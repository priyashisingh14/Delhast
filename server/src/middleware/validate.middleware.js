/**
 * Middleware factory that validates request body against a Zod schema
 * @param {import('zod').ZodSchema} schema 
 */
const validateRequest = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      const formattedErrors = parsed.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: formattedErrors[0]?.message || 'Invalid input data',
        errors: formattedErrors
      });
    }

    req.validatedBody = parsed.data;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = validateRequest;
