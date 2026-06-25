import React from 'react'
import { useTheme } from '../../context/Context';

const OrderSkeleton = () => {

    const { isDark } = useTheme();

    return (
        <div
            className={`flex items-center justify-between border-2 rounded-lg px-2 py-1 animate-pulse ${isDark ? "border-slate-800" : "border-slate-200"
                }`}
        >
            {/* Left */}
            <div className="flex w-[40%] space-x-2 items-center">
                <div
                    className={`min-h-15 min-w-15 rounded shimmer ${isDark ? "bg-slate-700" : "bg-slate-200"
                        }`}
                />

                <div className="space-y-2 w-full">
                    <div
                        className={`h-3 w-20 rounded shimmer ${isDark ? "bg-slate-700" : "bg-slate-200"
                            }`}
                    />
                    <div
                        className={`h-5 w-32 rounded shimmer ${isDark ? "bg-slate-700" : "bg-slate-200"
                            }`}
                    />
                    <div
                        className={`h-3 w-40 rounded shimmer ${isDark ? "bg-slate-700" : "bg-slate-200"
                            }`}
                    />
                </div>
            </div>

            {/* Items */}
            <div className="flex flex-col w-[25%] gap-2">
                <div
                    className={`h-3 w-16 rounded shimmer ${isDark ? "bg-slate-700" : "bg-slate-200"
                        }`}
                />

                <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`h-8 w-8 rounded shimmer ${isDark ? "bg-slate-700" : "bg-slate-200"
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Amount */}
            <div className="flex flex-col w-[15%] gap-2">
                <div
                    className={`h-5 w-20 rounded shimmer ${isDark ? "bg-slate-700" : "bg-slate-200"
                        }`}
                />
                <div
                    className={`h-3 w-16 rounded shimmer ${isDark ? "bg-slate-700" : "bg-slate-200"
                        }`}
                />
            </div>

            {/* Status */}
            <div className="flex items-center justify-center w-[20%]">
                <div
                    className={`h-8 w-28 rounded-full shimmer ${isDark ? "bg-slate-700" : "bg-slate-200"
                        }`}
                />
            </div>
        </div>
    )
};

export default OrderSkeleton;