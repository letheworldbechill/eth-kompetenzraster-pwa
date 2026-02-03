// ETH Kompetenzraster PWA - Service Worker

const CACHE_NAME = 'eth-kompetenzraster-v1';
const ASSETS = [
    './',
    './index.html',
    './app.js',
    './app.css',
    './manifest.json',
    '../data/modules.json',
    '../modules/m1/meta.json',
    '../modules/m1/content.md',
    '../modules/m1/tasks.json',
    '../modules/m2/meta.json',
    '../modules/m2/content.md',
    '../modules/m2/tasks.json',
    '../modules/m3/meta.json',
    '../modules/m3/content.md',
    '../modules/m3/tasks.json',
    '../modules/m4/meta.json',
    '../modules/m4/content.md',
    '../modules/m4/tasks.json',
    '../modules/m5/meta.json',
    '../modules/m5/content.md',
    '../modules/m5/tasks.json',
    '../modules/s1/meta.json',
    '../modules/s1/content.md',
    '../modules/s1/tasks.json',
    '../modules/s2/meta.json',
    '../modules/s2/content.md',
    '../modules/s2/tasks.json',
    '../modules/s3/meta.json',
    '../modules/s3/content.md',
    '../modules/s3/tasks.json',
    '../modules/s4/meta.json',
    '../modules/s4/content.md',
    '../modules/s4/tasks.json',
    '../modules/s5/meta.json',
    '../modules/s5/content.md',
    '../modules/s5/tasks.json',
    '../modules/s6/meta.json',
    '../modules/s6/content.md',
    '../modules/s6/tasks.json',
    '../modules/s7/meta.json',
    '../modules/s7/content.md',
    '../modules/s7/tasks.json',
    '../modules/p1/meta.json',
    '../modules/p1/content.md',
    '../modules/p1/tasks.json',
    '../modules/p2/meta.json',
    '../modules/p2/content.md',
    '../modules/p2/tasks.json',
    '../modules/p3/meta.json',
    '../modules/p3/content.md',
    '../modules/p3/tasks.json',
    '../modules/p4/meta.json',
    '../modules/p4/content.md',
    '../modules/p4/tasks.json',
    '../modules/p5/meta.json',
    '../modules/p5/content.md',
    '../modules/p5/tasks.json',
    '../modules/p6/meta.json',
    '../modules/p6/content.md',
    '../modules/p6/tasks.json'
];

// Install event: cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event: Cache-First strategy
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached response if available
                if (response) {
                    return response;
                }
                
                // Otherwise, fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200) {
                            return response;
                        }
                        
                        // Clone the response
                        const responseToCache = response.clone();
                        
                        // Cache the response
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // Offline fallback
                        return new Response('Offline - Cache nicht verfügbar', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Background sync (optional future feature)
self.addEventListener('sync', event => {
    if (event.tag === 'sync-data') {
        event.waitUntil(
            syncData()
        );
    }
});

function syncData() {
    // Future: synchronize user progress with server
    return Promise.resolve();
}

// ═══════════════════════════════════════════════════════════════════════════
// DOKUMENTATION (added in correction round)
// ═══════════════════════════════════════════════════════════════════════════
// Cache-First Strategy: Versuche zuerst Cache zu laden, dann Netzwerk
// Falls beide fehlschlagen: Offline-Fallback Response
// ASSETS: Alle 54 Dateien (5 Core + 18 Module × 3 Dateien + 1 Index)
