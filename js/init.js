// ===== INIZIALIZZAZIONE APP =====

// Carica impostazioni notifiche
// loadNotificationSettings();

// Inizializza notifiche
// initializeNotifications();

// Avvio
updateCalendarNavigation();
renderTodos();

// Ri-schedula le notifiche all'avvio (in caso l'app sia stata chiusa e riaperta)
setTimeout(() => {
  rescheduleAllNotifications();
}, 1000);

updateCategoryMenu();

// Inizializza keyboard shortcuts
initializeKeyboardShortcuts();

// Inizializza UI sorting
updateSortUI();

// Inizializza controllo ricorrenze
initializeRecurrenceCheck();

// Inizializza stato form
initializeFormState();
