import User from "../models/user.model.js"

const getUsers = async (req, res) => {
    const { skip } = req.query

    try {
        const now = new Date();

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);

        const metaDataRaw = await User.aggregate([
            {
                $facet: {

                    // TOTAL USERS
                    total: [
                        { $count: "count" }
                    ],

                    // NEW USERS
                    new: [
                        {
                            $match: {
                                createdAt: { $gte: oneMonthAgo }
                            }
                        },
                        { $count: "count" }
                    ],

                    // REPEAT USERS
                    repeat: [
                        {
                            $lookup: {
                                from: "orders",
                                localField: "_id",
                                foreignField: "user",
                                as: "orders"
                            }
                        },
                        {
                            $match: {
                                "orders.1": { $exists: true }
                            }
                        },
                        { $count: "count" }
                    ],

                    // TOP USERS
                    top: [
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
                                orderCount: { $size: "$orders" }
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
                    ]
                }
            }
        ]);

        // CLEAN FINAL OUTPUT
        const metaData = {
            total: metaDataRaw[0].total[0]?.count || 0,
            new: metaDataRaw[0].new[0]?.count || 0,
            repeat: metaDataRaw[0].repeat[0]?.count || 0,
            top: metaDataRaw[0].top[0]?.count || 0
        };

        const users = await User.find({}).select("-passwordHash -refreshToken -googleLogin").skip(Number(skip) || 0).limit(20);

        res.status(200).json({
            success: true,
            users: users,
            metaData
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users!"
        });
    }

}

export { getUsers }