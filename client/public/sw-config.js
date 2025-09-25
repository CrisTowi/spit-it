// Configuración del Service Worker para SpitIt PWA
const SW_CONFIG = {
  version: '1.0.0',
  cacheName: 'spitit-v1.0.0',

  // URLs que se cachearán inmediatamente
  urlsToCache: [
    '/',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    // Agregar más URLs según sea necesario
  ],

  // Estrategias de cache
  strategies: {
    // Cache First para recursos estáticos
    static: [
      '/static/',
      '/icons/',
      '.css',
      '.js',
      '.png',
      '.jpg',
      '.jpeg',
      '.gif',
      '.svg',
      '.woff',
      '.woff2',
      '.ttf',
      '.eot'
    ],

    // Network First para API calls
    api: [
      '/api/'
    ],

    // Stale While Revalidate para HTML
    html: [
      '/',
      '.html'
    ]
  },

  // Configuración de notificaciones
  notifications: {
    enabled: true,
    title: 'SpitIt',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png'
  },

  // Configuración de sincronización en segundo plano
  backgroundSync: {
    enabled: true,
    queueName: 'spitit-sync-queue'
  }
};

// Exportar para uso en el service worker
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SW_CONFIG;
} else if (typeof self !== 'undefined') {
  self.SW_CONFIG = SW_CONFIG;
}
