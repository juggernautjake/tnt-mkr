export default ({ env }) => [
  'strapi::errors',
  {
    name: 'strapi::body',
    config: {
      includeUnparsed: true,
    },
  },
  {
    name: 'strapi::session',
    config:
      env('NODE_ENV') === 'production'
        ? {
            provider: 'redis',
            providerOptions: {
              url: env('REDIS_URL'),
              socket: {
                reconnectStrategy: (retries) => {
                  if (retries > 10) {
                    return new Error('Too many reconnection attempts');
                  }
                  return 1000; // Reconnect after 1 second
                },
              },
            },
            exclude: ['/api/webhook-events'],
          }
        : {},
  },
  'strapi::query',
  {
    name: 'strapi::logger',
    config: {
      level: env('NODE_ENV') === 'production' ? 'info' : 'debug',
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: env('CORS_ORIGINS')
        ? env('CORS_ORIGINS').split(',').map((o) => o.trim())
        : ['http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'X-Guest-Session', 'Stripe-Signature'],
      credentials: true,
    },
  },
  'strapi::security',
  'strapi::poweredBy',
  {
    name: 'strapi::compression',
  },
  'strapi::responses',
  'strapi::favicon',
  'strapi::public',
  {
    name: 'global::rateLimit',
    config: {
      maxRequests: 100,
      windowSeconds: 60,
    },
  },
];
