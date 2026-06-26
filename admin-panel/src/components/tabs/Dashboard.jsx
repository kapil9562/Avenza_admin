import React, { useEffect, useState } from 'react';
import {
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiClipboard,
  FiPlus,
  FiEye
} from 'react-icons/fi';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  ComposedChart,
  Sector
} from 'recharts';
import { useDashboard, useTheme } from '../../context/Context';
import { formatDate, formatStatus, formatTime, getPaymentBadge, normalizeGooglePhoto, statusColors } from '../../utils/format';
import { getRecentOrders } from '../../api/api';
import { GoDotFill, GoEye } from 'react-icons/go';
import Lottie from 'lottie-react';
import adminLoader from '../../assets/adminLoader.json'
import { useNavigate } from 'react-router-dom';
import { IoRefresh } from 'react-icons/io5';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { useToast } from '../../context/Context';

// Mock Data for Charts
const salesData = [
  { name: 'Jan', sales: 400, trend: 240 },
  { name: 'Feb', sales: 300, trend: 380 },
  { name: 'Mar', sales: 600, trend: 450 },
  { name: 'Apr', sales: 500, trend: 390 },
  { name: 'May', sales: 800, trend: 600 },
  { name: 'Jun', sales: 700, trend: 650 },
];

const pieData = [
  { name: 'Electronics', value: 35, color: '#FF8A8A' },
  { name: 'Fashion', value: 25, color: '#6395F9' },
  { name: 'Home & Living', value: 20, color: '#7EE3B1' },
  { name: 'Beauty', value: 20, color: '#B9A3FF' },
];

const renderPercentLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;

  // text ko slice ke andar place karne ke liye
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
  const [showDetail, setShowDetail] = useState([]);
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

  const statsList = [
    {
      icon: <FiShoppingBag />,
      label: "Total Sales",
      value: "$12,540",
      color: `${isDark ? "bg-pink-900/50 text-pink-600" : "bg-pink-100 text-pink-500"}`,
      className: `${isDark ? "bg-pink-900/40 text-pink-400 border-pink-700 border" : "bg-linear-to-b from-white via-white to-pink-50 border-b-pink-200"} border-b-4`,
    },
    {
      icon: <FiClipboard />,
      label: "Orders",
      value: "320",
      color: `${isDark ? "bg-purple-900/50 text-purple-600" : "bg-purple-100 text-purple-500"}`,
      className: `${isDark ? "bg-purple-900/40 text-purple-400 border-purple-700 border" : "bg-linear-to-b from-white via-white to-purple-50 border-b-purple-200"} border-b-4`,
    },
    {
      icon: <FiUsers />,
      label: "Customers",
      value: "1,210",
      color: `${isDark ? "bg-green-900/50 text-green-600" : "bg-green-100 text-green-500"}`,
      className: `${isDark ? "bg-green-900/40 text-green-400 border-green-700 border" : "bg-linear-to-b from-white via-white to-green-50 border-b-green-200"} border-b-4`,
    },
    {
      icon: <FiDollarSign />,
      label: "Revenue",
      value: "$8,750",
      color: `${isDark ? "bg-orange-900/50 text-orange-600" : "bg-orange-100 text-orange-500"}`,
      className: `${isDark ? "bg-orange-900/40 text-orange-400 border-orange-700 border" : "bg-linear-to-b from-white via-white to-orange-50 border-b-orange-200"} border-b-4`,
    },
  ];

  return (
    <div className={`w-full p-2 md:p-4 font-sans text-slate-700 ${isDark ? "bg-[#0F172A]" : "bg-[#F9F9FF]"}`}>
      {/* 1. Stats Overview Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 xl:gap-6 mb-4">

        {statsList.map((item, idx) => (
          <StatCard
            key={idx}
            isDark={isDark}
            icon={item.icon}
            label={item.label}
            value={item.value}
            color={item.color}
            className={item.className}
          />
        ))}

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8 min-w-0">
          {/* 2. Recent Orders Table */}
          <div className={`rounded-xl overflow-hidden shadow-sm border-2 ${isDark ? "bg-[#0F172A] border-gray-800 border-2" : "bg-white border-slate-100 border"}`}>
            <div className={`border-b py-3 px-4 flex flex-row justify-between items-center ${isDark ? "text-gray-100 border-slate-600" : "text-gray-800 border-slate-50"}`}>
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
            <div className="overflow-y-auto scroll-smooth">
              <table className="w-full border-collapse">

                {/* Header */}
                <thead className={`sticky top-0 z-50 border-b ${isDark ? "bg-slate-800 border-b-slate-700 text-gray-100" : "bg-slate-100 border-b-slate-200"}`}>
                  <tr className={`text-left divide-slate-200 divide-x ${isDark ? "divide-slate-700" : "divide-slate-200"}`}>
                    <th className="px-4 py-4 w-[5%] font-semibold whitespace-nowrap">Order ID</th>
                    <th className="px-4 py-4 min-w-70 w-[30%] font-semibold">Customer</th>
                    <th className="px-4 py-4 w-[12%] font-semibold">Items</th>
                    <th className="px-4 py-4 w-[10%] font-semibold">Status</th>
                    <th className="px-4 py-4 w-[15%] font-semibold">Date</th>
                  </tr>
                </thead>

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
                          <td className={`px-4 py-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
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
        <div className="md:space-y-8 space-y-4 min-w-0">
          {/* 3. Sales Analytics */}
          <div className={`rounded-xl p-4 shadow-sm border-2 ${isDark ? "bg-[#0F172A] border-gray-800" : "bg-white border-slate-100"}`}>
            <h3 className={`text-lg font-bold nunitoFont ${isDark ? "text-gray-200" : "text-gray-800"}`}>Sales Analytics</h3>
            <p className={`text-sm mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Monthly Sales Overview</p>
            <div className="h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={salesData} accessibilityLayer={false}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF8A8A" stopOpacity={1} />
                      <stop offset="100%" stopColor="#FF3E9B" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: isDark ? "#94A3B8" : "#64748B",
                      fontWeight: 500,
                    }}
                  />

                  <YAxis hide />
                  <Tooltip cursor={false} />

                  <Bar
                    dataKey="sales"
                    fill="url(#salesGradient)"
                    radius={[4, 4, 0, 0]}
                  />

                  <Line
                    type="monotone"
                    dataKey="trend"
                    stroke="#6395F9"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#6395F9" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Product Categories */}
          <div className={`rounded-3xl p-6 shadow-sm border-2 ${isDark ? "bg-[#0F172A] border-gray-800" : "bg-white border-slate-100"}`}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-gray-200" : "text-gray-800"}`}>Product Categories</h3>
            <div className="flex items-center">
              <div className="w-1/2 h-40 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart stroke="none" >
                    <Pie stroke="none" data={pieData} innerRadius={0} outerRadius={70} paddingAngle={0} dataKey="value" shape={renderSlice} labelLine={false} label={renderPercentLabel} isAnimationActive={true} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center text-xs">
                    <span className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: item.color }}></span>
                    <span className={`${isDark ? "text-slate-200" : "text-slate-500"}`}>{item.name}</span>
                    <span className={`ml-auto font-bold ${isDark ? "text-slate-200" : "text-slate-500"}`}>{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Quick Actions */}
          <div className={`rounded-3xl p-6 shadow-sm border-2 ${isDark ? "bg-[#0F172A] border-gray-800" : "bg-white border-slate-100"}`}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-gray-200" : "text-gray-800"}`}>Quick Actions</h3>
            <div className="flex gap-4">
              <button
                className="flex-1 bg-linear-to-b from-orange-400 to-pink-400 text-white py-2 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition cursor-pointer font-semibold"
                onClick={() => navigate("/addProduct")}
              >
                <FiPlus size={16} /> Add Product
              </button>
              <button
                className="flex-1 bg-linear-to-b from-blue-400 to-teal-400 text-white py-2 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition cursor-pointer font-semibold"
                onClick={() => navigate("/orders")}
              >
                <FiEye size={16} /> View Orders
              </button>
            </div>
          </div>
        </div>
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