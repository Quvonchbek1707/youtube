import userServices from "../services/users.js";

class UserController {

    async register(req, res, next) {
        try {
            const data = await userServices.register(req);
            return res.status(data.status).json(data);
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const data = await userServices.login(req.body);
            return res.status(data.status).json(data);
        } catch (error) {
            next(error);
        }
    }

    async sendOTP(req, res, next) {
        try {
            const data = await userServices.sendOTP(req.body.email);
            return res.status(data.status).json(data);
        } catch (error) {
            next(error);
        }
    }

    async getAllUsers(req, res, next) {
        try {
            const data = await userServices.getAllUsers();
            return res.status(data.status).json(data);
        } catch (error) {
            next(error);
        }
    }

    async getOneUser(req, res, next) {
        try {
            const data = await userServices.getOneUser(req.params.id);
            return res.status(data.status).json(data);
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();
