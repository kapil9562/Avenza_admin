import express from "express"
import { deleteOrder, getOrders, getRecentOrders, updateOrder } from "../controllers/order.controller.js";
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

// { Get Orders }
orderRouter.get("/get-orders", verifyJWT("admin", "demo", "super_admin"), getOrders);

// { Get Recent Orders }
orderRouter.get("/get-recent-order", verifyJWT("admin", "demo", "super_admin"), getRecentOrders);

// { Update Orders }
orderRouter.patch("/update-order/status/:orderId", speedLimiter, limiter, verifyJWT("admin", "super_admin"), updateOrder);

// { Delete Orders }
orderRouter.delete("/delete-order/:orderId", speedLimiter, limiter, verifyJWT("super_admin"), deleteOrder);

export { orderRouter };