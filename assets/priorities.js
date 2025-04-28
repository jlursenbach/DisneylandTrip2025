// priorities.js

const top5Wrapper = document.getElementById('people-lists');
let top5Lists = []; // no longer relying on localStorage — will POST to cloud

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbymiX3sb_1odC7PhWFcKTlVO54t8RbNeUPvo6BS98VZDzG4hicVrXBJRrU-r2gcDZql/exec'; // <<< REPLACE THIS with your real Web App URL

async function loadChoices() {
  const response = await fetch('../assets/choices.json');
  return response.json();
}

function createPersonCard(person) {
  const card = document.createElement('div');
  card.className = 'card person-card';
  card.dataset.name = person.name;

  const header = document.createElement('h3');
  header.textContent = `${person.name}'s Must-Dos`;
  card.appendChild(header);

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '✖';
  removeBtn.className = 'remove-btn';
  removeBtn.onclick = () => removePerson(person.name);
  card.appendChild(removeBtn);

  const table = document.createElement('table');

  for (let i = 0; i < 5; i++) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');

    const categorySelect = document.createElement('select');
    categorySelect.className = 'category-select';
    categorySelect.innerHTML = '<option value="">Choose Category</option>';

    const choiceSelect = document.createElement('select');
    choiceSelect.className = 'choice-select';
    choiceSelect.innerHTML = '<option value="">Choose Attraction</option>';

    td.appendChild(categorySelect);
    td.appendChild(choiceSelect);
    tr.appendChild(td);
    table.appendChild(tr);
  }
  card.appendChild(table);
  top5Wrapper.appendChild(card);

  populateCategories(card, person.name);
}

function populateCategories(card, personName) {
  loadChoices().then(data => {
    const categorySelects = card.querySelectorAll('.category-select');
    const choiceSelects = card.querySelectorAll('.choice-select');

    categorySelects.forEach((catSel, idx) => {
      catSel.innerHTML = '<option value="">Choose Category</option>';
      Object.keys(data).forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        catSel.appendChild(option);
      });

      catSel.onchange = function() {
        const selectedCategory = this.value;
        const choiceSelect = choiceSelects[idx];
        choiceSelect.innerHTML = '<option value="">Choose Attraction...</option>';

        if (data[selectedCategory]) {
          choiceSelect.disabled = false;
          data[selectedCategory].forEach(attraction => {
            const opt = document.createElement('option');
            opt.value = attraction;
            opt.textContent = attraction;
            choiceSelect.appendChild(opt);
          });
        } else {
          choiceSelect.disabled = true;
        }
      };
    });

    choiceSelects.forEach(sel => {
      sel.onchange = () => {
        savePersonToSheet(personName);
      };
    });
  });
}

function savePersonToSheet(personName) {
  const personCard = document.querySelector(`.person-card[data-name="${personName}"]`);
  if (!personCard) return;

  const rows = personCard.querySelectorAll('table tr');
  const choices = [];

  rows.forEach(row => {
    const cat = row.querySelector('.category-select')?.value || '';
    const choice = row.querySelector('.choice-select')?.value || '';
    choices.push({ category: cat, attraction: choice });
  });

  fetch(WEB_APP_URL, {
    method: 'POST',
    body: JSON.stringify({
      name: personName,
      choice1: choices[0]?.attraction || '',
      choice2: choices[1]?.attraction || '',
      choice3: choices[2]?.attraction || '',
      choice4: choices[3]?.attraction || '',
      choice5: choices[4]?.attraction || ''
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(res => res.json())
  .then(data => console.log('Saved to Sheet:', data))
  .catch(err => console.error('Error saving:', err));
}

function removePerson(name) {
  const card = document.querySelector(`.person-card[data-name="${name}"]`);
  if (card) card.remove();
}

function addNewPerson() {
  const name = prompt('Enter your name:');
  if (!name) return;
  if (document.querySelector(`.person-card[data-name="${name}"]`)) {
    alert('That name already exists!');
    return;
  }

  const person = { name: name, choices: [] };
  createPersonCard(person);
}

// --- On page load ---
document.getElementById('add-person').onclick = addNewPerson;
