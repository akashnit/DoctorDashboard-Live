import Joi from "joi";

export const programValidationSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    memberships: Joi.array().items(
        Joi.object({
            duration: Joi.string().required(),
            price: Joi.number().required()
        })
    ).required()
});