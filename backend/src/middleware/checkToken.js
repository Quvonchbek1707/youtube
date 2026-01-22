import JWT from "jsonwebtoken";
import { UnauthorizedError } from "../utils/errors.js";

export const extractTokenFromRequest = (req) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.slice(7);
    }
    if (req.headers.token) return req.headers.token;

    throw new UnauthorizedError(401, "Token not provided");
};

export const getUserIdFromToken = (token) => {
    try {
        if (!token) throw new UnauthorizedError(401, "Token not provided");
        const decoded = JWT.verify(token, process.env.SECRETKEY);
        return decoded.id;
    } catch (error) {
        throw new UnauthorizedError(401, "Invalid or expired token");
    }
};

export const decodeToken = (token) => {
    try {
        if (!token) throw new UnauthorizedError(401, "Token not provided");
        return JWT.verify(token, process.env.SECRETKEY);
    } catch (error) {
        throw new UnauthorizedError(401, "Invalid or expired token");
    }
};

export const verifyToken = (req, res, next) => {
    try {
        const token = extractTokenFromRequest(req);
        const decoded = decodeToken(token);
        req.userId = decoded.id;
        next();
    } catch (error) {
        next(error);
    }
};

export default { getUserIdFromToken, decodeToken, extractTokenFromRequest, verifyToken };
