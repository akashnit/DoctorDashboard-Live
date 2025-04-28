import Joi from "joi";

// Validation schema for updating doctor profile
export const doctorProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  domain: Joi.string().min(2).max(100).optional(),
  city: Joi.string().min(2).max(50).optional(),
  hospital: Joi.string().min(2).max(100).optional(),
});

// Validation schema for updating patient status
export const updatePatientStatusSchema = Joi.object({
  status: Joi.string().valid("active", "inactive", "pending", "completed").required(),
  notes: Joi.string().max(500).allow("").optional(),
}); 