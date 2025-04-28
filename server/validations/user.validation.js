import Joi from "joi";

export const registerSchema = Joi.object({
    name: Joi.string().required().min(3).max(50),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6),
    role: Joi.string().valid("admin", "doctor", "patient").required(),
    // Additional fields based on role
    domain: Joi.when("role", {
        is: "doctor",
        then: Joi.string().required(),
        otherwise: Joi.forbidden(),
    }),
    yearsOfExperience: Joi.when("role", {
        is: "doctor",
        then: Joi.number().min(0).required(),
        otherwise: Joi.forbidden(),
    }),
    problems: Joi.when("role", {
        is: "patient",
        then: Joi.string().required(),
        otherwise: Joi.forbidden(),
    }),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const updateProfileSchema = Joi.object({
    name: Joi.string().min(3).max(50),
    email: Joi.string().email(),
    currentPassword: Joi.string().min(6),
    newPassword: Joi.string().min(6),
}); 