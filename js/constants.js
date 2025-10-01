// ===== ELEMENTI DOM =====
const htmlRoot = document.getElementById('html-root');
const themeToggle = document.getElementById('theme-toggle');
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const dateInput = document.getElementById('todo-date');
const timeInput = document.getElementById('todo-time');
const todoContainer = document.getElementById('todo-container');
const emptyState = document.getElementById('empty-state');
const resetFiltersBtn = document.getElementById('reset-filters');
const todoItemTemplate = document.getElementById('todo-item-template');

// Elementi navigazione calendario
const calendarNavigation = document.getElementById('calendar-navigation');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const currentMonthYearSpan = document.getElementById('current-month-year');

// Elementi modale categoria
const categoryModal = document.getElementById('category-modal');
const categoryInput = document.getElementById('category-input');
const categoryRadios = document.querySelectorAll('input[name="category"]');
const enableChecklistCheckbox = document.getElementById('enable-checklist');
const checklistItems = document.getElementById('checklist-items');
const checklistList = checklistItems?.querySelector('.checklist-list');
const addChecklistBtn = checklistItems?.querySelector('.add-checklist-item');
const checklistItemInput = checklistItems?.querySelector('.checklist-item-input');

// Elementi modale dettaglio
const detailModal = document.getElementById('detail-modal');
const detailTitle = document.getElementById('detail-title');
const detailCategory = document.getElementById('detail-category');
const detailDate = document.getElementById('detail-date');
const detailTime = document.getElementById('detail-time');
const detailStatus = document.getElementById('detail-status');
const detailChecklist = document.getElementById('detail-checklist');
const detailChecklistItems = document.getElementById('detail-checklist-items');
const closeDetailBtn = document.getElementById('close-detail');

// Elementi modale notifiche
const notificationToggleBtn = document.getElementById('notification-toggle');
const notificationModal = document.getElementById('notification-modal');
const closeNotificationBtn = document.getElementById('close-notification');
const notificationEnabledCheckbox = document.getElementById('notification-enabled');
const notificationTimeSelect = document.getElementById('notification-time');
const saveNotificationBtn = document.getElementById('save-notification-settings');

// Elementi modale modifica
const editModal = document.getElementById('edit-modal');
const editText = document.getElementById('edit-text');
const editDate = document.getElementById('edit-date');
const editTime = document.getElementById('edit-time');
const editCategory = document.getElementById('edit-category');
const editHasChecklist = document.getElementById('edit-has-checklist');
const editChecklistContainer = document.getElementById('edit-checklist-container');
const editChecklistInput = document.getElementById('edit-checklist-input');
const editAddChecklistBtn = document.getElementById('edit-add-checklist-item');
const editChecklistList = document.getElementById('edit-checklist-list');
const closeEditBtn = document.getElementById('close-edit');
const cancelEditBtn = document.getElementById('cancel-edit');
const confirmEditBtn = document.getElementById('confirm-edit');
