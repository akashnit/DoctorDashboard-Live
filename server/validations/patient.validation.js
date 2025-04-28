import Joi from "joi";

export const patientProfileSchema = Joi.object({
    name: Joi.string().min(3).max(50),
    age: Joi.number().min(1).max(120),
    problems: Joi.string(),
    city: Joi.string(),
});

export const patientProgramSchema = Joi.object({
    programName: Joi.string().required(),
    duration: Joi.string().valid("3 months", "6 months", "12 months").required(),
});

export const referralCodeSchema = Joi.object({
    referralCode: Joi.string().length(6).required(),
});

// Schema for creating a new patient from admin dashboard
export const patientValidationSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    age: Joi.number().integer().min(1).max(120).required(),
    problems: Joi.string().required(),
    city: Joi.string().required(),
    email: Joi.string().email().required(),
    medicalHistory: Joi.string().allow('', null),
    allergies: Joi.alternatives().try(
        Joi.array().items(Joi.string()),
        Joi.string()
    ).allow(null),
    emergencyContact: Joi.object({
        name: Joi.string().allow('', null),
        relationship: Joi.string().allow('', null),
        phone: Joi.string().allow('', null)
    }).allow(null),
    selectedProgram: Joi.object({
        program: Joi.string().allow('', null),
        membership: Joi.object({
            duration: Joi.string().valid("1 month", "3 months", "6 months").required(),
            price: Joi.number().required()
        }).required()
    }).allow(null),
    doctorId: Joi.string().allow('', null) // Optional field - doctor will be assigned separately
});

// Schema for assigning a patient to a doctor
export const patientDoctorAssignmentSchema = Joi.object({
    patientId: Joi.string().required().messages({
        'string.empty': 'Patient ID is required',
        'any.required': 'Patient ID is required'
    }),
    doctorId: Joi.string().required().messages({
        'string.empty': 'Doctor ID is required',
        'any.required': 'Doctor ID is required'
    }),
    programId: Joi.string().allow('', null),
    membership: Joi.object({
        duration: Joi.string().valid("1 month", "3 months", "6 months").required(),
        price: Joi.number().required()
    }).when('programId', {
        is: Joi.exist().not(null).not(''),
        then: Joi.required(),
        otherwise: Joi.optional()
    })
}); 