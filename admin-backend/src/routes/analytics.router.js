import express from "express"
import { verifyJWT } from "../middleware/auth.middleware.js";
import { getAnalytics } from "../controllers/analytics.controller.js";

const analyticsRouter = express.Router();

analyticsRouter.get("/get-analytics", verifyJWT("admin", "super_admin", "demo"), getAnalytics);

export { analyticsRouter };