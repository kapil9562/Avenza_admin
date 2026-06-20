import express from "express"
import { emailLogin, getCurrentUser, logout, refreshAccessToken } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import rateLimit from "express-rate-limit"
import slowDown from "express-slow-down";

const authRouter = express.Router();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Please try again later."
    },
});

const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 2,
    delayMs: (hits) => (hits - 3) * 1000,
});

authRouter.post("/auth/email-login", speedLimiter, limiter, emailLogin);
authRouter.post('/auth/logout', verifyJWT("admin", "demo"), logout);
authRouter.post('/auth/refresh', refreshAccessToken);
authRouter.get('/auth/get-current-user', verifyJWT("admin", "demo"), getCurrentUser);

export { authRouter };