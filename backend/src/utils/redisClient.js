const Redis = require('ioredis');
let redis = null;

function createRedis(url) {
  if (!url) return null;
  redis = new Redis(url);
  redis.on('error', (e) => console.error('Redis error', e));
  redis.on('connect', () => console.log('Redis connected'));
  return redis;
}

module.exports = { createRedis, getRedis: () => redis };
