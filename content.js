'use strict';
(() => {
  const draftKey = 'magan-portfolio-draft-v1';
  const escape = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  function safeLink(value, photo = false) {
    if (photo && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value)) return value;
    if (photo && /^assets\/[A-Za-z0-9_.\/-]+$/.test(value)) return value;
    try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; }
  }
  function validate(data) {
    if (!data || data.schemaVersion !== 1 || !data.fields || !Array.isArray(data.publications)) throw new Error('This is not a compatible website content file.');
    for (const definition of window.PORTFOLIO_FIELDS) {
      const value = data.fields[definition.key];
      if (typeof value !== 'string') throw new Error(`Missing field: ${definition.label}`);
      if ((definition.kind === 'link' || definition.kind === 'photo') && value && !safeLink(value, definition.kind === 'photo')) throw new Error(`${definition.label}: enter an HTTPS link or choose a photo.`);
    }
    if (!data.fields['hero.name'].trim()) throw new Error('Please enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.fields['contact.email'])) throw new Error('Please enter a valid email address.');
    const ids = new Set();
    for (const record of data.publications) {
      if (!record.id || ids.has(record.id)) throw new Error('Publication identifiers must be unique.');
      ids.add(record.id);
      if (!record.title?.trim() || !Array.isArray(record.authors) || !Array.isArray(record.topics)) throw new Error('Each publication needs a title, authors, and research areas.');
      if (!['article', 'conference', 'correction'].includes(record.type)) throw new Error('Choose a valid publication type.');
      if (record.url && !safeLink(record.url)) throw new Error('Publication links must start with https://.');
      if (record.doi && !/^10\.\d{4,9}\/\S+$/i.test(record.doi)) throw new Error(`Check the DOI for “${record.title}”. Enter the DOI without https://doi.org/.`);
    }
    if (data.publications.filter(record => record.featured).length > 5) throw new Error('Choose up to five featured publications.');
    return data;
  }
  function setText(node, value, kind) {
    function existingText(current) {
      return [...current.childNodes].map(child => {
        if (child.nodeType === 3) return child.textContent;
        if (child.nodeType !== 1 || child.matches('svg,.serif-dot')) return '';
        return child.tagName === 'BR' ? '\n' : existingText(child);
      }).join('');
    }
    if (kind !== 'list' && kind !== 'own' && existingText(node).trim() === value) return;
    if (kind === 'own') {
      const texts = [...node.childNodes].filter(child => child.nodeType === 3 && child.textContent.trim());
      if (texts.length) { texts[0].textContent = value + ' '; texts.slice(1).forEach(child => child.remove()); }
      else node.prepend(document.createTextNode(value + ' '));
    } else if (kind === 'list') {
      node.replaceChildren(...value.split('\n').map(line => line.trim()).filter(Boolean).map(line => { const li = document.createElement('li'); li.textContent = line; return li; }));
    } else if (kind === 'heading') {
      const dot = node.querySelector('.serif-dot')?.cloneNode(true);
      const italic = Boolean(node.querySelector('em'));
      const lines = value.split('\n');
      node.replaceChildren();
      lines.forEach((line, index) => {
        if (index) node.append(document.createElement('br'));
        if (italic && index === lines.length - 1) { const em = document.createElement('em'); em.textContent = line; node.append(em); }
        else node.append(document.createTextNode(line));
      });
      if (dot) node.append(dot);
    } else {
      const icons = [...node.children].filter(child => child.tagName.toLowerCase() === 'svg').map(child => child.cloneNode(true));
      node.replaceChildren(document.createTextNode(value + (icons.length ? ' ' : '')), ...icons);
    }
  }
  function applyContent(data) {
    for (const definition of window.PORTFOLIO_FIELDS) {
      const node = document.querySelector(definition.selector);
      if (!node) continue;
      const value = data.fields[definition.key];
      if (definition.kind === 'link') { const link = safeLink(value); if (link) node.setAttribute('href', link); else node.removeAttribute('href'); }
      else if (definition.kind === 'photo') { const link = safeLink(value, true); if (link) node.setAttribute('src', link); }
      else if (definition.kind === 'meta') node.setAttribute('content', value);
      else setText(node, value, definition.kind);
    }
    const name = data.fields['hero.name'].replace(/\s+/g, ' ').trim();
    document.querySelector('.hero-portrait').alt = `Portrait of ${name}`;
    document.querySelector('.brand').setAttribute('aria-label', `${name}, home`);
    document.querySelector('#footer-name').textContent = name;
    const email = document.querySelector('.email-link');
    email.href = `mailto:${data.fields['contact.email']}`;
    document.querySelector('meta[property="og:title"]').content = data.fields['site.title'];
    document.querySelector('meta[property="og:description"]').content = data.fields['site.description'];
    const scholar = safeLink(data.fields['contact.profile1']);
    if (scholar) document.querySelectorAll('.hero-actions a:last-child, #publications .section-heading > a').forEach(node => { node.href = scholar; });
    window.PORTFOLIO_PUBLICATIONS = data.publications;
    const types = {article: 'JOURNAL ARTICLE', conference: 'CONFERENCE ABSTRACT', correction: 'PUBLISHER CORRECTION'};
    document.querySelector('#publication-list').innerHTML = data.publications.map((record, index) => {
      const link = record.url ? safeLink(record.url) : record.doi ? `https://doi.org/${record.doi}` : '';
      const authors = record.authors.map(author => author === name ? `<strong>${escape(author)}</strong>` : escape(author)).join(', ');
      const title = link ? `<a href="${escape(link)}" target="_blank" rel="noopener noreferrer">${escape(record.title)}</a>` : escape(record.title);
      const read = record.type === 'conference' ? 'Read abstract' : record.type === 'correction' ? 'Read correction' : 'Read paper';
      return `<article class="publication-row" data-id="${escape(record.id)}" data-topics="${escape(record.topics.join(' '))}" data-featured="${Boolean(record.featured)}"${record.featured ? '' : ' hidden'}><div class="pub-year">${escape(record.year)}</div><div class="pub-main"><p class="pub-meta">${escape((record.journal || '').toUpperCase())} <span class="publication-type">${types[record.type]}</span>${record.firstAuthor ? ' <span class="author-badge">First author</span>' : ''}</p><h3>${title}</h3><p class="pub-authors">${authors}</p><p class="pub-summary">${escape(record.summary)}</p><div class="pub-links">${link ? `<a href="${escape(link)}" target="_blank" rel="noopener noreferrer">${read} <svg class="icon tiny"><use href="#arrow"/></svg></a>` : ''}<button type="button" data-citation="${escape(record.id)}">BibTeX <svg class="icon tiny"><use href="#download"/></svg></button></div></div><span class="pub-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span></article>`;
    }).join('\n');
  }
  window.PORTFOLIO_CONTENT = {draftKey, validate, safeLink};
  if (!document.querySelector('#hero-title')) return;
  window.PORTFOLIO_CONTENT_READY = (async () => {
    try {
      let data;
      if (new URLSearchParams(location.search).has('preview')) {
        const draft = await window.PORTFOLIO_DRAFTS.get();
        if (draft) data = validate(draft);
        const banner = document.createElement('div'); banner.className = 'draft-banner';
        banner.append(document.createTextNode(data ? 'Draft preview — these changes are not published. ' : 'No local draft found — showing the published site. '));
        const back = document.createElement('a'); back.href = 'edit.html'; back.textContent = 'Back to editor'; banner.append(back); document.body.prepend(banner);
      }
      if (!data) {
        const response = await fetch('site-content.json', {cache: 'no-store'});
        if (!response.ok) throw new Error('Could not load the website content.');
        data = validate(await response.json());
      }
      applyContent(data);
    } catch (error) { console.error('Content loading failed; showing the built-in website content.', error); }
  })();
})();
