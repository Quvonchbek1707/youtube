import pool from "../database/config.js";

class MessageService {
    async sendMessage({ content, type, senderId, receiverId }) {
        const result = await pool.query(
            `INSERT INTO messages(content, type, sender_id, receiver_id, created_at)
             VALUES ($1, $2, $3, $4, NOW())
             RETURNING *`,
            [content, type, senderId, receiverId]
        );

        return {
            status: 201,
            data: result.rows[0],
        };
    }

    async getChatMessages({ userId, chatWithId }) {
        const result = await pool.query(
            `SELECT id, content, type, sender_id, receiver_id, created_at
             FROM messages
             WHERE (sender_id = $1 AND receiver_id = $2)
                OR (sender_id = $2 AND receiver_id = $1)
             ORDER BY created_at ASC`,
            [userId, chatWithId]
        );

        return {
            status: 200,
            data: result.rows,
        };
    }

    async getChatMedia({ userId, chatWithId }) {
        const result = await pool.query(
            `SELECT id, content, type, sender_id, receiver_id, created_at
             FROM messages
             WHERE ((sender_id = $1 AND receiver_id = $2)
                    OR (sender_id = $2 AND receiver_id = $1))
               AND type = 'media'
             ORDER BY created_at ASC`,
            [userId, chatWithId]
        );

        return {
            status: 200,
            data: result.rows,
        };
    }
}

export default new MessageService();
