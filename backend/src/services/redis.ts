// src/services/redis.ts
import { createClient, RedisClientType } from 'redis';

export default (): RedisClientType => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const useTls = redisUrl.startsWith('rediss://') || process.env.REDIS_TLS === 'true';

  const client = createClient({
    url: redisUrl,
    socket: {
      ...(useTls && {
        tls: true,
        rejectUnauthorized: process.env.REDIS_TLS_REJECT_UNAUTHORIZED === 'true',
      }),
      keepAlive: 5000,
      reconnectStrategy: (retries) => {
        if (retries > 20) {
          strapi.log.error('Redis: too many reconnection attempts, giving up');
          return new Error('Too many reconnection attempts');
        }
        return Math.min(retries * 100, 3000);
      },
    },
  }) as RedisClientType;

  client.on('connect', () => {
    strapi.log.info('Redis connected successfully');
  });

  client.on('error', (err: Error) => {
    strapi.log.error('Redis client error:', err.message);
  });

  (async () => {
    try {
      await client.connect();
    } catch (err) {
      strapi.log.error('Failed to connect to Redis:', (err as Error).message);
    }
  })();

  return client;
};