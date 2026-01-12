import pool from "../database/config.js"
import bcrypt from "bcrypt"
import JWT from "jsonwebtoken"

class UserServices{
    async register(payload){
        const {username, email, password} = payload
        const existUser = await pool.query("select * from users where username = $1 or email = $2", [username, email]);
        if(existUser.rows.length){
            return {
                status: 409,
                message: "User already exists"
            }
        }
        const passHash= await bcrypt.hash(password, 10)
        let newUser = await pool.query("insert into users(username, email, password) values($1, $2, $3) returning *", 
            [username, email, passHash]
        )
        let id = newUser.rows[0].id
        return {
            status: 201,
            success: true,
            message: "user registered",
            accessToken: JWT.sign({id, username}, process.env.SECRETKEY)
        }
    }

    async login(payload){
        const  {username, password} = payload
        let existUser = await pool.query("select * from users where username = $1", [username]);
        if(!existUser.rows.length){
            return{
                status: 404,
                message:"Username or Password is wrong"
            }
        }
        if(!await bcrypt.compare(password,existUser.rows[0].password)){
            return {
                status: 404,
                message: "Username or password wrong"
            }
        }
        return {
            status:200,
            success: true,
            message:"User successfully logged in",
            accessToken: JWT.sign({id: existUser.rows[0].id, username: existUser.rows[0].username}, process.env.SECRETKEY)
        }
    }

    async getAllUsers(){
        const users = await pool.query("select id, username from users")
        return users.rows
    }

    async getOneUser(id){
        const user = await pool.query("select id, username from users where id = $1", [id])
        return user.rows[0]
    }
}
export default new UserServices();