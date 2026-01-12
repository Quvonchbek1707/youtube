import validations  from "../utils/validation.js";

class UserMiddleware {
    register = (req, res, next) => {
        try {
            const { error } = validations.registerSchema.validate(req.body);
            if (error){
                console.log('Validation error:', error.details[0].message);
                return res.status(400).json({
                    status: 400,
                    message:"Bad request"
                });
            }
            next();
        }catch (error) {
            next(error)
        }
    }
    login = (req, res, next) => {
        try {
            const { error } = validations.loginSchema.validate(req.body);
            if (error){
                console.log('Validation error:', error.details[0].message);
                return res.status(400).json({
                    status: 400,
                    message:"Bad request"
                });
            }
            next();
        }catch (error) {
            next(error)
        }
    }
}

export default new UserMiddleware()


