import Order from "../models/order.modal.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const getAnalytics = async (req, res) => {
    try {
        const {
            salesRange = "yearly",
            orderRange = "monthly",
        } = req.query;

        const now = new Date();

        // OVERVIEW GROWTH (FIXED 30 DAYS)
        const currentStart = new Date();
        currentStart.setDate(now.getDate() - 30);

        const previousStart = new Date();
        previousStart.setDate(now.getDate() - 60);

        const previousEnd = new Date();
        previousEnd.setDate(now.getDate() - 30);

        // SALES CHART RANGE
        let salesStartDate;
        let salesFormat;

        switch (salesRange) {
            case "weekly":
                salesStartDate = new Date();
                salesStartDate.setDate(now.getDate() - 7);
                salesFormat = "%d %b";
                break;

            case "yearly":
                salesStartDate = new Date();
                salesStartDate.setFullYear(now.getFullYear() - 1);
                salesFormat = "%b";
                break;

            case "monthly":
            default:
                salesStartDate = new Date();
                salesStartDate.setMonth(now.getMonth() - 1);
                salesFormat = "%d %b";
        }

        // ORDER CHART RANGE
        let orderStartDate;
        let orderFormat;

        switch (orderRange) {
            case "weekly":
                orderStartDate = new Date();
                orderStartDate.setDate(now.getDate() - 7);
                orderFormat = "%d %b";
                break;

            case "monthly":
            default:
                orderStartDate = new Date();
                orderStartDate.setMonth(now.getMonth() - 6);
                orderFormat = "%b";
        }

        const [

            totalProducts,
            totalCustomers,
            totalOrders,

            totalRevenueAgg,

            currentRevenueAgg,
            previousRevenueAgg,

            currentOrders,
            previousOrders,

            currentCustomers,
            previousCustomers,

            salesChart,
            ordersChart,

            topProducts,
            categorySales

        ] = await Promise.all([

            Product.countDocuments(),
            User.countDocuments(),
            Order.countDocuments(),

            // Total Revenue
            Order.aggregate([
                {
                    $match: {
                        orderStatus: "delivered",
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: {
                            $sum: "$totalAmount",
                        },
                    },
                },
            ]),

            // Current Revenue
            Order.aggregate([
                {
                    $match: {
                        orderStatus: "delivered",
                        createdAt: {
                            $gte: currentStart,
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$totalAmount",
                        },
                    },
                },
            ]),

            // Previous Revenue
            Order.aggregate([
                {
                    $match: {
                        orderStatus: "delivered",
                        createdAt: {
                            $gte: previousStart,
                            $lt: previousEnd,
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$totalAmount",
                        },
                    },
                },
            ]),

            // Current Orders
            Order.countDocuments({
                createdAt: {
                    $gte: currentStart,
                },
            }),

            // Previous Orders
            Order.countDocuments({
                createdAt: {
                    $gte: previousStart,
                    $lt: previousEnd,
                },
            }),

            // Current Customers
            User.countDocuments({
                createdAt: {
                    $gte: currentStart,
                },
            }),

            // Previous Customers
            User.countDocuments({
                createdAt: {
                    $gte: previousStart,
                    $lt: previousEnd,
                },
            }),

            // SALES CHART
            Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: salesStartDate,
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: salesFormat,
                                date: "$createdAt",
                            },
                        },
                        revenue: {
                            $sum: "$totalAmount",
                        },
                    },
                },
                {
                    $sort: {
                        _id: 1,
                    },
                },
            ]),

            // ORDERS CHART
            Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: orderStartDate,
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: orderFormat,
                                date: "$createdAt",
                            },
                        },
                        orders: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        _id: 1,
                    },
                },
            ]),

            // TOP 3 SELLING PRODUCTS
            Order.aggregate([
                {
                    $unwind: "$orderItems",
                },
                {
                    $group: {
                        _id: "$orderItems.product",
                        totalSold: {
                            $sum: "$orderItems.quantity",
                        },
                    },
                },
                {
                    $sort: {
                        totalSold: -1,
                    },
                },
                {
                    $limit: 3,
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "_id",
                        foreignField: "_id",
                        as: "product",
                    },
                },
                {
                    $unwind: "$product",
                },
                {
                    $project: {
                        _id: 0,
                        productId: "$product._id",
                        name: "$product.title",
                        image: "$product.thumbnail",
                        totalSold: 1,
                        price: "$product.price"
                    },
                },
            ]),

            // Sales By Category 
            Order.aggregate([
                {
                    $match: {
                        orderStatus: {
                            $in: ["processing", "shipped", "out_for_delivery", "delivered"]
                        }
                    }
                },

                {
                    $unwind: "$orderItems"
                },

                {
                    $lookup: {
                        from: "products",
                        localField: "orderItems.product",
                        foreignField: "_id",
                        as: "product"
                    }
                },

                {
                    $unwind: "$product"
                },

                {
                    $group: {
                        _id: "$product.parentCategory", // ya category
                        totalSales: {
                            $sum: {
                                $multiply: [
                                    "$orderItems.price",
                                    "$orderItems.quantity"
                                ]
                            }
                        }
                    }
                },

                {
                    $sort: {
                        totalSales: -1
                    }
                }
            ])
        ]);

        const getGrowth = (current, previous) => {
            if (previous === 0) {
                return current > 0 ? 100 : 0;
            }

            return Number(
                (((current - previous) / previous) * 100).toFixed(1)
            );
        };

        const totalRevenue =
            totalRevenueAgg[0]?.totalRevenue || 0;

        const currentRevenue =
            currentRevenueAgg[0]?.total || 0;

        const previousRevenue =
            previousRevenueAgg[0]?.total || 0;

        const finalOrdersChart = [];

        if (orderRange === "monthly") {
            const ordersMap = new Map(
                ordersChart.map(item => [item._id, item.orders])
            );

            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(now.getMonth() - i);

                const month = date.toLocaleString("en-US", {
                    month: "short",
                });

                finalOrdersChart.push({
                    _id: month,
                    orders: ordersMap.get(month) ?? 0,
                });
            }
        }

        const totalSales = categorySales.reduce(
            (acc, item) => acc + item.totalSales,
            0
        );

        const salesByCategory = categorySales.map(item => ({
            name: item._id || "Others",
            value: Number(
                ((item.totalSales / totalSales) * 100).toFixed(1)
            )
        }));

        return res.status(200).json({
            success: true,

            overview: {
                totalRevenue,
                totalOrders,
                totalCustomers,
                totalProducts,

                revenueGrowth: getGrowth(
                    currentRevenue,
                    previousRevenue
                ),

                ordersGrowth: getGrowth(
                    currentOrders,
                    previousOrders
                ),

                customerGrowth: getGrowth(
                    currentCustomers,
                    previousCustomers
                ),
            },

            topProducts,
            salesByCategory,

            salesChart,

            ordersChart: orderRange === "monthly"
                ? finalOrdersChart
                : ordersChart
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error!",
        });
    }
};