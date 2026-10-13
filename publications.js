'use strict';
(async () => {
await window.PORTFOLIO_CONTENT_READY;

const records=window.PORTFOLIO_PUBLICATIONS;
const filterButtons=[...document.querySelectorAll('[data-filter]')];
const search=document.getElementById('publication-search');
const rows=[...document.querySelectorAll('.publication-row')];
const publicationStatus=document.getElementById('publication-status');
const publicationToggle=document.getElementById('toggle-publications');
const actionStatus=document.getElementById('action-status');
let activeFilter='all';
let publicationsExpanded=false;

function updatePublications(){
  const term=search.value.trim().toLocaleLowerCase();
  const filtering=Boolean(term)||activeFilter!=='all';
  let count=0;
  for(const row of rows){
    const topicMatch=activeFilter==='all'||row.dataset.topics.split(' ').includes(activeFilter);
    const textMatch=row.textContent.toLocaleLowerCase().includes(term);
    const viewMatch=publicationsExpanded||filtering||row.dataset.featured==='true';
    const match=topicMatch&&textMatch&&viewMatch;
    row.hidden=!match;
    if(match)count++;
  }
  document.getElementById('publication-empty').hidden=count!==0;
  publicationToggle.hidden=filtering;
  publicationToggle.setAttribute('aria-expanded',String(publicationsExpanded));
  publicationToggle.querySelector('span').textContent=publicationsExpanded?'Show fewer publications':`Show all publications (${records.length})`;
  if(filtering){publicationStatus.textContent=`${count} matching ${count===1?'publication':'publications'} · searching all listed work`;}
  else if(publicationsExpanded){publicationStatus.textContent=`${count} publications · full listed record`;}
  else{publicationStatus.textContent=`${count} featured ${count===1?'publication':'publications'}`;}
}
function setFilter(value){activeFilter=value;for(const button of filterButtons){const selected=button.dataset.filter===value;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));}updatePublications();}
filterButtons.forEach(button=>button.addEventListener('click',()=>setFilter(button.dataset.filter)));
search.addEventListener('input',updatePublications);
document.getElementById('reset-publications').addEventListener('click',()=>{search.value='';publicationsExpanded=true;setFilter('all');search.focus();});
publicationToggle.addEventListener('click',()=>{publicationsExpanded=!publicationsExpanded;updatePublications();if(!publicationsExpanded)document.getElementById('publications-title').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});

function toBibTeX(key){
  const record=records.find(r=>r.id===key);
  const bibAuthor=name=>{
    if(name==='Soumyashree Das Adhikari')return 'Das Adhikari, Soumyashree';
    const parts=name.split(' ');
    return parts.length===1?`{${name}}`:`${parts.pop()}, ${parts.join(' ')}`;
  };
  const fields={title:record.bibTitle||record.title,author:record.authors.map(bibAuthor).join(' and '),journal:record.journal,year:record.year,volume:record.volume,number:record.number,pages:record.pages,doi:record.doi};
  if(record.type!=='article')fields.note=record.type==='conference'?'Conference abstract':'Publisher correction';
  return `@article{${key},\n${Object.entries(fields).filter(([,value])=>value).map(([field,value])=>`  ${field} = {${value}}`).join(',\n')}\n}\n`;
}
function downloadCitations(keys,name){const blob=new Blob([keys.map(toBibTeX).join('\n')],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);actionStatus.textContent='BibTeX citation download started.';}
document.querySelectorAll('[data-citation]').forEach(button=>button.addEventListener('click',()=>downloadCitations([button.dataset.citation],`${button.dataset.citation}.bib`)));
document.getElementById('download-all').addEventListener('click',()=>downloadCitations(records.map(r=>r.id),'magan-himanshu-publications.bib'));
updatePublications();

})();
