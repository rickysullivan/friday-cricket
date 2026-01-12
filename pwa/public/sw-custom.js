// Custom service worker for notification actions

self.addEventListener('notificationclick', (event) => {
  const action = event.action;
  const notification = event.notification;

  console.log('Notification clicked:', action, notification.tag);

  notification.close();

  if (action === 'undo') {
    // Send message to the app to trigger undo
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Focus existing window or open new one
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.postMessage({ type: 'UNDO_ACTION', tag: notification.tag });
            return;
          }
        }
        // If no window open, open one
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  } else if (action === 'dismiss' || !action) {
    // Just close the notification (already done above)
    // Optionally focus the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }
      })
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});
