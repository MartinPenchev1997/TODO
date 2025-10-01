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