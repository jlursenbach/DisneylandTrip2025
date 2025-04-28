/* priorities.js  – v3 cloud-sync */
const SHEET_URL =
  'https://script.google.com/macros/s/AKfycbwkcTIZpKci9R4DUtqmSMiU4VdXJ2WfGZibtO8W2Rge5BYdtlJT0rxrTNEsTqYaK9mE/exec';

const wrapper = document.getElementById('people-lists');
const addBtn  = document.getElementById('add-person');
let choiceDB  = {};   // from choices.json

/* 1️⃣  load master choices THEN load saved rows */
fetch('../assets/choices.json')
  .then(r=>r.json())
  .then(db=>{
      choiceDB=db;
      loadRowsFromSheet();
      addBtn.onclick = addPerson;
  });

/* ---------- card builder ---------- */
function buildCard(name, pairs=[{},{},{},{},{}]){
  const card = document.createElement('div');
  card.className='card person-card';
  card.dataset.name=name;

  card.innerHTML = `
    <details open>
      <summary>
        <span class="title">${name}&apos;s Must-Dos</span>
        <button class="remove">✖</button>
      </summary>
      <div class="top5-form"></div>
    </details>`;
  wrapper.appendChild(card);

  card.querySelector('.remove').onclick=e=>{
      e.stopPropagation();
      card.remove(); pushToSheet(name, true);
  };

  const form = card.querySelector('.top5-form');

  for(let i=0;i<5;i++){
    const row = document.createElement('div');
    row.className='pair';
    const catSel=document.createElement('select');
    const attSel=document.createElement('select');
    catSel.className='cat'; attSel.className='att'; attSel.disabled=true;

    catSel.innerHTML='<option value="">Category…</option>';
    Object.keys(choiceDB).forEach(cat=>{
      catSel.innerHTML+=`<option value="${cat}">${cat}</option>`;
    });

    catSel.onchange=()=>{
      attSel.innerHTML='<option value="">Attraction…</option>';
      attSel.disabled=!choiceDB[catSel.value];
      if(!attSel.disabled){
        choiceDB[catSel.value].forEach(a=>{
          attSel.innerHTML+=`<option value="${a}">${a}</option>`;
        });
      }
      pushToSheet(name);
    };
    attSel.onchange=()=>pushToSheet(name);

    /* restore saved */
    if(pairs[i].cat){
      catSel.value=pairs[i].cat;
      catSel.onchange();
      setTimeout(()=>{attSel.value=pairs[i].att;},50);
    }
    row.append(catSel,attSel); form.appendChild(row);
  }
}

/* ---------- Add-Me handler ---------- */
function addPerson(){
  const name=prompt('Your name?'); if(!name) return;
  if(document.querySelector(`[data-name="${name}"]`)){alert('Name exists');return;}
  buildCard(name);
}

/* ---------- push one person to Sheet ---------- */
function pushToSheet(name,remove=false){
  const rows=[...document.querySelectorAll(`[data-name="${name}"] .pair`)];
  const pairs=rows.map(r=>{
      const cat=r.querySelector('.cat').value||'';
      const att=r.querySelector('.att').value||'';
      return {cat,att};
  });
  if(remove) pairs.forEach(p=>{p.cat='';p.att='';});

  fetch(SHEET_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      name,
      c1:pairs[0].cat, a1:pairs[0].att,
      c2:pairs[1].cat, a2:pairs[1].att,
      c3:pairs[2].cat, a3:pairs[2].att,
      c4:pairs[3].cat, a4:pairs[3].att,
      c5:pairs[4].cat, a5:pairs[4].att
    })
  }).then(()=>console.log('Saved',name));
}

/* ---------- pull all rows, build cards ---------- */
async function loadRowsFromSheet(){
  const data=await fetch(SHEET_URL).then(r=>r.json());
  data.slice(1).forEach(r=>{
    const [name,...cols]=r;
    if(!name) return;
    const pairs=[];
    for(let i=0;i<10;i+=2){
      pairs.push({cat:cols[i]||'',att:cols[i+1]||''});
    }
    buildCard(name,pairs);
  });
}
