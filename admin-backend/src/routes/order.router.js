import express from "express"
import { deleteOrder, getOrders, updateOrder } from "../controllers/order.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import rateLimit from "express-rate-limit"
import slowDown from "express-slow-down";

const orderRouter = express.Router();

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

orderRouter.get("/get-orders", verifyJWT("admin", "demo"), getOrders);
orderRouter.patch("/update-order/status/:orderId", speedLimiter, limiter, verifyJWT("admin"), updateOrder);
orderRouter.delete("/delete-order/:orderId", speedLimiter, limiter, verifyJWT("admin"), deleteOrder);

export {orderRouter};