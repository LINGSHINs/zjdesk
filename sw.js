// 书桌刷题应用 - Service Worker
const CACHE_NAME = 'shuzhuo-cache-v1';
const OFFLINE_URL = 'index.html';

const PRECACHE_URLS = [
  './',
  'index.html',
  'manifest.json',
  'css/themes.css',
  'css/main.css',
  'js/utils.js',
  'js/particles.js',
  'js/sounds.js',
  'js/stats.js',
  'js/modes.js',
  'js/easter-eggs.js',
  'js/themes.js',
  'js/app.js',
  'data/questions.json'
];

// 安装阶段 - 预缓存核心资源
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS).catch(function(error) {
        console.warn('Pre-cache failed:', error);
        return cache.add(OFFLINE_URL);
      });
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// 激活阶段 - 清理旧缓存
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// 请求拦截 - Stale-While-Revalidate 策略
self.addEventListener('fetch', function(event) {
  const request = event.request;

  // 只处理 GET 请求
  if (request.method !== 'GET') return;

  // 导航请求 - 网络优先，失败回退到缓存
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(function(response) {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(request, responseClone);
        });
        return response;
      }).catch(function() {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // 其他请求 - 缓存优先，同时更新缓存
  event.respondWith(
    caches.match(request).then(function(cachedResponse) {
      const fetchPromise = fetch(request).then(function(networkResponse) {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      }).catch(function() {
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// 消息处理
self.addEventListener('message', function(event) {
  const data = event.data;

  if (data && data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (data && data.type === 'CLEAR_CACHE') {
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(name) {
          return caches.delete(name);
        })
      );
    });
  }
});

// 推送通知（可选）
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const title = data.title || '书桌';
    const options = {
      body: data.body || '',
      icon: 'assets/icons/icon-192.png',
      badge: 'assets/icons/icon-72.png',
      data: data.data || {},
      tag: data.tag || 'default',
      renotify: true,
      vibrate: [200, 100, 200]
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// 通知点击
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const url = event.notification.data.url || './index.html';
  event.waitUntil(
    clients.openWindow(url)
  );
});
