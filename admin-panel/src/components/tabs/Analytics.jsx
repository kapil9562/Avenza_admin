import React from "react";
import { FiShoppingBag, FiUsers } from "react-icons/fi";
import { MdOutlineCurrencyRupee } from "react-icons/md";
import { useAnalytics, useTheme } from "../../context/Context";
import { IoMdArrowUp } from "react-icons/io";
import { AiOutlineProduct } from "react-icons/ai";
import { formatValue } from "../../utils/format";
import { useNavigate } from "react-router-dom";
import SalesChart from "../../helpers/charts/SalesChart";
import SalesByCategoryChart from "../../helpers/charts/SalesByCategoryChart";
import OrdersChart from "../../helpers/charts/OrdersChart";
import TopSellingProducts from "../../helpers/charts/TopSellingProducts";

function Analytics() {
  const { isDark } = useTheme();
  const { data } = useAnalytics();
  const overview = data?.data?.overview || {};

  const statCard = [
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
      percentageChange: 100, icon: AiOutlineProduct,
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

  const cardBg = isDark ? "bg-gray-900 border-gray-800" : "bg-white";
  const text = isDark ? "text-white" : "text-gray-800";
  const subText = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`animate-fadeIn md:p-4 p-2 space-y-4 overflow-hidden nunitoFont ${isDark ? "bg-[#0F172A]" : "bg-[#F9F9FF]"}`}>
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${text}`}>
          Analytics Overview
        </h1>
        <p className={`font-semibold ${subText}`}>
          Track your business performance and growth.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 md:gap-6 gap-2">
        {statCard.map((item) => (<StatCard key={item.label} item={item} isDark={isDark} />))}
      </div>

      {/* Charts */}
      <div className="grid xl:grid-cols-2 gap-6">

        {/* Sales */}
        <SalesChart />

        {/* Orders */}
        <OrdersChart />
      </div>

      {/* Bottom */}
      <div className="grid xl:grid-cols-2 gap-6">
        {/* Products */}
        <TopSellingProducts />

        {/* Category */}
        <SalesByCategoryChart />
      </div>
    </div >
  );
}

const StatCard = ({ item, isDark }) => {
  const Icon = item.icon;
  const theme = isDark ? item.dark : item.light;
  return (
    <div className={`px-3 nunitoFont md:py-2 py-1 rounded-2xl shadow md:shadow-[0px_3px_8px_rgba(0,0,0,0.15)] flex items-center gap-2 sm:gap-4 border-b-4 ${theme.card}`}>
      <div className={`md:p-4 p-2 rounded-xl ${theme.icon} md:text-3xl text-xl`}><Icon /></div>
      <div>
        <p className={`text-sm ${isDark ? "text-slate-100" : "text-gray-600"} font-semibold`}>{item.label}</p>
        <p className={`sm:text-2xl text-lg font-bold ${isDark ? "text-white" : "text-gray-800"}`}>{item.value}</p>
        {item?.percentageChange !== undefined && (
          <div className="flex flex-row flex-wrap gap-1 font-medium text-xs sm:text-sm mt-1">
            <div className={`${item?.percentageChange >= 0 ? "text-green-500" : "text-red-500"} flex row gap-1 items-center`}>
              <IoMdArrowUp className={`${item?.percentageChange < 0 && "rotate-180"}`} />
              <span>{item?.percentageChange}%</span>
            </div>
            <p className={`${isDark ? "text-slate-300" : "text-slate-400"}`}>this month</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;