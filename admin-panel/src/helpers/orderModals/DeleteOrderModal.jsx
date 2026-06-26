import React, { useState } from "react";
import { MdDeleteOutline } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { useOrders, useTheme, useToast } from "../../context/Context";
import { GoDotFill } from "react-icons/go";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoWarningOutline } from "react-icons/io5";
import { deleteOrder } from "../../api/api";
import { formatDate, formatStatus, formatTime, normalizeGooglePhoto, statusColors } from "../../utils/format";

function DeleteOrderModal({ order, setDeleteModal }) {

    const { isDark } = useTheme();
    const [loading, setLoading] = useState(false);
    const { setCache } = useOrders();
    const toast = useToast();

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
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">

            <div
                className={`
                    w-full max-w-3xl rounded-xl overflow-hidden zoom-modal transform-gpu will-change-transform
                    ${isDark
                        ? "bg-[#0F172A] shadow-black/50 shadow-xl text-gray-200"
                        : "bg-white shadow-[0_10px_60px_rgba(0,0,0,0.15)] text-gray-800"
                    }
                `}
            >

                {/* Header */}
                <div className={`flex items-center justify-between md:p-6 p-4 border-b-2 ${isDark ? "border-slate-800" : "border-slate-100"}`}>

                    <div className="flex items-center gap-4">

                        <div className={`p-4 rounded-xl flex items-center justify-center text-xl ${isDark ? "bg-red-600/10  text-red-600" : "bg-red-100  text-red-600"}`}>
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
                <div className="">

                    <div className="md:p-6 p-4">
                        <div
                            className={`
                            rounded-2xl border overflow-hidden
                            ${isDark
                                    ? "bg-slate-800/40 border-gray-700"
                                    : "bg-gray-50 border-gray-200"
                                }
                        `}
                        >

                            <div className="flex flex-col justify-between">

                                {/* Customer */}
                                <div className={`w-full flex justify-between px-5 py-3 ${isDark ? " bg-slate-800 text-gray-100" : "bg-gray-200"}`}>
                                    <div className="flex items-center gap-3 shrink-0">

                                        <img
                                            src={normalizeGooglePhoto(order?.user?.avatar) || (isDark ? "/user.png" : "/userLight.png")}
                                            alt="customer"
                                            className="w-12 h-12 rounded-full object-cover"
                                        />

                                        <div className="w-fit">
                                            <h3 className="font-semibold text-lg">
                                                {order?.user?.name}
                                            </h3>

                                            <p
                                                className={`text-sm font-semibold ${isDark
                                                    ? "text-gray-400"
                                                    : "text-gray-500"
                                                    }`}
                                            >
                                                {order?.user?.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className={`text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>{formatDate(order?.createdAt)}</span>
                                        <span className={`text-sm font-semibold ${isDark ? "text-gray-400" : "text-gray-600"}`}>{formatTime(order?.createdAt)}</span>
                                    </div>
                                </div>

                                <div className="overflow-auto tableBody scroll-smooth md:p-5 p-3">
                                    <table >
                                        <thead>
                                            <tr className="text-left leading-none">
                                                <th className={`px-2 py-1 leading-none w-[5%] font-semibold whitespace-nowrap ${isDark ? "text-gray-400" : "text-gray-600"}`}>Order ID</th>
                                                <th className={`px-2 py-1 leading-none w-[5%] font-semibold whitespace-nowrap ${isDark ? "text-gray-400" : "text-gray-600"}`}>Total Items</th>
                                                <th className={`px-2 py-1 leading-none w-[5%] font-semibold whitespace-nowrap ${isDark ? "text-gray-400" : "text-gray-600"}`}>Total Amount</th>
                                                <th className={`px-2 py-1 leading-none w-[5%] font-semibold whitespace-nowrap ${isDark ? "text-gray-400" : "text-gray-600"}`}>Status</th>
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

                                                {/* Total Item */}
                                                <td className={`px-2 py-1 leading-none`}>
                                                    <h3 className="font-semibold">
                                                        {order?.orderItems?.length} {order?.orderItems?.length <= 1 ? "item" : "items"}
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
                        </div>

                        {/* Warning Box */}
                        <div
                            className={`
                            md:mt-6 mt-4 rounded-2xl border p-2 px-5 text-sm
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
                    </div>

                    {/* Footer */}
                    <div className={`flex items-center justify-end py-3 md:py-4 px-4 gap-2 border-t-2 ${isDark ? "bg-slate-900 border-t-slate-800" : "bg-white border-t-slate-100"}`}>

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