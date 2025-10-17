// ===== FILE ATTACHMENTS MANAGEMENT =====

let tempAttachments = []; // File temporanei durante la creazione
let editTempAttachments = []; // File temporanei durante la modifica

// ===== GENERIC MODAL FUNCTIONS =====
function showGenericModal(options) {
  return new Promise((resolve) => {
    const modal = document.getElementById('generic-modal');
    const title = document.getElementById('generic-modal-title');
    const message = document.getElementById('generic-modal-message');
    const buttonsContainer = document.getElementById('generic-modal-buttons');
    const iconDiv = modal.querySelector('.generic-modal-icon');

    // Imposta contenuto
    title.textContent = options.title || '';
    message.textContent = options.message || '';
    
    // Imposta icona
    iconDiv.className = 'generic-modal-icon';
    if (options.icon) {
      iconDiv.classList.add(options.icon);
    }

    // Crea bottoni
    buttonsContainer.innerHTML = '';
    
    if (options.type === 'confirm') {
      // Modale di conferma con due bottoni
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn-cancel';
      cancelBtn.textContent = options.cancelText || 'Annulla';
      cancelBtn.onclick = () => {
        modal.style.display = 'none';
        resolve(false);
      };

      const confirmBtn = document.createElement('button');
      confirmBtn.className = options.danger ? 'btn-danger' : 'btn-confirm';
      confirmBtn.textContent = options.confirmText || 'Conferma';
      confirmBtn.onclick = () => {
        modal.style.display = 'none';
        resolve(true);
      };

      buttonsContainer.appendChild(cancelBtn);
      buttonsContainer.appendChild(confirmBtn);
    } else {
      // Modale di alert con un solo bottone
      const okBtn = document.createElement('button');
      okBtn.className = 'btn-confirm';
      okBtn.textContent = options.okText || 'OK';
      okBtn.onclick = () => {
        modal.style.display = 'none';
        resolve(true);
      };

      buttonsContainer.appendChild(okBtn);
    }

    // Mostra modale
    modal.style.display = 'flex';

    // Chiudi con ESC
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        modal.style.display = 'none';
        resolve(false);
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);

    // Chiudi cliccando fuori
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        resolve(false);
      }
    };
  });
}

// Funzioni helper per casi comuni
function showAlert(message, title = 'Attenzione', icon = 'warning') {
  return showGenericModal({
    type: 'alert',
    title: title,
    message: message,
    icon: icon
  });
}

function showConfirm(message, title = 'Conferma', icon = 'question', danger = false) {
  return showGenericModal({
    type: 'confirm',
    title: title,
    message: message,
    icon: icon,
    danger: danger
  });
}

function showDeleteConfirm(itemName) {
  return showGenericModal({
    type: 'confirm',
    title: 'Elimina file',
    message: `Vuoi eliminare "${itemName}"?\nQuesta azione non può essere annullata.`,
    icon: 'trash',
    danger: true,
    confirmText: 'Elimina',
    cancelText: 'Annulla'
  });
}

// Funzione per convertire file in base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Funzione per gestire l'aggiunta di file nella modale di creazione
async function handleFileAdd(files) {
  const fileArray = Array.from(files);
  
  for (const file of fileArray) {
    // Verifica dimensione (max 5MB per file)
    if (file.size > 5 * 1024 * 1024) {
      await showAlert(
        `Il file "${file.name}" è troppo grande. Dimensione massima: 5MB`,
        'File troppo grande',
        'error'
      );
      continue;
    }

    try {
      const base64 = await fileToBase64(file);
      tempAttachments.push({
        name: file.name,
        type: file.type,
        data: base64,
        size: file.size
      });
    } catch (error) {
      console.error('Errore durante la lettura del file:', error);
      await showAlert(
        `Errore durante il caricamento di "${file.name}". Riprova.`,
        'Errore caricamento',
        'error'
      );
    }
  }

  renderFilePreview();
}

// Funzione per gestire l'aggiunta di file nella modale di modifica
async function handleEditFileAdd(files) {
  const fileArray = Array.from(files);
  
  for (const file of fileArray) {
    // Verifica dimensione (max 5MB per file)
    if (file.size > 5 * 1024 * 1024) {
      await showAlert(
        `Il file "${file.name}" è troppo grande. Dimensione massima: 5MB`,
        'File troppo grande',
        'error'
      );
      continue;
    }

    try {
      const base64 = await fileToBase64(file);
      editTempAttachments.push({
        name: file.name,
        type: file.type,
        data: base64,
        size: file.size
      });
    } catch (error) {
      console.error('Errore durante la lettura del file:', error);
      await showAlert(
        `Errore durante il caricamento di "${file.name}". Riprova.`,
        'Errore caricamento',
        'error'
      );
    }
  }

  renderEditFilePreview();
}

// Render preview dei file nella modale di creazione
function renderFilePreview() {
  const previewContainer = document.getElementById('task-file-preview');
  if (!previewContainer) return;

  previewContainer.innerHTML = '';

  tempAttachments.forEach((file, index) => {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-preview-item';

    // Se è un'immagine, mostra preview
    if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = file.data;
      img.alt = file.name;
      fileItem.appendChild(img);
    } else {
      // Per altri file, mostra icona e nome
      fileItem.classList.add('file-doc');
      fileItem.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
          <polyline points="13 2 13 9 20 9"/>
        </svg>
        <div class="file-doc-name">${file.name}</div>
      `;
    }

    // Bottone rimuovi
    const removeBtn = document.createElement('button');
    removeBtn.className = 'file-remove-btn';
    removeBtn.innerHTML = '×';
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      tempAttachments.splice(index, 1);
      renderFilePreview();
    };

    fileItem.appendChild(removeBtn);
    previewContainer.appendChild(fileItem);
  });
}

// Render preview dei file nella modale di modifica
function renderEditFilePreview() {
  const previewContainer = document.getElementById('edit-file-preview');
  if (!previewContainer) return;

  previewContainer.innerHTML = '';

  // Se stiamo modificando un todo, mostra gli allegati esistenti
  if (editingTodoIndex !== null && todos[editingTodoIndex] && todos[editingTodoIndex].attachments) {
    const existingAttachments = todos[editingTodoIndex].attachments;
    
    existingAttachments.forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-preview-item existing-attachment';
      fileItem.title = 'File già salvato';

      // Se è un'immagine, mostra preview
      if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = file.data;
        img.alt = file.name;
        fileItem.appendChild(img);
      } else {
        // Per altri file, mostra icona e nome
        fileItem.classList.add('file-doc');
        fileItem.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
            <polyline points="13 2 13 9 20 9"/>
          </svg>
          <div class="file-doc-name">${file.name}</div>
        `;
      }

      // Badge "Salvato"
      const savedBadge = document.createElement('div');
      savedBadge.className = 'file-saved-badge';
      savedBadge.textContent = '✓';
      savedBadge.title = 'File già salvato';
      fileItem.appendChild(savedBadge);

      // Bottone rimuovi per file esistenti
      const removeBtn = document.createElement('button');
      removeBtn.className = 'file-remove-btn';
      removeBtn.innerHTML = '×';
      removeBtn.onclick = async (e) => {
        e.stopPropagation();
        const confirmed = await showDeleteConfirm(file.name);
        if (confirmed) {
          todos[editingTodoIndex].attachments.splice(index, 1);
          renderEditFilePreview();
        }
      };

      fileItem.appendChild(removeBtn);
      previewContainer.appendChild(fileItem);
    });
  }

  // Mostra i nuovi file da aggiungere
  editTempAttachments.forEach((file, index) => {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-preview-item new-attachment';
    fileItem.title = 'Nuovo file da aggiungere';

    // Se è un'immagine, mostra preview
    if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = file.data;
      img.alt = file.name;
      fileItem.appendChild(img);
    } else {
      // Per altri file, mostra icona e nome
      fileItem.classList.add('file-doc');
      fileItem.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
          <polyline points="13 2 13 9 20 9"/>
        </svg>
        <div class="file-doc-name">${file.name}</div>
      `;
    }

    // Badge "Nuovo"
    const newBadge = document.createElement('div');
    newBadge.className = 'file-new-badge';
    newBadge.textContent = 'NEW';
    fileItem.appendChild(newBadge);

    // Bottone rimuovi per nuovi file
    const removeBtn = document.createElement('button');
    removeBtn.className = 'file-remove-btn';
    removeBtn.innerHTML = '×';
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      editTempAttachments.splice(index, 1);
      renderEditFilePreview();
    };

    fileItem.appendChild(removeBtn);
    previewContainer.appendChild(fileItem);
  });
}

// Render attachments nella modale dettaglio
function renderDetailAttachments(todo) {
  const attachmentsSection = document.getElementById('detail-attachments');
  const attachmentsList = document.getElementById('detail-attachments-list');
  
  if (!attachmentsSection || !attachmentsList) return;

  if (todo.attachments && todo.attachments.length > 0) {
    attachmentsSection.style.display = 'block';
    attachmentsList.innerHTML = '';

    todo.attachments.forEach((file, index) => {
      const attachmentItem = document.createElement('div');
      attachmentItem.className = 'attachment-item';

      // Se è un'immagine
      if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = file.data;
        img.alt = file.name;
        attachmentItem.appendChild(img);

        // Click per visualizzare in fullscreen
        attachmentItem.onclick = () => showFileViewer(file);
      } else {
        // Per altri file
        attachmentItem.classList.add('file-doc');
        attachmentItem.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
            <polyline points="13 2 13 9 20 9"/>
          </svg>
          <div class="attachment-name">${file.name}</div>
        `;

        // Click per scaricare
        attachmentItem.onclick = () => downloadFile(file);
      }

      // Bottone elimina
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'attachment-delete-btn';
      deleteBtn.innerHTML = '🗑️';
      deleteBtn.onclick = async (e) => {
        e.stopPropagation();
        const confirmed = await showDeleteConfirm(file.name);
        if (confirmed) {
          deleteAttachment(todo, index);
        }
      };

      attachmentItem.appendChild(deleteBtn);
      attachmentsList.appendChild(attachmentItem);
    });
  } else {
    attachmentsSection.style.display = 'none';
  }
}

// Elimina un attachment da un todo
function deleteAttachment(todo, fileIndex) {
  if (!todo.attachments) return;
  
  todo.attachments.splice(fileIndex, 1);
  saveAndRender();
  
  // Aggiorna la visualizzazione nella modale dettaglio se è aperta
  renderDetailAttachments(todo);
}

// Mostra file viewer per immagini
function showFileViewer(file) {
  // Crea overlay se non esiste
  let overlay = document.getElementById('file-viewer-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'file-viewer-overlay';
    overlay.className = 'file-viewer-overlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="file-viewer-content">
      <button class="file-viewer-close">×</button>
      <img src="${file.data}" alt="${file.name}">
    </div>
  `;

  overlay.classList.add('active');

  // Chiudi al click
  overlay.onclick = (e) => {
    if (e.target === overlay || e.target.classList.contains('file-viewer-close')) {
      overlay.classList.remove('active');
    }
  };
}

// Download file
function downloadFile(file) {
  const link = document.createElement('a');
  link.href = file.data;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Reset file temporanei
function resetTempAttachments() {
  tempAttachments = [];
  const fileInput = document.getElementById('task-file-input');
  if (fileInput) fileInput.value = '';
  renderFilePreview();
}

function resetEditTempAttachments() {
  editTempAttachments = [];
  const fileInput = document.getElementById('edit-file-input');
  if (fileInput) fileInput.value = '';
  renderEditFilePreview();
}

// Formatta dimensione file
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
