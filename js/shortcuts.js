// ===== KEYBOARD SHORTCUTS =====

function initializeKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ignora shortcuts se si sta scrivendo in un input/textarea
    const isInputActive = document.activeElement.tagName === 'INPUT' || 
                          document.activeElement.tagName === 'TEXTAREA' ||
                          document.activeElement.isContentEditable;
    
    // Eccezione: Escape funziona sempre
    if (e.key === 'Escape') {
      closeAllModals();
      closeAllMenus();
      clearSearch();
      return;
    }
    
    // Altri shortcuts solo se non si sta scrivendo
    if (isInputActive && e.key !== '/') return;
    
    // Previeni default solo per shortcuts che usiamo
    const shortcutKeys = ['/', 'n', 's', 'r', 'c', 'v', '?'];
    if (shortcutKeys.includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
    
    // Ctrl/Cmd + S = Mostra statistiche
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      toggleStatistics();
      return;
    }
    
    switch (e.key.toLowerCase()) {
      case '/':
        // Focus sulla ricerca
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        break;
        
      case 'n':
        // New task - focus su input
        const todoInput = document.getElementById('todo-input');
        if (todoInput) {
          todoInput.focus();
        }
        break;
        
      case 's':
        // Toggle statistiche
        toggleStatistics();
        break;
        
      case 'r':
        // Reset filtri
        resetAllFilters();
        break;
        
      case 'c':
        // Toggle vista calendario
        const viewToggle = document.getElementById('view-toggle');
        if (viewToggle) {
          viewToggle.click();
        }
        break;
        
      case 'v':
        // Toggle stato (completati/attivi)
        const statusToggle = document.getElementById('status-toggle');
        if (statusToggle) {
          statusToggle.click();
        }
        break;
        
      case '?':
        // Mostra aiuto shortcuts
        showShortcutsHelp();
        break;
    }
  });
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.style.display = 'none';
  });
  
  // Reset editing state
  window.editingTodoIndex = null;
  window.editTempChecklistItems = [];
  window.tempTodo = null;
  window.tempChecklistItems = [];
}

function resetAllFilters() {
  currentFilter = 'active';
  currentCategoryFilter = 'all';
  currentDayFilter = 'all';
  currentView = 'list';
  searchQuery = '';
  currentSortBy = 'date';
  sortDirection = 'asc';
  
  // Reset UI
  const statusToggle = document.getElementById('status-toggle');
  const viewToggle = document.getElementById('view-toggle');
  const searchInput = document.getElementById('search-input');
  
  if (statusToggle) statusToggle.dataset.state = 'active';
  if (viewToggle) viewToggle.dataset.view = 'list';
  if (searchInput) searchInput.value = '';
  
  document.querySelectorAll('.dropdown-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const categoryAll = document.querySelector('#category-menu [data-value="all"]');
  const dayAll = document.querySelector('#day-menu [data-value="all"]');
  if (categoryAll) categoryAll.classList.add('active');
  if (dayAll) dayAll.classList.add('active');
  
  updateSortUI();
  closeAllMenus();
  renderTodos();
}

function showShortcutsHelp() {
  const helpModal = document.getElementById('shortcuts-help-modal');
  if (helpModal) {
    helpModal.style.display = 'flex';
  }
}
