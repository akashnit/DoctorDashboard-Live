import { ApiError } from "../utils/ApiError.js";

/**
 * Middleware to validate request data against a Joi schema
 * @param {Object} schema - Joi schema to validate against
 * @returns {Function} Express middleware function
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Validate request body against schema
      const { error, value } = schema.validate(req.body, {
        abortEarly: false, // Return all errors, not just the first one
        stripUnknown: true, // Remove unknown keys
      });
      
      if (error) {
        // Format validation errors
        const errorMessage = error.details
          .map((detail) => detail.message)
          .join(", ");
        
        throw new ApiError(400, `Validation error: ${errorMessage}`);
      }
      
      // Replace req.body with validated value
      req.body = value;
      next();
    } catch (err) {
      next(err);
    }
  };
}; 