import express from "express"
import { getOrders } from "../controllers/order.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const orderRouter = express.Router();

orderRouter.get("/get-orders", verifyJWT, getOrders);

export {orderRouter};