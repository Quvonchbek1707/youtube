import fileServices from "../services/files.js";
import path from "path";
import fs from "fs";
import { NotFoundError } from "../utils/errors.js";

class FileController {
    async createFile(req, res, next) {
        try {
            const userId = req.userId;
            const data = await fileServices.createFile(req, userId, next);
            return res.status(data.status).json({ status: data.status, data: data.file });
        } catch (error) {
            next(error);
        }
    }

    async getAllFiles(req, res, next) {
        try {
            const userId = req.userId;
            const files = await fileServices.getAllFiles(userId);
            return res.status(200).json({ status: 200, data: files });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const { search } = req.query;
            const files = await fileServices.getAll(search);
            return res.status(200).json({ status: 200, data: files });
        } catch (error) {
            next(error);
        }
    }

    async getChatMedia(req, res, next) {
        try {
            const userId = req.userId;
            const { fileName, chatWith } = req.query;
            const files = await fileServices.getChatFiles(fileName, userId, chatWith);
            return res.status(200).json({ status: 200, data: files });
        } catch (error) {
            next(error);
        }
    }

    async downloadFile(req, res, next) {
        try {
            const userId = req.userId;
            const { fileName } = req.params;

            const access = await fileServices.checkFileAccess(fileName, userId);
            if (!access) {
                return res.status(403).json({ status: 403, data: { message: "Access denied" } });
            }

            const filePath = path.join(process.cwd(), "src/uploads/videos", fileName);

            if (!fs.existsSync(filePath)) {
                throw new NotFoundError(404, "File not found");
            }

            res.download(filePath, fileName);

        } catch (error) {
            next(error);
        }
    }

    async fileUpdate(req, res, next) {
        try {
            const userId = req.userId;
            const result = await fileServices.fileUpdate(req, userId, next);
            return res.status(result.status).json({ status: result.status, data: { message: result.message } });
        } catch (error) {
            next(error);
        }
    }

    async deleteFile(req, res, next) {
        try {
            const userId = req.userId;
            const result = await fileServices.deleteFile(req, userId, next);
            return res.status(result.status).json({ status: result.status, data: { message: result.message } });
        } catch (error) {
            next(error);
        }
    }

    async getFilesByUserId(req, res, next) {
        try {
            const { userId } = req.params;
            const files = await fileServices.getAllFiles(userId);
            return res.status(200).json({ status: 200, data: files });
        } catch (error) {
            next(error);
        }
    }

    async getAvatar(req, res, next) {
        try {
            const { userId } = req.params;
            const avatar = await fileServices.getUserAvatar(userId);

            const fileName = avatar || "avatar.jpg";
            const filePath = path.join(process.cwd(), "src/uploads/pictures", fileName);

            if (!fs.existsSync(filePath)) {
                throw new NotFoundError(404, "Avatar file not found");
            }

            res.sendFile(filePath);
        } catch (error) {
            next(error);
        }
    }
}

export default new FileController();
