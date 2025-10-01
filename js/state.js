// ===== STATO =====
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'active';       // 'active', 'completed' (rimosso 'all')
let currentCategoryFilter = 'all';  // 'all' o nome categoria
let currentDayFilter = 'all';       // 'all', 'today', 'tomorrow', 'week'
let currentView = 'list';           // 'list' o 'calendar'
let currentDate = new Date();       // Per navigazione calendario
let dragSrcEl = null;
let tempTodo = null;
let tempChecklistItems = [];
let editingTodoIndex = null;
let editTempChecklistItems = [];
let notificationPermission = false;
let scheduledNotifications = new Map(); // Per tenere traccia delle notifiche schedulate
let notificationSettings = {
  enabled: false,
  minutesBefore: 30
};

// ===== NUOVE VARIABILI (Features v2) =====
let searchQuery = '';               // Query ricerca testuale
let currentSortBy = 'date';         // 'date', 'priority', 'category', 'alphabetical'
let sortDirection = 'asc';          // 'asc', 'desc'

// ===== INIZIALIZZAZIONE VALORI DEFAULT =====
const today = new Date().toISOString().split('T')[0];
dateInput.value = today;
dateInput.min = today;

// Imposta ora attuale + 30min. come default
const now = new Date();
now.setMinutes(now.getMinutes() + 30);
const currentTime = now.getHours().toString().padStart(2, '0') + ':' + (now.getMinutes()).toString().padStart(2, '0');
timeInput.value = currentTime;

// Carica tema
const savedTheme = localStorage.getItem('theme') || 'light';
htmlRoot.setAttribute('data-theme', savedTheme);
