import Order from "../models/order.modal.js";
import User from "../models/user.model.js";
import Fuse from "fuse.js";


// { Get Orders }
const getOrders = async (req, res) => {
    try {
        const {
            skip,
            limit = 10,
            status,
            paymentMethod,
            search,
            sort = "-createdAt",
        } = req.query;

        // Build filter
        let query = {};

        // Filter by status
        if (status && status !== "All") {
            query.orderStatus = status;
        }

        // Filter by payment method
        if (paymentMethod && paymentMethod !== "All") {
            query.paymentMethod = paymentMethod;
        }

        // Search
        if (search?.trim()) {
            const searchTerm = search.trim();

            // get users
            const users = await User.find({}, "_id name email").limit(200);

            // Fuzzy search
            const fuse = new Fuse(users, {
                keys: ["name", "email"],
                threshold: 0.4,
            });

            const fuzzyResults = fuse.search(searchTerm);
            const fuzzyUserIds = fuzzyResults.map(r => r.item._id);

            // Regex fallback
            const regexUsers = await User.find({
                $or: [
                    { name: { $regex: searchTerm, $options: "i" } },
                    { email: { $regex: searchTerm, $options: "i" } },
                ],
            }).select("_id");

            const regexUserIds = regexUsers.map(u => u._id);

            // merge both
            const userIds = [...new Set([...fuzzyUserIds, ...regexUserIds])];

            // final query
            query.$or = [
                { orderId: { $regex: searchTerm, $options: "i" } },
                { user: { $in: userIds } },
            ];
        }

        const [orders, statsRaw] = await Promise.all([

            // paginated orders
            Order.find(query)
                .populate("user", "name email avatar")
                .sort(sort)
                .skip(Number(skip) || 0)
                .limit(Number(limit)),

            // stats
            Order.aggregate([
                {
                    $group: {
                        _id: "$orderStatus",
                        count: { $sum: 1 }
                    }
                }
            ])

        ]);

        const total = await Order.countDocuments(query);

        const stats = {
            total: 0,
            processing: 0,
            packed: 0,
            shipped: 0,
            out_for_delivery: 0,
            delivered: 0,
            cancelled: 0
        };

        statsRaw.forEach(item => {
            stats[item._id] = item.count;
            stats.total += item.count;
        });

        res.status(200).json({
            success: true,
            orders,
            total,
            stats,
            paymentMethods: ["COD", "Stripe", "Razorpay", "PayPal"]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
        });
    }
};

// { Get Recent Orders }
const getRecentOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "name email avatar").sort("-createdAt").limit(5);
        if (!orders) {
            return res.status(404).json({
                success: false,
                message: "No orders found!"
            });
        }
        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error!"
        })
    }
};

// { Update Orders }
const updateOrder = async (req, res) => {
    const orderId = req.params.orderId;
    const { status } = req.body;

    if (!orderId || !status) {
        return res.status(400).json({
            success: false,
            message: "Invalid order status!"
        })
    }

    try {
        const order = await Order.findOneAndUpdate(
            { orderId },
            { orderStatus: status },
            { returnDocument: 'after' }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully.",
            order,
        });
    } catch (error) {
        console.log("update status error ::", error);
        return res.status(500).json({
            success: false,
            message: "Failed to change update status!"
        })
    }
};

// { Delete Orders }
const deleteOrder = async (req, res) => {
    const orderId = req.params.orderId;

    if (!orderId) {
        return res.status(4000).json({
            success: false,
            message: "Invalid order id!"
        });
    }

    try {
        await Order.findOneAndDelete({ orderId });

        return res.status(200).json({
            success: true,
            message: "Order deleted."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete order!"
        })
    }
};

export { getOrders, getRecentOrders, updateOrder, deleteOrder };