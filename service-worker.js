const CACHE_NAME = 'my-app-cache-v7.11'; // Update version when there are changes
const IMAGE_CACHE_NAME = 'api-image-cache-v0.02'; // Cache name
const META_CHACHE_NAME = 'api-image-metadata-v0.01';

const ASSETS_TO_CACHE = [
    '/',
    '/index.html'
];

const cacheFiles = [
    // '.tsx',
    // '.css',
    // 'client',
    // '_min.css',
];

self.addEventListener('install', event => {
    console.log("Service Worker Installed");
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME).then(cache => {
                console.log('[Service Worker] Caching static assets');
                return cache.addAll(ASSETS_TO_CACHE);
            }),
            caches.open(META_CHACHE_NAME).then(metadataCache => {
                console.log('[Service Worker] Opening metadata cache');
            })
        ])
    );
    self.skipWaiting();
});


self.addEventListener('fetch', event => {
    const ReqUrl = event.request.url
    const shouldCache = cacheFiles.some(extension => ReqUrl.endsWith(extension)) 
    || ReqUrl.includes('vite')
    || ReqUrl.includes('fonts');
    if (!shouldCache) return;
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) return cachedResponse;
        const networkResponse = await fetch(event.request);
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      })
    );

});

const handleImageRequest = async (request) => {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    console.log(request)
    const cachedResponse = await cache.match(request.url);    // Check if the image is in the cache
    if (cachedResponse) return cachedResponse;
    const networkResponse = await fetch(request);    // If not found in cache, fetch from the network
    // Only cache the image if it's a valid response
    //if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
    if (networkResponse && networkResponse.status === 200) cache.put(request.url, networkResponse.clone()); // Cache the image for future use
    return networkResponse; // Return the network response (image)
  }

self.addEventListener('activate', event => {// Handle version updates by deleting old caches
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', key);
                        return caches.delete(key);
                    }
                })
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('message', event => {// Reload app on version change
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});