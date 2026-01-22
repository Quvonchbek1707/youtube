import { config } from "dotenv";
import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import indexRouter from "./routers/index.js";
import errorLogger from "./utils/error.logger.js";
import { createServer } from "http";
import { Server } from "socket.io";
import JWT from "jsonwebtoken";
import userService from "./services/users.js";
import { join } from "path";

config();

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(fileUpload());
app.use(cors());

app.use("/uploads", express.static(join(process.cwd(), "src", "uploads")));

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use("/api", indexRouter.userRouter);
app.use("/api", indexRouter.fileRouter);
app.use("/api", indexRouter.messageRouter);

app.use(errorLogger);

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));
    try {
        const decoded = JWT.verify(token, process.env.SECRETKEY);
        socket.userId = decoded.id;
        next();
    } catch (err) {
        next(new Error("Authentication error"));
    }
});

io.on("connection", async (socket) => {
    const userRoom = `user_${socket.userId}`;
    socket.join(userRoom);

    await userService.updateSocketId(socket.userId, socket.id);

    io.emit("user_status", { userId: socket.userId, status: "online" });

    socket.on("disconnect", async () => {
        const room = io.sockets.adapter.rooms.get(userRoom);
        const numClients = room ? room.size : 0;

        if (numClients === 0) {
            io.emit("user_status", { userId: socket.userId, status: "offline" });
            await userService.updateSocketId(socket.userId, null);
        }
    });
});



const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
