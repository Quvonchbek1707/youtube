import pool from "../database/config.js";
import { extname, join } from "path";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import JWT from "jsonwebtoken";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/errors.js";
import nodemailer from "nodemailer";
import { config } from "dotenv";
import fs from "fs";

config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 5000,
    socketTimeout: 5000,
});

class UserServices {
    async register(req) {
        const { username, password, email } = req.body;

        if (!req.files || !req.files.avatar) {
            throw new BadRequestError(400, "Avatar file is required");
        }

        const { avatar } = req.files;
        const ext = extname(avatar.name).toLowerCase();
        const allowedExt = [".png", ".jpg", ".jpeg", ".svg"];
        if (!allowedExt.includes(ext)) {
            throw new BadRequestError(400, "Invalid file format");
        }

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE username = $1 OR email = $2",
            [username, email]
        );
        if (existingUser.rowCount) {
            throw new ConflictError(409, "User already exists");
        }

        const fileName = Date.now() + ext;
        const uploadPath = join(process.cwd(), "src", "uploads", "pictures", fileName);
        await avatar.mv(uploadPath);

        const passHash = await hashPassword(password);
        const newUser = await pool.query(
            "INSERT INTO users(username, email, password, avatar) VALUES($1, $2, $3, $4) RETURNING *",
            [username, email, passHash, fileName]
        );

        const id = newUser.rows[0].id;
        return {
            status: 201,
            data: {
                message: "User registered successfully",
                accessToken: JWT.sign({ id, username }, process.env.SECRETKEY, { expiresIn: "1h" }),
            },
        };
    }

    async sendOTP(email) {
        if (!email) throw new BadRequestError(400, "Email required");

        const otp_code = Math.floor(100000 + Math.random() * 900000);

        try {
            await transporter.sendMail({
                from: `"YouTube" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Email Verification",
                html: `<h2>${otp_code}</h2>`,
            });

            const otpData = {
                email,
                otp_code,
                expiresAt: Date.now() + 300_000,
            };
            const filePath = join(process.cwd(), "src", "database", "otp.json");
            let otps = [];
            try {
                const content = fs.readFileSync(filePath, "utf-8");
                otps = content ? JSON.parse(content) : [];
            } catch (err) {
                otps = [];
            }
            otps.push(otpData);
            fs.writeFileSync(filePath, JSON.stringify(otps, null, 2));

            return { status: 200, data: { message: `Verification code sent to ${email}` } };
        } catch (err) {
            throw new BadRequestError(400, err.message);
        }
    }

    async login({ username, password }) {
        const userQuery = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (!userQuery.rowCount) {
            return { status: 404, data: { message: "Username or password is wrong" } };
        }

        const user = userQuery.rows[0];
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return { status: 404, data: { message: "Username or password is wrong" } };
        }

        return {
            status: 200,
            data: {
                message: "User successfully logged in",
                accessToken: JWT.sign({ id: user.id, username: user.username }, process.env.SECRETKEY, { expiresIn: "24h" }),
            },
        };
    }

    async getAllUsers() {
        const users = await pool.query("SELECT id, username, avatar, socket_id FROM users");
        return { status: 200, data: users.rows };
    }

    async getOneUser(id) {
        const user = await pool.query("SELECT id, username, avatar FROM users WHERE id = $1", [id]);
        if (!user.rowCount) throw new NotFoundError(404, "User not found");
        return { status: 200, data: user.rows[0] };
    }

    async updateSocketId(userId, socketId) {
        await pool.query("UPDATE users SET socket_id = $1 WHERE id = $2", [socketId, userId]);
    }

    async getSocketId(userId) {
        const result = await pool.query("SELECT socket_id FROM users WHERE id = $1", [userId]);
        return result.rows[0]?.socket_id;
    }
}

export default new UserServices();
