const CACHE_NAME = 'mktg-academy-cache-v5';
const ASSETS = [
  'index.html',
  'styles.css',
  'app.js',
  'manifest.json',
  'data/chapters.js',
  'data/chapter_01.js',
  'data/chapter_02.js',
  'data/chapter_07.js',
  'images/logos/logo-active.jpg',
  'images/logos/logo_1_gold_badge.jpg',
  'images/logos/logo_2_modern_minimal.jpg',
  'images/logos/logo_3_nebula_cosmic.jpg',
  'images/logos/logo_4_corporate_premium.jpg',
  'images/logos/logo_5_cyber_terminal.jpg',
  'images/icon-192.png',
  'images/icon-512.png',
  'images/figure_1_1_marketing_process.jpg',
  'images/figure_2_2_bcg_matrix.jpg',
  'images/figure_2_3_ansoff_grid.jpg',
  'images/figure_3_1_environment.jpg',
  'images/figure_5_1_buyer_behavior.jpg',
  'images/figure_7_1_stp_strategy.jpg',
  'images/figure_7_2_perceptual_map.jpg',
  'images/figure_8_1_product_levels.jpg'
];

// Install Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Service Worker (Network first, fall back to Cache)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).then((response) => {
      // Clone and store in cache if successful
      if (response && response.status === 200 && response.type === 'basic') {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseClone);
        });
      }
      return response;
    }).catch(() => {
      return caches.match(e.request);
    })
  );
});
