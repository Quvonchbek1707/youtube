import Joi from "joi"
class Validations {
    registerSchema = Joi.object({
        username: Joi.string().alphanum().required(),
        email: Joi.string().email().required(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,20}$')).required()
    });
    loginSchema = Joi.object({
        username: Joi.string().alphanum().required(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,20}$')).required()
    });
}

export default new Validations()