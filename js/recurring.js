// ===== RICORRENZA TASK =====

const RECURRENCE_TYPES = {
  none: { label: 'Nessuna', interval: 0 },
  daily: { label: 'Giornaliera', interval: 1 },
  weekly: { label: 'Settimanale', interval: 7 },
  biweekly: { label: 'Ogni 2 settimane', interval: 14 },
  monthly: { label: 'Mensile', interval: 30 },
  yearly: { label: 'Annuale', interval: 365 }
};

// Calcola la prossima data per task ricorrente
function calculateNextRecurrence(date, recurrenceType) {
  if (!recurrenceType || recurrenceType === 'none') return null;
  
  const currentDate = new Date(date);
  const recurrence = RECURRENCE_TYPES[recurrenceType];
  
  if (!recurrence) return null;
  
  switch (recurrenceType) {
    case 'daily':
      currentDate.setDate(currentDate.getDate() + 1);
      break;
    case 'weekly':
      currentDate.setDate(currentDate.getDate() + 7);
      break;
    case 'biweekly':
      currentDate.setDate(currentDate.getDate() + 14);
      break;
    case 'monthly':
      currentDate.setMonth(currentDate.getMonth() + 1);
      break;
    case 'yearly':
      currentDate.setFullYear(currentDate.getFullYear() + 1);
      break;
    default:
      return null;
  }
  
  return currentDate.toISOString().split('T')[0];
}

// Crea il prossimo task ricorrente
function createRecurringTask(originalTodo) {
  if (!originalTodo.recurrence || originalTodo.recurrence === 'none') return null;
  
  const nextDate = calculateNextRecurrence(originalTodo.date, originalTodo.recurrence);
  if (!nextDate) return null;
  
  const newTodo = {
    id: Date.now() + Math.random(), // ID unico
    text: originalTodo.text,
    completed: false,
    date: nextDate,
    time: originalTodo.time,
    category: originalTodo.category,
    priority: originalTodo.priority || 'none',
    checklist: originalTodo.checklist ? originalTodo.checklist.map(item => ({
      text: item.text,
      completed: false // Reset checklist per nuovo task
    })) : [],
    recurrence: originalTodo.recurrence,
    originalTaskId: originalTodo.originalTaskId || originalTodo.id // Traccia l'origine
  };
  
  return newTodo;
}

// Controlla e crea task ricorrenti quando necessario
function checkAndCreateRecurringTasks() {
  const today = new Date().toISOString().split('T')[0];
  const newTasks = [];
  
  todos.forEach(todo => {
    // Se task completato e ha ricorrenza, crea il prossimo
    if (todo.completed && todo.recurrence && todo.recurrence !== 'none') {
      // Controlla se non esiste già un task ricorrente per la prossima data
      const nextDate = calculateNextRecurrence(todo.date, todo.recurrence);
      if (nextDate) {
        const existingNext = todos.find(t => 
          t.date === nextDate && 
          t.text === todo.text && 
          (t.originalTaskId === todo.id || t.originalTaskId === todo.originalTaskId)
        );
        
        if (!existingNext) {
          const newTask = createRecurringTask(todo);
          if (newTask) {
            newTasks.push(newTask);
          }
        }
      }
    }
  });
  
  // Aggiungi i nuovi task
  if (newTasks.length > 0) {
    newTasks.forEach(task => {
      todos.push(task);
      // Schedula notifica per il nuovo task
      if (typeof scheduleNotification === 'function') {
        scheduleNotification(task);
      }
    });
    
    saveAndRender();
    
    // Mostra notifica all'utente
    if (newTasks.length === 1) {
      showNotification(`📅 Task ricorrente creato: "${newTasks[0].text}" per ${formatDate(newTasks[0].date)}`);
    } else {
      showNotification(`📅 ${newTasks.length} task ricorrenti creati`);
    }
  }
}

// Formatta data per display
function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (dateString === today.toISOString().split('T')[0]) {
    return 'oggi';
  } else if (dateString === tomorrow.toISOString().split('T')[0]) {
    return 'domani';
  } else {
    return date.toLocaleDateString('it-IT', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  }
}

// Ottieni informazioni sulla ricorrenza per display
function getRecurrenceInfo(todo) {
  if (!todo.recurrence || todo.recurrence === 'none') return '';
  
  const recurrence = RECURRENCE_TYPES[todo.recurrence];
  if (!recurrence) return '';
  
  let info = `🔄 ${recurrence.label}`;
  
  // Se task completato, mostra quando sarà il prossimo
  if (todo.completed) {
    const nextDate = calculateNextRecurrence(todo.date, todo.recurrence);
    if (nextDate) {
      info += ` (prossimo: ${formatDate(nextDate)})`;
    }
  }
  
  return info;
}

// Inizializza il controllo ricorrenze (da chiamare periodicamente)
function initializeRecurrenceCheck() {
  // Controlla subito
  checkAndCreateRecurringTasks();
  
  // Controlla ogni ora
  setInterval(checkAndCreateRecurringTasks, 60 * 60 * 1000);
  
  // Evento quando un task viene completato
  document.addEventListener('taskCompleted', (event) => {
    const todo = event.detail.todo;
    if (todo.recurrence && todo.recurrence !== 'none') {
      // Delay per permettere il salvataggio
      setTimeout(() => {
        checkAndCreateRecurringTasks();
      }, 100);
    }
  });
}

// Ottieni badge ricorrenza per display
function getRecurrenceBadge(todo) {
  if (!todo.recurrence || todo.recurrence === 'none') return '';
  
  const symbols = {
    daily: '📅',
    weekly: '📆',
    biweekly: '🗓️',
    monthly: '📊',
    yearly: '🎂'
  };
  
  const symbol = symbols[todo.recurrence] || '🔄';
  const label = RECURRENCE_TYPES[todo.recurrence]?.label || 'Ricorrente';
  
  return `<span class="recurrence-badge" title="${label}">${symbol}</span>`;
}