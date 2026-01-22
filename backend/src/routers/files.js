import { Router } from "express";
import fileController from "../controllers/files.js";
import validation from "../middleware/validation.js";
import { verifyToken } from "../middleware/checkToken.js";

const fileRouter = Router();

fileRouter
    .post("/files", verifyToken, validation.file, fileController.createFile)
    .get("/files/me", verifyToken, fileController.getAllFiles)
    .get("/files", fileController.getAll)
    .get("/files/chat", verifyToken, fileController.getChatMedia)
    .get("/files/download/:fileName", fileController.downloadFile)
    .get("/files/user/:userId", fileController.getFilesByUserId)
    .get("/avatar/:userId", fileController.getAvatar)
    .put("/files/:fileId", verifyToken, fileController.fileUpdate)
    .delete("/files/:fileId", verifyToken, fileController.deleteFile);

export default fileRouter;
