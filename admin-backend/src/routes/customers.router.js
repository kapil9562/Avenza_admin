import express from "express"
import { verifyJWT } from "../middleware/auth.middleware.js";
import { getUsers } from "../controllers/customer.controller.js";

const customerRouter = express.Router();

customerRouter.get("/customers/get-users", verifyJWT, getUsers)

export {customerRouter};