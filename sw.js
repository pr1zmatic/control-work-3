const SHELL_CACHE = 'shell-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

const SHELL_ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(SHELL_CACHE)
        .then(cache => cache.addAll(SHELL_ASSETS))
        .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => {
        return Promise.all(
            keys.filter(k => k !== SHELL_CACHE && k !== DYNAMIC_CACHE)
            .map(k => caches.delete(k))
        );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);

    if (url.pathname.includes('/content/')) {
        e.respondWith(
        fetch(e.request)
            .then(res => {
            const clone = res.clone();
            caches.open(DYNAMIC_CACHE).then(cache => cache.put(e.request, clone));
            return res;
            })
            .catch(() => caches.match(e.request))
        );
    } else {
        e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
        );
    }
});