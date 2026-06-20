import jwt from "jsonwebtoken";

import User from "../models/user.model.js"

export const verifyJWT = (...roles) => {
    return async (req, res, next) => {
        try {
            const token =
                req.cookies?.accessToken ||
                req.header("Authorization")?.replace("Bearer ", "");

            if (!token) {
                return res.status(401).json({
                    message: "Unauthorized request!"
                });
            }

            const decodedToken = jwt.verify(
                token,
                process.env.ACCESS_TOKEN_SECRET
            );

            const user = await User.findById(decodedToken?._id)
                .select("-passwordHash -googleLogin -refreshToken");

            if (!user) {
                return res.status(401).json({
                    message: "Invalid access token!"
                });
            }

            if (!user.isActive) {
                return res.status(403).json({
                    message: "This account has been temporarily frozen."
                });
            }

            if (
                roles.length &&
                !roles.includes(user.role)
            ) {
                return res.status(403).json({
                    message: "Access denied!"
                });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({
                message: error?.message || "Invalid access token!"
            });
        }
    };
};