import rateLimit from 'express-rate-limit';

const isDevelopment = process.env.NODE_ENV === 'development';

// Rate limiter
export const authLimiter = isDevelopment
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: 'Too many auth attempts — please try again in 15 minutes.',
        data: null,
      },
    });
