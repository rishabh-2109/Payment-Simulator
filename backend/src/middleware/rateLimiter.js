const { getRedis } = require('../utils/redisClient');

const WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_SEC || '60', 10); 
const LIMIT = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);

function inMemoryStore() {
  const map = new Map();
  return {
    incr(key) {
      const now = Date.now();
      const entry = map.get(key) || { count: 0, start: now };
    
      if (now - entry.start > WINDOW * 1000) {
        entry.count = 1;
        entry.start = now;
      } else {
        entry.count++;
      }
      map.set(key, entry);
      return entry.count;
    },
    ttlRemaining(key) {
      const entry = map.get(key);
      if (!entry) return WINDOW;
      return Math.max(0, WINDOW - Math.floor((Date.now() - entry.start) / 1000));
    }
  };
}

const memStore = inMemoryStore();

async function rateLimiter(req, res, next) {
  const redis = getRedis();
 
  const apiKey = req.header('x-api-key');
  const ident = apiKey || req.ip;

  try {
    if (redis) {
   
      const key = `rate:${ident}`;
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, WINDOW);
      }
      const ttl = await redis.ttl(key);
      if (count > LIMIT) {
        return res.status(429).json({ error: 'Too many requests', retryAfter: ttl });
      }
      res.set('X-RateLimit-Limit', LIMIT);
      res.set('X-RateLimit-Remaining', Math.max(0, LIMIT - count));
      res.set('X-RateLimit-Reset', ttl);
      return next();
    } else {
      const count = memStore.incr(ident);
      const ttl = memStore.ttlRemaining(ident);
      if (count > LIMIT) {
        return res.status(429).json({ error: 'Too many requests (in-memory)', retryAfter: ttl });
      }
      res.set('X-RateLimit-Limit', LIMIT);
      res.set('X-RateLimit-Remaining', Math.max(0, LIMIT - count));
      res.set('X-RateLimit-Reset', ttl);
      return next();
    }
  } catch (e) {
    console.error('Rate limiter error', e);
    next(); 
  }
}

module.exports = rateLimiter;
