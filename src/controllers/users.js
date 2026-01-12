import userServices from "../services/users.js"

class UserController{

    async register(req, res, next){
        try{
            const data =  await userServices.register(req.body)
            if(data){
                return res.status(data.status).json(data);
            }
        }catch (error){
            next(error)
        }
    }

    async login(req, res, next){
        try{
            const data =  await userServices.login(req.body)
            if(data){
                return res.status(data.status).json(data);
            }
        }catch (error){
            next(error)
        }
    }

    async getAllUsers(req, res, next){
        try {
            const data = await userServices.getAllUsers()
            if(data){
                return res.status(200).json(data)
            }
        } catch (error) {
            next(error)
        }
    }

    async getOneUser(req, res, next){
        try {
            const data = await userServices.getOneUser(req.params.id)
            if(data){
                return res.status(200).json(data)
            }
        } catch (error) {
            next(error)
        }
    }
}

export default new UserController()