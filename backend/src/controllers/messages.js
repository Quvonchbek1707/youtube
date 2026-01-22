import messageService from "../services/messages.js";
import userService from "../services/users.js";
import { extractTokenFromRequest, getUserIdFromToken } from "../middleware/checkToken.js";

class MessageController {
    async sendMessage(req, res, next) {
        try {
            const senderId = getUserIdFromToken(extractTokenFromRequest(req));
            const { content, type, receiverId } = req.body;

            const data = await messageService.sendMessage({
                content,
                type,
                senderId,
                receiverId,
            });

            const message = data.data;

            if (req.io) {
                const receiverSocketId = await userService.getSocketId(receiverId);
                const senderSocketId = await userService.getSocketId(senderId);

                const payload = {
                    text: message.content,
                    sender_id: message.sender_id,
                    receiver_id: message.receiver_id,
                    created_at: message.created_at,
                    type: message.type
                };

                if (receiverSocketId) {
                    req.io.to(receiverSocketId).emit("receive_message", payload);
                }

                if (senderSocketId) {
                    req.io.to(senderSocketId).emit("receive_message", payload);
                }
            }

            return res.status(data.status).json(data);
        } catch (error) {
            next(error);
        }
    }

    async getChatMessages(req, res, next) {
        try {
            const userId = getUserIdFromToken(extractTokenFromRequest(req));
            const { chatWithId } = req.params;

            const data = await messageService.getChatMessages({ userId, chatWithId });

            return res.status(data.status).json(data);
        } catch (error) {
            next(error);
        }
    }

    async getChatMedia(req, res, next) {
        try {
            const userId = getUserIdFromToken(extractTokenFromRequest(req));
            const { chatWithId } = req.params;

            const data = await messageService.getChatMedia({ userId, chatWithId });

            return res.status(data.status).json(data);
        } catch (error) {
            next(error);
        }
    }
}

export default new MessageController();
