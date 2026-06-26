import React from 'react';
import { useTheme } from '../../context/Context';

const OrderSkeleton = () => {
    const { isDark } = useTheme();

    return (
        <tr
            className={`animate-pulse border-b ${
                isDark ? "border-slate-800" : "border-slate-200"
            }`}
        >
            {/* Order */}
            <td className="px-4 py-4">
                <div className="flex items-center gap-3 min-w-[260px]">
                    <div
                        className={`h-12 w-12 md:h-14 md:w-14 rounded-lg shimmer ${
                            isDark ? "bg-slate-700" : "bg-slate-200"
                        }`}
                    />

                    <div className="flex flex-col gap-2">
                        <div
                            className={`h-3 w-16 rounded shimmer ${
                                isDark ? "bg-slate-700" : "bg-slate-200"
                            }`}
                        />
                        <div
                            className={`h-4 w-32 rounded shimmer ${
                                isDark ? "bg-slate-700" : "bg-slate-200"
                            }`}
                        />
                        <div
                            className={`h-3 w-24 rounded shimmer ${
                                isDark ? "bg-slate-700" : "bg-slate-200"
                            }`}
                        />
                    </div>
                </div>
            </td>

            {/* Items */}
            <td className="px-4 py-4">
                <div className="flex flex-col gap-2 min-w-[160px]">
                    <div
                        className={`h-3 w-16 rounded shimmer ${
                            isDark ? "bg-slate-700" : "bg-slate-200"
                        }`}
                    />

                    <div className="flex gap-1">
                        {[1, 2].map((i) => (
                            <div
                                key={i}
                                className={`h-8 w-8 rounded shimmer ${
                                    isDark ? "bg-slate-700" : "bg-slate-200"
                                }`}
                            />
                        ))}

                        <div
                            className={`h-8 w-10 rounded-full shimmer ${
                                isDark ? "bg-slate-700" : "bg-slate-200"
                            }`}
                        />
                    </div>
                </div>
            </td>

            {/* Amount */}
            <td className="px-4 py-4 text-right">
                <div className="flex flex-col items-end gap-2">
                    <div
                        className={`h-4 w-20 rounded shimmer ${
                            isDark ? "bg-slate-700" : "bg-slate-200"
                        }`}
                    />

                    <div
                        className={`h-3 w-14 rounded shimmer ${
                            isDark ? "bg-slate-700" : "bg-slate-200"
                        }`}
                    />
                </div>
            </td>

            {/* Status */}
            <td className="px-4 py-4 text-center">
                <div className="flex justify-center">
                    <div
                        className={`h-8 w-28 rounded-full shimmer ${
                            isDark ? "bg-slate-700" : "bg-slate-200"
                        }`}
                    />
                </div>
            </td>
        </tr>
    );
};

export default OrderSkeleton;