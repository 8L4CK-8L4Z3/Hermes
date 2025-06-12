import redis from "../Configs/redis.js";
import logger from "../Utils/logger.js";

const NAMESPACE = "Cache Middleware";

redis.on("error", (err) => {
  logger.logError(NAMESPACE, "Redis Client Error", err);
});

// Default cache duration - 1 hour
const DEFAULT_EXPIRATION = 3600;

/**
 * Parse duration string into seconds
 * @param {string|number} duration - Duration string (e.g., '5m', '1h') or number of seconds
 * @returns {number} Duration in seconds
 */
const parseDuration = (duration) => {
  if (typeof duration === "number") return duration;

  const match = duration.toString().match(/^(\d+)(s|m|h|d)$/);
  if (!match) return NaN;

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 3600;
    case "d":
      return value * 86400;
    default:
      return NaN;
  }
};

/**
 * Cache middleware factory
 * @param {string|number} duration - Cache duration (e.g., '5m', '1h') or seconds
 * @param {function} keyGenerator - Optional function to generate cache key
 */
export const cache = (duration = DEFAULT_EXPIRATION, keyGenerator) => {
  // Parse and validate duration
  let cacheDuration = parseDuration(duration);
  if (isNaN(cacheDuration) || cacheDuration <= 0) {
    logger.logWarn(
      NAMESPACE,
      `Invalid cache duration provided: ${duration}, using default: ${DEFAULT_EXPIRATION}`
    );
    cacheDuration = DEFAULT_EXPIRATION;
  }

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
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          logger.logDebug(
            NAMESPACE,
            `Attempting to cache with duration: ${cacheDuration} (type: ${typeof cacheDuration})`
          );
          // Store the response in cache
          redis
            .setex(key, cacheDuration, JSON.stringify(body))
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
        }

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

// ... existing code ...
