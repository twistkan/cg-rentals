const icons = {
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  cinema:'<rect x="3" y="7" width="13" height="12" rx="2"/><path d="m16 11 5-3v10l-5-3M7 7V4h6v3"/><circle cx="9.5" cy="13" r="3"/>',
  mirrorless:'<path d="M4 7h4l2-3h5l2 3h3a1 1 0 0 1 1 1v11H3V8a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="4"/>',
  camcorders:'<rect x="3" y="8" width="13" height="10" rx="2"/><path d="m16 11 5-3v10l-5-3M6 8V5h8v3"/>',
  action:'<rect x="3" y="6" width="18" height="13" rx="3"/><circle cx="15" cy="12.5" r="3.5"/><rect x="6" y="9" width="4" height="3" rx=".5"/>',
  jibs:'<path d="m3 17 16-12 2 3L5 20M9 15l3 6M16 8V3M13 3h6M4 21h6"/>',
  dollies:'<rect x="4" y="12" width="16" height="5" rx="1"/><path d="m8 12 4-7 4 7M12 5V2"/><circle cx="7" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/>',
  sliders:'<path d="M3 13h18M3 17h18M6 13V9h8v4M8 17l-3 4M16 17l3 4M10 9V4M7 4h6"/>',
  stabilizers:'<rect x="9" y="3" width="10" height="7" rx="1.5"/><path d="M4 5v9h10v7M14 14v-4M11 21h6M7 5H3"/>',
  book:'<path d="M12 6C8 3 5 3 2 4v15c3-1 6-1 10 2 4-3 7-3 10-2V4c-3-1-6-1-10 2Zm0 0v15"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  compare:'<path d="M7 3v18M17 3v18M3 8h8M13 16h8"/><circle cx="7" cy="8" r="2"/><circle cx="17" cy="16" r="2"/>'
};
const categories = [
  {id:'cinema',name:'Cinema cameras',short:'Cinema',family:'cameras'},
  {id:'mirrorless',name:'Mirrorless & DSLR',short:'Mirrorless / DSLR',family:'cameras'},
  {id:'camcorders',name:'Camcorders',short:'Camcorder',family:'cameras'},
  {id:'action',name:'Action & 360°',short:'Action / 360°',family:'cameras'},
  {id:'jibs',name:'Jibs & cranes',short:'Jib / crane',family:'rigs'},
  {id:'dollies',name:'Dollies',short:'Dolly',family:'rigs'},
  {id:'sliders',name:'Sliders',short:'Slider',family:'rigs'},
  {id:'stabilizers',name:'Gimbals & stabilizers',short:'Gimbal / stabilizer',family:'rigs'}
];
const $ = id => document.getElementById(id);
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.cinema}</svg>`;
const escape = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = price => new Intl.NumberFormat('en-UG').format(price);
const normalize = value => String(value).normalize('NFKD').toLowerCase().replace(/[–—-]/g,' ').replace(/[^\p{L}\p{N}\s]/gu,'').replace(/\s+/g,' ').trim();
let items = [], currentCategory = 'all', query = '', sort = 'catalogue', selected = new Set(), toastTimer;
document.querySelectorAll('[data-icon]').forEach(el => {el.innerHTML = icon(el.dataset.icon);});

function categoryFor(item) {return categories.find(c=>c.id===item.category);}
function itemLabel(item) {return `${item.title} · ${item.description}`;}
function filteredItems() {
  const terms = normalize(query).split(' ').filter(Boolean);
  const result = items.filter(item => {
    const category = categoryFor(item);
    const searchable = normalize(`${item.title} ${item.description} ${item.sourceName} ${item.sourceCategory} ${category.name}`);
    return (currentCategory === 'all' || item.category === currentCategory) && terms.every(t=>searchable.includes(t));
  });
  if(sort==='price-asc') result.sort((a,b)=>a.price-b.price||a.id-b.id);
  else if(sort==='price-desc') result.sort((a,b)=>b.price-a.price||a.id-b.id);
  else if(sort==='name') result.sort((a,b)=>a.title.localeCompare(b.title)||a.id-b.id);
  return result;
}
function buildCategories() {
  for(const category of categories) {
    const count = items.filter(item=>item.category===category.id).length;
    const button = document.createElement('button');
    button.className = 'category-button';button.dataset.category=category.id;button.setAttribute('aria-pressed','false');
    button.innerHTML = `<span class="nav-icon">${icon(category.id)}</span><span>${escape(category.name)}</span><span class="count">${count}</span>`;
    $(category.family==='cameras'?'cameraCategories':'rigCategories').append(button);
    const option = document.createElement('option');option.value=category.id;option.textContent=`${category.name} (${count})`;$('categorySelect').append(option);
  }
  document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>setCategory(button.dataset.category)));
}
function setCategory(category) {
  currentCategory=category;
  $('categorySelect').value=category;
  document.querySelectorAll('[data-category]').forEach(button=>{
    const active=button.dataset.category===category;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));
  });
  render();
}
function render() {
  const visible = filteredItems();
  $('equipmentTitle').textContent=currentCategory==='all'?'All equipment':categories.find(c=>c.id===currentCategory).name;
  $('resultsCount').textContent=`${visible.length} of ${items.length} items`;
  $('equipmentList').hidden=!visible.length;
  $('emptyState').hidden=Boolean(visible.length);
  $('clearSearch').hidden=!query;
  $('filterSummary').hidden=currentCategory==='all'&&!query;
  $('filterText').textContent=[currentCategory!=='all'?categories.find(c=>c.id===currentCategory).name:'All categories',query?`Search: “${query}”`:''].filter(Boolean).join(' · ');
  $('equipmentList').innerHTML=visible.map(item=>{
    const category=categoryFor(item), checked=selected.has(item.id);
    return `<article class="equipment-row${checked?' selected':''}" data-item="${item.id}" aria-label="${escape(itemLabel(item))}">
      <div class="item-main"><span class="item-icon">${icon(item.category)}</span><div class="item-copy"><h3 class="item-title">${escape(item.title)}</h3><p class="item-description">${escape(item.description)}</p></div></div>
      <span class="item-category${category.family==='rigs'?' rig-category':''}">${escape(category.short)}</span>
      <div class="item-price" aria-label="${money(item.price)} Ugandan shillings"><small>UGX</small>${money(item.price)}</div>
      <label class="compare-check"><span>Compare</span><input type="checkbox" data-select="${item.id}" ${checked?'checked':''} aria-label="Compare ${escape(itemLabel(item))}"></label>
    </article>`;
  }).join('');
  $('equipmentList').setAttribute('aria-busy','false');
  $('equipmentList').querySelectorAll('[data-select]').forEach(input=>input.addEventListener('change',()=>toggleSelection(Number(input.dataset.select))));
  renderSelection();
}
function notify(message) {
  clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;toastTimer=setTimeout(()=>{$('toast').hidden=true;},3500);
}
function saveSelection() {try{localStorage.setItem('cg-rentals-compare-v1',JSON.stringify([...selected]));}catch{}}
function toggleSelection(id) {
  if(selected.has(id)) selected.delete(id);
  else if(selected.size<4) selected.add(id);
  else {const input=document.querySelector(`[data-select="${id}"]`);if(input)input.checked=false;notify('You can compare up to 4 items. Remove one to add another.');return;}
  saveSelection();
  // Keep the active checkbox mounted so keyboard focus stays on the row.
  document.querySelectorAll('[data-select]').forEach(input=>{
    input.checked=selected.has(Number(input.dataset.select));input.closest('.equipment-row').classList.toggle('selected',input.checked);
  });
  renderSelection();
  if($('compareDialog').open) renderComparison();
}
function renderSelection() {
  const count=selected.size;
  $('selectionTray').hidden=!count;document.body.classList.toggle('has-selection',Boolean(count));
  $('selectionTitle').textContent=`${count} item${count===1?'':'s'} selected`;
  $('selectionHint').textContent=count===1?'Add one more to compare prices':`${count} of 4 comparison slots filled`;
  document.querySelectorAll('.compare-launch').forEach(button=>button.disabled=count<2);
  document.querySelectorAll('.compare-count').forEach(el=>el.textContent=count);
  $('selectedItems').innerHTML=[...selected].map(id=>{
    const item=items.find(i=>i.id===id);
    return `<div class="selected-chip" title="${escape(itemLabel(item))}"><span>${escape(item.title)}</span><button data-remove="${id}" aria-label="Remove ${escape(itemLabel(item))} from comparison">${icon('close')}</button></div>`;
  }).join('');
  $('selectedItems').querySelectorAll('[data-remove]').forEach(button=>button.addEventListener('click',()=>toggleSelection(Number(button.dataset.remove))));
}
function renderComparison() {
  const compared=[...selected].map(id=>items.find(item=>item.id===id));
  if(!compared.length){$('compareDialog').close();return;}
  const lowest=Math.min(...compared.map(item=>item.price));
  const grid=$('compareGrid');grid.style.setProperty('--compare-columns',Math.min(compared.length,4));
  grid.innerHTML=compared.map(item=>{
    const category=categoryFor(item), difference=item.price-lowest;
    const delta=compared.length<2?'Add another item to compare':difference?`+${money(difference)} UGX vs lowest`:'Lowest listed price';
    return `<article class="compare-card${difference===0?' best':''}"><div class="compare-card-top"><span class="item-icon">${icon(item.category)}</span><button class="icon-button" data-compare-remove="${item.id}" aria-label="Remove ${escape(itemLabel(item))} from comparison">${icon('close')}</button></div>
      <div class="compare-card-body"><span class="item-category${category.family==='rigs'?' rig-category':''}">${escape(category.short)}</span><h3>${escape(item.title)}</h3><p>${escape(item.description)}</p><div class="compare-price"><small>LISTED PRICE · UGX</small>${money(item.price)}</div><div class="price-delta${difference===0?' lowest':''}">${escape(delta)}</div></div>
      <div class="source-name"><strong>CATALOGUE ENTRY</strong>${escape(item.sourceName)}</div></article>`;
  }).join('');
  grid.querySelectorAll('[data-compare-remove]').forEach(button=>button.addEventListener('click',()=>{
    const id=Number(button.dataset.compareRemove);toggleSelection(id);
    if($('compareDialog').open)$('closeCompare').focus();
  }));
}
function resetFilters() {
  query='';$('search').value='';sort='catalogue';$('sort').value=sort;setCategory('all');
}
$('search').addEventListener('input',event=>{query=event.target.value;render();});
$('clearSearch').addEventListener('click',()=>{query='';$('search').value='';render();$('search').focus();});
$('sort').addEventListener('change',event=>{sort=event.target.value;render();});
$('categorySelect').addEventListener('change',event=>setCategory(event.target.value));
['resetFilters','emptyReset'].forEach(id=>$(id).addEventListener('click',resetFilters));
$('clearSelection').addEventListener('click',()=>{selected.clear();saveSelection();render();$('search').focus();});
document.querySelectorAll('.compare-launch').forEach(button=>button.addEventListener('click',()=>{
  if(selected.size<2)return;renderComparison();$('compareDialog').showModal();$('closeCompare').focus();
}));
['closeCompare','backToCatalogue'].forEach(id=>$(id).addEventListener('click',()=>$('compareDialog').close()));
$('compareDialog').addEventListener('click',event=>{if(event.target===$('compareDialog')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.target.close();}});
$('reload').addEventListener('click',()=>location.reload());
document.addEventListener('keydown',event=>{
  if(event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!$('compareDialog').open&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){
    event.preventDefault();$('search').focus();
  }
});
try {
  const response=await fetch('./catalogue.json');if(!response.ok)throw new Error('Catalogue unavailable');
  items=await response.json();
  if(!Array.isArray(items)||items.length!==38)throw new Error('Incomplete catalogue');
  try{const saved=JSON.parse(localStorage.getItem('cg-rentals-compare-v1')||'[]');if(Array.isArray(saved))selected=new Set(saved.filter(id=>items.some(item=>item.id===id)).slice(0,4));}catch{}
  buildCategories();render();
} catch(error) {
  $('equipmentList').hidden=true;$('loadError').hidden=false;$('resultsCount').textContent='Catalogue unavailable';
}
