const CACHE_NAME = 'quba-v7';
const STATIC_ASSETS = [
    '/',
    '/login',
    '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch((error) => {
                console.error('Failed to cache assets during install:', error);
            });
        })
    );
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip API requests and auth-related routes (always network)
    if (event.request.url.includes('/api/') ||
        event.request.url.includes('supabase') ||
        event.request.url.includes('/auth/')) {
        return;
    }

    // For navigation requests (HTML pages), always try network first
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // Only fallback to cached index if offline
                    return caches.match('/') || caches.match('/login');
                })
        );
        return;
    }

    // For other resources (JS, CSS, images), use cache-first strategy
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Return cached version and update cache in background
                fetch(event.request).then((response) => {
                    if (response.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, response);
                        });
                    }
                });
                return cachedResponse;
            }
            // If not in cache, fetch from network
            return fetch(event.request).then((response) => {
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            });
        })
    );
});

// Push notification event
self.addEventListener('push', (event) => {
    console.log("SW: Push event received", event);
    if (!event.data) {
        console.log("SW: No data in push event");
        return;
    }

    let data;
    try {
        data = event.data.json();
        console.log("SW: Push data parsed", data);
    } catch (e) {
        console.error("SW: Failed to parse push data", e);
        data = { body: event.data.text() };
    }

    const options = {
        body: data.body || 'Notifikasi baru dari QUBA',
        icon: '/icons/icon-192x192.png',
        data: {
            url: data.url || '/',
        },
        tag: 'quba-notification',
        renotify: true
    };

    console.log("SW: Showing notification with options", options);

    event.waitUntil(
        self.registration.showNotification(data.title || 'QUBA', options)
            .then(() => console.log("SW: Notification shown"))
            .catch((err) => console.error("SW: Show notification failed", err))
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') return;

    const url = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // If a window is already open, focus it
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
