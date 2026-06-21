import express from "express"
import { verifyJWT } from "../middleware/auth.middleware.js";
import { getUsers, updateRole } from "../controllers/customer.controller.js";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

const customerRouter = express.Router();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Please try again later."
    },
});

const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 10,
    delayMs: (hits) => (hits - 3) * 500,
});

customerRouter.get("/customers/get-users", verifyJWT("admin", "demo", "super_admin"), getUsers);
customerRouter.post("/customers/update-role", speedLimiter, limiter, verifyJWT("super_admin"), updateRole);

export {customerRouter};