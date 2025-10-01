// ===== RICERCA TESTUALE =====
function updateSearchQuery(query) {
  searchQuery = query.toLowerCase().trim();
  renderTodos();
}

function matchesSearch(todo) {
  if (!searchQuery) return true;
  
  // Cerca in: testo, categoria, checklist items
  const textMatch = todo.text.toLowerCase().includes(searchQuery);
  const categoryMatch = todo.category.toLowerCase().includes(searchQuery);
  
  let checklistMatch = false;
  if (todo.checklist && todo.checklist.length > 0) {
    checklistMatch = todo.checklist.some(item => 
      item.text.toLowerCase().includes(searchQuery)
    );
  }
  
  return textMatch || categoryMatch || checklistMatch;
}

function clearSearch() {
  searchQuery = '';
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.value = '';
  }
  renderTodos();
}
