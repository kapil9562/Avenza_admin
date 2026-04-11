import User from "../models/user.model.js"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save();

        return { accessToken, refreshToken }
    } catch (error) {
        throw error;
    }
}

const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
}

export const emailLogin = async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required !"
        });
    }

    try {

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "Invalid credentials!",
            });
        } else if (!user.isActive) {
            return res.status(403).json({
                message: "This account has been temporarily frozen.",
            });
        } else if (!user.passwordHash && user.googleLogin) {
            return res.status(403).json({
                message: "This account uses Google login !",
            });
        } else {
            const isValid = await user.isPasswordCorrect(password);

            if (!isValid) {
                return res.status(401).json({ message: "Invalid credentials !" });
            } else if (user.role !== "admin") {
                return res.status(403).json({
                    message: "Access denied",
                });
            }

            const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
            const loggedInUser = await User.findById(user._id).select("-passwordHash -googleLogin -isActive -refreshToken");

            return res
                .status(200)
                .cookie('accessToken', accessToken, options)
                .cookie('refreshToken', refreshToken, options)
                .json({
                    message: "login successful",
                    user: loggedInUser,
                });
        }

    } catch (err) {
        console.error("Email Login Error ::", err);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const logout = async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            returnDocument: "after"
        }
    );

    res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({
            message: "logout successfully"
        })

}

export const refreshAccessToken = async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        return res.status(401).json({
            message: "unauthorized request!"
        });
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            return res.status(401).json({
                message: "Invalid refresh token!"
            })
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            return res.status(401).json({
                message: "Refresh token is expired or used!"
            });
        }

        const { refreshToken: newRefreshToken, accessToken } = await generateAccessAndRefreshToken(user._id);

        res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json({
                message: "Access token refreshed."
            });
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired refresh token!"
        });
    }

}

export const getCurrentUser = async (req, res) => {
    res.status(200).json({
        user: req.user,
    });
};