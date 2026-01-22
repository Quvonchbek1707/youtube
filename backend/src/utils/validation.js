import Joi from "joi";

class Validations {
    register = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string().email().required(),
        otp: Joi.string().length(6).required(),
        password: Joi.string().pattern(/^[a-zA-Z0-9]{6,20}$/).required(),
    });

    login = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        password: Joi.string().pattern(/^[a-zA-Z0-9]{6,20}$/).required(),
    });

    file = Joi.object({
        title: Joi.string().min(3).max(30).required(),
    });

    email = Joi.object({
        email: Joi.string().email().required(),
    });
}

export default new Validations();
