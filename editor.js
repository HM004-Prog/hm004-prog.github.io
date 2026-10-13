'use strict';
(() => {
  const {draftKey, validate, safeLink} = window.PORTFOLIO_CONTENT;
  const definitions = window.PORTFOLIO_FIELDS;
  const sections = [...new Set(definitions.map(field => field.section))];
  const status = document.querySelector('#editor-status');
  const state = document.querySelector('#draft-state');
  const container = document.querySelector('#editor-fields');
  const navigation = document.querySelector('#editor-sections');
  const clone = value => JSON.parse(JSON.stringify(value));
  const topics = {'photocatalysis':'Photocatalysis','nanomaterials':'Nanomaterials','liquid-crystals':'Liquid crystals','energy-storage':'Energy storage'};
  const {createClient,encryptVault,decryptVault,fingerprint} = window.PORTFOLIO_PUBLISHING;
  const publisher = createClient();
  const connectionStatus = document.querySelector('#connection-status');
  let loadedFromRepository=false;
  let data, savedDraft, savedDraftBaseSha, selected = 'Profile', removed, baselineData, baseSha, savedVault, lockTimer, publishing = false, waitingForLive = null;
  function tell(message, error = false) { status.textContent = message; status.classList.toggle('error', error); }
  async function storeDraft() {
    try { await window.PORTFOLIO_DRAFTS.set({data:clone(data),baseSha}); state.textContent = 'Draft saved in this browser. Select Save and publish to update the website.'; }
    catch { state.textContent = 'Browser storage is unavailable or full. Download changes to keep this draft.'; }
  }
  function element(tag, className, text) {
    const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node;
  }
  function makeField(label, value, update, options = {}) {
    const wrapper = element('label', 'field'); wrapper.append(element('span', '', label));
    let input;
    if (options.choices) {
      input = element('select'); Object.entries(options.choices).forEach(([key, name]) => { const option = element('option', '', name); option.value = key; input.append(option); });
    } else input = element(options.multiline ? 'textarea' : 'input');
    if (input.tagName === 'INPUT') input.type = options.type || 'text';
    if (options.multiline) input.rows = options.rows || 3;
    input.value = value ?? ''; input.autocomplete = 'off';
    input.addEventListener('input', () => { update(input.value); storeDraft(); });
    wrapper.append(input);
    if (options.help) wrapper.append(element('small', '', options.help));
    return wrapper;
  }
  function checkbox(label, checked, update) {
    const wrapper = element('label', 'check-label'); const input = element('input'); input.type = 'checkbox'; input.checked = Boolean(checked);
    input.addEventListener('change', () => { update(input.checked); storeDraft(); }); wrapper.append(input, document.createTextNode(label)); return wrapper;
  }
  function button(label, action, className = 'small-button') {
    const node = element('button', className, label); node.type = 'button'; node.addEventListener('click', action); return node;
  }
  function renderFields(section) {
    for (const definition of definitions.filter(field => field.section === section)) {
      const photo = definition.kind === 'photo';
      const options = {multiline:['long','heading','list'].includes(definition.kind),rows:definition.kind === 'list' ? 5 : 3,type:definition.kind === 'link' ? 'url' : definition.key === 'contact.email' ? 'email' : 'text'};
      if (definition.kind === 'heading') options.help = 'Line breaks appear on the website.';
      if (definition.kind === 'list') options.help = 'Enter one technique per line.';
      if (photo) {
        const preview = element('img', 'photo-preview'); preview.alt = 'Current draft profile photo'; preview.src = safeLink(data.fields[definition.key], true);
        const upload = element('label', 'field'); upload.append(element('span', '', 'Choose a new profile photo'), preview);
        const chooser = element('input'); chooser.type = 'file'; chooser.accept = 'image/png,image/jpeg,image/webp';
        chooser.addEventListener('change', () => {
          const file = chooser.files[0]; if (!file) return;
          if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) { tell('Choose a PNG, JPEG, or WebP photo smaller than 8 MB.', true); return; }
          const reader = new FileReader();
          reader.addEventListener('load', () => { data.fields[definition.key] = reader.result; preview.src = reader.result; storeDraft(); tell('Photo added to your draft. It will be included when you download changes.'); });
          reader.addEventListener('error', () => tell('Could not read that photo. Please choose it again.', true)); reader.readAsDataURL(file);
        });
        upload.append(chooser, element('small', '', 'PNG, JPEG, or WebP, up to 8 MB. Your photo is included in the downloaded content file.')); container.append(upload);
        const remotePhoto = data.fields[definition.key].startsWith('data:') ? '' : data.fields[definition.key];
        container.append(makeField('Or use an HTTPS photo URL', remotePhoto, value => {
          if (value.trim()) { data.fields[definition.key] = value.trim(); const link = safeLink(value.trim(), true); if (link) preview.src = link; }
        }, {help:'Leave blank to keep your current or uploaded photo. The default photo uses its existing assets path.'}));
      } else container.append(makeField(definition.label, data.fields[definition.key], value => { data.fields[definition.key] = value; }, options));
    }
  }
  function renderPublications(openId) {
    container.append(element('p', 'inline-note', 'Choose up to five featured papers to show by default. Use Move up / Move down to change their order. Citation ranking is not fetched automatically.'));
    container.append(button('＋ Add publication', () => {
      const record = {id:'publication-' + Date.now(),type:'article',featured:false,firstAuthor:false,topics:[],year:String(new Date().getFullYear()),title:'',authors:[],journal:'',doi:'',summary:'',citationCount:null};
      data.publications.push(record); storeDraft(); render(record.id);
    }, 'button secondary'));
    if (removed) {
      const note = element('div', 'undo-note'); note.append(element('span', '', 'Publication removed from this draft.'), button('Undo', () => { data.publications.splice(removed.index, 0, removed.record); const id = removed.record.id; removed = null; storeDraft(); render(id); })); container.append(note);
    }
    data.publications.forEach((record, index) => {
      const details = element('details', 'publication-edit'); details.open = record.id === openId;
      const summary = element('summary', '', `${index + 1}. ${record.title || 'New publication'}${record.featured ? ' · Featured' : ''}`); details.append(summary);
      const body = element('div', 'publication-edit-body');
      const refreshSummary = () => { summary.textContent = `${index + 1}. ${record.title || 'New publication'}${record.featured ? ' · Featured' : ''}`; };
      body.append(makeField('Publication title', record.title, value => { record.title = value; refreshSummary(); }, {multiline:true}));
      const row = element('div', 'field-row');
      row.append(makeField('Year', record.year, value => { record.year = value; }), makeField('Publication type', record.type, value => { record.type = value; }, {choices:{article:'Journal article',conference:'Conference abstract',correction:'Publisher correction'}})); body.append(row);
      body.append(makeField('Authors — one name per line', record.authors.join('\n'), value => { record.authors = value.split('\n').map(name => name.trim()).filter(Boolean); }, {multiline:true}));
      body.append(makeField('Journal or venue', record.journal, value => { record.journal = value; }));
      const bibliographic = element('div', 'field-row');
      for (const [key,label] of Object.entries({volume:'Volume',number:'Issue',pages:'Pages or article number',doi:'DOI (without https://doi.org/)'})) bibliographic.append(makeField(label, record[key], value => { record[key] = value.trim(); })); body.append(bibliographic);
      body.append(makeField('Alternative paper URL (optional)', record.url, value => { record.url = value.trim(); }, {type:'url',help:'Use an HTTPS link if the paper has no DOI, or to link to an open-access version.'}));
      body.append(makeField('Short research summary', record.summary, value => { record.summary = value; }, {multiline:true}));
      body.append(checkbox('Featured — show on the website by default', record.featured, value => { record.featured = value; refreshSummary(); }));
      body.append(checkbox('Mark as first-author work', record.firstAuthor, value => { record.firstAuthor = value; }));
      const area = element('fieldset', 'topics'); area.append(element('legend', '', 'Research areas'));
      Object.entries(topics).forEach(([key,label]) => area.append(checkbox(label, record.topics.includes(key), value => { record.topics = value ? [...new Set([...record.topics,key])] : record.topics.filter(topic => topic !== key); }))); body.append(area);
      const actions = element('div', 'publication-actions');
      const move = direction => { const target = index + direction; if (target < 0 || target >= data.publications.length) return; [data.publications[index],data.publications[target]] = [data.publications[target],data.publications[index]]; storeDraft(); render(record.id); };
      const up = button('Move up', () => move(-1)); up.disabled = index === 0; const down = button('Move down', () => move(1)); down.disabled = index === data.publications.length - 1;
      actions.append(up, down, button('Remove publication', () => { removed = {record:clone(record),index}; data.publications.splice(index,1); storeDraft(); render(); }, 'small-button danger')); body.append(actions); details.append(body); container.append(details);
    });
  }
  function render(openId) {
    container.replaceChildren(element('h2', '', selected));
    if (selected === 'Profile') container.append(element('p', 'section-help', 'Your opening introduction and photo.'));
    navigation.querySelectorAll('button').forEach(node => { if (node.textContent === selected) node.setAttribute('aria-current','page'); else node.removeAttribute('aria-current'); });
    renderFields(selected);
    if (selected === 'Publications') renderPublications(openId);
    if (selected === 'Profile') {
      const restore = element('div', 'restore-file');
      const label = element('label', 'field'); label.append(element('span', '', 'Import an earlier downloaded content file'));
      const input = element('input'); input.type = 'file'; input.accept = '.json,application/json';
      input.addEventListener('change', async () => { try { const file = input.files[0]; if (!file) return; data = clone(validate(JSON.parse(await file.text()))); storeDraft(); render(); tell('Content file imported into this draft. The live site is unchanged.'); } catch(error) { tell(error.message,true); } }); label.append(input); restore.append(label); container.append(restore);
    }
  }
  document.querySelector('#editor-form').addEventListener('submit', event => event.preventDefault());
  document.querySelector('#preview-draft').addEventListener('click', async () => {
    try { validate(data); await window.PORTFOLIO_DRAFTS.set({data:clone(data),baseSha}); window.open('./?preview=1','_blank','noopener'); tell('Draft preview opened. Your public site is unchanged.'); }
    catch(error) { tell(error.message, true); }
  });
  document.querySelector('#download-changes').addEventListener('click', () => {
    try {
      validate(data); const file = new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'}); const url = URL.createObjectURL(file); const link = element('a'); link.href = url; link.download = 'site-content.json'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      tell('A backup of your draft was downloaded. Use Save and publish to update the website directly.');
    } catch(error) { tell(error.message,true); }
  });
  document.querySelector('#restore-draft').addEventListener('click', () => {
    try { data = clone(validate(savedDraft)); baseSha = savedDraftBaseSha; render(); updateConnection(); document.querySelector('#draft-notice').hidden = true; state.textContent = 'Saved draft restored. The live website is unchanged.'; tell('Your saved draft is ready to edit.'); }
    catch(error) { tell(error.message,true); }
  });
  document.querySelector('#discard-draft').addEventListener('click', async () => { await window.PORTFOLIO_DRAFTS.remove(); savedDraft = null; document.querySelector('#draft-notice').hidden = true; tell('Editing the current published content.'); });

  function connectionMessage(message, error = false) { connectionStatus.textContent = message; connectionStatus.classList.toggle('error',error); }
  function updateConnection() {
    const connected = publisher.isConnected();
    document.querySelector('#connection-badge').textContent = connected ? 'Connected as HM004-Prog' : savedVault ? 'Locked' : 'Not connected';
    document.querySelector('#connection-badge').classList.toggle('connected',connected);
    document.querySelector('#connect-form').hidden = connected || Boolean(savedVault);
    document.querySelector('#unlock-form').hidden = connected || !savedVault;
    document.querySelector('#connected-actions').hidden = !connected;
    document.querySelector('#save-publish').disabled = !data || !connected || !baseSha || publishing || publisher.hasPending() || Boolean(waitingForLive);
    document.querySelector('#load-latest').disabled = !data || publishing;
    document.querySelector('#check-save').hidden = !publisher.hasPending() && !waitingForLive;
  }
  function lockPublishing() {
    clearTimeout(lockTimer); publisher.disconnect();
    for (const id of ['publishing-key','new-editor-password','repeat-editor-password','unlock-editor-password']) document.getElementById(id).value = '';
    updateConnection(); connectionMessage('Publishing is locked. Unlock or connect to publish changes.');
  }
  function resetLockTimer() { if (publisher.isConnected()) { clearTimeout(lockTimer); lockTimer = setTimeout(()=>{ if (publishing) resetLockTimer(); else lockPublishing(); },15*60*1000); } }
  for (const event of ['pointerdown','keydown']) document.addEventListener(event,resetLockTimer,{passive:true});
  window.addEventListener('pagehide',()=>publisher.disconnect());
  let disabledControls = new Map();
  function setBusy(busy) {
    publishing = busy;
    if (busy) {
      disabledControls = new Map([...document.querySelectorAll('#editor-form input,#editor-form textarea,#editor-form select,#editor-form button,#editor-sections button,.connection-panel input,.connection-panel button,.editor-actions button,#draft-notice button')].map(node=>[node,node.disabled]));
      disabledControls.forEach((_,node)=>{node.disabled=true;});
    } else { disabledControls.forEach((disabled,node)=>{node.disabled=disabled;}); disabledControls.clear(); }
    updateConnection();
  }
  async function acceptConnection(result) {
    validate(result.data);
    if (!baseSha && fingerprint(baselineData) === fingerprint(result.data)) baseSha = result.sha;
    updateConnection(); resetLockTimer();
    if (baseSha !== result.sha) { connectionMessage('Connected. The published content changed since this draft began. Use Load latest published content and review your draft before saving.',true); return; }
    connectionMessage('Connected as HM004-Prog. Edit your portfolio and select Save and publish.');
  }
  document.querySelector('#remember-connection').addEventListener('change',event=>{document.querySelector('#password-setup').hidden=!event.target.checked;});
  document.querySelector('#connect-form').addEventListener('submit',async event=>{
    event.preventDefault(); const keyInput = document.querySelector('#publishing-key'); let key = keyInput.value.trim(); keyInput.value = '';
    const remember = document.querySelector('#remember-connection').checked;
    let password = document.querySelector('#new-editor-password').value;
    const repeated = document.querySelector('#repeat-editor-password').value;
    document.querySelector('#new-editor-password').value = ''; document.querySelector('#repeat-editor-password').value = '';
    if (remember && (password.length < 12 || password !== repeated)) { connectionMessage('Use matching editor passwords of at least 12 characters.',true); key=''; password=''; return; }
    setBusy(true); connectionMessage('Verifying your publishing account…');
    try {
      const result = await publisher.connect(key);
      if (remember) { savedVault = await encryptVault(key,password); await window.PORTFOLIO_VAULT.set(savedVault); }
      await acceptConnection(result);
    } catch(error) { if (!publisher.isConnected()) lockPublishing(); connectionMessage(error.message,true); }
    finally { key=''; password=''; setBusy(false); }
  });
  document.querySelector('#unlock-form').addEventListener('submit',async event=>{
    event.preventDefault(); const input = document.querySelector('#unlock-editor-password'); let password = input.value; input.value=''; let key='';
    setBusy(true); connectionMessage('Unlocking your publishing connection…');
    try { key=await decryptVault(savedVault,password); const result=await publisher.connect(key); await acceptConnection(result); }
    catch(error) { lockPublishing(); connectionMessage(error.message,true); }
    finally { key=''; password=''; setBusy(false); }
  });
  document.querySelector('#use-new-key').addEventListener('click',()=>{document.querySelector('#unlock-form').hidden=true;document.querySelector('#connect-form').hidden=false;});
  document.querySelector('#lock-publishing').addEventListener('click',lockPublishing);
  document.querySelector('#forget-connection').addEventListener('click',async()=>{
    await window.PORTFOLIO_VAULT.remove(); savedVault=null; lockPublishing(); connectionMessage('Saved connection removed from this device. The GitHub key itself is unchanged.');
  });
  document.querySelector('#load-latest').addEventListener('click',async()=>{
    setBusy(true); connectionMessage('Loading the latest published content…');
    try {
      const latest=await publisher.read(publisher.isConnected());validate(latest.data);
      if (fingerprint(data)!==fingerprint(latest.data)) { savedDraft=clone(data);savedDraftBaseSha=baseSha;await window.PORTFOLIO_DRAFTS.set({data:savedDraft,baseSha:savedDraftBaseSha});document.querySelector('#draft-notice').hidden=false; }
      data=clone(latest.data);baselineData=clone(latest.data);baseSha=latest.sha;removed=null;render();connectionMessage('Latest content loaded. Your previous draft is available using Restore saved draft.');
    } catch(error) { connectionMessage(error.message,true); }
    finally { setBusy(false); }
  });
  async function waitForPublished(snapshot) {
    waitingForLive=snapshot; updateConnection();
    for (let attempt=0;attempt<18;attempt++) {
      try {
        const response=await fetch('site-content.json?published='+encodeURIComponent(snapshot.publishedAt),{cache:'no-store',credentials:'omit'});
        if (response.ok) { const live=await response.json();if (live.publishedAt===snapshot.publishedAt && fingerprint(live)===fingerprint(snapshot)) {
          waitingForLive=null; connectionMessage('Published successfully. Your changes are live.');state.textContent='Your changes are live on the public website.';document.querySelector('#published-site-link').hidden=false;updateConnection();return;
        } }
      } catch { /* A saved commit is retained while the public deployment catches up. */ }
      if (attempt<17) await new Promise(resolve=>setTimeout(resolve,8000));
    }
    connectionMessage('Saved to GitHub. The public website is still updating. Use Check save status to check again.');state.textContent='Saved; waiting for the public website to update.';updateConnection();
  }
  async function finishSave(result) {
    data=clone(validate(result.data));baselineData=clone(data);baseSha=result.sha;
    try { await window.PORTFOLIO_DRAFTS.set({data:clone(data),baseSha}); } catch { /* The confirmed GitHub save remains valid when local storage is unavailable. */ }
    connectionMessage('Changes saved. Publishing your website…');state.textContent='Changes saved. Waiting for GitHub Pages to publish them.';
    await waitForPublished(data);
  }
  document.querySelector('#save-publish').addEventListener('click',async()=>{
    try { validate(data); } catch(error) { tell(error.message,true);return; }
    setBusy(true);connectionMessage('Saving your changes…');document.querySelector('#published-site-link').hidden=true;
    try { await finishSave(await publisher.save(clone(data),baseSha)); }
    catch(error) { if (['401','403'].includes(error.code)) lockPublishing();connectionMessage(error.message,true);state.textContent='Your draft has been kept.'; }
    finally { setBusy(false);resetLockTimer(); }
  });
  document.querySelector('#check-save').addEventListener('click',async()=>{
    setBusy(true);connectionMessage('Checking your save…');
    try { if (publisher.hasPending()) await finishSave(await publisher.checkPending());else if (waitingForLive) await waitForPublished(waitingForLive); }
    catch(error) { connectionMessage(error.message,true); }
    finally { setBusy(false); }
  });
  (async () => {
    try {
      try { const initial=await publisher.read(false);data=clone(validate(initial.data));baseSha=initial.sha;loadedFromRepository=true; }
      catch { const response = await fetch('site-content.json',{cache:'no-store'}); if (!response.ok) throw new Error('Could not load the published content. Reload this page to try again.');data=clone(validate(await response.json()));baseSha=null; }
      baselineData=clone(data);
      try { const stored = await window.PORTFOLIO_DRAFTS.get(); if (stored) { savedDraft = stored.data || stored; savedDraftBaseSha=stored.baseSha || null;if (fingerprint(savedDraft) !== fingerprint(data)) document.querySelector('#draft-notice').hidden = false; } } catch { /* Backups remain available when browser storage is disabled. */ }
      try { savedVault=await window.PORTFOLIO_VAULT.get(); } catch { savedVault=null; }
      sections.forEach(section => navigation.append(button(section, () => { selected = section; render(); }, 'section-button')));
      render(); document.querySelector('#preview-draft').disabled = false; document.querySelector('#download-changes').disabled = false;updateConnection();tell(loadedFromRepository?'Latest repository content loaded. Connect or unlock publishing, then save directly from this editor.':'Website content loaded. Connect publishing to verify the latest version before saving.');
    } catch(error) { tell(error.message,true); state.textContent = 'Editor unavailable until the published content can be loaded.'; }
  })();
})();
