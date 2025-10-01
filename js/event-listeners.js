// ===== TEMA =====
themeToggle.addEventListener('click', () => {
  const current = htmlRoot.getAttribute('data-theme');
  const newTheme = current === 'light' ? 'dark' : 'light';
  htmlRoot.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

// ===== FORM SUBMIT =====
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  const date = dateInput.value;
  const time = timeInput.value;
  
  if (!text) return;
  
  // Se non è impostata una categoria, mostra la modale
  if (!tempTodo || !tempTodo.category) {
    tempTodo = { text, date, time };
    openCategoryModal();
    return;
  }
  
  // Aggiungi il todo con categoria, ora e checklist
  const newTodo = {
    id: Date.now(),
    text,
    completed: false,
    date,
    time,
    category: tempTodo.category,
    checklist: tempTodo.checklist || []
  };
  
  todos.push(newTodo);
  
  // Schedula notifica per il nuovo task
  scheduleNotification(newTodo);
  
  input.value = '';
  tempTodo = null;
  tempChecklistItems = [];
  
  saveAndRender();
});

// ===== MODALE CATEGORIA - CONFERMA =====
document.getElementById('confirm-category').addEventListener('click', () => {
  let selectedCategory = '';
  
  // Check radio buttons
  const selectedRadio = document.querySelector('input[name="category"]:checked');
  if (selectedRadio) {
    if (selectedRadio.value === 'custom') {
      selectedCategory = categoryInput.value.trim() || 'Senza categoria';
    } else {
      selectedCategory = selectedRadio.value;
    }
  } else {
    selectedCategory = 'Senza categoria';
  }
  
  // Add category and checklist to tempTodo
  if (tempTodo) {
    tempTodo.category = selectedCategory;
    if (enableChecklistCheckbox.checked) {
      tempTodo.checklist = [...tempChecklistItems];
    }
  }
  
  categoryModal.style.display = 'none';
  
  // Reset form
  categoryRadios.forEach(radio => radio.checked = false);
  categoryInput.value = '';
  categoryInput.disabled = true;
  enableChecklistCheckbox.checked = false;
  checklistItems.style.display = 'none';
  tempChecklistItems = [];
  renderChecklistItems();
  
  // Submit the form
  if (tempTodo) {
    form.dispatchEvent(new Event('submit'));
  }
});

// ===== CANCEL CATEGORY HANDLER =====
document.getElementById('cancel-category').addEventListener('click', () => {
  categoryModal.style.display = 'none';
  tempTodo = null;
  
  // Reset form
  categoryRadios.forEach(radio => radio.checked = false);
  categoryInput.value = '';
  categoryInput.disabled = true;
  enableChecklistCheckbox.checked = false;
  checklistItems.style.display = 'none';
  tempChecklistItems = [];
  renderChecklistItems();
});

// ===== GESTIONE CATEGORIE RADIO BUTTONS =====
categoryRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    const customInput = document.getElementById('category-input');
    if (radio.value === 'custom') {
      customInput.disabled = false;
      customInput.focus();
    } else {
      customInput.disabled = true;
      customInput.value = '';
    }
  });
});

// ===== GESTIONE CHECKLIST =====
enableChecklistCheckbox?.addEventListener('change', () => {
  if (enableChecklistCheckbox.checked) {
    if (checklistItems) checklistItems.style.display = 'block';
    checklistItemInput?.focus();
  } else {
    if (checklistItems) checklistItems.style.display = 'none';
    tempChecklistItems = [];
    renderChecklistItems();
  }
});

addChecklistBtn?.addEventListener('click', addChecklistItem);
checklistItemInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addChecklistItem();
  }
});

// ===== KEYBOARD HANDLERS =====
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('category-modal').style.display = 'none';
    tempTodo = null;
  }
});

// ===== DROPDOWN FILTRI =====
document.querySelectorAll('.dropdown-toggle').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = btn.nextElementSibling;
    if (menu.classList.contains('active')) {
      menu.classList.remove('active');
    } else {
      closeAllMenus();
      menu.classList.add('active');
    }
  });
});

document.addEventListener('click', () => {
  closeAllMenus();
});

// Toggle Stato (Da fare / Completato)
const statusToggle = document.getElementById('status-toggle');
statusToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  const currentState = statusToggle.dataset.state;
  const newState = currentState === 'active' ? 'completed' : 'active';
  statusToggle.dataset.state = newState;
  currentFilter = newState;
  renderTodos();
});

// Toggle Vista (Lista / Calendario)
const viewToggle = document.getElementById('view-toggle');
viewToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  const currentViewState = viewToggle.dataset.view;
  const newView = currentViewState === 'list' ? 'calendar' : 'list';
  viewToggle.dataset.view = newView;
  currentView = newView;
  renderTodos();
});

// ===== FILTRO GIORNO =====
document.querySelectorAll('#day-menu .dropdown-item').forEach(item => {
  item.addEventListener('click', () => {
    currentDayFilter = item.dataset.value;
    document.querySelectorAll('#day-menu .dropdown-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    closeAllMenus();
    renderTodos();
  });
});

// ===== NAVIGAZIONE CALENDARIO =====
prevMonthBtn?.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  updateCalendarNavigation();
  if (currentView === 'calendar') renderTodos();
});

nextMonthBtn?.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  updateCalendarNavigation();
  if (currentView === 'calendar') renderTodos();
});

// ===== RESET FILTRI =====
resetFiltersBtn.addEventListener('click', () => {
  currentFilter = 'active';
  currentCategoryFilter = 'all';
  currentDayFilter = 'all';
  currentView = 'list';
  
  // Reset toggle buttons
  const statusToggle = document.getElementById('status-toggle');
  const viewToggle = document.getElementById('view-toggle');
  if (statusToggle) statusToggle.dataset.state = 'active';
  if (viewToggle) viewToggle.dataset.view = 'list';
  
  // Reset visual indicators per dropdown rimanenti
  document.querySelectorAll('.dropdown-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Reset "all" items to active per dropdown rimanenti
  const categoryAll = document.querySelector('#category-menu [data-value="all"]');
  const dayAll = document.querySelector('#day-menu [data-value="all"]');
  if (categoryAll) categoryAll.classList.add('active');
  if (dayAll) dayAll.classList.add('active');
  
  closeAllMenus();
  renderTodos();
});

// ===== MODALE DETTAGLIO - CHIUDI =====
closeDetailBtn.addEventListener('click', () => {
  detailModal.style.display = 'none';
});

// Chiudi modale dettaglio cliccando fuori
detailModal.addEventListener('click', (e) => {
  if (e.target === detailModal) {
    detailModal.style.display = 'none';
  }
});

// ===== EVENT LISTENERS NOTIFICHE =====
notificationToggleBtn?.addEventListener('click', () => {
  notificationModal.style.display = 'flex';
});

closeNotificationBtn?.addEventListener('click', () => {
  notificationModal.style.display = 'none';
});

notificationModal?.addEventListener('click', (e) => {
  if (e.target === notificationModal) {
    notificationModal.style.display = 'none';
  }
});

saveNotificationBtn?.addEventListener('click', async () => {
  // Se l'utente abilita le notifiche, richiedi permesso
  if (notificationEnabledCheckbox.checked && !notificationPermission) {
    const permission = await Notification.requestPermission();
    notificationPermission = permission === 'granted';
    
    if (!notificationPermission) {
      alert('Permessi notifiche negati. Le notifiche non funzioneranno.');
      notificationEnabledCheckbox.checked = false;
      return;
    }
  }
  
  saveNotificationSettings();
  notificationModal.style.display = 'none';
  
  // Mostra messaggio di conferma
  const message = notificationSettings.enabled 
    ? `Notifiche abilitate! Riceverai un avviso ${notificationSettings.minutesBefore} minuti prima di ogni task.`
    : 'Notifiche disabilitate.';
  
  // Potresti aggiungere un toast notification qui
  console.log(message);
});

// ===== LISTENER MESSAGGI SERVICE WORKER =====
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data && event.data.type === 'COMPLETE_TODO') {
      // Trova e completa il todo
      const todoIndex = todos.findIndex(t => t.id === event.data.todoId);
      if (todoIndex !== -1) {
        toggleComplete(todoIndex);
      }
    }
  });
}

// ===== EVENT LISTENERS MODALE MODIFICA =====
editHasChecklist.addEventListener('change', () => {
  editChecklistContainer.style.display = editHasChecklist.checked ? 'block' : 'none';
  if (!editHasChecklist.checked) {
    editTempChecklistItems = [];
    renderEditChecklistItems();
  }
});

editAddChecklistBtn.addEventListener('click', () => {
  const text = editChecklistInput.value.trim();
  if (text) {
    editTempChecklistItems.push({ text, completed: false });
    editChecklistInput.value = '';
    renderEditChecklistItems();
  }
});

editChecklistInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const text = editChecklistInput.value.trim();
    if (text) {
      editTempChecklistItems.push({ text, completed: false });
      editChecklistInput.value = '';
      renderEditChecklistItems();
    }
  }
});

closeEditBtn.addEventListener('click', () => {
  editModal.style.display = 'none';
  editingTodoIndex = null;
  editTempChecklistItems = [];
});

cancelEditBtn.addEventListener('click', () => {
  editModal.style.display = 'none';
  editingTodoIndex = null;
  editTempChecklistItems = [];
});

confirmEditBtn.addEventListener('click', () => {
  if (editingTodoIndex === null) return;
  
  const text = editText.value.trim();
  if (!text) return;
  
  // Aggiorna il todo
  todos[editingTodoIndex].text = text;
  todos[editingTodoIndex].date = editDate.value;
  todos[editingTodoIndex].time = editTime.value;
  todos[editingTodoIndex].category = editCategory.value;
  todos[editingTodoIndex].checklist = editHasChecklist.checked ? [...editTempChecklistItems] : [];
  
  // Cancella vecchia notifica e crea nuova
  cancelNotification(todos[editingTodoIndex].id);
  scheduleNotification(todos[editingTodoIndex]);
  
  // Chiudi modale e salva
  editModal.style.display = 'none';
  editingTodoIndex = null;
  editTempChecklistItems = [];
  
  saveAndRender();
});

// Chiudi modale modifica cliccando fuori
editModal.addEventListener('click', (e) => {
  if (e.target === editModal) {
    editModal.style.display = 'none';
    editingTodoIndex = null;
    editTempChecklistItems = [];
  }
});

// ===== GESTIONE CHIUSURA POPOVER =====
document.addEventListener('click', (e) => {
  // Chiudi tutti i popover se si clicca fuori
  if (!e.target.closest('.todo-actions')) {
    document.querySelectorAll('.action-popover').forEach(popover => {
      popover.style.display = 'none';
    });
    // Rimuovi classe popover-open da tutti i todo-item e rimuovi focus dai menu button
    document.querySelectorAll('.todo-item').forEach(item => {
      item.classList.remove('popover-open');
      const menuBtn = item.querySelector('.menu-btn');
      if (menuBtn) menuBtn.blur();
    });
  }
});
