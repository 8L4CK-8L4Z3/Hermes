import redis from "../Configs/redis.js";
import logger from "../Utils/logger.js";

const NAMESPACE = "Cache Middleware";

redis.on("error", (err) => {
  logger.logError(NAMESPACE, "Redis Client Error", err);
});

// Default cache duration - 1 hour
const DEFAULT_EXPIRATION = 3600;

/**
 * Cache middleware factory
 * @param {number} duration - Cache duration in seconds
 * @param {function} keyGenerator - Optional function to generate cache key
 */
export const cache = (duration = DEFAULT_EXPIRATION, keyGenerator) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== "GET") {
      return next();
    }

    try {
      // Generate cache key
      const key = keyGenerator
        ? keyGenerator(req)
        : `${req.originalUrl || req.url}`;

      logger.logDebug(
        NAMESPACE,
        `Attempting to retrieve cache for key: ${key}`
      );

      // Try to get cached response
      const cachedResponse = await redis.get(key);

      if (cachedResponse) {
        logger.logInfo(NAMESPACE, `Cache hit for key: ${key}`);
        return res.json(JSON.parse(cachedResponse));
      }

      logger.logDebug(NAMESPACE, `Cache miss for key: ${key}`);

      // Store original send
      const originalSend = res.json;

      // Override res.json method
      res.json = function (body) {
        // Store the response in cache
        redis
          .setex(key, duration, JSON.stringify(body))
          .then(() => {
            logger.logDebug(
              NAMESPACE,
              `Successfully cached response for key: ${key}`
            );
          })
          .catch((err) => {
            logger.logError(
              NAMESPACE,
              `Failed to cache response for key: ${key}`,
              err
            );
          });

        // Call original send
        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      logger.logError(NAMESPACE, "Cache middleware execution error", error);
      next();
    }
  };
};

/**
 * Clear cache by pattern
 * @param {string} pattern - Pattern to match cache keys
 */
export const clearCache = async (pattern) => {
  try {
    logger.logDebug(
      NAMESPACE,
      `Attempting to clear cache with pattern: ${pattern}`
    );
    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      await redis.del(keys);
      logger.logInfo(
        NAMESPACE,
        `Successfully cleared ${keys.length} cache entries with pattern: ${pattern}`
      );
    } else {
      logger.logDebug(
        NAMESPACE,
        `No cache entries found for pattern: ${pattern}`
      );
    }
  } catch (error) {
    logger.logError(
      NAMESPACE,
      `Failed to clear cache with pattern: ${pattern}`,
      error
    );
  }
};

// Common cache durations
export const CACHE_DURATIONS = {
  MINUTE_5: 300,
  MINUTE_15: 900,
  HOUR_1: 3600,
  HOUR_6: 21600,
  DAY_1: 86400,
};
