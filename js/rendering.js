// ===== RENDERING =====
function renderTodos() {
  let filteredTodos = todos.filter((todo) => {
    if (currentFilter === "active" && todo.completed) return false;
    if (currentFilter === "completed" && !todo.completed) return false;
    if (
      currentCategoryFilter !== "all" &&
      todo.category !== currentCategoryFilter
    )
      return false;

    // Filtro ricerca testuale
    if (!matchesSearch(todo)) return false;

    // Filtro per giorno
    if (currentDayFilter !== "all") {
      const todoDate = new Date(todo.date);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      switch (currentDayFilter) {
        case "today":
          if (todoDate.toDateString() !== today.toDateString()) return false;
          break;
        case "tomorrow":
          if (todoDate.toDateString() !== tomorrow.toDateString()) return false;
          break;
        case "week":
          if (todoDate < weekStart || todoDate > weekEnd) return false;
          break;
      }
    }

    return true;
  });

  // Applica sorting
  filteredTodos = sortTodos(filteredTodos);

  todoContainer.innerHTML = "";
  emptyState.style.display = filteredTodos.length === 0 ? "block" : "none";

  if (currentView === "calendar") {
    renderCalendarView(filteredTodos);
  } else {
    renderListView(filteredTodos);
  }
}

function renderListView(todosToRender) {
  // Nascondi controlli navigazione
  if (calendarNavigation) {
    calendarNavigation.style.display = "none";
  }

  // Se si ordina per data, raggruppa per date, altrimenti mostra lista ordinata
  if (currentSortBy === "date") {
    const grouped = groupTodosByDate(todosToRender);
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      // Converti le etichette in date effettive per ordinamento corretto
      const getDateFromLabel = (label) => {
        if (label === "Oggi") return new Date();
        if (label === "Domani") {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          return tomorrow;
        }
        // Per altre date, usa la data del primo todo del gruppo
        return new Date(grouped[label][0].date);
      };
      
      const dateA = getDateFromLabel(a);
      const dateB = getDateFromLabel(b);
      
      const comparison = dateA - dateB;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    sortedDates.forEach((dateLabel) => {
      renderDateGroup(dateLabel, grouped[dateLabel]);
    });
  } else {
    // Rendering lineare senza raggruppamento per altri tipi di sorting
    renderTodosList(todosToRender);
  }
}

function renderDateGroup(dateLabel, todosInGroup) {
  const section = document.createElement("div");
  section.className = "day-section";

  // Make the entire section a drop zone
  section.addEventListener("dragover", handleSectionDragOver);
  section.addEventListener("dragleave", handleSectionDragLeave);
  section.addEventListener("drop", handleSectionDrop);

  const header = document.createElement("div");
  header.className = "day-header";
  header.textContent = dateLabel;
  header.dataset.date = todosInGroup[0].date; // Store the actual date
  section.appendChild(header);

  todosInGroup.forEach((todo) => {
    const todoElement = createTodoElement(todo);
    section.appendChild(todoElement);
  });

  todoContainer.appendChild(section);
}

function renderTodosList(todosToRender) {
  // Rendering lineare per sorting non-date
  todosToRender.forEach((todo) => {
    const todoElement = createTodoElement(todo);
    todoContainer.appendChild(todoElement);
  });
}

function createTodoElement(todo) {
  const globalIndex = todos.findIndex((t) => t === todo);

  // Clona il template
  const li = todoItemTemplate.content
    .cloneNode(true)
    .querySelector(".todo-item");

  // Imposta i dati
  li.dataset.index = globalIndex;
  li.dataset.todoId = todo.id || globalIndex;
  li.dataset.date = todo.date;

  // Desktop drag events
  li.addEventListener("dragstart", handleDragStart);
  li.addEventListener("dragover", handleDragOver);
  li.addEventListener("dragenter", handleDragEnter);
  li.addEventListener("dragleave", handleDragLeave);
  li.addEventListener("drop", handleDrop);
  li.addEventListener("dragend", handleDragEnd);

  // Mobile touch events
  li.addEventListener("touchstart", handleTouchStart, { passive: false });
  li.addEventListener("touchmove", handleTouchMove, { passive: false });
  li.addEventListener("touchend", handleTouchEnd, { passive: false });

  // Popola i contenuti
  const todoText = li.querySelector(".todo-text");
  todoText.textContent = todo.text;
  if (todo.completed) todoText.classList.add("completed");

  // Aggiungi classe overdue se scaduto
  if (isOverdue(todo)) {
    li.classList.add("overdue");
  }

  const categoryBadge = li.querySelector(".category-badge");
  categoryBadge.textContent = todo.category;

  // Aggiungi badge priorità
  const priorityContainer = li.querySelector(".todo-text");
  if (todo.priority && todo.priority !== "none") {
    const priorityBadge = document.createElement("span");
    priorityBadge.className = "priority-indicator";
    priorityBadge.innerHTML = getPriorityBadge(todo.priority);
    priorityContainer.insertBefore(priorityBadge, priorityContainer.firstChild);
  }
  
  // Aggiungi badge ricorrenza
  if (todo.recurrence && todo.recurrence !== "none") {
    const recurrenceBadge = document.createElement("span");
    recurrenceBadge.className = "recurrence-indicator";
    recurrenceBadge.innerHTML = getRecurrenceBadge(todo);
    priorityContainer.appendChild(recurrenceBadge);
  }

  // Aggiungi badge attachments
  if (todo.attachments && todo.attachments.length > 0) {
    const attachmentBadge = document.createElement("span");
    attachmentBadge.className = "attachment-indicator";
    attachmentBadge.innerHTML = `📎 ${todo.attachments.length}`;
    attachmentBadge.title = `${todo.attachments.length} file allegati`;
    priorityContainer.appendChild(attachmentBadge);
  }

  const todoTime = li.querySelector(".todo-time");
  todoTime.textContent = todo.time || "00:00";

  // Configura popover e azioni
  const menuBtn = li.querySelector(".menu-btn");
  const popover = li.querySelector(".action-popover");

  // Assicurati che il popover parta sempre chiuso
  popover.style.display = "none";

  // Reset completo dello stato del menu button
  menuBtn.blur();
  li.classList.remove("popover-open");

  // Previeni drag quando si interagisce con tutto il container delle azioni
  const todoActions = li.querySelector(".todo-actions");
  todoActions.addEventListener("mousedown", (e) => {
    e.stopPropagation();
  });

  todoActions.addEventListener("dragstart", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  // Gestione apertura/chiusura popover
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    // Chiudi tutti gli altri popover e rimuovi classe popover-open
    document.querySelectorAll(".todo-item").forEach((item) => {
      item.classList.remove("popover-open");
    });
    document.querySelectorAll(".action-popover").forEach((p) => {
      if (p !== popover) p.style.display = "none";
    });

    // Toggle questo popover
    const isOpen = popover.style.display === "block";
    popover.style.display = isOpen ? "none" : "block";

    // Aggiungi/rimuovi classe per z-index
    if (!isOpen) {
      li.classList.add("popover-open");
    } else {
      li.classList.remove("popover-open");
      menuBtn.blur(); // Rimuovi focus quando chiudi
    }
  });

  // Configura azioni del popover
  const completeAction = li.querySelector(".complete-action");
  const completeLabel = completeAction.querySelector(".action-label");
  const completeSvg = completeAction.querySelector("svg");

  if (todo.completed) {
    completeLabel.textContent = "Ripristina";
    completeSvg.innerHTML =
      '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>';
  } else {
    completeLabel.textContent = "Completa";
  }

  const editAction = li.querySelector(".edit-action");
  const deleteAction = li.querySelector(".delete-action");
  const detailAction = li.querySelector(".detail-action");

  completeAction.addEventListener("click", () => {
    toggleComplete(globalIndex);
    popover.style.display = "none";
    li.classList.remove("popover-open");
  });

  editAction.addEventListener("click", () => {
    editTodo(globalIndex);
    popover.style.display = "none";
    li.classList.remove("popover-open");
  });

  deleteAction.addEventListener("click", () => {
    deleteTodo(globalIndex);
    popover.style.display = "none";
    li.classList.remove("popover-open");
  });

  detailAction.addEventListener("click", () => {
    showTodoDetail(globalIndex);
    popover.style.display = "none";
    li.classList.remove("popover-open");
  });

  return li;
}



function renderCalendarView(todosToRender) {
  // Mostra controlli navigazione
  if (calendarNavigation) {
    calendarNavigation.style.display = "flex";
    updateCalendarNavigation();
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const calendar = document.createElement("div");
  calendar.className = "calendar";

  const monthHeader = document.createElement("div");
  monthHeader.className = "calendar-header";
  monthHeader.textContent = currentDate.toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric",
  });
  calendar.appendChild(monthHeader);

  const weekdays = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  const weekHeader = document.createElement("div");
  weekHeader.className = "calendar-weekdays";
  weekdays.forEach((day) => {
    const dayEl = document.createElement("div");
    dayEl.className = "calendar-weekday";
    dayEl.textContent = day;
    weekHeader.appendChild(dayEl);
  });
  calendar.appendChild(weekHeader);

  const grid = document.createElement("div");
  grid.className = "calendar-grid";
  for (let i = 0; i < startDayOfWeek; i++) {
    grid.appendChild(document.createElement("div"));
  }

  const todosByDate = {};
  todosToRender.forEach((todo) => {
    if (!todosByDate[todo.date]) todosByDate[todo.date] = [];
    todosByDate[todo.date].push(todo);
  });

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    const dayCell = document.createElement("div");
    dayCell.className = "calendar-day";

    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = day;

    if (dayStr === new Date().toISOString().split("T")[0]) {
      dayCell.classList.add("today");
    }

    dayCell.appendChild(dayNumber);

    if (todosByDate[dayStr]) {
      const tasks = document.createElement("div");
      tasks.className = "day-tasks";
      todosByDate[dayStr].slice(0, 3).forEach((todo) => {
        const task = document.createElement("div");
        task.className = "task-preview";
        if (todo.completed) task.classList.add("completed");
        task.title = todo.text;
        task.textContent =
          todo.text.length > 20
            ? todo.text.substring(0, 20) + "..."
            : todo.text;
        tasks.appendChild(task);
      });
      dayCell.appendChild(tasks);
    }

    grid.appendChild(dayCell);
  }

  calendar.appendChild(grid);
  todoContainer.appendChild(calendar);
}

function renderChecklistItems() {
  if (!checklistList) return;

  checklistList.innerHTML = "";
  tempChecklistItems.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "checklist-list-item";
    div.innerHTML = `
      <span>${item.text}</span>
      <button onclick="removeChecklistItem(${index})">×</button>
    `;
    checklistList.appendChild(div);
  });
}

function renderEditChecklistItems() {
  editChecklistList.innerHTML = "";
  editTempChecklistItems.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "checklist-list-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.completed;
    checkbox.addEventListener("change", () => {
      editTempChecklistItems[index].completed = checkbox.checked;
    });

    const span = document.createElement("span");
    span.textContent = item.text;
    if (item.completed) span.style.textDecoration = "line-through";

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => {
      editTempChecklistItems.splice(index, 1);
      renderEditChecklistItems();
    });

    div.appendChild(checkbox);
    div.appendChild(span);
    div.appendChild(removeBtn);
    editChecklistList.appendChild(div);
  });
}

function updateCalendarNavigation() {
  if (currentMonthYearSpan) {
    const options = { year: "numeric", month: "long" };
    currentMonthYearSpan.textContent = currentDate.toLocaleDateString(
      "it-IT",
      options
    );
  }
}
