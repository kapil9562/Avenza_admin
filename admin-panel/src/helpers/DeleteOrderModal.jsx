import React, { useState } from "react";
import { MdDeleteOutline } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { useTheme } from "../context/ThemeContext";
import { GoDotFill } from "react-icons/go";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoWarningOutline } from "react-icons/io5";
import { deleteOrder } from "../api/api";
import { toast } from "../context/ToastContext";
import { useOrders } from "../context/OrderContext";

function DeleteOrderModal({ order, setDeleteModal }) {

    const { isDark } = useTheme();
    const [loading, setLoading] = useState(false);
    const { setCache } = useOrders();

    const normalizeGooglePhoto = (url) => {
        if (!url) return null;
        const base = url.split("=")[0];
        return `${base}=s200`;
    };

    const statusColors = {
        processing: "text-yellow-600 bg-yellow-600/10 border border-yellow-400",
        shipped: "text-blue-600 bg-blue-600/10 border border-blue-400",
        out_for_delivery: "text-pink-600 bg-pink-600/10 border border-pink-400",
        delivered: "text-green-600 bg-green-600/10 border border-green-400",
        cancelled: "text-red-600 bg-red-600/10 border border-red-400",
    };

    const formatStatus = (status) => {
        return status
            .replaceAll("_", " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const deleteThisOrder = async () => {
        try {
            setLoading(true);
            const res = await deleteOrder({ orderId: order?.orderId });
            if (res?.data?.success) {
                toast.success(res?.data?.message);
                setDeleteModal(false);
                await setCache((prev) => {
                    const updatedCache = { ...prev };

                    Object.keys(updatedCache).forEach((key) => {
                        updatedCache[key] = updatedCache[key].filter(
                            (o) => o?.orderId !== order?.orderId
                        );
                    });

                    return updatedCache;
                });
            }
        } catch (error) {
            const msg = error?.response?.data?.message || error?.message || "Something went wrong!"
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/40 p-4">

            <div
                className={`
                    w-full max-w-3xl rounded-xl border shadow-2xl overflow-hidden zoom-modal transform-gpu will-change-transform
                    ${isDark
                        ? "bg-[#111827] border-gray-800 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }
                `}
            >

                {/* Header */}
                <div className={`flex items-start justify-between p-6 border-b ${isDark? "border-gray-800" : "border-gray-200"}`}>

                    <div className="flex items-center gap-4">

                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${isDark ? "bg-red-600/10  text-red-600" : "bg-red-100  text-red-600"}`}>
                            <RiDeleteBin6Line />
                        </div>

                        <div>
                            <h2 className={`text-xl font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                                Delete Order
                            </h2>

                            <p
                                className={`font-semibold ${isDark ? "text-gray-400" : "text-gray-500"}`}
                            >
                                Are you sure you want to delete this order?
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setDeleteModal(false)}
                        className={`
                            w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer
                            ${isDark
                                ? "hover:bg-gray-800"
                                : "hover:bg-gray-100"
                            }
                        `}
                    >
                        <IoClose className="text-2xl" />
                    </button>
                </div>

                {/* Order Info */}
                <div className="p-6">

                    <div
                        className={`
                            rounded-2xl border p-5
                            ${isDark
                                ? "bg-slate-800/40 border-gray-700"
                                : "bg-gray-50 border-gray-200"
                            }
                        `}
                    >

                        <div className="flex md:flex-row flex-col justify-between gap-6">

                            {/* Customer */}
                            <div className="flex items-center gap-3">

                                <img
                                    src={normalizeGooglePhoto(order?.userId?.avatar) || (isDark ? "/user.png" : "/userLight.png")}
                                    alt="customer"
                                    className="w-12 h-12 rounded-full object-cover"
                                />

                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {order?.userId?.name}
                                    </h3>

                                    <p
                                        className={`text-sm font-semibold ${isDark
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                            }`}
                                    >
                                        {order?.userId?.email}
                                    </p>
                                </div>
                            </div>

                            <table>
                                <thead>
                                    <tr className="text-left leading-none">
                                        <th className={`px-2 leading-none w-[5%] font-semibold whitespace-nowrap ${isDark ? "" : "text-gray-600"}`}>Order ID</th>
                                        <th className={`px-2 leading-none w-[5%] font-semibold whitespace-nowrap ${isDark ? "" : "text-gray-600"}`}>Total Amount</th>
                                        <th className={`px-2 leading-none w-[5%] font-semibold whitespace-nowrap ${isDark ? "" : "text-gray-600"}`}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>

                                        {/* Order ID */}
                                        <td className={`px-2 py-1 leading-none`}>
                                            <h3 className="font-semibold">
                                                #{order?.orderId}
                                            </h3>
                                        </td>

                                        {/* Amount */}
                                        <td className={`px-2 py-1 leading-none`}>
                                            <h3 className="font-semibold text-lg">
                                                ₹{order?.totalAmount?.toLocaleString("en-IN")}
                                            </h3>
                                        </td>

                                        {/* Status */}
                                        <td className={`px-2 py-1 leading-none`}>
                                            <div className={`flex flex-row w-fit font-semibold items-center gap-1 px-2 py-1 text-sm rounded-full whitespace-nowrap ${statusColors[order?.orderStatus.replace(/\s/g, "")]}`}>
                                                <span>
                                                    <GoDotFill size={10} />
                                                </span>
                                                <span>
                                                    {formatStatus(order?.orderStatus?.charAt(0).toUpperCase() + order?.orderStatus.slice(1))}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Warning Box */}
                    <div
                        className={`
                            mt-6 rounded-2xl border p-5
                            ${isDark
                                ? "bg-red-500/10 border-red-500/30"
                                : "bg-red-50 border-red-200"
                            }
                        `}
                    >

                        <div className="flex gap-3 items-center">

                            <div className="text-red-600 text-2xl flex items-center justify-center">
                                <IoWarningOutline />
                            </div>

                            <div>
                                <p
                                    className={`font-semibold text-red-600`}
                                >
                                    This action cannot be undone. All order
                                    details, items,
                                    and related data will be permanently deleted
                                    from the system.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 mt-6">

                        <button
                            className={`px-4 py-3 cursor-pointer hover:text-red-600 disabled:cursor-not-allowed ${isDark ? "text-gray-300" : "text-gray-600"}`}
                            onClick={() => setDeleteModal(false)}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            className={`px-4 py-3 text-sm bg-linear-to-b flex flex-row justify-center rounded-lg font-semibold items-center gap-2 cursor-pointer active:scale-95 transform-gpu will-change-transform transition-all duration-300 text-white ${isDark ? "shadow-[0px_3px_8px_rgba(0,0,0,1)] from-red-500 to-red-700" : "shadow-[0px_3px_8px_rgba(0,0,0,0.24)] from-red-300 to-red-500"} hover:brightness-110 min-h-12 min-w-30.5 disabled:brightness-90 disabled:cursor-not-allowed`}
                            onClick={deleteThisOrder}
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "Delete Order"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeleteOrderModal;