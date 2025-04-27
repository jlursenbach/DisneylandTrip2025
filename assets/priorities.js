// priorities.js

// Load the choices.json database
let attractionData = {};

fetch('../assets/choices.json')
  .then(response => response.json())
  .then(data => {
    attractionData = data;
  })
  .catch(error => {
    console.error('Error loading attractions list:', error);
  });

// DOM elements
const peopleLists = document.getElementById('people-lists');
const addPersonBtn = document.getElementById('add-person');

// Handle Add Person
addPersonBtn.addEventListener('click', () => {
  const name = prompt("What's your name?");
  if (!name) return;

  const personDiv = document.createElement('div');
  personDiv.classList.add('card', 'mt-1');

  // Dropdown Summary
  const summary = document.createElement('summary');
  summary.innerHTML = `<strong>${name}'s Must-Dos</strong>`;

  // Dropdown Container
  const details = document.createElement('details');
  details.open = true; // Start expanded by default
  details.appendChild(summary);

  // Inside: a small form with 5 slots
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

    // When category changes, populate attraction dropdown
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
});
