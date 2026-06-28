import React, { useState } from 'react'
import { useAnalytics, useTheme } from '../../context/Context'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { IoIosArrowDown } from 'react-icons/io';
import { formatValue } from '../../utils/format';

const OrdersChart = () => {

    const { isDark } = useTheme();
    const { data, orderRange, setOrderRange } = useAnalytics();
    const [orderRangeDropdown, setOrderRangeDropdown] = useState(false);
    const cardBg = isDark ? "bg-gray-900 border-gray-800" : "bg-white";
    const text = isDark ? "text-white" : "text-gray-800";

    const orderData = data?.data?.ordersChart;

    return (
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
    )
}

export default OrdersChart
