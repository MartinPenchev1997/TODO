// ===== MODALE CATEGORIA =====
function openCategoryModal() {
  const modal = document.getElementById('category-modal');
  if (!modal) return;
  
  // Reset form
  categoryRadios.forEach(radio => radio.checked = false);
  if (categoryInput) {
    categoryInput.value = '';
    categoryInput.disabled = true;
  }
  if (enableChecklistCheckbox) enableChecklistCheckbox.checked = false;
  if (checklistItems) checklistItems.style.display = 'none';
  tempChecklistItems = [];
  renderChecklistItems();

  modal.style.display = 'flex';
}

// ===== MODALE DETTAGLIO =====
function showTodoDetail(todoIndex) {
  const todo = todos[todoIndex];
  if (!todo) return;
  
  detailTitle.textContent = todo.text;
  detailCategory.textContent = todo.category;
  detailDate.textContent = formatDate(todo.date);
  detailTime.textContent = todo.time || '00:00';
  detailStatus.textContent = todo.completed ? 'Completato' : 'Da fare';
  
  if (todo.checklist && todo.checklist.length > 0) {
    detailChecklist.style.display = 'block';
    detailChecklistItems.innerHTML = '';
    
    todo.checklist.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'detail-checklist-item';
      div.innerHTML = `
        <input type="checkbox" ${item.completed ? 'checked' : ''} 
               onchange="toggleChecklistItem(${todoIndex}, ${index})">
        <span ${item.completed ? 'style="text-decoration: line-through;"' : ''}>${item.text}</span>
      `;
      detailChecklistItems.appendChild(div);
    });
  } else {
    detailChecklist.style.display = 'none';
  }
  
  // Mostra attachments
  renderDetailAttachments(todo);
  
  detailModal.style.display = 'flex';
}
