import pool from "../database/config.js";
import { NotFoundError } from "../utils/errors.js";

class FileService {
    async getAllFiles(userId) {
        const files = await pool.query(`
            SELECT files.id, files.title, files.size, files.created_at, files.file_name, 
                   json_build_object('id', users.id, 'username', users.username) AS user
            FROM files
            INNER JOIN users ON users.id = files.user_id
            WHERE files.user_id = $1
            ORDER BY files.created_at DESC
        `, [userId]);

        return files.rows;
    }

    async getAll(search) {
        let query = `
            SELECT files.id, files.title, files.size, files.created_at, files.file_name,
                    json_build_object('id', users.id, 'username', users.username) AS user
            FROM files
            INNER JOIN users ON users.id = files.user_id
        `;
        const params = [];

        if (search) {
            query += ` WHERE files.title ILIKE $1`;
            params.push(`%${search}%`);
        }

        query += ` ORDER BY files.created_at DESC`;

        const files = await pool.query(query, params);
        return files.rows;
    }

    async getChatFiles(fileName, userId) {
        let query = `
            SELECT content 
            FROM messages
            WHERE (sender_id = $1 OR receiver_id = $1)
              AND type = 'media'
        `;
        const params = [userId];

        if (fileName) {
            query += ` AND content ILIKE $2`;
            params.push(`%${fileName}%`);
        }

        query += ` ORDER BY created_at DESC`;

        const files = await pool.query(query, params);
        return files.rows;
    }

    async createFile(req, userId, next) {
        try {
            const { title } = req.body;
            const { file } = req.files;

            const existUser = await pool.query(
                "SELECT * FROM users WHERE id = $1",
                [userId]
            );
            if (!existUser.rowCount) {
                throw new NotFoundError(404, "User not found");
            }

            const fileName = `${Date.now()}-${file.name}`;
            const uploadPath = `./src/uploads/videos/${fileName}`;

            await file.mv(uploadPath);

            const sizeMB = Math.ceil(file.size / 1024 / 1024);

            const result = await pool.query(
                `INSERT INTO files(title, user_id, file_name, size, created_at)
                 VALUES($1, $2, $3, $4, NOW()) RETURNING *`,
                [title, userId, fileName, sizeMB]
            );

            return {
                status: 201,
                message: "File created successfully",
                file: result.rows[0]
            };

        } catch (error) {
            next(error);
        }
    }

    async fileUpdate(req, userId, next) {
        try {
            const { fileId } = req.params;
            const { title } = req.body;

            const existFile = await pool.query(
                `SELECT * FROM files WHERE id = $1 AND user_id = $2`,
                [fileId, userId]
            );
            if (!existFile.rowCount) {
                throw new NotFoundError(404, "File of this user not found");
            }

            await pool.query(`UPDATE files SET title = $1 WHERE id = $2`, [title, fileId]);

            return {
                status: 200,
                message: "File updated successfully"
            };

        } catch (error) {
            next(error);
        }
    }

    async deleteFile(req, userId, next) {
        try {
            const { fileId } = req.params;

            const existFile = await pool.query(
                `SELECT * FROM files WHERE id = $1 AND user_id = $2`,
                [fileId, userId]
            );
            if (!existFile.rowCount) {
                throw new NotFoundError(404, "File not found");
            }

            await pool.query(`DELETE FROM files WHERE id = $1`, [fileId]);

            return {
                status: 200,
                message: "File deleted successfully"
            };

        } catch (error) {
            next(error);
        }
    }

    async getUserAvatar(userId) {
        const result = await pool.query(
            "SELECT avatar FROM users WHERE id = $1",
            [userId]
        );

        if (!result.rowCount || !result.rows[0].avatar) {
            return null;
        }

        return result.rows[0].avatar;
    }
}

export default new FileService();
