/* priorities.js — cloud-save + tidy layout 23-05-2025 */

const WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbymiX3sb_1odC7PhWFcKTlVO54t8RbNeUPvo6BS98VZDzG4hicVrXBJRrU-r2gcDZql/exec';

const top5Wrapper = document.getElementById('people-lists');
const addBtn      = document.getElementById('add-person');

let choiceDB = {};

/* ---------- load master choices once ---------- */
fetch('../assets/choices.json')
  .then(r => r.json())
  .then(data => { choiceDB = data; });

/* ---------- add-person flow ---------- */
addBtn.onclick = async () => {
  const name = prompt('Enter your name:');
  if (!name) return;
  if (document.querySelector(`[data-name="${name}"]`)) {
    alert('That name already exists!');
    return;
  }
  createCard(name);
};

/* ---------- build one collapsible card ---------- */
function createCard(name, savedChoices = []) {
  const card = document.createElement('div');
  card.className = 'card person-card';
  card.dataset.name = name;

  /* header line */
  const header = document.createElement('div');
  header.className = 'card-header';
  header.innerHTML = `<strong>${name}&apos;s Must-Dos</strong>`;

  const close = document.createElement('button');
  close.className = 'remove-btn';
  close.textContent = '✖';
  close.onclick = () => { card.remove(); };
  header.appendChild(close);
  card.appendChild(header);

  /* collapsible body */
  const body = document.createElement('div');
  body.className = 'top5-form';

  for (let i = 0; i < 5; i++) {
    const row = document.createElement('div');
    row.className = 'top5-row';

    const catSel   = document.createElement('select');
    const itemSel  = document.createElement('select');
    catSel.className  = 'cat';
    itemSel.className = 'item';
    catSel.innerHTML  = `<option value="">Category…</option>`;
    Object.keys(choiceDB).forEach(cat => {
      catSel.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
    itemSel.innerHTML = `<option value="">Attraction…</option>`;
    itemSel.disabled  = true;

    /* populate second dropdown when category changes */
    catSel.onchange = () => {
      itemSel.innerHTML = `<option value="">Attraction…</option>`;
      itemSel.disabled  = !choiceDB[catSel.value];
      if (!itemSel.disabled) {
        choiceDB[catSel.value].forEach(a=>{
          itemSel.innerHTML += `<option value="${a}">${a}</option>`;
        });
      }
      pushToSheet(name);           // save on every change
    };
    itemSel.onchange = () => pushToSheet(name);

    /* restore previously-saved selection */
    if (savedChoices[i]) {
      catSel.value = savedChoices[i].category;
      catSel.onchange();           // populate items
      setTimeout(()=>{ itemSel.value = savedChoices[i].attraction; }, 50);
    }

    row.append(catSel, itemSel);
    body.appendChild(row);
  }

  card.appendChild(body);
  top5Wrapper.appendChild(card);
}

/* ---------- write a person’s 5 picks to Google Sheet ---------- */
function pushToSheet(name) {
  const card = document.querySelector(`[data-name="${name}"]`);
  if (!card) return;

  const rows = [...card.querySelectorAll('.top5-row')];
  const picks = rows.map(r=>r.querySelector('.item').value || '');

  fetch(WEB_APP_URL, {
    method: 'POST',
    mode  : 'no-cors',            // !!! important for GitHub Pages
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({
      name,
      choice1: picks[0],
      choice2: picks[1],
      choice3: picks[2],
      choice4: picks[3],
      choice5: picks[4]
    })
  }).then(()=> console.log(`Saved ${name} to sheet`));
}

/* ---------- (optional) pull existing sheet rows on load ---------- */
async function loadSheetRows() {
  const res  = await fetch(WEB_APP_URL);
  const data = await res.json();          // [["Name","Choice1",…], …]
  data.slice(1).forEach(row => {          // skip header row
    const [ name, ...choices ] = row;
    const saved = choices.map(c=>({category:'',attraction:c}));
    createCard(name, saved);
  });
}
loadSheetRows();
