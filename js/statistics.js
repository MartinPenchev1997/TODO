// ===== STATISTICHE E PROGRESS TRACKING =====

function calculateStatistics() {
  const stats = {
    total: todos.length,
    completed: 0,
    active: 0,
    completedToday: 0,
    completedThisWeek: 0,
    completedThisMonth: 0,
    byCategory: {},
    completionRate: 0
  };
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() - todayStart.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  todos.forEach(todo => {
    // Conteggi base
    if (todo.completed) {
      stats.completed++;
      
      // Statistiche temporali (se ha una data di completamento)
      // Per ora usiamo la data del task come proxy
      const todoDate = new Date(todo.date);
      if (todoDate >= todayStart) stats.completedToday++;
      if (todoDate >= weekStart) stats.completedThisWeek++;
      if (todoDate >= monthStart) stats.completedThisMonth++;
    } else {
      stats.active++;
    }
    
    // Statistiche per categoria
    const cat = todo.category || 'Senza categoria';
    if (!stats.byCategory[cat]) {
      stats.byCategory[cat] = { total: 0, completed: 0, rate: 0 };
    }
    stats.byCategory[cat].total++;
    if (todo.completed) stats.byCategory[cat].completed++;
  });
  
  // Calcola percentuali per categoria
  Object.keys(stats.byCategory).forEach(cat => {
    const catStats = stats.byCategory[cat];
    catStats.rate = catStats.total > 0 
      ? Math.round((catStats.completed / catStats.total) * 100) 
      : 0;
  });
  
  // Completion rate globale
  stats.completionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;
  
  return stats;
}

function renderStatistics() {
  const statsContainer = document.getElementById('statistics-container');
  if (!statsContainer) return;
  
  const stats = calculateStatistics();
  
  statsContainer.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-value">${stats.completed}</div>
        <div class="stat-label">Completati</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">⏳</div>
        <div class="stat-value">${stats.active}</div>
        <div class="stat-label">Attivi</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-value">${stats.completionRate}%</div>
        <div class="stat-label">Tasso completamento</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-value">${stats.completedToday}</div>
        <div class="stat-label">Oggi</div>
      </div>
    </div>
    
    ${renderCategoryBreakdown(stats.byCategory)}
  `;
}

function renderCategoryBreakdown(byCategory) {
  const categories = Object.keys(byCategory);
  if (categories.length === 0) return '';
  
  let html = '<div class="category-stats"><h3>Per Categoria</h3>';
  
  categories.forEach(cat => {
    const catStats = byCategory[cat];
    html += `
      <div class="category-stat-item">
        <div class="category-stat-header">
          <span class="category-name">${cat}</span>
          <span class="category-percentage">${catStats.rate}%</span>
        </div>
        <div class="category-progress-bar">
          <div class="category-progress-fill" style="width: ${catStats.rate}%"></div>
        </div>
        <div class="category-stat-detail">${catStats.completed}/${catStats.total} completati</div>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}

function toggleStatistics() {
  const statsModal = document.getElementById('statistics-modal');
  if (!statsModal) return;
  
  if (statsModal.style.display === 'flex') {
    statsModal.style.display = 'none';
  } else {
    renderStatistics();
    statsModal.style.display = 'flex';
  }
}
