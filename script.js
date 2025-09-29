// ===== ELEMENTI DOM =====
const htmlRoot = document.getElementById('html-root');
const themeToggle = document.getElementById('theme-toggle');
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const dateInput = document.getElementById('todo-date');
const todoContainer = document.getElementById('todo-container');
const emptyState = document.getElementById('empty-state');

// ===== STATO =====
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';          // 'all', 'active', 'completed'
let currentCategoryFilter = 'all';  // 'all' o nome categoria
let currentView = 'list';           // 'list' o 'calendar'
let dragSrcEl = null;
let tempTodo = null;

// ===== INIZIALIZZAZIONE =====
const today = new Date().toISOString().split('T')[0];
dateInput.value = today;
dateInput.min = today;

// Carica tema
const savedTheme = localStorage.getItem('theme') || 'light';
htmlRoot.setAttribute('data-theme', savedTheme);

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

// ===== TEMA =====
themeToggle.addEventListener('click', () => {
  const current = htmlRoot.getAttribute('data-theme');
  const newTheme = current === 'light' ? 'dark' : 'light';
  htmlRoot.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

// ===== FORM =====
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  const date = dateInput.value;
  if (text && date) {
    tempTodo = { text, date };
    openCategoryModal();
  }
});

// ===== MODALE CATEGORIA =====
function openCategoryModal() {
  const modal = document.getElementById('category-modal');
  const catInput = document.getElementById('category-input');
  const suggestions = document.getElementById('category-suggestions');

  catInput.value = '';
  suggestions.innerHTML = '';

  const existingCategories = [...new Set(todos.map(t => t.category))];
  existingCategories.forEach(cat => {
    const btn = document.createElement('span');
    btn.className = 'category-suggestion';
    btn.textContent = cat;
    btn.onclick = () => {
      catInput.value = cat;
      catInput.focus();
    };
    suggestions.appendChild(btn);
  });

  modal.style.display = 'flex';
  setTimeout(() => catInput.focus(), 300);
}

document.getElementById('cancel-category').onclick = () => {
  document.getElementById('category-modal').style.display = 'none';
  tempTodo = null;
};

document.getElementById('confirm-category').onclick = () => {
  const category = document.getElementById('category-input').value.trim() || 'Generale';
  if (tempTodo) {
    todos.push({
      text: tempTodo.text,
      completed: false,
      date: tempTodo.date,
      category
    });
    saveAndRender();
    input.value = '';
    input.focus();
  }
  document.getElementById('category-modal').style.display = 'none';
  tempTodo = null;
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('category-modal').style.display = 'none';
    tempTodo = null;
  }
});

// ===== AZIONI TODO =====
function toggleComplete(index) {
  todos[index].completed = !todos[index].completed;
  saveAndRender();
}

function deleteTodo(index) {
  const item = document.querySelector(`.todo-item[data-index="${index}"]`);
  if (item) {
    item.classList.add('leaving');
    item.addEventListener('animationend', () => {
      todos.splice(index, 1);
      saveAndRender();
    });
  }
}

// ===== DRAG & DROP =====
function handleDragStart(e) {
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
  setTimeout(() => this.style.opacity = '0.3', 0);
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragEnter(e) {
  this.classList.add('drag-over');
}

function handleDragLeave() {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  e.stopPropagation();
  if (dragSrcEl !== this) {
    const srcIndex = parseInt(dragSrcEl.dataset.index);
    const destIndex = parseInt(this.dataset.index);
    [todos[srcIndex], todos[destIndex]] = [todos[destIndex], todos[srcIndex]];
    dragSrcEl.dataset.index = destIndex;
    this.dataset.index = srcIndex;
    saveAndRender();
  }
  return false;
}

function handleDragEnd() {
  this.style.opacity = '1';
  document.querySelectorAll('.todo-item').forEach(item => {
    item.classList.remove('drag-over');
  });
}

// ===== RENDERING =====
function renderTodos() {
  const filteredTodos = todos.filter(todo => {
    if (currentFilter === 'active' && todo.completed) return false;
    if (currentFilter === 'completed' && !todo.completed) return false;
    if (currentCategoryFilter !== 'all' && todo.category !== currentCategoryFilter) return false;
    return true;
  });

  todoContainer.innerHTML = '';
  emptyState.style.display = filteredTodos.length === 0 ? 'block' : 'none';

  if (currentView === 'calendar') {
    renderCalendarView(filteredTodos);
  } else {
    renderListView(filteredTodos);
  }
}

function renderListView(todosToRender) {
  const grouped = groupTodosByDate(todosToRender);
  const sortedDates = Object.keys(grouped).sort((a, b) => {
    if (a === 'Oggi') return -1;
    if (b === 'Oggi') return 1;
    if (a === 'Domani') return -1;
    if (b === 'Domani') return 1;
    return new Date(grouped[a][0].date) - new Date(grouped[b][0].date);
  });

  sortedDates.forEach(dateLabel => {
    const section = document.createElement('div');
    section.className = 'day-section';

    const header = document.createElement('div');
    header.className = 'day-header';
    header.textContent = dateLabel;
    section.appendChild(header);

    grouped[dateLabel].forEach(todo => {
      const globalIndex = todos.findIndex(t => t === todo);
      const li = document.createElement('li');
      li.className = 'todo-item';
      li.draggable = true;
      li.dataset.index = globalIndex;

      li.addEventListener('dragstart', handleDragStart);
      li.addEventListener('dragover', handleDragOver);
      li.addEventListener('dragenter', handleDragEnter);
      li.addEventListener('dragleave', handleDragLeave);
      li.addEventListener('drop', handleDrop);
      li.addEventListener('dragend', handleDragEnd);

      const todoContent = document.createElement('div');
      todoContent.className = 'todo-content';

      const span = document.createElement('span');
      span.className = 'todo-text';
      span.textContent = todo.text;
      if (todo.completed) span.classList.add('completed');

      const categoryBadge = document.createElement('span');
      categoryBadge.className = 'category-badge';
      categoryBadge.textContent = todo.category;

      todoContent.appendChild(span);
      todoContent.appendChild(categoryBadge);

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'todo-actions';

      const completeBtn = document.createElement('button');
      completeBtn.className = 'action-btn complete-btn';
      completeBtn.title = todo.completed ? 'Ripristina' : 'Completa';
      completeBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${todo.completed ? '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' : '<polyline points="20 6 9 17 4 12"/>'}
        </svg>
      `;
      completeBtn.onclick = () => toggleComplete(globalIndex);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'action-btn delete-btn';
      deleteBtn.title = 'Elimina';
      deleteBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      `;
      deleteBtn.onclick = () => deleteTodo(globalIndex);

      actionsDiv.appendChild(completeBtn);
      actionsDiv.appendChild(deleteBtn);

      li.appendChild(todoContent);
      li.appendChild(actionsDiv);
      section.appendChild(li);
    });

    todoContainer.appendChild(section);
  });
}

function renderCalendarView(todosToRender) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const calendar = document.createElement('div');
  calendar.className = 'calendar';

  const monthHeader = document.createElement('div');
  monthHeader.className = 'calendar-header';
  monthHeader.textContent = now.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  calendar.appendChild(monthHeader);

  const weekdays = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  const weekHeader = document.createElement('div');
  weekHeader.className = 'calendar-weekdays';
  weekdays.forEach(day => {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-weekday';
    dayEl.textContent = day;
    weekHeader.appendChild(dayEl);
  });
  calendar.appendChild(weekHeader);

  const grid = document.createElement('div');
  grid.className = 'calendar-grid';
  for (let i = 0; i < startDayOfWeek; i++) {
    grid.appendChild(document.createElement('div'));
  }

  const todosByDate = {};
  todosToRender.forEach(todo => {
    if (!todosByDate[todo.date]) todosByDate[todo.date] = [];
    todosByDate[todo.date].push(todo);
  });

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    
    if (dayStr === new Date().toISOString().split('T')[0]) {
      dayCell.classList.add('today');
    }

    dayCell.appendChild(dayNumber);

    if (todosByDate[dayStr]) {
      const tasks = document.createElement('div');
      tasks.className = 'day-tasks';
      todosByDate[dayStr].slice(0, 3).forEach(todo => {
        const task = document.createElement('div');
        task.className = 'task-preview';
        if (todo.completed) task.classList.add('completed');
        task.title = todo.text;
        task.textContent = todo.text.length > 20 ? todo.text.substring(0, 20) + '...' : todo.text;
        tasks.appendChild(task);
      });
      dayCell.appendChild(tasks);
    }

    grid.appendChild(dayCell);
  }

  calendar.appendChild(grid);
  todoContainer.appendChild(calendar);
}

// ===== DROPDOWN FILTRI =====
function closeAllMenus() {
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.classList.remove('active');
  });
}

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

// Menu Stato
document.querySelectorAll('#status-menu .dropdown-item').forEach(item => {
  item.addEventListener('click', () => {
    currentFilter = item.dataset.value;
    document.querySelectorAll('#status-menu .dropdown-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    closeAllMenus();
    renderTodos();
  });
});
document.querySelector('#status-menu .dropdown-item[data-value="all"]').classList.add('active');

// Menu Vista
document.querySelectorAll('#view-menu .dropdown-item').forEach(item => {
  item.addEventListener('click', () => {
    currentView = item.dataset.value;
    document.querySelectorAll('#view-menu .dropdown-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    closeAllMenus();
    renderTodos();
  });
});
document.querySelector('#view-menu .dropdown-item[data-value="list"]').classList.add('active');

// Menu Categoria
function updateCategoryMenu() {
  const menu = document.getElementById('category-menu');
  menu.innerHTML = '<div class="dropdown-item" data-value="all">Tutte</div>';
  
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

// ===== SALVATAGGIO E RENDER INIZIALE =====
function saveAndRender() {
  localStorage.setItem('todos', JSON.stringify(todos));
  updateCategoryMenu();
  renderTodos();
}

// Avvio
renderTodos();
updateCategoryMenu();