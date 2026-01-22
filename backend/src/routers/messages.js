import { Router } from "express";
import messageController from "../controllers/messages.js";
import { verifyToken } from "../middleware/checkToken.js";

const messageRouter = Router();

messageRouter.post("/messages/send", verifyToken, messageController.sendMessage);

messageRouter.get("/messages/chat/:chatWithId", verifyToken, messageController.getChatMessages);

messageRouter.get("/messages/chat/:chatWithId/media", verifyToken, messageController.getChatMedia);

export default messageRouter;
