import rateLimit from 'express-rate-limit';

/**
 * General limiter for AI generation endpoints
 * Limits each IP to 10 requests per minute
 */
export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again after a minute',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Limiter for embedding endpoints (usually more frequent but lighter)
 * Limits each IP to 30 requests per minute
 */
export const embeddingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: {
    error: 'Too many embedding requests, please wait a moment',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
