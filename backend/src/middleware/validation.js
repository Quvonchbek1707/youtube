import validations from "../utils/validation.js";

class UserMiddleware {
    register = (req, res, next) => {
        const { error } = validations.register.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 400,
                message: error.details[0].message,
            });
        }
        next();
    };

    login = (req, res, next) => {
        const { error } = validations.login.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 400,
                message: error.details[0].message,
            });
        }
        next();
    };

    email = (req, res, next) => {
        const { error } = validations.email.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 400,
                message: error.details[0].message,
            });
        }
        next();
    };

    file = (req, res, next) => {
        if (!req.files || !req.files.file) {
            return res.status(400).json({
                status: 400,
                message: "File is required",
            });
        }
        next();
    };
}

export default new UserMiddleware();
