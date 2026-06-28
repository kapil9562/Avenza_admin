import React from 'react'
import { useAnalytics, useTheme } from '../../context/Context';
import { getCategoryColors } from '../../utils/format';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

const SalesByCategoryChart = () => {

    const { isDark } = useTheme();
    const cardBg = isDark ? "bg-gray-900 border-gray-800" : "bg-white";
    const text = isDark ? "text-white" : "text-gray-800";
    const subText = isDark ? "text-gray-400" : "text-gray-500";

    const { data } = useAnalytics();
    const categoryData = data?.data?.salesByCategory;
    const overview = data?.data?.overview || {};

    return (
        < div className={`${cardBg} rounded-2xl p-5 shadow border-2 h-full ${isDark ? "border-slate-800" : "border-transparent"}`}>
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
        </div >
    )
};

export default SalesByCategoryChart;
