import { ZodError } from 'zod';

export const validate = (schema) => async (req, res, next) => {
  try {
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

    next();
  } catch (error) {
    // If it's not a Zod validation error, pass it to your global error handler
    if (!(error instanceof ZodError)) {
      return next(error);
    }

    const errorMessages = error.issues.map((e) => e.message);

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages,
    });
  }
};
