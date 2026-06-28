import React, { useEffect, useState } from "react";
import {
    FiX,
    FiRefreshCw,
    FiCheckCircle,
} from "react-icons/fi";
import {
    MdOutlineLocalShipping,
    MdCancel,
} from "react-icons/md";
import { HiOutlineBellAlert } from "react-icons/hi2";
import { useTheme, useToast } from "../../context/Context";
import { updateStatus } from "../../api/api";
import { GoDotFill } from "react-icons/go";
import { FaShippingFast } from "react-icons/fa";
import Lottie from "lottie-react";
import loader from "../../assets/loader2.json";
import { formatStatus, statusColors } from "../../utils/format";

const statuses = [
    {
        id: "processing",
        title: "Processing",
        desc: "Order is being processed",
        icon: <FiRefreshCw />,
        color: "orange",
    },
    {
        id: "shipped",
        title: "Shipped",
        desc: "Order has been shipped",
        icon: <MdOutlineLocalShipping />,
        color: "purple",
    },
    {
        id: "out_for_delivery",
        title: "Out For Delivery",
        desc: "Order is out for delivery",
        icon: <FaShippingFast />,
        color: "pink",
    },
    {
        id: "delivered",
        title: "Delivered",
        desc: "Order has been delivered",
        icon: <FiCheckCircle />,
        color: "green",
    },
    {
        id: "cancelled",
        title: "Cancelled",
        desc: "Order has been cancelled",
        icon: <MdCancel />,
        color: "red",
    },
];

const colorClasses = {
    orange: {
        border: "border-orange-200",
        bg: "bg-orange-600/10",
        text: "text-orange-500",
        ring: "ring-orange-500",
    },
    pink: {
        border: "border-pink-200",
        bg: "bg-pink-600/10",
        text: "text-pink-500",
        ring: "ring-pink-500",
    },
    purple: {
        border: "border-violet-200",
        bg: "bg-violet-600/10",
        text: "text-violet-500",
        ring: "ring-violet-500",
    },
    green: {
        border: "border-green-200",
        bg: "bg-green-600/10",
        text: "text-green-500",
        ring: "ring-green-500",
    },
    red: {
        border: "border-red-200",
        bg: "bg-red-600/10",
        text: "text-red-500",
        ring: "ring-red-500",
    },
};

export default function UpdateStatusModal({ setShowUpdateStatusModal, orderId, setOrderId, setCache, currentStatus }) {
    const [selected, setSelected] = useState(currentStatus);
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    useEffect(() => {
        setSelected(currentStatus);
    }, [currentStatus]);

    const updateOrderStatus = async () => {
        if (currentStatus?.trim() === selected?.trim()) {
            toast.warn("Make changes first!");
            return;
        };
        try {
            setLoading(true);
            const res = await updateStatus({ status: selected, orderId });
            if (res?.data?.success) {
                toast.success(res?.data?.message);

                await setCache((prev) => {
                    const updatedCache = { ...prev };

                    Object.keys(updatedCache).forEach((key) => {
                        updatedCache[key] = updatedCache[key].map((order) =>
                            order.orderId === orderId
                                ? {
                                    ...order,
                                    orderStatus: selected,
                                }
                                : order
                        );
                    });

                    return updatedCache;
                });

                setShowUpdateStatusModal(false);
                setOrderId("");
            }
        } catch (error) {
            const msg = error?.response?.data?.message || error?.message || "Something went wrong!"
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">

            <div className="overflow-hidden h-fit w-fit rounded-xl">
                <div className={`w-full relative max-w-4xl rounded-xl ${isDark ? "bg-[#0F172A] shadow-black/50 shadow-xl" : "bg-white shadow-[0_10px_60px_rgba(0,0,0,0.15)]"} zoom-modal transform-gpu will-change-transform`}>
                    {loading && (
                        <div className="absolute top-0 left-0 w-full overflow-hidden rounded-t-3xl z-10">
                            <div className={`h-1 w-full ${isDark ? "bg-slate-800" : "bg-gray-300"}`}>
                                <div className="loading-line h-full w-1/3 bg-linear-to-r from-violet-500 via-fuchsia-500 to-violet-500"></div>
                            </div>
                        </div>
                    )}

                    <div className={`${loading && (isDark ? "brightness-70 pointer-events-none" : "opacity-60 bg-gray-100 pointer-events-none")}`}>

                        {/* Header */}
                        <div className={`flex items-center justify-between md:p-6 p-4 sticky top-0 border-b-2 ${isDark? "bg-slate-900 border-b-slate-800" : "bg-white border-b-slate-100"}`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-xl flex items-center justify-center text-xl ${isDark ? "bg-purple-600/10  text-purple-600" : "bg-purple-100  text-purple-600"}`}>
                                    <FiRefreshCw />
                                </div>

                                <div>
                                    <h2 className={`text-xl font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                                        Update Order Status
                                    </h2>

                                    <p className={`mt-1 flex gap-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                        <span className="hidden md:block">Update the current status of order</span>
                                        <span className="font-semibold text-purple-600">
                                            #{orderId}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <button className={`transition cursor-pointer ${isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-400 hover:text-black"}`} onClick={() => setShowUpdateStatusModal(false)}>
                                <FiX size={30} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="md:p-6 p-4 md:space-y-6 space-y-4  h-fit max-h-[70dvh] overflow-y-auto">

                            {/* Alert */}
                            <div className={`w-full hidden rounded-xl border px-4 py-3 md:flex items-center gap-3 ${isDark ? "bg-purple-600/10 border-purple-700" : "bg-purple-50 border-purple-100"}`}>
                                <div className="w-5 h-5 rounded-full bg-purple-600 p-2 text-sm text-white flex items-center justify-center">
                                    i
                                </div>

                                <p className={`text-purple-600 font-medium text-[16px] `}>
                                    Changing the status will update the order timeline and notify the
                                    customer.
                                </p>
                            </div>

                            {/* Current Status */}
                            <div className={`border rounded-xl px-4 py-2 flex items-center justify-between ${isDark ? "border-slate-700 text-slate-300" : "border-gray-200 text-slate-700"}`}>
                                <h3 className="text-lg font-semibold">
                                    Current Status
                                </h3>

                                <div className={`px-2 py-1 rounded-full border font-semibold flex items-center gap-2 text-sm ${statusColors[currentStatus]}`}>
                                    <span>
                                        <GoDotFill size={15} />
                                    </span>
                                    {formatStatus(currentStatus?.charAt(0).toUpperCase() + currentStatus?.slice(1))}
                                </div>
                            </div>

                            {/* Select Status */}
                            <div>
                                <h3 className={`text-lg font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                                    Select New Status
                                </h3>

                                <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                    Choose the new status for this order
                                </p>

                                <div className="grid md:grid-cols-4 lg:grid-cols-5 grid-cols-2 gap-3 md:gap-5 mt-4 md:mt-6">
                                    {statuses.map((item) => {
                                        const isActive = selected === item.id;
                                        const styles = colorClasses[item.color];

                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setSelected(item.id)}
                                                className={`rounded-xl border py-4 px-2 gap-2 cursor-pointer text-left transition-all duration-300 flex flex-col items-center ${isActive ? `ring-2 ${styles.ring} border-transparent shadow-lg -translate-y-1` : isDark ? "border-slate-700 hover:border-slate-400" : "border-gray-200 hover:border-gray-400"} hover:-translate-y-1`}
                                            >
                                                <div className="flex gap-2 items-center">
                                                    <div
                                                        className={`min-w-8 min-h-8 rounded-full flex items-center justify-center text-xl ${styles.bg} ${styles.text}`}
                                                    >
                                                        {item.icon}
                                                    </div>

                                                    <h4
                                                        className={`text-lg font-semibold leading-6 ${styles.text}`}
                                                    >
                                                        {item.title}
                                                    </h4>
                                                </div>

                                                <p className={`text-sm font-medium text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                                    {item.desc}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Bottom Alert */}
                            <div className={`border rounded-xl px-4 py-3 flex items-center gap-3 ${isDark ? "bg-blue-600/10 border-blue-700" : "bg-blue-50 border-blue-100"}`}>
                                <div className="text-blue-500 text-xl">
                                    <HiOutlineBellAlert />
                                </div>

                                <p className="text-blue-600 font-medium text-[16px]">
                                    Customer will be notified automatically about this status update.
                                </p>
                            </div>

                        </div>
                    </div>
                    {/* Footer */}
                    <div className={`flex justify-end gap-2 sticky bottom-0 py-2 px-4 border-t-2 md:py-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                        <button
                            className={`px-4 py-3 cursor-pointer hover:text-purple-600 disabled:cursor-not-allowed ${isDark ? "text-gray-300" : "text-gray-600"}`}
                            onClick={() => setShowUpdateStatusModal(false)}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            className={`px-4 py-3 text-sm bg-linear-to-b flex flex-row justify-center rounded-lg font-semibold items-center gap-2 cursor-pointer active:scale-95 transition-all duration-300 text-white ${isDark ? "shadow-[0px_3px_8px_rgba(0,0,0,1)] from-purple-500 to-purple-700" : "shadow-[0px_3px_8px_rgba(0,0,0,0.24)] from-purple-300 to-purple-500"} hover:brightness-110 min-h-12 min-w-30.5 disabled:brightness-90 disabled:cursor-not-allowed`}
                            onClick={updateOrderStatus}
                            disabled={loading}
                        >
                            {loading ? <Lottie
                                animationData={loader}
                                loop={true}
                                className="w-50 h-50 absolute invert brightness-0"
                            /> : "Update Status"
                            }
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}