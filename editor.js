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
  let data, savedDraft, selected = 'Profile', removed;
  function tell(message, error = false) { status.textContent = message; status.classList.toggle('error', error); }
  async function storeDraft() {
    try { await window.PORTFOLIO_DRAFTS.set(clone(data)); state.textContent = 'Draft saved in this browser. The live website is unchanged.'; }
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
    try { validate(data); await window.PORTFOLIO_DRAFTS.set(clone(data)); window.open('./?preview=1','_blank','noopener'); tell('Draft preview opened. Your public site is unchanged.'); }
    catch(error) { tell(error.message, true); }
  });
  document.querySelector('#download-changes').addEventListener('click', () => {
    try {
      validate(data); const file = new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'}); const url = URL.createObjectURL(file); const link = element('a'); link.href = url; link.download = 'site-content.json'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      tell('Changes downloaded. Upload site-content.json using GitHub upload, then select Commit changes. If your browser added “(1)” to the filename, rename it to site-content.json first.');
      state.textContent = 'Downloaded changes are ready to publish through GitHub.';
    } catch(error) { tell(error.message,true); }
  });
  document.querySelector('#restore-draft').addEventListener('click', () => {
    try { data = clone(validate(savedDraft)); render(); document.querySelector('#draft-notice').hidden = true; state.textContent = 'Saved draft restored. The live website is unchanged.'; tell('Your saved draft is ready to edit.'); }
    catch(error) { tell(error.message,true); }
  });
  document.querySelector('#discard-draft').addEventListener('click', async () => { await window.PORTFOLIO_DRAFTS.remove(); savedDraft = null; document.querySelector('#draft-notice').hidden = true; tell('Editing the current published content.'); });
  (async () => {
    try {
      const response = await fetch('site-content.json',{cache:'no-store'}); if (!response.ok) throw new Error('Could not load the published content. Reload this page to try again.');
      data = clone(validate(await response.json()));
      try { const stored = await window.PORTFOLIO_DRAFTS.get(); if (stored) { savedDraft = stored; if (JSON.stringify(savedDraft) !== JSON.stringify(data)) document.querySelector('#draft-notice').hidden = false; } } catch { /* Download remains available when browser storage is disabled. */ }
      sections.forEach(section => navigation.append(button(section, () => { selected = section; render(); }, 'section-button')));
      render(); document.querySelector('#preview-draft').disabled = false; document.querySelector('#download-changes').disabled = false; tell('Published content loaded. You can edit independently whenever you want.');
    } catch(error) { tell(error.message,true); state.textContent = 'Editor unavailable until the published content can be loaded.'; }
  })();
})();
