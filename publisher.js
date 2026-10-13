'use strict';
(() => {
  const apiOrigin = 'https://api.github.com';
  const repository = 'HM004-Prog/hm004-prog.github.io';
  const repoPath = `/repos/${repository}`;
  const filePath = `${repoPath}/contents/site-content.json`;
  const ownerId = 207867580;
  const repositoryId = 1415766109;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder('utf-8', {fatal:true});
  const shaPattern = /^[a-f0-9]{40}$/;
  class PublishError extends Error {
    constructor(message, code) { super(message); this.name = 'PublishError'; this.code = code; }
  }
  function toBase64(bytes) {
    let binary = ''; for (let index = 0; index < bytes.length; index += 32768) binary += String.fromCharCode(...bytes.subarray(index,index+32768)); return btoa(binary);
  }
  function fromBase64(value) { const binary = atob(value.replace(/\s/g,'')); return Uint8Array.from(binary,char=>char.charCodeAt(0)); }
  function canonical(value) {
    if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
    if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+canonical(value[key])).join(',') + '}';
    return JSON.stringify(value);
  }
  function fingerprint(data) { return canonical({schemaVersion:data.schemaVersion,fields:data.fields,publications:data.publications}); }
  async function gitBlobSha(bytes) {
    const header = encoder.encode(`blob ${bytes.length}\0`); const all = new Uint8Array(header.length + bytes.length); all.set(header); all.set(bytes,header.length);
    return [...new Uint8Array(await crypto.subtle.digest('SHA-1',all))].map(byte=>byte.toString(16).padStart(2,'0')).join('');
  }
  async function passwordKey(password, salt, usages) {
    const material = await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:600000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,usages);
  }
  const associatedData = encoder.encode(`portfolio-publishing:${location.origin}:${repository}`);
  async function encryptVault(token, password) {
    if (password.length < 12) throw new PublishError('Use an editor password of at least 12 characters.','PASSWORD');
    const salt = crypto.getRandomValues(new Uint8Array(16)); const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await passwordKey(password,salt,['encrypt']); const encrypted = await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:associatedData},key,encoder.encode(token));
    return {version:1,repository,iterations:600000,salt:toBase64(salt),iv:toBase64(iv),ciphertext:toBase64(new Uint8Array(encrypted))};
  }
  async function decryptVault(record, password) {
    if (record?.version !== 1 || record.repository !== repository || record.iterations !== 600000) throw new PublishError('The saved connection is incompatible. Connect again with your publishing key.','VAULT');
    try {
      const key = await passwordKey(password,fromBase64(record.salt),['decrypt']);
      const decrypted = await crypto.subtle.decrypt({name:'AES-GCM',iv:fromBase64(record.iv),additionalData:associatedData},key,fromBase64(record.ciphertext)); return decoder.decode(decrypted);
    } catch { throw new PublishError('That editor password could not unlock the saved connection.','PASSWORD'); }
  }
  function createClient() {
    let token = '', busy = false, pending = null;
    async function request(path, options = {}, authenticated = true) {
      // The destination and paths are fixed by the application, never by content fields.
      if (!path.startsWith(repoPath+'/') && path !== repoPath && path !== '/user') throw new PublishError('Unsupported publishing request.','TARGET');
      const controller = new AbortController(); const timer = setTimeout(()=>controller.abort(),30000);
      try {
        const headers = {'Accept':options.accept || 'application/vnd.github+json','X-GitHub-Api-Version':'2026-03-10'};
        if (authenticated && token) headers.Authorization = `Bearer ${token}`;
        if (options.body) headers['Content-Type'] = 'application/json';
        const response = await fetch(apiOrigin + path,{method:options.method || 'GET',headers,body:options.body ? JSON.stringify(options.body) : undefined,signal:controller.signal,cache:'no-store',credentials:'omit',redirect:'error'});
        if (!response.ok) {
          const messages = {401:'Your publishing key is invalid or expired. Connect again.',403:'GitHub denied this request. Check that the key has Contents: read and write for this website.',404:'GitHub could not find the website or the key cannot access it.',409:'The website changed while you were editing. Load the latest content before publishing.',422:'GitHub rejected this update. Your draft is still available to download.'};
          throw new PublishError(messages[response.status] || 'GitHub could not complete the request. Your draft has been kept.',String(response.status));
        }
        return await response.json();
      } catch(error) { if (error instanceof PublishError) throw error; throw new PublishError('The connection to GitHub was interrupted. Your draft has been kept.','NETWORK'); }
      finally { clearTimeout(timer); }
    }
    async function read(authenticated = true) {
      const metadata = await request(filePath+'?ref=main',{accept:'application/vnd.github.object+json'},authenticated);
      if (!shaPattern.test(metadata.sha) || metadata.path !== 'site-content.json') throw new PublishError('GitHub returned an unexpected content file.','RESPONSE');
      let encoded = metadata.content;
      if (metadata.encoding !== 'base64') {
        const blob = await request(`${repoPath}/git/blobs/${metadata.sha}`,{},authenticated);
        if (blob.sha !== metadata.sha || blob.encoding !== 'base64') throw new PublishError('Could not verify the website content.','RESPONSE'); encoded = blob.content;
      }
      const bytes = fromBase64(encoded);
      if (await gitBlobSha(bytes) !== metadata.sha) throw new PublishError('Could not verify the website content.','RESPONSE');
      return {sha:metadata.sha,data:JSON.parse(decoder.decode(bytes))};
    }
    async function connect(key) {
      if (!/^github_pat_[A-Za-z0-9_]+$/.test(key)) throw new PublishError('Use a fine-grained GitHub publishing key restricted to this website.','KEY');
      token = key;
      try {
        const [user,repo] = await Promise.all([request('/user'),request(repoPath)]);
        if (user.id !== ownerId || user.login.toLowerCase() !== 'hm004-prog' || repo.id !== repositoryId) throw new PublishError('Only the HM004-Prog owner account can publish this website.','OWNER');
        return {login:user.login,...await read()};
      } catch(error) { token = ''; throw error; }
    }
    async function checkPending() {
      if (!pending) throw new PublishError('There is no unconfirmed save.','STATE');
      const latest = await read();
      if (latest.sha !== pending.blobSha) throw new PublishError('The save is not confirmed yet. Check again before submitting another update.','UNCERTAIN');
      const result = {sha:latest.sha,data:latest.data,commitSha:null,recovered:true}; pending = null; return result;
    }
    async function save(draft, baseSha) {
      if (!token) throw new PublishError('Connect or unlock your publishing account first.','LOCKED');
      if (busy) throw new PublishError('A save is already in progress.','BUSY');
      if (pending) throw new PublishError('Check the previous save before submitting another update.','UNCERTAIN');
      if (!shaPattern.test(baseSha || '')) throw new PublishError('Load the latest published content before saving.','BASE');
      busy = true;
      try {
        const latest = await read();
        if (latest.sha !== baseSha) throw new PublishError('The website changed in another session. Your draft is kept; load the latest content and review your changes.','CONFLICT');
        const snapshot = {...JSON.parse(JSON.stringify(draft)),publishedAt:new Date().toISOString()};
        const text = JSON.stringify(snapshot,null,2)+'\n';
        if (text.includes(token) || /github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,}/.test(text)) throw new PublishError('A GitHub credential was found in the draft. Remove it from the content before publishing.','SECRET');
        const bytes = encoder.encode(text); if (bytes.length > 15*1024*1024) throw new PublishError('This draft is too large. Choose a smaller profile photo.','SIZE');
        const blobSha = await gitBlobSha(bytes);
        pending = {blobSha};
        let response;
        try { response = await request(filePath,{method:'PUT',body:{message:'Update portfolio from website editor',branch:'main',sha:baseSha,content:toBase64(bytes)}}); }
        catch(error) {
          if (['401','403','404','409','422'].includes(error.code)) { pending = null; throw error; }
          try { return await checkPending(); } catch { throw new PublishError('The save could not be confirmed. Use Check save status; no update will be submitted again automatically.','UNCERTAIN'); }
        }
        if (response.content?.sha !== blobSha || !shaPattern.test(response.commit?.sha || '')) throw new PublishError('The save response was incomplete. Use Check save status before trying again.','UNCERTAIN');
        pending = null; return {sha:blobSha,data:snapshot,commitSha:response.commit.sha,recovered:false};
      } finally { busy = false; }
    }
    return {connect,read,save,checkPending,disconnect:()=>{token='';},isConnected:()=>Boolean(token),hasPending:()=>Boolean(pending)};
  }
  window.PORTFOLIO_PUBLISHING = {createClient,encryptVault,decryptVault,fingerprint};
})();
