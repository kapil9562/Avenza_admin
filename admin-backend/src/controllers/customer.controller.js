import mongoose from "mongoose";
import Order from "../models/order.modal.js";
import User from "../models/user.model.js";

const getUsers = async (req, res) => {
    const { skip = 0, role, status, search, sort = "-createdAt" } = req.query;

    let filter = {};

    if (role && role != "All") {
        filter.role = role;
    }

    if (status && status != "All") {
        filter.isActive = status === "active" ? true : false;
    }

   if (search?.trim()) {
    const searchTerm = search.trim();
    const orConditions = [
        { uid: { $regex: searchTerm, $options: "i" } },
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } }
    ];

    if (mongoose.Types.ObjectId.isValid(searchTerm)) {
        orConditions.push({
            _id: new mongoose.Types.ObjectId(searchTerm)
        });
    }

    filter.$or = orConditions;
}

    try {
        const now = new Date();

        const currentMonthStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

        const previousMonthStart = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1
        );

        const previousMonthEnd = currentMonthStart;

        // TOTAL USERS
        const totalUsers = await User.countDocuments(filter);

        // NEW USERS
        const currentNewUsers = await User.countDocuments({
            createdAt: { $gte: currentMonthStart }
        });

        const previousNewUsers = await User.countDocuments({
            createdAt: {
                $gte: previousMonthStart,
                $lt: previousMonthEnd
            }
        });

        // REPEAT USERS (2+ orders in month)
        const [currentRepeatResult, previousRepeatResult] = await Promise.all([
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: currentMonthStart }
                    }
                },
                {
                    $group: {
                        _id: "$user",
                        orderCount: { $sum: 1 }
                    }
                },
                {
                    $match: {
                        orderCount: { $gte: 2 }
                    }
                },
                {
                    $count: "count"
                }
            ]),

            Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: previousMonthStart,
                            $lt: previousMonthEnd
                        }
                    }
                },
                {
                    $group: {
                        _id: "$user",
                        orderCount: { $sum: 1 }
                    }
                },
                {
                    $match: {
                        orderCount: { $gte: 2 }
                    }
                },
                {
                    $count: "count"
                }
            ])
        ]);

        // TOP USERS (5+ orders in month)
        const [currentTopResult, previousTopResult] = await Promise.all([
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: currentMonthStart }
                    }
                },
                {
                    $group: {
                        _id: "$user",
                        orderCount: { $sum: 1 }
                    }
                },
                {
                    $match: {
                        orderCount: { $gt: 5 }
                    }
                },
                {
                    $count: "count"
                }
            ]),

            Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: previousMonthStart,
                            $lt: previousMonthEnd
                        }
                    }
                },
                {
                    $group: {
                        _id: "$user",
                        orderCount: { $sum: 1 }
                    }
                },
                {
                    $match: {
                        orderCount: { $gt: 5 }
                    }
                },
                {
                    $count: "count"
                }
            ])
        ]);

        const currentRepeat = currentRepeatResult[0]?.count || 0;
        const previousRepeat = previousRepeatResult[0]?.count || 0;

        const currentTop = currentTopResult[0]?.count || 0;
        const previousTop = previousTopResult[0]?.count || 0;

        // Growth Calculator
        const calculateGrowth = (current, previous) => {
            if (previous === 0) {
                return current > 0 ? 100 : 0;
            }

            return Number(
                (((current - previous) / previous) * 100).toFixed(1)
            );
        };

        const metaData = {
            total: totalUsers,

            new: {
                count: currentNewUsers,
                growth: calculateGrowth(
                    currentNewUsers,
                    previousNewUsers
                )
            },

            repeat: {
                count: currentRepeat,
                growth: calculateGrowth(
                    currentRepeat,
                    previousRepeat
                )
            },

            top: {
                count: currentTop,
                growth: calculateGrowth(
                    currentTop,
                    previousTop
                )
            }
        };

        // USERS TABLE DATA
        const users = await User.aggregate([
            {
                $match: filter
            },
            {
                $lookup: {
                    from: "orders",
                    localField: "_id",
                    foreignField: "user",
                    as: "orders"
                }
            },
            {
                $addFields: {
                    ordersCount: {
                        $size: "$orders"
                    },

                    totalSpent: {
                        $sum: "$orders.totalAmount"
                    }
                }
            },
            {
                $project: {
                    passwordHash: 0,
                    refreshToken: 0,
                    googleLogin: 0,
                    orders: 0
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $skip: Number(skip)
            },
            {
                $limit: 10
            }
        ]);

        res.status(200).json({
            success: true,
            users,
            metaData
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch users!"
        });
    }
};

const updateRole = async (req, res) => {
    const { role, userId } = req.body;

    const availableRoles = ["super_admin", "admin", "user", "demo"];

    if (!role || !userId || !availableRoles.includes(role)) {
        return res.status(400).json({
            success: false,
            message: "Invalid userId or role!"
        });
    }

    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { returnDocument: 'after' }
        ).select("-passwordHash -googleLogin -refreshToken");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        }

        res.status(200).json({
            success: true,
            message: "Role updated successfully.",
            user
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
};

const updateStatus = async (req, res) => {
    const { userId } = req.params;
    const { status } = req.body;

    if (!userId || typeof status !== "boolean") {
        return res.status(400).json({
            success: false,
            message: "Invalid userId or status!"
        });
    }

    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { isActive: status },
            { returnDocument: 'after' }
        ).select("-passwordHash -googleLogin -refreshToken");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        }

        res.status(200).json({
            success: true,
            message: "Status updated successfully.",
            user
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
}

export { getUsers, updateRole, updateStatus };