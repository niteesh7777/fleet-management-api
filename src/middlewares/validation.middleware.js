export const validate = (schema) => {
  return (req, res, next) => {
    console.log('[VALIDATION] Request body:', JSON.stringify(req.body, null, 2));
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

    if (error) {
      const details = error.details.map((d) => d.message);
      console.log('[VALIDATION] Validation failed:', details);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: details,
      });
    }

    console.log('[VALIDATION] Validation passed, sanitized body:', JSON.stringify(value, null, 2));
    req.body = value;
    next();
  };
};
