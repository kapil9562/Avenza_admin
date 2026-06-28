import React from 'react'
import { useTheme } from '../../context/Context'
import { IoMdArrowUp } from 'react-icons/io';

const AnalyticsStatCard = ({item}) => {

    const { isDark } = useTheme();
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
    )
}

export default AnalyticsStatCard
