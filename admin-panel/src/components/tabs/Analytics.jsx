import React, { useState } from "react";
import { FiShoppingBag, FiUsers } from "react-icons/fi";
import { MdOutlineCurrencyRupee, MdOutlineInventory2 } from "react-icons/md";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, CartesianGrid, Sector } from "recharts";
import { useAnalytics, useTheme } from "../../context/Context";
import { LuCrown, LuUserCog } from "react-icons/lu";
import { IoIosArrowDown, IoMdArrowUp } from "react-icons/io";
import { AiOutlineProduct } from "react-icons/ai";
import { formatValue, getCategoryColors } from "../../utils/format";
import { useNavigate } from "react-router-dom";

function Analytics() {
  const { isDark } = useTheme();
  const { data, isLoading, isError, error, refetch, isFetching, salesRange, setSalesRange, orderRange, setOrderRange } = useAnalytics();
  const [salesRangeDropdown, setSalesRangeDropdown] = useState(false);
  const [orderRangeDropdown, setOrderRangeDropdown] = useState(false);
  const overview = data?.data?.overview || {};
  const salesData = data?.data?.salesChart;
  const navigate = useNavigate();

  const orderData = data?.data?.ordersChart;

  const products = data?.data?.topProducts;

  const activities = [
    {
      title: "New order #OD20260615473739",
      amount: "₹1,250",
      time: "12:49 pm",
    },
    {
      title: "New customer joined",
      amount: "Abcd",
      time: "12:06 pm",
    },
    {
      title: "Order delivered",
      amount: "#OD20260615473739",
      time: "11:45 am",
    },
    {
      title: "Payment received",
      amount: "₹950",
      time: "10:20 am",
    },
  ];

  const categoryData = data?.data?.salesByCategory;

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
        fontSize={16}
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
        fill={props.fill}
        stroke="none"
      />
    );
  };

  const statCard = [
    { label: "Total Revenue", value: "₹ " + overview?.totalRevenue?.toLocaleString("en-IN") || "-", percentageChange: overview?.revenueGrowth, icon: MdOutlineCurrencyRupee, light: { icon: "bg-pink-100 text-pink-500", card: "from-white via-white to-pink-50 border-b-pink-200" }, dark: { icon: "bg-pink-900/50 text-pink-400", card: "bg-pink-900/40 text-pink-400 border-pink-700" } },
    { label: "Total Products", value: overview?.totalProducts, percentageChange: 100, icon: AiOutlineProduct, light: { icon: "bg-purple-100 text-purple-500", card: "from-white via-white to-purple-50 border-b-purple-200" }, dark: { icon: "bg-purple-900/50 text-purple-400", card: "bg-purple-900/40 text-purple-400 border-purple-700" } },
    { label: "Total Customers", value: overview?.totalCustomers, percentageChange: overview?.customerGrowth, icon: FiUsers, light: { icon: "bg-green-100 text-green-500", card: "from-white via-white to-green-50 border-b-green-200" }, dark: { icon: "bg-green-900/50 text-green-400", card: "bg-green-900/40 text-green-400 border-green-700" } },
    { label: "Total Orders", value: overview?.totalOrders, percentageChange: overview?.ordersGrowth, icon: FiShoppingBag, light: { icon: "bg-orange-100 text-orange-500", card: "from-white via-white to-orange-50 border-b-orange-200" }, dark: { icon: "bg-orange-900/50 text-orange-400", card: "bg-orange-900/40 text-orange-400 border-orange-700" } },
  ];

  const cardBg = isDark ? "bg-gray-900 border-gray-800" : "bg-white";
  const text = isDark ? "text-white" : "text-gray-800";
  const subText = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`md:p-4 p-2 space-y-4 nunitoFont ${isDark ? "bg-[#0F172A]" : "bg-[#F9F9FF]"}`}>
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
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Sales */}
        <div className={`${cardBg} rounded-2xl p-5 shadow border-2 ${isDark ? "border-slate-800" : "border-transparent"}`}>
          <div className="flex justify-between mb-4">
            <h3 className={`font-bold text-xl ${text}`}>
              Sales Overview
            </h3>
            <div className={`relative flex gap-2 items-center px-2 py-1 border-2 rounded-md text-sm font-semibold cursor-pointer ${isDark ? "border-slate-800 text-slate-100" : "border-slate-200 text-gray-700"}`}
              onClick={() => setSalesRangeDropdown((prev) => !prev)}>
              <h4>{salesRange?.charAt(0)?.toUpperCase() + salesRange?.slice(1)}</h4>
              <IoIosArrowDown className={`${salesRangeDropdown && "rotate-180"} transition-transform duration-500`} />

              <ol className={`absolute top-full min-w-fit w-full whitespace-nowrap z-20 border-2 left-0 rounded-md mt-1 ${salesRangeDropdown ? "block" : "hidden"} ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                {["Weekly", "Monthly", "Yearly"].map((item, idx) => (
                  <li
                    key={idx}
                    className={`px-2 py-0.5 cursor-pointer block ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
                    onClick={() => setSalesRange(item?.toLowerCase())}
                  >
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} dataKey="revenue" cursor="pointer">

                <defs>
                  <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isDark ? "rgba(219, 39, 119, 1)" : "#ff4fa2"} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={isDark ? "rgba(219, 39, 119, 0.4)" : "#ffd4e8"} stopOpacity={0.3} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="0" opacity={0.2} vertical={false} />
                <XAxis dataKey="_id" axisLine={false} tickLine={false} padding={{ left: 30, right: 30 }} tick={{ fontSize: 14, fontWeight: 600, fill: isDark ? "#dadada" : "#787878" }} />
                <YAxis width={50} dataKey="revenue" axisLine={false} tickLine={false} tickFormatter={(value) => formatValue(value)} tick={{ fontSize: 14, fontWeight: 600, fill: isDark ? "#dadada" : "#787878" }} />

                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#101828" : "#ffffff",
                    border: isDark ? "2px solid #252D3B" : "2px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                  }}
                  labelStyle={{
                    color: isDark ? "#e2e8f0" : "#1e293b"
                  }}
                  itemStyle={{
                    color: "#a855f7"
                  }}
                  cursor={{
                    stroke: "#a855f7",
                    strokeWidth: 1,
                    strokeDasharray: "4 4"
                  }}
                  formatter={(value) => [`₹${value}`, "Revenue"]}
                />

                <Area
                  cursor="pointer"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#ff4fa2"
                  fill="url(#pinkGradient)"
                  dot={{ r: 5, fill: "#ff4fa2", fillOpacity: 1 }}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders */}
        <div className={`${cardBg} rounded-2xl p-5 shadow border-2 ${isDark ? "border-slate-800" : "border-transparent"}`}>
          <div className="flex justify-between mb-4">
            <h3 className={`font-bold text-xl ${text}`}>
              Orders Overview
            </h3>

            <div className={`relative flex gap-2 items-center px-2 py-1 border-2 rounded-md text-sm font-semibold cursor-pointer ${isDark ? "border-slate-800 text-slate-100" : "border-slate-200 text-gray-700"}`}
              onClick={() => setOrderRangeDropdown((prev) => !prev)}>
              <h4>{orderRange?.charAt(0)?.toUpperCase() + orderRange?.slice(1)}</h4>
              <IoIosArrowDown className={`${orderRangeDropdown && "rotate-180"} transition-transform duration-500`} />

              <ol className={`absolute top-full min-w-fit w-full whitespace-nowrap z-20 border-2 left-0 rounded-md mt-1 ${orderRangeDropdown ? "block" : "hidden"} ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                {["Weekly", "Monthly"].map((item, idx) => (
                  <li
                    key={idx}
                    className={`px-2 py-0.5 cursor-pointer block ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
                    onClick={() => setOrderRange(item?.toLowerCase())}
                  >
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderData}>
                <CartesianGrid strokeDasharray="0" opacity={0.2} vertical={false} />
                <XAxis dataKey="_id" axisLine={false} tickLine={false} padding={{ left: 30, right: 30 }} tick={{ fontSize: 14, fontWeight: 600, fill: isDark ? "#dadada" : "#787878" }} />
                <YAxis width={50} allowDecimals={false} tickCount={5} dataKey="orders" axisLine={false} tickLine={false} tickFormatter={(value) => formatValue(value)} tick={{ fontSize: 14, fontWeight: 600, fill: isDark ? "#dadada" : "#787878" }} />

                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#101828" : "#ffffff",
                    border: isDark ? "2px solid #252D3B" : "2px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                  }}
                  labelStyle={{
                    color: isDark ? "#e2e8f0" : "#1e293b"
                  }}
                  itemStyle={{
                    color: "#a855f7"
                  }}
                  cursor={{
                    fill: "rgba(168, 85, 247, 0.1)"
                  }}
                />
                <Bar
                  maxBarSize={40}
                  dataKey="orders"
                  fill="#a855f7"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Products */}
        <div className={`${cardBg} rounded-2xl p-5 shadow border-2 ${isDark ? "border-slate-800" : "border-transparent"}`}>
          <div className="flex justify-between mb-5">
            <h3 className={`font-bold text-xl ${text}`}>
              Top Selling Products
            </h3>

            <button className="text-purple-500 font-bold text-sm hover:underline" onClick={() => navigate("/products")}>
              View All
            </button>
          </div>

          <div>
            {products?.map((item, i) => (
              <div
                key={i}
                className={`flex justify-between items-center gap-4 py-2 ${i < products?.length - 1 && `border-b-2 ${isDark ? "border-b-slate-800" : "border-b-slate-100"}`}`}
              >
                <div className="flex gap-2 items-center">
                  <div className={`${isDark ? "bg-purple-800/10" : "bg-purple-100/50"} w-fit h-fit rounded-md p-1 flex items-center justify-center`}>
                    <img
                      src={item?.image}
                      alt={item?.name}
                      loading="lazy"
                      className="min-h-12 min-w-12 max-h-12 max-w-12 rounded-md object-contain"
                    />
                  </div>
                  <div>
                    <h4 className={`font-semibold line-clamp-2 ${text}`}>
                      {item?.name}
                    </h4>
                    <p className={`${subText} font-semibold`}>₹{item?.price?.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <span className={`${subText} text-sm font-semibold`}>
                  {formatValue(item?.totalSold)} <br /> Sold
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className={`${cardBg} rounded-2xl p-5 shadow border-2 h-full ${isDark ? "border-slate-800" : "border-transparent"}`}>
          <h3 className={`font-bold text-xl ${text}`}>
            Sales By Category
          </h3>

          <div className="flex flex-col sm:flex-row items-center h-full">
            <div className="sm:w-1/2 w-full h-50 min-w-0">
              <ResponsiveContainer width="100%" height="100%" className="relative">
                <PieChart stroke="none" >
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    innerRadius={50}
                    outerRadius={90}
                    stroke="none"
                  >
                    {categoryData?.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={getCategoryColors(index)}
                      />
                    ))}
                  </Pie>
                </PieChart>
                <div className="text-xl text-black absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center">
                  <span className={`${text} font-bold`}>₹{overview?.totalRevenue?.toLocaleString("en-IN")}</span>
                  <span className={`${subText} text-sm font-semibold`}>Total Sales</span>
                </div>
              </ResponsiveContainer>
            </div>
            <div className="sm:w-1/2 w-full space-y-2">
              {categoryData?.map((item, idx) => (
                <div key={item.name} className="flex items-center text-sm font-semibold">
                  <span className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: getCategoryColors(idx) }}></span>
                  <span className={`${isDark ? "text-slate-200" : "text-slate-500"}`}>{item.name}</span>
                  <span className={`ml-auto font-bold ${isDark ? "text-slate-200" : "text-slate-500"}`}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
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