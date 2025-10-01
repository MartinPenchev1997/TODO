// ===== GESTIONE IMPOSTAZIONI NOTIFICHE =====
function loadNotificationSettings() {
  const saved = localStorage.getItem('notificationSettings');
  if (saved) {
    notificationSettings = JSON.parse(saved);
  }
  
  // Aggiorna UI
  if (notificationEnabledCheckbox) {
    notificationEnabledCheckbox.checked = notificationSettings.enabled;
  }
  if (notificationTimeSelect) {
    notificationTimeSelect.value = notificationSettings.minutesBefore.toString();
  }
}

function saveNotificationSettings() {
  notificationSettings.enabled = notificationEnabledCheckbox.checked;
  notificationSettings.minutesBefore = parseInt(notificationTimeSelect.value);
  
  localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
  
  // Ri-schedula tutte le notifiche con le nuove impostazioni
  if (notificationSettings.enabled) {
    rescheduleAllNotifications();
  } else {
    // Cancella tutte le notifiche se disabilitate
    scheduledNotifications.forEach(timeoutId => clearTimeout(timeoutId));
    scheduledNotifications.clear();
  }
}

// ===== NOTIFICHE PUSH =====
async function initializeNotifications() {
  // Controlla se il browser supporta le notifiche
  if (!('Notification' in window)) {
    console.log('Questo browser non supporta le notifiche');
    return;
  }

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Mostra il bottone notifiche su mobile
    if (notificationToggleBtn) {
      notificationToggleBtn.style.display = 'flex';
    }
    
    // Richiedi permesso solo se l'utente ha abilitato le notifiche
    if (notificationSettings.enabled) {
      const permission = await Notification.requestPermission();
      notificationPermission = permission === 'granted';
      
      if (notificationPermission) {
        console.log('Notifiche abilitate per mobile');
      }
    }
  }
}

function scheduleNotification(todo) {
  if (!notificationPermission || !notificationSettings.enabled || !todo.time || !todo.date) return;
  
  const todoDateTime = new Date(`${todo.date}T${todo.time}`);
  const notificationTime = new Date(todoDateTime.getTime() - notificationSettings.minutesBefore * 60 * 1000);
  const now = new Date();
  
  // Se il momento della notifica è già passato, non schedularla
  if (notificationTime <= now) return;
  
  const timeUntilNotification = notificationTime.getTime() - now.getTime();
  
  // Schedula la notifica
  const timeoutId = setTimeout(async () => {
    let deliveredToSW = false;

    try {
      deliveredToSW = await dispatchNotificationToSW({
        id: todo.id,
        text: todo.text,
        time: todo.time,
        category: todo.category,
      });
    } catch (error) {
      console.error('Invio notifica al Service Worker fallito:', error);
    }

    if (!deliveredToSW) {
      // Fallback per notifica diretta
      new Notification(`⏰ Task in scadenza!`, {
        body: `"${todo.text}" è programmato per le ${todo.time}`,
        icon: '/TODO/images.jpeg',
        badge: '/TODO/images.jpeg',
        tag: `todo-${todo.id}`,
        data: { todoId: todo.id }
      });
    }
    
    // Rimuovi dalla mappa delle notifiche schedulate
    scheduledNotifications.delete(todo.id);
  }, timeUntilNotification);
  
  // Salva il timeout ID per poterlo cancellare se necessario
  scheduledNotifications.set(todo.id, timeoutId);
  
  console.log(`Notifica schedulata per ${todo.text} alle ${notificationTime.toLocaleTimeString()}`);
}

async function dispatchNotificationToSW(todo) {
  if (!('serviceWorker' in navigator)) return null;

  const registration = await navigator.serviceWorker.ready;
  if (!registration.active) return null;

  registration.active.postMessage({
    type: 'SCHEDULE_NOTIFICATION',
    todo,
  });

  return true;
}

function cancelNotification(todoId) {
  if (scheduledNotifications.has(todoId)) {
    clearTimeout(scheduledNotifications.get(todoId));
    scheduledNotifications.delete(todoId);
  }
}

function rescheduleAllNotifications() {
  // Cancella tutte le notifiche esistenti
  scheduledNotifications.forEach(timeoutId => clearTimeout(timeoutId));
  scheduledNotifications.clear();
  
  // Ri-schedula le notifiche per tutti i task attivi
  todos.forEach(todo => {
    if (!todo.completed) {
      scheduleNotification(todo);
    }
  });
}
