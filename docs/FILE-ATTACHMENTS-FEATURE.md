# 📎 Funzionalità Allegati File/Foto

## Panoramica
È stata implementata la funzionalità completa per allegare file e foto ai task della TODO list. Gli utenti possono aggiungere, visualizzare ed eliminare allegati sia da PC che da dispositivi mobile.

## Funzionalità Implementate

### ✅ 1. Aggiunta File in Creazione Task
- Nuovo campo "📎 Allega file/foto" nella modale di creazione
- Supporta selezione multipla di file
- Preview immediata dei file selezionati (miniature per immagini, icona per documenti)
- Possibilità di rimuovere singoli file prima della conferma
- Limite dimensione: 5MB per file

### ✅ 2. Aggiunta File in Modifica Task
- Stesso campo disponibile nella modale di modifica
- I file aggiunti si sommano a quelli già esistenti
- Preview dei nuovi file da aggiungere

### ✅ 3. Visualizzazione File Allegati
- Badge "📎 N" sulla card del task (dove N = numero file)
- Sezione dedicata nella modale dettaglio task
- Grid responsive con miniature per immagini
- Icone documenti per file non-immagine
- Click su immagini → visualizzazione fullscreen
- Click su documenti → download automatico

### ✅ 4. Eliminazione File
- Bottone 🗑️ su ogni file nella modale dettaglio
- Conferma prima dell'eliminazione
- Aggiornamento automatico UI e localStorage

## Tipi di File Supportati
- **Immagini**: `image/*` (jpeg, png, gif, webp, etc.)
- **Documenti**: `.pdf`, `.doc`, `.docx`, `.txt`

## Limiti
- Dimensione massima per file: **5MB**
- I file vengono salvati in base64 nel localStorage
- Attenzione: molti file di grandi dimensioni possono riempire il localStorage

## File Modificati

### 📄 HTML (`index.html`)
- Aggiunto campo file input nella modale creazione task
- Aggiunto campo file input nella modale modifica task
- Aggiunta sezione attachments nella modale dettaglio
- Incluso nuovo script `file-attachments.js`

### 🎨 CSS (`style-features.css`)
- Nuovi stili per `.file-attachment-section`
- Stili per preview file (`.file-preview-list`, `.file-preview-item`)
- Stili per visualizzatore fullscreen (`.file-viewer-overlay`)
- Stili per attachments grid nella modale dettaglio
- Badge indicatore attachments su card task

### 📜 JavaScript

#### Nuovo File: `js/file-attachments.js`
Contiene tutta la logica per:
- Conversione file → base64
- Gestione upload e preview
- Rendering attachments
- Visualizzatore fullscreen per immagini
- Download file
- Eliminazione attachments

Funzioni principali:
- `handleFileAdd(files)` - Gestisce upload in creazione
- `handleEditFileAdd(files)` - Gestisce upload in modifica
- `renderFilePreview()` - Mostra preview in creazione
- `renderEditFilePreview()` - Mostra preview in modifica
- `renderDetailAttachments(todo)` - Mostra attachments nella modale dettaglio
- `deleteAttachment(todo, index)` - Elimina un attachment
- `showFileViewer(file)` - Apre visualizzatore fullscreen
- `downloadFile(file)` - Scarica un file

#### Modifiche: `js/event-listeners.js`
- Aggiunti listener per input file (creazione e modifica)
- Aggiunta chiamata a `resetTempAttachments()` nel reset form creazione
- Aggiunta chiamata a `resetEditTempAttachments()` nel reset form modifica
- Attachments inclusi nell'oggetto todo al salvataggio

#### Modifiche: `js/modals.js`
- Aggiunta chiamata a `renderDetailAttachments()` in `showTodoDetail()`

#### Modifiche: `js/todo-actions.js`
- Reset `editTempAttachments` all'apertura modale modifica

#### Modifiche: `js/rendering.js`
- Aggiunto badge "📎 N" sulla card del task quando ci sono allegati

#### Modifiche: `js/state.js`
- Aggiunte variabili globali:
  - `tempAttachments = []` - File temporanei durante creazione
  - `editTempAttachments = []` - File temporanei durante modifica

## Struttura Dati

### Oggetto Todo con Attachments
```javascript
{
  id: 1234567890,
  text: "Task con allegati",
  completed: false,
  date: "2025-10-17",
  time: "14:30",
  category: "Lavoro",
  checklist: [],
  priority: "high",
  recurrence: "none",
  attachments: [
    {
      name: "documento.pdf",
      type: "application/pdf",
      data: "data:application/pdf;base64,...",
      size: 1024000
    },
    {
      name: "foto.jpg",
      type: "image/jpeg",
      data: "data:image/jpeg;base64,...",
      size: 512000
    }
  ]
}
```

## User Experience

### Da PC
1. Click su "📎 Allega file/foto"
2. Selezione file dal file system
3. Preview immediata con possibilità di rimuovere
4. Conferma → file salvati nel task

### Da Mobile/Tablet
1. Tap su "📎 Allega file/foto"
2. Scelta tra fotocamera, galleria o file
3. Preview e gestione come su PC

### Visualizzazione
- Badge discreto "📎 3" sulla card → indica 3 file allegati
- Click su "Dettagli" → mostra griglia con tutti i file
- Click su immagine → fullscreen viewer
- Click su documento → download

### Eliminazione
- Hover su file → appare bottone 🗑️
- Click → conferma eliminazione
- File rimosso immediatamente

## Note Tecniche

### Perché Base64?
I file vengono convertiti in base64 per essere salvati direttamente nel localStorage insieme agli altri dati del task. Questo garantisce:
- ✅ Persistenza locale senza bisogno di server
- ✅ Funzionamento offline completo
- ✅ Semplicità di implementazione

### Limitazioni Base64
- ⚠️ Il base64 aumenta la dimensione del file del ~33%
- ⚠️ localStorage ha limite di ~5-10MB (varia per browser)
- ⚠️ Troppi file possono saturare lo storage

### Raccomandazioni
- Limitare numero di file per task
- Preferire immagini compresse
- Evitare file molto grandi
- Monitorare utilizzo localStorage

## Test Suggeriti
- [ ] Upload singolo file immagine
- [ ] Upload multiplo (3-4 immagini)
- [ ] Upload documento PDF
- [ ] Upload file di testo
- [ ] Visualizzazione fullscreen immagine
- [ ] Download documento
- [ ] Eliminazione singolo attachment
- [ ] Modifica task con aggiunta nuovi file
- [ ] Verifica persistenza dopo refresh
- [ ] Test su mobile (galleria/fotocamera)
- [ ] Test limite 5MB

## Miglioramenti Futuri (Opzionali)
- [ ] Compressione immagini lato client
- [ ] Indicatore percentuale spazio localStorage utilizzato
- [ ] Supporto drag & drop file
- [ ] Anteprima PDF inline
- [ ] Supporto video (con limiti stretti)
- [ ] Export tutti gli attachments di un task come ZIP
