// ===== AZIONI TODO =====
function toggleComplete(index) {
  const todo = todos[index];
  todo.completed = !todo.completed;
  
  if (todo.completed) {
    // Se completato, cancella la notifica
    cancelNotification(todo.id);
  } else {
    // Se riattivato, ri-schedula la notifica
    scheduleNotification(todo);
  }
  
  saveAndRender();
}

function deleteTodo(index) {
  const todo = todos[index];
  const item = document.querySelector(`.todo-item[data-index="${index}"]`);
  
  // Cancella la notifica prima di eliminare
  cancelNotification(todo.id);
  
  if (item) {
    item.classList.add('leaving');
    item.addEventListener('animationend', () => {
      todos.splice(index, 1);
      saveAndRender();
    });
  }
}

function editTodo(index) {
  const todo = todos[index];
  editingTodoIndex = index;
  
  // Popola i campi della modale
  editText.value = todo.text;
  editDate.value = todo.date;
  editTime.value = todo.time;
  editCategory.value = todo.category;
  
  // Gestione checklist
  editTempChecklistItems = todo.checklist ? [...todo.checklist] : [];
  editHasChecklist.checked = editTempChecklistItems.length > 0;
  editChecklistContainer.style.display = editTempChecklistItems.length > 0 ? 'block' : 'none';
  renderEditChecklistItems();
  
  // Mostra modale
  editModal.style.display = 'flex';
}

function addChecklistItem() {
  if (!checklistItemInput) return;
  const text = checklistItemInput.value.trim();
  if (text) {
    tempChecklistItems.push({ text, completed: false });
    checklistItemInput.value = '';
    renderChecklistItems();
  }
}

function removeChecklistItem(index) {
  tempChecklistItems.splice(index, 1);
  renderChecklistItems();
}

function toggleChecklistItem(todoIndex, itemIndex) {
  todos[todoIndex].checklist[itemIndex].completed = !todos[todoIndex].checklist[itemIndex].completed;
  
  // Check if all checklist items are completed
  const allCompleted = todos[todoIndex].checklist.every(item => item.completed);
  if (allCompleted && !todos[todoIndex].completed) {
    todos[todoIndex].completed = true;
  } else if (!allCompleted && todos[todoIndex].completed) {
    todos[todoIndex].completed = false;
  }
  
  saveAndRender();
  showTodoDetail(todoIndex); // Refresh the detail view
}

// ===== FUNZIONI GLOBALI PER ONCLICK =====
window.removeChecklistItem = removeChecklistItem;
window.toggleChecklistItem = toggleChecklistItem;
window.showTodoDetail = showTodoDetail;
