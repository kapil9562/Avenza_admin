import express from "express"
import { emailLogin } from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/auth/email-login", emailLogin);

export {authRouter};