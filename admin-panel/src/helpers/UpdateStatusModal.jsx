import React, { useEffect, useState } from "react";
import {
    FiX,
    FiRefreshCw,
    FiCheckCircle,
} from "react-icons/fi";
import {
    MdPending,
    MdOutlineLocalShipping,
    MdCancel,
} from "react-icons/md";
import { HiOutlineBellAlert } from "react-icons/hi2";
import { useTheme } from "../context/ThemeContext";
import { updateStatus } from "../api/api";
import { toast } from "../context/ToastContext";
import { GoDotFill } from "react-icons/go";
import { FaShippingFast } from "react-icons/fa";

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

const statusColors = {
    processing: "text-yellow-600 bg-yellow-600/10 border border-yellow-400",
    shipped: "text-blue-600 bg-blue-600/10 border border-blue-400",
    out_for_delivery: "text-pink-600 bg-pink-600/10 border border-pink-400",
    delivered: "text-green-600 bg-green-600/10 border border-green-400",
    cancelled: "text-red-600 bg-red-600/10 border border-red-400",
};

export default function UpdateStatusModal({ setShowUpdateStatusModal, orderId, setOrderId, setCache, currentStatus, formatStatus }) {
    const [selected, setSelected] = useState(currentStatus);
    const { isDark } = useTheme();

    useEffect(() => {
        setSelected(currentStatus);
    }, [currentStatus]);

    const updateOrderStatus = async () => {
        if (currentStatus === selected) return;
        try {
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
        }
    }

    return (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/40 p-4">
            <div className={`w-full max-w-4xl rounded-xl overflow-hidden ${isDark ? "bg-[#0F172A] border-gray-800 shadow-black/50 shadow-xl" : "bg-white border-gray-200 shadow-[0_10px_60px_rgba(0,0,0,0.15)]"}`}>

                {/* Header */}
                <div className="flex items-start justify-between px-8 pt-8">
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${isDark ? "bg-purple-600/10  text-purple-600" : "bg-purple-100  text-purple-600"}`}>
                            <FiRefreshCw />
                        </div>

                        <div>
                            <h2 className={`text-xl font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                                Update Order Status
                            </h2>

                            <p className={`mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                Update the current status of order{" "}
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
                <div className="px-8 py-7 space-y-6">

                    {/* Alert */}
                    <div className={`w-full rounded-xl border px-4 py-3 flex items-center gap-3 ${isDark ? "bg-purple-600/10 border-purple-700" : "bg-purple-50 border-purple-100"}`}>
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

                        <div className={`px-2 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-500 font-semibold flex items-center gap-2 text-sm ${statusColors[currentStatus]}`}>
                            <span>
                                <GoDotFill size={15} />
                            </span>
                            {formatStatus(currentStatus?.charAt(0).toUpperCase() + currentStatus?.slice(1))}
                        </div>
                    </div>

                    {/* Select Status */}
                    <div>
                        <h3 className={`text-lg font-semibold ${isDark? "text-slate-200" : "text-slate-800"}`}>
                            Select New Status
                        </h3>

                        <p className={`text-sm font-medium ${isDark? "text-gray-400" : "text-gray-500"}`}>
                            Choose the new status for this order
                        </p>

                        <div className="grid grid-cols-5 gap-5 mt-6">
                            {statuses.map((item) => {
                                const isActive = selected === item.id;
                                const styles = colorClasses[item.color];

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setSelected(item.id)}
                                        className={`rounded-xl border py-4 px-2 gap-2 cursor-pointer text-left transition-all duration-300 flex flex-col items-center ${isActive ? `ring-2 ${styles.ring} border-transparent shadow-lg -translate-y-1` : isDark? "border-slate-700 hover:border-slate-400" : "border-gray-200 hover:border-gray-400"} hover:-translate-y-1`}
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

                                        <p className={`text-sm font-medium text-center ${isDark? "text-gray-400" : "text-gray-500"}`}>
                                            {item.desc}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom Alert */}
                    <div className={`border rounded-xl px-4 py-3 flex items-center gap-3 ${isDark? "bg-blue-600/10 border-blue-700" : "bg-blue-50 border-blue-100"}`}>
                        <div className="text-blue-500 text-xl">
                            <HiOutlineBellAlert />
                        </div>

                        <p className="text-blue-600 font-medium text-[16px]">
                            Customer will be notified automatically about this status update.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2">
                        <button className={`px-4 py-3 cursor-pointer hover:text-purple-600 ${isDark? "text-gray-300" : "text-gray-600"}`} onClick={() => setShowUpdateStatusModal(false)}>
                            Cancel
                        </button>

                        <button className={`px-4 py-3 text-sm bg-linear-to-b flex flex-row justify-center rounded-lg font-semibold items-center gap-2 cursor-pointer active:scale-95 transition-all duration-300 text-white ${isDark ? "shadow-[0px_3px_8px_rgba(0,0,0,1)] from-purple-500 to-purple-700" : "shadow-[0px_3px_8px_rgba(0,0,0,0.24)] from-purple-300 to-purple-500"} hover:brightness-110`}
                            onClick={updateOrderStatus}>
                            Update Status
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}