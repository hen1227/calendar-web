self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('push', (e) => {
    const body = e.data.text() || 'Push message has no payload';

    const options = {
        body,
        icon: 'android-chrome-192x192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
        },
        actions: [
            {
                action: 'open',
                title: 'View Calendar',
                icon: 'android-chrome-192x192.png',
            },
            {
                action: 'dining',
                title: 'View Menu',
                icon: 'android-chrome-192x192.png',
            },
        ],
    };
    e.waitUntil(self.registration.showNotification('SPS Now Calendar', options));
});

self.addEventListener('notificationclick', (event) => {
    const eventAction = event.action;
    //console.log('message event fired! event action is:', `'${eventAction}'`);

    let url = 'https://spsnow.henhen1227.com';
    if (eventAction === 'dining') {
        url = 'https://spsnow.henhen1227.com/dining';
    }

    event.notification.close(); // Android needs explicit close.
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((windowClients) => {
            // Check if there is already a window/tab open with the target URL
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                // If so, just focus it.
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, then open the target URL in a new window/tab.
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
