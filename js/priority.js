// ===== PRIORITÀ E SORTING =====

const PRIORITY_LEVELS = {
  high: { label: 'Alta', color: '#ef4444', icon: '🔴', order: 1 },
  medium: { label: 'Media', color: '#f59e0b', icon: '🟡', order: 2 },
  low: { label: 'Bassa', color: '#10b981', icon: '🟢', order: 3 },
  none: { label: 'Nessuna', color: '#9ca3af', icon: '⚪', order: 4 }
};

function sortTodos(todosArray) {
  const sorted = [...todosArray];
  
  sorted.sort((a, b) => {
    let comparison = 0;
    
    switch (currentSortBy) {
      case 'priority':
        const aPriority = PRIORITY_LEVELS[a.priority || 'none'].order;
        const bPriority = PRIORITY_LEVELS[b.priority || 'none'].order;
        comparison = aPriority - bPriority;
        break;
        
      case 'date':
        const aDate = new Date(a.date + 'T' + (a.time || '00:00'));
        const bDate = new Date(b.date + 'T' + (b.time || '00:00'));
        comparison = aDate - bDate;
        break;
        
      case 'category':
        comparison = (a.category || '').localeCompare(b.category || '');
        break;
        
      case 'alphabetical':
        comparison = a.text.localeCompare(b.text);
        break;
        
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
}

function setSortBy(sortBy) {
  if (currentSortBy === sortBy) {
    // Toggle direction se stesso sorting
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    currentSortBy = sortBy;
    sortDirection = 'asc';
  }
  
  updateSortUI();
  renderTodos();
}

function updateSortUI() {
  // Aggiorna UI bottoni sorting
  document.querySelectorAll('.sort-option').forEach(btn => {
    btn.classList.remove('active');
    btn.querySelector('.sort-arrow')?.remove();
  });
  
  const activeBtn = document.querySelector(`[data-sort="${currentSortBy}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    const arrow = document.createElement('span');
    arrow.className = 'sort-arrow';
    arrow.textContent = sortDirection === 'asc' ? '↑' : '↓';
    activeBtn.appendChild(arrow);
  }
}

function getPriorityBadge(priority) {
  const level = PRIORITY_LEVELS[priority || 'none'];
  return `<span class="priority-badge" style="color: ${level.color}" title="${level.label}">${level.icon}</span>`;
}

function isOverdue(todo) {
  if (todo.completed) return false;
  
  const now = new Date();
  const todoDateTime = new Date(todo.date + 'T' + (todo.time || '23:59'));
  
  return todoDateTime < now;
}
