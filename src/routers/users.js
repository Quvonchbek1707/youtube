import { Router } from "express";
import userController from "../controllers/users.js";
import validation from "../middleware/validation.js";

const router  = Router();

router
    .post("/api/register",validation.register, userController.register)
    .post("/api/login",validation.login, userController.login)
    .get("/api/users", userController.getAllUsers)
    .get("/api/users/:id", userController.getOneUser)

export default router