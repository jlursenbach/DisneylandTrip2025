/* priorities.js – simple localStorage-driven table */
const STORAGE_KEY = 'dl_trip_priorities_v1';
const tableBody = document.querySelector('#prio-table tbody');
const btnAdd = document.getElementById('add-row');

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
function saveData(rows) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}
function buildRow(rowData, idx) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td contenteditable>${rowData.name || ''}</td>
    <td contenteditable>${rowData.p1 || ''}</td>
    <td contenteditable>${rowData.p2 || ''}</td>
    <td contenteditable>${rowData.p3 || ''}</td>
    <td contenteditable>${rowData.p4 || ''}</td>
    <td contenteditable>${rowData.p5 || ''}</td>
    <td><button data-idx="${idx}" class="del">🗑</button></td>`;
  return tr;
}
function render() {
  tableBody.innerHTML = '';
  const rows = loadData();
  rows.forEach((r, i) => tableBody.appendChild(buildRow(r, i)));
}
function gatherRows() {
  return [...tableBody.querySelectorAll('tr')].map(tr => {
    const cells = tr.querySelectorAll('td');
    return {
      name: cells[0].innerText.trim(),
      p1: cells[1].innerText.trim(),
      p2: cells[2].innerText.trim(),
      p3: cells[3].innerText.trim(),
      p4: cells[4].innerText.trim(),
      p5: cells[5].innerText.trim()
    };
  });
}
// Initial render
render();

// Add row handler
btnAdd.addEventListener('click', () => {
  tableBody.appendChild(buildRow({} , loadData().length));
});

// Delegate delete + autosave
document.addEventListener('click', e => {
  if(e.target.classList.contains('del')){
    e.target.closest('tr').remove();
    saveData(gatherRows());
  }
});

// Autosave on focusout
tableBody.addEventListener('focusout', () => {
  saveData(gatherRows());
});
