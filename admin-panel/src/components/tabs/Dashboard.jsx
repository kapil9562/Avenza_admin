import React, { useEffect, useState } from 'react';
import {
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiClipboard,
  FiPlus,
  FiEye
} from 'react-icons/fi';
import { Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, ComposedChart, Sector } from 'recharts';
import { useAnalytics, useDashboard, useTheme } from '../../context/Context';
import { formatDate, formatStatus, formatTime, normalizeGooglePhoto, statusColors } from '../../utils/format';
import { getRecentOrders } from '../../api/api';
import { GoDotFill, GoTriangleUp } from 'react-icons/go';
import Lottie from 'lottie-react';
import adminLoader from '../../assets/adminLoader.json'
import { useNavigate } from 'react-router-dom';
import { IoRefresh } from 'react-icons/io5';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { useToast } from '../../context/Context';
import SalesChart from '../../helpers/charts/SalesChart';
import SalesByCategoryChart from '../../helpers/charts/SalesByCategoryChart';
import TopSellingProducts from '../../helpers/charts/TopSellingProducts';
import { getStatCard } from '../../constants/analyticsStats';
import AnalyticsStatCard from '../../helpers/charts/AnalyticsStatCard';

const pieData = [
  { name: 'Electronics', value: 35, color: '#FF8A8A' },
  { name: 'Fashion', value: 25, color: '#6395F9' },
  { name: 'Home & Living', value: 20, color: '#7EE3B1' },
  { name: 'Beauty', value: 20, color: '#B9A3FF' },
];

const renderPercentLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;

  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;

  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const renderSlice = (props) => {
  return (
    <Sector
      {...props}
      fill={props.payload.color}
      stroke="none"
    />
  );
};

const Dashboard = () => {

  const { isDark } = useTheme();
  const { recentOrders, setRecentOrders, error, setError } = useDashboard();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (recentOrders.length > 0) return;

    const fetchRecentOrders = async () => {
      try {
        setLoading(true);
        const res = await getRecentOrders();
        if (res?.data?.orders?.length === 0) {
          setError("No Order Found!");
        }
        setRecentOrders(res?.data?.orders);
        setError("");
      } catch (error) {
        console.log(error);
        const msg = error?.response?.data?.message || error?.data?.message || "Failed to fetch recent Orders!";
        setError(msg)
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentOrders();
  }, [recentOrders, setRecentOrders, setError, toast]);

  const { data } = useAnalytics();
  const overview = data?.data?.overview || {};

  const statCard = getStatCard(overview);

  return (
    <div className={`w-full p-2 md:p-4 font-sans space-y-4 text-slate-700 ${isDark ? "bg-[#0F172A]" : "bg-[#F9F9FF]"}`}>

      {/* 1. Stats Overview Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 md:gap-6 gap-2 animate-fadeIn">
        {statCard?.map((item) => (<AnalyticsStatCard key={item.label} item={item} isDark={isDark} />))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fadeIn">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8 min-w-0">
          {/* 2. Recent Orders Table */}
          <div className={`rounded-xl overflow-hidden shadow h-full ${isDark ? "bg-[#0F172A] border-gray-800 border-2" : "bg-white border-slate-100 border"}`}>
            <div className={`border-b py-3 px-4 flex flex-row justify-between items-center ${isDark ? "text-gray-100 border-slate-800" : "text-gray-800 border-slate-50"}`}>
              <h3 className='text-xl font-bold nunitoFont'>Recent Orders</h3>
              <button
                className={`flex flex-row justify-center items-center border-2 px-2 py-1 rounded-md text-sm font-medium ${isDark ? "bg-pink-600/10 border-pink-600 text-pink-400 hover:border-pink-700" : "bg-rose-50/60 border-rose-100 text-rose-400 hover:border-rose-200"}`}
                onClick={() => navigate("/orders")}
              >
                <span>View All Orders</span>
                <MdKeyboardArrowRight size={20} />
              </button>
            </div>
            {/* Table Container */}
            <div className="overflow-y-auto scroll-smooth min-h-fit h-87">
              <table className="w-full border-collapse">

                {/* Header */}
                {(!error && !loading) &&
                  <thead className={`sticky top-0 z-50 border-b ${isDark ? "bg-slate-800 border-b-slate-700 text-gray-100" : "bg-slate-100 border-b-slate-200"}`}>
                    <tr className={`text-left divide-slate-200 divide-x ${isDark ? "divide-slate-700" : "divide-slate-200"}`}>
                      <th className="px-4 py-4 w-[30%] font-semibold whitespace-nowrap">Order ID</th>
                      <th className="px-4 py-4 w-[30%] font-semibold">Customer</th>
                      <th className="px-4 py-4 w-[20%] font-semibold">Items</th>
                      <th className="px-4 py-4 w-[10%] font-semibold">Status</th>
                      <th className="px-4 py-4 w-[10%] font-semibold">Date</th>
                    </tr>
                  </thead>
                }

                {/* Body */}
                <tbody className={`font-semibold divide-y ${isDark ? "divide-slate-700 text-gray-300" : "divide-slate-200 text-gray-800"} ${recentOrders?.length === 0 && "h-[36dvh]"}`}>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-8">
                        <div className="flex flex-col items-center justify-center relative">
                          <Lottie animationData={adminLoader} loop={true} className="w-40 h-40" />
                          <p className="text-gray-500 font-semibold absolute bottom-4">Loading...</p>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="8" className="py-4">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className={`${isDark ? "bg-purple-800/10" : "bg-purple-100/50"} rounded-full p-5 flex items-center justify-center`}>
                            <img src="/noResult.webp" alt="img" className="h-20 w-20 object-contain" />
                          </div>
                          <h4 className={`${isDark ? "text-gray-300" : "text-gray-800"} font-bold text-2xl`}>{error}</h4>
                          <p className={`${isDark ? "text-gray-500" : "text-gray-400"} font-semibold text-sm mt-2`}>
                            We couldn't find any recent orders.
                          </p>
                          <button
                            className={`p-2 flex flex-row justify-center rounded-lg font-semibold items-center gap-1 cursor-pointer active:scale-95 transition-transform duration-300 will-change-transform text-sm mt-4 text-purple-600 border ${isDark ? "bg-purple-600/10 border-purple-600 hover:brightness-110" : "bg-purple-100 border-purple-200 hover:bg-purple-200/60"}`}
                            onClick={() => setRecentOrders([])}
                          >
                            <IoRefresh size={24} />
                            <span>Refresh Orders</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recentOrders?.map((order, idx) => (
                      <React.Fragment key={order?._id || idx}>
                        <tr
                          className={`divide-x cursor-pointer  ${isDark ? "divide-slate-700 hover:bg-slate-800" : "divide-slate-200 hover:bg-slate-100"}`}
                          onClick={() => navigate("/orders", { state: { id: order?.orderId } })}
                        >

                          {/* Order ID */}
                          <td className={`px-4 py-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            #{order.orderId}
                          </td>

                          {/* Customer */}
                          <td className="px-4 py-1">
                            <div className="flex items-center gap-4">
                              <img
                                src={normalizeGooglePhoto(order?.user?.avatar) || (isDark ? "/user.png" : "/userLight.png")}
                                referrerPolicy="no-referrer"
                                alt="thumbnail"
                                className={`min-w-10 min-h-10 max-w-10 max-h-10 object-contain rounded-full ${isDark ? "bg-linear-to-br from-blue-900/40 to-purple-900/40" : "bg-linear-to-br from-blue-100 to-purple-100"}`}
                              />
                              <div className='flex flex-col'>
                                <span>{order?.user?.name}</span>
                                <span className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}>{order?.user?.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Items */}
                          <td className="px-4 py-1">
                            <div className='flex flex-row gap-1 items-center'>
                              <img
                                src={order?.orderItems[0]?.image}
                                alt="img"
                                className={`${isDark ? "bg-linear-to-br from-blue-900/40 to-purple-900/40" : "bg-linear-to-br from-blue-100 to-purple-100"} h-8 w-8 object-contain rounded`}
                              />
                              {order?.orderItems?.length > 1 && (
                                <div className={`ml-1 text-sm font-medium px-2 py-0.5 group rounded-full relative cursor-pointer ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}>
                                  +{order.orderItems.length - 1}
                                  <div className={`absolute p-1 z-50 left-0 ${idx !== order?.orderItems?.length - 1 ? "top-full mt-2" : "bottom-full mb-2"} gap-1 rounded-md hidden group-hover:flex animate-fadeIn ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
                                    <div className={`absolute ${idx !== order?.orderItems?.length - 1 ? "-top-4" : "-bottom-4 rotate-180"} left-1 ${isDark ? "text-gray-800" : "text-gray-200"}`}>
                                      <GoTriangleUp size={26} />
                                    </div>
                                    {order?.orderItems?.slice(1).map((item, i) => (
                                      <div key={i}>
                                        <img src={item?.image} loading='lazy' alt="img" className={`${isDark ? "bg-linear-to-br from-blue-900/40 to-purple-900/40" : "bg-linear-to-br from-blue-100 to-purple-100"} min-h-10 min-w-10 object-contain rounded shadow-[0_0px_6px_rgba(0,0,0,0.28)]`} />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-1">
                            <div className={`flex flex-row w-fit items-center gap-1 px-2 py-1 text-sm rounded-full whitespace-nowrap ${statusColors[order?.orderStatus.replace(/\s/g, "")]}`}>
                              <GoDotFill size={10} />
                              <span>{formatStatus(order?.orderStatus?.charAt(0).toUpperCase() + order?.orderStatus.slice(1))}</span>
                            </div>
                          </td>

                          {/* Date */}
                          <td className={`px-4 py-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            <div className='flex flex-col'>
                              <span className={`${isDark ? "text-gray-300" : "text-gray-800"} text-sm whitespace-nowrap`}>{formatDate(order?.createdAt)}</span>
                              <span className='text-sm'>{formatTime(order?.createdAt)}</span>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="md:space-y-8 space-y-4 min-w-0 h-fit">
          {/* Sales Analytics */}
          <SalesChart />
        </div>
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-2 gap-4 animate-fadeIn'>
        {/* Top Selling Products */}
        <TopSellingProducts />
        {/* Product Categories */}
        <SalesByCategoryChart />
      </div>

    </div>
  );
};

// Sub-components for cleaner code
const StatCard = ({ icon, label, value, color, className, isDark }) => (
  <div className={`md:p-5 p-3 rounded-xl md:rounded-3xl shadow md:shadow-md flex items-center gap-4 ${className}`}>
    <div className={`md:p-3 p-2 rounded-xl ${color} text-xl`}>{icon}</div>
    <div>
      <p className={`text-sm ${isDark ? "text-slate-100" : "text-slate-400"} font-medium`}>{label}</p>
      <p className={`md:text-2xl sm:text-xl text-lg font-bold ${isDark ? "text-white" : "text-slate-700"} `}>{value}</p>
    </div>
  </div>
);

export default Dashboard;