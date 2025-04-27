// priorities.js

let attractionData = {};
let peopleList = []; // local tracking array

// Load the choices.json database first
fetch('../assets/choices.json')
  .then(response => response.json())
  .then(data => {
    attractionData = data;
    loadPeopleFromStorage();
  })
  .catch(error => {
    console.error('Error loading attractions list:', error);
  });

const peopleLists = document.getElementById('people-lists');
const addPersonBtn = document.getElementById('add-person');

// Add Person button logic
addPersonBtn.addEventListener('click', () => {
  const name = prompt("What's your name?");
  if (!name) return;
  createPersonSection(name);
  peopleList.push(name);
  savePeopleToStorage();
});

// Function to create a new person's Top-5 section
function createPersonSection(name) {
  const personDiv = document.createElement('div');
  personDiv.classList.add('card', 'mt-1');
  personDiv.dataset.name = name;

  const details = document.createElement('details');
  details.open = true;

  const summary = document.createElement('summary');
  summary.innerHTML = `<strong>${name}'s Must-Dos</strong>`;

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '❌ Remove';
  removeBtn.style.marginLeft = '1rem';
  removeBtn.className = 'btn-remove';
  removeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    removePerson(name);
  });

  summary.appendChild(removeBtn);
  details.appendChild(summary);

  const form = document.createElement('div');
  form.classList.add('top5-form');

  for (let i = 1; i <= 5; i++) {
    const slot = document.createElement('div');
    slot.classList.add('top5-slot');

    const categorySelect = document.createElement('select');
    categorySelect.innerHTML = `<option value="">Pick Category...</option>`;
    Object.keys(attractionData).forEach(category => {
      categorySelect.innerHTML += `<option value="${category}">${category}</option>`;
    });

    const attractionSelect = document.createElement('select');
    attractionSelect.innerHTML = `<option value="">Pick Attraction...</option>`;
    attractionSelect.disabled = true;

    categorySelect.addEventListener('change', () => {
      const selectedCategory = categorySelect.value;
      if (selectedCategory && attractionData[selectedCategory]) {
        attractionSelect.disabled = false;
        attractionSelect.innerHTML = `<option value="">Pick Attraction...</option>`;
        attractionData[selectedCategory].forEach(attraction => {
          attractionSelect.innerHTML += `<option value="${attraction}">${attraction}</option>`;
        });
      } else {
        attractionSelect.disabled = true;
        attractionSelect.innerHTML = `<option value="">Pick Attraction...</option>`;
      }
    });

    slot.appendChild(categorySelect);
    slot.appendChild(attractionSelect);
    form.appendChild(slot);
  }

  details.appendChild(form);
  personDiv.appendChild(details);
  peopleLists.appendChild(personDiv);
}

// Save the list of people to LocalStorage
function savePeopleToStorage() {
  localStorage.setItem('peopleList', JSON.stringify(peopleList));
}

// Load the people from LocalStorage when page loads
function loadPeopleFromStorage() {
  const storedPeople = JSON.parse(localStorage.getItem('peopleList')) || [];
  storedPeople.forEach(name => {
    createPersonSection(name);
  });
  peopleList = storedPeople;
}

// Remove a person
function removePerson(name) {
  const personDiv = document.querySelector(`[data-name="${name}"]`);
  if (personDiv) {
    personDiv.remove();
  }
  peopleList = peopleList.filter(person => person !== name);
  savePeopleToStorage();
}
