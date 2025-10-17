// ===== DROPDOWN FILTRI =====
function closeAllMenus() {
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.classList.remove('active');
    // Ripristina tutti i menu nelle loro posizioni originali
    restoreMenuToOriginalPosition(menu);
  });
}

// Funzione per spostare il menu nel body e posizionarlo
function attachMenuToBody(toggleBtn, menu) {
  // Salva il parent originale come data attribute
  if (!menu.dataset.originalParent) {
    menu.dataset.originalParent = 'true';
    menu._originalParent = menu.parentElement;
    menu._originalNextSibling = menu.nextElementSibling;
  }
  
  // Calcola la posizione del toggle button
  const rect = toggleBtn.getBoundingClientRect();
  
  // Stacca il menu e riattaccalo al body
  document.body.appendChild(menu);
  
  // Applica posizionamento assoluto
  menu.style.position = 'fixed';
  menu.style.top = `${rect.bottom + 4}px`; // 4px di gap
  menu.style.left = `${rect.left}px`;
  menu.style.zIndex = '10000'; // Assicura che sia sopra tutto
  menu.style.minWidth = `${rect.width}px`;
}

// Funzione per ripristinare il menu nella posizione originale
function restoreMenuToOriginalPosition(menu) {
  if (menu._originalParent && menu.parentElement === document.body) {
    // Rimuovi gli stili di posizionamento
    menu.style.position = '';
    menu.style.top = '';
    menu.style.left = '';
    menu.style.zIndex = '';
    menu.style.minWidth = '';
    
    // Rimetti il menu nella posizione originale
    if (menu._originalNextSibling) {
      menu._originalParent.insertBefore(menu, menu._originalNextSibling);
    } else {
      menu._originalParent.appendChild(menu);
    }
  }
}

// Chiudi i menu quando si fa scroll o resize
window.addEventListener('scroll', closeAllMenus, true);
window.addEventListener('resize', closeAllMenus);

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
