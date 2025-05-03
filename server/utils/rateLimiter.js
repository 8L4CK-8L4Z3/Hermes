import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10000, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: process.env.RATE_LIMIT_MESSAGE || 'Too many requests from this IP, please try again later.',
  skipSuccessfulRequests: false, // Count successful requests against the rate limit
  // Skip rate limiting for admin routes with valid admin key
  skip: (req) => {
    return req.path.startsWith('/admin') && req.headers['admin-key'] === process.env.ADMIN_KEY;
  }
});

export default rateLimiter; 