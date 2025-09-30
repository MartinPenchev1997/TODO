// sw.js v.3 - Aggiunto supporto notifiche
// const CACHE_NAME = "todo-app-v3";
self.addEventListener("fetch", () => {});

// // Gestione messaggi per notifiche
// self.addEventListener("message", (event) => {
//   if (!event.data || event.data.type !== "SCHEDULE_NOTIFICATION") return;

//   if (Notification.permission !== "granted") return;

//   event.waitUntil(
//     self.registration.showNotification(`⏰ Task in scadenza!`, {
//       body: `"${event.data.todo.text}" è programmato per le ${event.data.todo.time}`,
//       icon: "/TODO/images.jpeg",
//       badge: "/TODO/images.jpeg",
//       tag: `todo-${event.data.todo.id}`,
//       data: { todoId: event.data.todo.id },
//       requireInteraction: true,
//       actions: [
//         {
//           action: "view",
//           title: "Visualizza",
//         },
//         {
//           action: "complete",
//           title: "Completa",
//         },
//       ],
//     })
//   );
// });

// // Gestione click sulla notifica
// self.addEventListener("notificationclick", (event) => {
//   event.notification.close();

//   if (event.action === "complete") {
//     // Comunica al client di completare il task
//     clients.matchAll().then((clientList) => {
//       if (clientList.length > 0) {
//         clientList[0].postMessage({
//           type: "COMPLETE_TODO",
//           todoId: event.notification.data.todoId,
//         });
//       }
//     });
//   } else {
//     // Apri l'app
//     event.waitUntil(
//       clients.matchAll().then((clientList) => {
//         if (clientList.length > 0) {
//           return clientList[0].focus();
//         }
//         return clients.openWindow("/TODO/");
//       })
//     );
//   }
// });
