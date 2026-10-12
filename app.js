'use strict';

// The network is an abstract illustration, not a crystallographic model.
const ns='http://www.w3.org/2000/svg';
const network=document.getElementById('network');
const nodes=[];
for(let z=0;z<3;z++)for(let y=0;y<3;y++)for(let x=0;x<3;x++){
  nodes.push({x,y,z,px:260+(x-1)*77+(z-1)*51,py:218+(y-1)*73-(z-1)*29+(x-1)*20,color:['green','gold','white','blue','clay'][(x+2*y+3*z)%5],r:12+((x+y+z)%3)*3});
}
const bonds=document.createElementNS(ns,'g');
bonds.setAttribute('stroke','#a5bba2');bonds.setAttribute('stroke-width','1.5');bonds.setAttribute('opacity','.38');
for(const a of nodes)for(const b of nodes){if(Math.abs(a.x-b.x)+Math.abs(a.y-b.y)+Math.abs(a.z-b.z)!==1||nodes.indexOf(a)>=nodes.indexOf(b))continue;const line=document.createElementNS(ns,'line');for(const [key,val]of Object.entries({x1:a.px,y1:a.py,x2:b.px,y2:b.py}))line.setAttribute(key,val);bonds.appendChild(line);}
network.appendChild(bonds);
nodes.sort((a,b)=>b.z-a.z||a.py-b.py).forEach(n=>{const c=document.createElementNS(ns,'circle');for(const [key,val]of Object.entries({cx:n.px,cy:n.py,r:n.r,fill:`url(#sphere-${n.color})`}))c.setAttribute(key,val);network.appendChild(c);});

const menu=document.querySelector('.menu-toggle');
const nav=document.getElementById('navigation');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
window.addEventListener('resize',()=>{if(window.innerWidth>600)closeMenu();});

const copyButton=document.getElementById('copy-email');
copyButton.addEventListener('click',async()=>{try{await navigator.clipboard.writeText('an.magan004@gmail.com');copyButton.textContent='Email address copied';document.getElementById('action-status').textContent='Email address copied to clipboard.';setTimeout(()=>{copyButton.textContent='Copy email address';},3000);}catch{copyButton.textContent='Email: an.magan004@gmail.com';document.getElementById('action-status').textContent='Please select and copy an.magan004@gmail.com from the email link.';}});
document.getElementById('year').textContent=new Date().getFullYear();
if('IntersectionObserver'in window){const sections=[...document.querySelectorAll('section[id]')];const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;nav.querySelectorAll('a').forEach(a=>a.classList.toggle('current',a.getAttribute('href')===`#${entry.target.id}`));}},{rootMargin:'-15% 0px -55% 0px',threshold:0});sections.forEach(section=>observer.observe(section));}
