# ✅ TEST PLAN - TODO App Refactoring

## 🎯 Obiettivo
Verificare che il refactoring modulare non abbia introdotto breaking changes e che tutte le funzionalità rimangano operative.

## 🧪 Test Automatici

### File di Test Creato
- **`test-refactoring.html`** - Pagina di test con verifica automatica delle funzioni

### Come Eseguire
1. Apri `test-refactoring.html` nel browser
2. I test vengono eseguiti automaticamente
3. Verifica che tutti i test siano ✅ verdi

## 🖱️ Test Manuali Essenziali

### 1. ✅ Caricamento App
- [ ] Apri `index.html` nel browser
- [ ] Apri DevTools (F12) → Console
- [ ] Verifica che NON ci siano errori JavaScript
- [ ] Verifica che l'app si carichi correttamente

### 2. ➕ Creazione Task
- [ ] Inserisci testo nel campo "Cosa devi fare?"
- [ ] Seleziona una data
- [ ] Seleziona un'ora
- [ ] Clicca il bottone "+" per aggiungere
- [ ] Verifica che appaia la modale categoria
- [ ] Seleziona una categoria (es. "Lavoro")
- [ ] Clicca "Conferma"
- [ ] Verifica che il task appaia nella lista

### 3. ✏️ Modifica Task
- [ ] Clicca sui tre puntini (⋯) di un task
- [ ] Clicca "Modifica"
- [ ] Cambia il testo
- [ ] Cambia la data/ora
- [ ] Cambia la categoria
- [ ] Clicca "Conferma"
- [ ] Verifica che le modifiche siano salvate

### 4. ✔️ Completa/Ripristina Task
- [ ] Clicca sui tre puntini (⋯) di un task
- [ ] Clicca "Completa"
- [ ] Verifica che il task venga barrato
- [ ] Clicca di nuovo sui tre puntini
- [ ] Clicca "Ripristina"
- [ ] Verifica che il task torni attivo

### 5. 🗑️ Elimina Task
- [ ] Clicca sui tre puntini (⋯) di un task
- [ ] Clicca "Elimina"
- [ ] Verifica che il task venga rimosso con animazione

### 6. 👁️ Dettagli Task
- [ ] Clicca sui tre puntini (⋯) di un task
- [ ] Clicca "Dettagli"
- [ ] Verifica che si apra la modale con tutte le info
- [ ] Clicca X per chiudere

### 7. 🎯 Drag & Drop Desktop
- [ ] Crea almeno 3 task con date diverse
- [ ] Trascina un task su un altro task
- [ ] Verifica che l'ordine cambi
- [ ] Trascina un task su una sezione giorno diversa
- [ ] Verifica che la data cambi

### 8. 📱 Touch Drag & Drop Mobile
- [ ] Apri l'app su mobile o usa DevTools device mode
- [ ] Tieni premuto un task per ~200ms
- [ ] Trascina il task
- [ ] Verifica che funzioni come su desktop

### 9. 🔍 Filtri
**Filtro Stato:**
- [ ] Clicca il bottone cerchio (stato)
- [ ] Verifica che mostri solo task completati
- [ ] Clicca di nuovo per tornare a "Da fare"

**Filtro Categoria:**
- [ ] Clicca il bottone categorie
- [ ] Seleziona una categoria specifica
- [ ] Verifica che mostri solo quella categoria
- [ ] Seleziona "Tutte" per resettare

**Filtro Giorno:**
- [ ] Clicca il bottone calendario
- [ ] Seleziona "Oggi"
- [ ] Verifica che mostri solo task di oggi
- [ ] Prova "Domani" e "Questa settimana"

### 10. 📅 Vista Calendario
- [ ] Clicca il bottone toggle vista (lista/calendario)
- [ ] Verifica che appaia la vista calendario
- [ ] Verifica che i task appaiano nei giorni corretti
- [ ] Usa frecce ← → per navigare mesi
- [ ] Clicca di nuovo per tornare alla lista

### 11. 🔄 Reset Filtri
- [ ] Applica vari filtri (stato, categoria, giorno)
- [ ] Clicca il bottone reset (↻)
- [ ] Verifica che tutti i filtri tornino al default

### 12. 🌓 Tema Chiaro/Scuro
- [ ] Clicca il bottone sole/luna
- [ ] Verifica che il tema cambi
- [ ] Ricarica la pagina
- [ ] Verifica che il tema sia mantenuto

### 13. ☑️ Checklist (se abilitata)
- [ ] Crea un nuovo task
- [ ] Nella modale categoria, abilita "Crea come checklist"
- [ ] Aggiungi 2-3 attività
- [ ] Conferma
- [ ] Apri i dettagli del task
- [ ] Spunta le attività della checklist
- [ ] Verifica che tutte le funzioni funzionino

### 14. 🔔 Notifiche (Solo Mobile)
- [ ] Apri su mobile
- [ ] Verifica che appaia il bottone campana (🔔)
- [ ] Clicca per aprire impostazioni notifiche
- [ ] Abilita notifiche
- [ ] Accetta i permessi del browser
- [ ] Imposta preavviso (es. 30 min)
- [ ] Salva
- [ ] Crea un task futuro
- [ ] Verifica che la notifica arrivi al momento giusto

### 15. 💾 Persistenza Dati
- [ ] Crea alcuni task
- [ ] Chiudi la tab/browser
- [ ] Riapri `index.html`
- [ ] Verifica che i task siano ancora presenti

### 16. 🔄 Service Worker
- [ ] Apri DevTools → Application → Service Workers
- [ ] Verifica che il service worker sia registrato
- [ ] Status: "activated and running"

## 🐛 Cosa Verificare nella Console

### ✅ Console Pulita
La console NON deve mostrare:
- ❌ Errori JavaScript (`Uncaught`, `TypeError`, ecc.)
- ❌ Errori di caricamento file (`404`, `Failed to load`)
- ❌ Warning critici

### ✅ Console OK
È normale vedere:
- ℹ️ `Drag started for todo: X`
- ℹ️ `Drag ended`
- ℹ️ `Notifica schedulata per...`
- ℹ️ Log di debug

## 📊 Checklist Finale

Prima di considerare il refactoring completo:
- [ ] Tutti i test automatici passano (test-refactoring.html)
- [ ] Tutti i test manuali essenziali (1-16) superati
- [ ] Console senza errori
- [ ] Nessun comportamento anomalo
- [ ] Performance simile alla versione originale
- [ ] Tutti i file modulari caricati correttamente

## 🚨 In Caso di Problemi

### Ripristino Backup
Se qualcosa non funziona:

```powershell
# 1. Ripristina script.js originale
Copy-Item "script.js.backup" "script.js"

# 2. Modifica index.html
# Sostituisci i tag <script src="js/..."> con:
# <script src="script.js"></script>

# 3. Ricarica la pagina
```

### Debug
Se un modulo specifico ha problemi:
1. Apri DevTools → Sources
2. Trova il file js/xxx.js problematico
3. Aggiungi breakpoint
4. Ricarica e analizza

## ✅ Sign-Off

**Test eseguito da:** _________________  
**Data:** _________________  
**Browser testato:** _________________  
**Esito:** ☐ PASS  ☐ FAIL  
**Note:** _________________________________

---

**🎉 Se tutti i test passano, il refactoring è completato con successo!**
