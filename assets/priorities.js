// priorities.js
const top5Wrapper = document.getElementById('top5Wrapper');
let top5Lists = JSON.parse(localStorage.getItem('top5Lists')) || [];

async function loadChoices() {
  const response = await fetch('../assets/choices.json');
  return response.json();
}

function saveToLocalStorage() {
  localStorage.setItem('top5Lists', JSON.stringify(top5Lists));
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

  // Create Top 5 rows
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

  populateCategories(card);
  if (person.choices) populatePersonChoices(card, person.choices);
}

function populateCategories(card) {
  loadChoices().then(data => {
    const categorySelects = card.querySelectorAll('.category-select');
    categorySelects.forEach(catSel => {
      catSel.innerHTML = '<option value="">Choose Category</option>';
      Object.keys(data).forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        catSel.appendChild(option);
      });

      catSel.onchange = function() {
        const selectedCategory = this.value;
        const choiceSelect = this.nextElementSibling;
        choiceSelect.innerHTML = '<option value="">Choose Attraction</option>';
        if (data[selectedCategory]) {
          data[selectedCategory].forEach(choice => {
            const opt = document.createElement('option');
            opt.value = choice;
            opt.textContent = choice;
            choiceSelect.appendChild(opt);
          });
        }
        savePersonChoices();
      };
    });

    const choiceSelects = card.querySelectorAll('.choice-select');
    choiceSelects.forEach(sel => {
      sel.onchange = savePersonChoices;
    });
  });
}

function savePersonChoices() {
  const allCards = document.querySelectorAll('.person-card');
  top5Lists = [];

  allCards.forEach(card => {
    const person = {
      name: card.dataset.name,
      choices: []
    };
    const rows = card.querySelectorAll('table tr');
    rows.forEach(row => {
      const cat = row.querySelector('.category-select')?.value || '';
      const choice = row.querySelector('.choice-select')?.value || '';
      person.choices.push({ category: cat, attraction: choice });
    });
    top5Lists.push(person);
  });

  saveToLocalStorage();
}

function populatePersonChoices(card, choices) {
  const rows = card.querySelectorAll('table tr');
  choices.forEach((choice, idx) => {
    if (rows[idx]) {
      const catSel = rows[idx].querySelector('.category-select');
      const choiceSel = rows[idx].querySelector('.choice-select');
      if (catSel && choiceSel) {
        catSel.value = choice.category;
        catSel.dispatchEvent(new Event('change'));
        setTimeout(() => {
          choiceSel.value = choice.attraction;
        }, 100); // slight delay to allow populate
      }
    }
  });
}

function removePerson(name) {
  const card = document.querySelector(`.person-card[data-name="${name}"]`);
  if (card) card.remove();
  top5Lists = top5Lists.filter(p => p.name !== name);
  saveToLocalStorage();
}

function addNewPerson() {
  const name = prompt('Enter your name:');
  if (!name) return;
  if (top5Lists.find(p => p.name === name)) {
    alert('That name already exists!');
    return;
  }
  const person = { name: name, choices: [] };
  top5Lists.push(person);
  saveToLocalStorage();
  createPersonCard(person);
}

// --- On page load ---
top5Lists.forEach(createPersonCard);
document.getElementById('addPersonBtn').onclick = addNewPerson;
