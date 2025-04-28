/* priorities.js – v2 (overwrite row, header flex, auto-load) */
const sheetURL =
  'https://script.google.com/macros/s/AKfycbzcUxvfnsvzggOhK8e6VOoHKzZqgLqWwm8gtvzLqGJRBEBtA2wiAuCOhLeusRBRosii/exec';

const wrapper  = document.getElementById('people-lists');
const addBtn   = document.getElementById('add-person');
let   db = {};          // choices.json

/* ---------- load master choice DB once ---------- */
fetch('../assets/choices.json').then(r=>r.json()).then(d=>{db=d; start();});

function start(){
  loadExistingRows();            // pull Sheet rows → cards
  addBtn.onclick = () => {
    const name = prompt('Your name?'); if(!name) return;
    if (document.querySelector(`[data-name="${name}"]`)) { alert('Name exists'); return; }
    buildCard(name, []);         // fresh (empty) card
  };
}

/* ---------- build one collapsible card ---------- */
function buildCard(name, savedPairs = []) {

  // ── card shell
  const card  = document.createElement('div');
  card.className = 'card person-card';
  card.dataset.name = name;

  // ── <details> wrapper (built-in dropdown)
  const details = document.createElement('details');
  details.open = true;               // start open; remove if you want closed-by-default
  card.appendChild(details);

  // ── summary line (title + close button)
  const summary = document.createElement('summary');
  summary.innerHTML =
      `<span class="title">${name}&apos;s Must-Dos</span>
       <button class="remove" title="Remove">✖</button>`;
  details.appendChild(summary);

  // close-button handler
  summary.querySelector('.remove').onclick = (e)=>{
      e.stopPropagation();           // don’t toggle accordion
      card.remove();                 // remove from DOM
      pushToSheet(name,true);        // clear in sheet
  };

  // ── body (flex column of 5 rows)
  const body = document.createElement('div');
  body.className = 'top5-form';
  details.appendChild(body);

  for (let i=0; i<5; i++){
    const pair = savedPairs[i] || {};
    const row  = document.createElement('div');
    row.className = 'pair';

    const catSel = document.createElement('select');
    const attSel = document.createElement('select');
    catSel.className='cat';  attSel.className='att';  attSel.disabled=true;

    catSel.innerHTML = '<option value="">Category…</option>';
    Object.keys(db).forEach(cat=>{
      catSel.innerHTML += `<option value="${cat}">${cat}</option>`;
    });

    catSel.onchange = ()=>{
      attSel.innerHTML = '<option value="">Attraction…</option>';
      attSel.disabled = !db[catSel.value];
      if (!attSel.disabled){
        db[catSel.value].forEach(a=>{
          attSel.innerHTML += `<option value="${a}">${a}</option>`;
        });
      }
      pushToSheet(name);
    };
    attSel.onchange = ()=> pushToSheet(name);

    /* restore previous choice */
    if (pair.cat){
      catSel.value = pair.cat;        // fire to fill attractions
      catSel.onchange();
      setTimeout(()=>{attSel.value = pair.att;},50);
    }

    row.append(catSel, attSel);
    body.appendChild(row);
  }
  wrapper.appendChild(card);
}


/* ---------- send / delete row in sheet ---------- */
function pushToSheet(name, remove=false){
  // gather pairs
  let c = Array.from(document.querySelectorAll(`[data-name="${name}"] .pair`))
          .map(p=>{
              const cat = p.querySelector('.cat').value || '';
              const att = p.querySelector('.att').value || '';
              return {cat,att};
          });

  // build payload (empty strings if removed)
  if(remove) c = [{}, {}, {}, {}, {}];

  fetch(sheetURL, {
    method:'POST', mode:'no-cors',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      name,
      c1:c[0].cat||'', a1:c[0].att||'',
      c2:c[1].cat||'', a2:c[1].att||'',
      c3:c[2].cat||'', a3:c[2].att||'',
      c4:c[3].cat||'', a4:c[3].att||'',
      c5:c[4].cat||'', a5:c[4].att||''
    })
  });
}

/* ---------- load rows from sheet on page load ---------- */
async function loadExistingRows(){
  const raw = await fetch(sheetURL).then(r=>r.json());
  raw.slice(1).forEach(r=>{
    const [name, ...cols] = r;
    if(!name) return;
    const pairs=[];
    for(let i=0;i<10;i+=2){
      pairs.push({cat:cols[i]||'', att:cols[i+1]||''});
    }
    buildCard(name, pairs);
  });
}
