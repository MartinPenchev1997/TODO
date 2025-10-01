// ===== DROPDOWN FILTRI =====
function closeAllMenus() {
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.classList.remove('active');
  });
}

// Menu Categoria
function updateCategoryMenu() {
  const menu = document.getElementById('category-menu');
  menu.innerHTML = '<div class="dropdown-item" data-value="all">Tutte</div>';
  
  // Aggiungi listener per "Tutte"
  const allItem = menu.querySelector('[data-value="all"]');
  allItem.addEventListener('click', () => {
    currentCategoryFilter = 'all';
    closeAllMenus();
    renderTodos();
  });
  
  const categories = [...new Set(todos.map(t => t.category))];
  categories.forEach(cat => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    if (currentCategoryFilter === cat) item.classList.add('active');
    item.dataset.value = cat;
    item.textContent = cat;
    item.addEventListener('click', () => {
      currentCategoryFilter = cat;
      updateCategoryMenu();
      closeAllMenus();
      renderTodos();
    });
    menu.appendChild(item);
  });

  if (currentCategoryFilter === 'all') {
    menu.firstElementChild.classList.add('active');
  }
}
