import { AiOutlineProduct } from "react-icons/ai";
import { FiShoppingBag, FiUsers } from "react-icons/fi";
import { MdOutlineCurrencyRupee } from "react-icons/md";

export const getStatCard = (overview) => [
    {
        label: "Total Revenue",
        value: "₹ " + overview?.totalRevenue?.toLocaleString("en-IN") || "-",
        percentageChange: overview?.revenueGrowth,
        icon: MdOutlineCurrencyRupee,
        light: {
            icon: "bg-pink-100 text-pink-500",
            card: "from-white via-white to-pink-50 border-b-pink-200"
        },
        dark: {
            icon: "bg-pink-900/50 text-pink-400",
            card: "bg-pink-900/40 text-pink-400 border-pink-700"
        }
    },
    {
        label: "Total Products",
        value: overview?.totalProducts,
        percentageChange: 100,
        icon: AiOutlineProduct,
        light: {
            icon: "bg-purple-100 text-purple-500",
            card: "from-white via-white to-purple-50 border-b-purple-200"
        },
        dark: {
            icon: "bg-purple-900/50 text-purple-400",
            card: "bg-purple-900/40 text-purple-400 border-purple-700"
        }
    },
    {
        label: "Total Customers",
        value: overview?.totalCustomers,
        percentageChange: overview?.customerGrowth,
        icon: FiUsers,
        light: {
            icon: "bg-green-100 text-green-500",
            card: "from-white via-white to-green-50 border-b-green-200"
        },
        dark: {
            icon: "bg-green-900/50 text-green-400",
            card: "bg-green-900/40 text-green-400 border-green-700"
        }
    },
    {
        label: "Total Orders",
        value: overview?.totalOrders,
        percentageChange: overview?.ordersGrowth,
        icon: FiShoppingBag,
        light: {
            icon: "bg-orange-100 text-orange-500",
            card: "from-white via-white to-orange-50 border-b-orange-200"
        },
        dark: {
            icon: "bg-orange-900/50 text-orange-400",
            card: "bg-orange-900/40 text-orange-400 border-orange-700"
        }
    },
];