// ===== UTILS =====
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Oggi';
  if (date.toDateString() === tomorrow.toDateString()) return 'Domani';
  
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

function groupTodosByDate(todosToRender) {
  const groups = {};
  todosToRender.forEach(todo => {
    const dateLabel = formatDate(todo.date);
    if (!groups[dateLabel]) groups[dateLabel] = [];
    groups[dateLabel].push(todo);
  });
  return groups;
}

// ===== SALVATAGGIO E RENDER =====
function saveAndRender() {
  localStorage.setItem('todos', JSON.stringify(todos));
  updateCategoryMenu();
  renderTodos();
}

// ===== NOTIFICHE UTENTE =====
function showNotification(message, duration = 3000) {
  // Crea elemento notifica
  const notification = document.createElement('div');
  notification.className = 'app-notification';
  notification.textContent = message;
  
  // Stili inline per evitare dipendenze CSS
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--primary);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Animazione entrata
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);
  
  // Rimozione automatica
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, duration);
}

// Reset dei campi della modale di modifica
function resetEditForm() {
  if (typeof input !== 'undefined' && input) input.value = '';
  const now = new Date();
  now.setMinutes(now.getMinutes()+30);
  if (typeof dateInput !== 'undefined' && dateInput) dateInput.value = now.toISOString().split('T')[0];
  if (typeof timeInput !== 'undefined' && timeInput) timeInput.value = now.toTimeString().split(' ')[0].substring(0, 5);
  if (typeof categoryInput !== 'undefined' && categoryInput) categoryInput.value = '';  
  document.querySelectorAll('input[name="priority"]').forEach(radio => radio.checked = false);
  document.getElementById('priority-none').checked = true; // Default none

  categoryRadios.forEach(radio => radio.checked = false);
  enableChecklistCheckbox.checked = false;
  recurrenceSelect.value = 'none';

  if (typeof editText !== 'undefined' && editText) editText.value = '';
  if (typeof editDate !== 'undefined' && editDate) editDate.value = '';
  if (typeof editTime !== 'undefined' && editTime) editTime.value = '';
  if (typeof editCategory !== 'undefined' && editCategory) editCategory.value = '';
  // Reset priorità
  document.querySelectorAll('input[name="edit-priority"]').forEach(radio => radio.checked = false);
  // Reset ricorrenza
  if (typeof editRecurrence !== 'undefined' && editRecurrence) editRecurrence.value = 'none';
  // Reset checklist
  if (typeof editHasChecklist !== 'undefined' && editHasChecklist) editHasChecklist.checked = false;
  if (typeof editChecklistContainer !== 'undefined' && editChecklistContainer) editChecklistContainer.style.display = 'none';
  if (typeof editTempChecklistItems !== 'undefined') editTempChecklistItems = [];
  if (typeof renderEditChecklistItems === 'function') renderEditChecklistItems();
}

// Inizializza lo stato del form al caricamento della pagina
function initializeFormState() {
  const savedState = localStorage.getItem('formVisible');
  
  if (savedState === 'false') {
    form.classList.add('form-hidden');
    form.classList.remove('form-visible');
  } else {
    // Default: form visibile
    form.classList.add('form-visible');
    form.classList.remove('form-hidden');
  }
}