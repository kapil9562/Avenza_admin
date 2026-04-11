import express from "express"
import { emailLogin, getCurrentUser, logout, refreshAccessToken } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/auth/email-login", emailLogin);
authRouter.post('/auth/logout', verifyJWT, logout);
authRouter.post('/auth/refresh', refreshAccessToken);
authRouter.get('/auth/get-current-user', verifyJWT, getCurrentUser);

export {authRouter};