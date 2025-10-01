// ===== DRAG & DROP =====
let dragStartPos = { x: 0, y: 0 };
let isDragging = false;
let autoScrollInterval = null;
let scrollContainer = null;

function handleDragStart(e) {
  dragSrcEl = this;
  isDragging = true;
  this.classList.add('dragging');
  
  // Initialize scroll container
  if (!scrollContainer) {
    scrollContainer = document.querySelector('.scrollable-content');
  }
  
  // Store drag start position for mobile
  const touch = e.touches ? e.touches[0] : e;
  dragStartPos.x = touch.clientX;
  dragStartPos.y = touch.clientY;
  
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
  }
  
  console.log('Drag started for todo:', this.dataset.index);
}

function handleDragEnd(e) {
  console.log('Drag ended');
  isDragging = false;
  
  // Stop auto-scroll
  clearAutoScroll();
  
  if (this.classList) {
    this.classList.remove('dragging');
  }
  
  // Reset all drag-over classes
  document.querySelectorAll('.todo-item').forEach(item => {
    item.classList.remove('drag-over');
  });
  
  // Clear dragSrcEl after a small delay to let drop process
  setTimeout(() => {
    dragSrcEl = null;
  }, 50);
}

function handleDragOver(e) {
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move';
  }
  
  // Update auto-scroll based on mouse position
  updateAutoScroll(e.clientY);
  
  return false;
}

function handleDragEnter(e) {
  e.preventDefault();
  if (this !== dragSrcEl && isDragging) {
    this.classList.add('drag-over');
  }
}

function handleDragLeave(e) {
  // Only remove class if we're actually leaving this element
  const rect = this.getBoundingClientRect();
  const x = e.clientX;
  const y = e.clientY;
  
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    this.classList.remove('drag-over');
  }
}

function handleSectionDragLeave(e) {
  // Only remove class if we're actually leaving this section
  const rect = this.getBoundingClientRect();
  const x = e.clientX;
  const y = e.clientY;
  
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    this.classList.remove('section-drag-over');
  }
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  
  console.log('Drop event triggered on todo item');
  
  if (!dragSrcEl || dragSrcEl === this) {
    return false;
  }
  
  const dragIndex = parseInt(dragSrcEl.dataset.index);
  const dropIndex = parseInt(this.dataset.index);
  
  console.log('Drag from index:', dragIndex, 'to index:', dropIndex);
  
  // Check if dragging between different dates
  const dragDate = dragSrcEl.dataset.date;
  const dropDate = this.dataset.date;
  
  if (dragDate !== dropDate) {
    console.log('Cross-date drag detected, changing date from', dragDate, 'to', dropDate);
    // Change the date of the dragged todo
    todos[dragIndex].date = dropDate;
  }
  
  // Validate indices
  if (isNaN(dragIndex) || isNaN(dropIndex) || dragIndex === dropIndex) {
    console.log('Invalid indices or same position');
    return false;
  }
  
  // Validate that indices exist in todos array
  if (dragIndex >= todos.length || dropIndex >= todos.length || dragIndex < 0 || dropIndex < 0) {
    console.log('Indices out of bounds');
    return false;
  }
  
  console.log('Performing reorder...');
  
  // Reorder todos array - use splice correctly
  const draggedTodo = todos[dragIndex];
  todos.splice(dragIndex, 1); // Remove from old position
  
  // Adjust dropIndex if needed (when dragging from lower to higher index)
  const adjustedDropIndex = dragIndex < dropIndex ? dropIndex - 1 : dropIndex;
  todos.splice(adjustedDropIndex, 0, draggedTodo); // Insert at new position
  
  console.log('Reorder completed, saving...');
  
  // Save and re-render
  localStorage.setItem('todos', JSON.stringify(todos));
  
  // Clean up
  this.classList.remove('drag-over');
  isDragging = false;
  
  // Re-render to show new order
  setTimeout(() => {
    updateCategoryMenu();
    renderTodos();
  }, 50);
  
  return false;
}

// ===== DRAG & DROP TRA SEZIONI DIVERSE =====
function handleSectionDragOver(e) {
  e.preventDefault();
  
  // Update auto-scroll based on mouse position
  updateAutoScroll(e.clientY);
  
  // Only allow drop if dragging over empty area of section
  if (e.target.classList.contains('day-section') || e.target.classList.contains('day-header')) {
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('section-drag-over');
    return false;
  }
}

function handleSectionDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  
  console.log('Drop event triggered on section');
  
  if (!dragSrcEl) {
    return false;
  }
  
  // Only handle drops on empty area of section or header
  if (!e.target.classList.contains('day-section') && !e.target.classList.contains('day-header')) {
    return false;
  }
  
  const dragIndex = parseInt(dragSrcEl.dataset.index);
  const targetDate = this.querySelector('.day-header').dataset.date;
  const dragDate = dragSrcEl.dataset.date;
  
  console.log('Section drop: moving todo from', dragDate, 'to', targetDate);
  
  if (dragDate === targetDate) {
    console.log('Same date, no change needed');
    this.classList.remove('section-drag-over');
    return false;
  }
  
  // Validate index
  if (isNaN(dragIndex) || dragIndex >= todos.length || dragIndex < 0) {
    console.log('Invalid drag index');
    this.classList.remove('section-drag-over');
    return false;
  }
  
  // Change the date of the dragged todo
  todos[dragIndex].date = targetDate;
  console.log('Date changed for todo:', todos[dragIndex].text);
  
  // Save and re-render
  localStorage.setItem('todos', JSON.stringify(todos));
  
  // Clean up
  this.classList.remove('section-drag-over');
  document.querySelectorAll('.todo-item').forEach(item => {
    item.classList.remove('drag-over', 'dragging');
  });
  isDragging = false;
  dragSrcEl = null;
  
  // Re-render to show new grouping
  setTimeout(() => {
    updateCategoryMenu();
    renderTodos();
  }, 50);
  
  return false;
}

// ===== AUTO-SCROLL DURANTE DRAG & DROP =====
function startAutoScroll(clientY) {
  if (!scrollContainer) {
    scrollContainer = document.querySelector('.scrollable-content');
  }
  
  if (!scrollContainer || autoScrollInterval) return;
  
  const scrollRect = scrollContainer.getBoundingClientRect();
  const scrollZone = 50; // Zona di 50px dai bordi dove inizia l'auto-scroll
  const scrollSpeed = 5; // Velocità di scroll in pixel
  
  autoScrollInterval = setInterval(() => {
    if (!isDragging) {
      clearAutoScroll();
      return;
    }
    
    const distanceFromTop = clientY - scrollRect.top;
    const distanceFromBottom = scrollRect.bottom - clientY;
    
    // Rimuovi tutte le classi degli indicatori prima di aggiornarle
    scrollContainer.classList.remove('auto-scroll-up', 'auto-scroll-down');
    
    // Scroll verso l'alto
    if (distanceFromTop < scrollZone && distanceFromTop > 0) {
      const scrollAmount = Math.max(1, scrollSpeed * (scrollZone - distanceFromTop) / scrollZone);
      scrollContainer.scrollTop -= scrollAmount;
      scrollContainer.classList.add('auto-scroll-up');
    }
    // Scroll verso il basso
    else if (distanceFromBottom < scrollZone && distanceFromBottom > 0) {
      const scrollAmount = Math.max(1, scrollSpeed * (scrollZone - distanceFromBottom) / scrollZone);
      scrollContainer.scrollTop += scrollAmount;
      scrollContainer.classList.add('auto-scroll-down');
    }
    // Fuori dalla zona di scroll
    else if (distanceFromTop <= 0 || distanceFromBottom <= 0) {
      clearAutoScroll();
    }
  }, 16); // ~60fps
}

function clearAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
  // Rimuovi gli indicatori visivi
  if (scrollContainer) {
    scrollContainer.classList.remove('auto-scroll-up', 'auto-scroll-down');
  }
}

function updateAutoScroll(clientY) {
  if (!scrollContainer) {
    scrollContainer = document.querySelector('.scrollable-content');
  }
  
  if (!scrollContainer) return;
  
  const scrollRect = scrollContainer.getBoundingClientRect();
  const scrollZone = 50;
  
  const distanceFromTop = clientY - scrollRect.top;
  const distanceFromBottom = scrollRect.bottom - clientY;
  
  // Inizia auto-scroll se siamo nella zona critica
  if ((distanceFromTop < scrollZone && distanceFromTop > 0) || 
      (distanceFromBottom < scrollZone && distanceFromBottom > 0)) {
    if (!autoScrollInterval) {
      startAutoScroll(clientY);
    }
  } else {
    clearAutoScroll();
  }
}

// ===== MOBILE TOUCH SUPPORT =====
function handleTouchStart(e) {
  if (e.touches.length === 1) {
    // Non attivare il drag se si sta cliccando sui bottoni delle azioni
    if (e.target.closest('.todo-actions')) {
      return;
    }
    
    const touch = e.touches[0];
    dragStartPos.x = touch.clientX;
    dragStartPos.y = touch.clientY;
    
    // Add visual feedback
    this.classList.add('touch-active');
    
    // Start drag after a delay
    setTimeout(() => {
      if (this.classList.contains('touch-active')) {
        handleDragStart.call(this, e);
      }
    }, 200);
  }
}

function handleTouchMove(e) {
  if (!isDragging) return;
  
  e.preventDefault();
  const touch = e.touches[0];
  const deltaX = Math.abs(touch.clientX - dragStartPos.x);
  const deltaY = Math.abs(touch.clientY - dragStartPos.y);
  
  // Update auto-scroll for mobile
  updateAutoScroll(touch.clientY);
  
  // Start dragging if moved enough
  if (deltaX > 10 || deltaY > 10) {
    this.classList.remove('touch-active');
    
    // Find element under touch
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const todoItem = elementBelow?.closest('.todo-item');
    const daySection = elementBelow?.closest('.day-section');
    
    // Remove all previous drag-over classes
    document.querySelectorAll('.todo-item').forEach(item => {
      item.classList.remove('drag-over');
    });
    document.querySelectorAll('.day-section').forEach(section => {
      section.classList.remove('section-drag-over');
    });
    
    if (todoItem && todoItem !== this) {
      // Add to current todo item
      todoItem.classList.add('drag-over');
    } else if (daySection && !todoItem) {
      // Add to day section
      daySection.classList.add('section-drag-over');
    }
  }
}

function handleTouchEnd(e) {
  this.classList.remove('touch-active');
  
  // Stop auto-scroll
  clearAutoScroll();
  
  if (isDragging) {
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const todoItem = elementBelow?.closest('.todo-item');
    const daySection = elementBelow?.closest('.day-section');
    
    if (todoItem && todoItem !== this) {
      // Trigger drop on todo item
      handleDrop.call(todoItem, e);
    } else if (daySection && !todoItem) {
      // Trigger drop on section (empty area or header)
      handleSectionDrop.call(daySection, e);
    }
    
    handleDragEnd.call(this, e);
  }
}
