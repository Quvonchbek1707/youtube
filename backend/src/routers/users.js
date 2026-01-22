import { Router } from "express";
import userController from "../controllers/users.js";
import validation from "../middleware/validation.js";

const userRouter = Router();

userRouter
    .post("/register", validation.register, userController.register)
    .post("/login", validation.login, userController.login)
    .post("/send", validation.email, userController.sendOTP)
    .get("/users", userController.getAllUsers)
    .get("/users/one", userController.getOneUser)


export default userRouter