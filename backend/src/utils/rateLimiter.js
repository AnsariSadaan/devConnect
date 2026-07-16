import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// ✅ SINGLE SOURCE OF TRUTH: Use this config for ALL limiters
const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    standardHeaders: true,
    legacyHeaders: false,
    // ✅ FIXED: Use ipKeyGenerator correctly
    keyGenerator: (req) => {
      const userId = req.user?._id || 'anonymous';
      // ✅ Always use ipKeyGenerator for IPv6 support
      const ip = ipKeyGenerator(req.ip);
      const key = `${userId}:${ip}`;
      
      // ✅ ADD DEBUG LOGGING
      console.log(`🔑 Rate limit key generated: ${key}`);
      console.log(`📡 Request IP: ${req.ip}`);
      
      return key;
    },
    // ✅ ADD HANDLER to see when limit is reached
    handler: (req, res, next, options) => {
      console.log(`🚨 Rate limit EXCEEDED for ${req.ip}`);
      res.status(options.statusCode).json(options.message);
    },
    ...options
  });
};

// Now create all limiters using the SAME function
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  // skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

export const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  }
});

export const sensitiveLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message: 'Too many attempts. Please try again after an hour.'
  }
});

export const otpLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1,
  message: {
    success: false,
    message: 'Please wait 5 minutes before requesting another OTP.'
  }
});

console.log('✅ Rate limiters initialized successfully');