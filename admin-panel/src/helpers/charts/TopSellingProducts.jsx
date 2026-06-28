import React from 'react'
import { useAnalytics, useTheme } from '../../context/Context'
import { useNavigate } from 'react-router-dom';
import { formatValue } from '../../utils/format';

const TopSellingProducts = () => {

    const { isDark } = useTheme();
    const navigate = useNavigate();

    const { data } = useAnalytics();
    const products = data?.data?.topProducts;

    const cardBg = isDark ? "bg-gray-900 border-gray-800" : "bg-white";
    const text = isDark ? "text-white" : "text-gray-800";
    const subText = isDark ? "text-gray-400" : "text-gray-500";

    return (
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
    )
}

export default TopSellingProducts
