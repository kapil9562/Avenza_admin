import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { FiX } from 'react-icons/fi';
import { getActiveBadge, normalizeGooglePhoto } from '../utils/format';
import { GoDotFill } from 'react-icons/go';
import Lottie from 'lottie-react';
import loader from "../assets/loader2.json"
import { LuPencilLine } from 'react-icons/lu';
import { updateCustomerStatus } from '../api/api';
import { toast } from '../context/ToastContext';
import { useCustomers } from '../context/CustomerContext';

function UpdateCustomerStatusModal({ currUser, statusModal, setStatusModal, pageNo }) {
    const { isDark } = useTheme();
    const [selectedStatus, setSelectedStatus] = useState(currUser?.isActive);
    const [loading, setLoading] = useState(false);
    const { setCache } = useCustomers();

    const statusOptions = [
        {
            label: "Active",
            value: true,
            desc: "This customer account is active and can access the platform.",
            classes: isDark
                ? "border-green-800 bg-green-900/10 hover:bg-green-900/20"
                : "border-green-300 bg-green-50 hover:bg-green-100",
            activeBorder: "border-emerald-500",
            activeDot: "bg-emerald-500",
        },
        {
            label: "Blocked",
            value: false,
            desc: "This customer account is blocked and access is restricted.",
            classes: isDark
                ? "border-red-800 bg-red-900/10 hover:bg-red-900/20"
                : "border-red-300 bg-red-50 hover:bg-red-100",
            activeBorder: "border-red-500",
            activeDot: "bg-red-500",
        },
    ];

    const updateStatus = async () => {
        if (!currUser || selectedStatus === currUser?.isActive || typeof selectedStatus !== "boolean") return;

        try {
            setLoading(true);
            const res = await updateCustomerStatus({ status: selectedStatus, userId: currUser?._id });
            const newUserData = res?.data?.user;

            setCache(prev => {
                const updated = { ...prev };

                const userIndex = updated[pageNo].findIndex(user => user._id === newUserData?._id);

                updated[pageNo] = [...updated[pageNo]];
                updated[pageNo][userIndex] = {
                    ...updated[pageNo][userIndex],
                    ...newUserData
                };

                return updated;
            });

            toast.success(res?.data?.message);
            setStatusModal(false);
        } catch (error) {
            console.log(error);
            const msg = error?.response?.data?.message || error?.data?.message || "Failed to update role!";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-999 bg-black/40 flex items-center justify-center p-3 md:p-6 nunitoFont">
            <div className={`w-full max-w-xl rounded-xl shadow-2xl overflow-hidden zoom-modal ${isDark ? "bg-slate-900" : "bg-white"}`}>
                {/* Header */}
                <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? "border-slate-800" : "border-gray-200"}`}>

                    <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                        Update Status
                    </h2>

                    <button
                        onClick={() => setStatusModal(false)}
                        className={`p-2 rounded-xl transition ${isDark
                            ? "hover:bg-slate-800 text-gray-400"
                            : "hover:bg-gray-100 text-gray-500"
                            }`}
                    >
                        <FiX size={22} />
                    </button>
                </div>

                {/* Body */}
                <div className='px-4 py-3 space-y-4'>
                    <div className={`flex flex-row gap-4 items-center border-b pb-4 ${isDark ? "border-slate-800" : "border-gray-200"}`}>
                        <img
                            src={normalizeGooglePhoto(currUser?.avatar) || (isDark ? "/user.png" : "/userLight.png")}
                            referrerPolicy="no-referrer"
                            alt="profile photo"
                            className='h-15 w-15 rounded-full'
                        />
                        <div className='flex flex-col justify-center font-semibold'>
                            <h2 className={`${isDark ? "text-gray-200" : "text-gray-800"}`}>{currUser?.name}</h2>
                            <span className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>ID: #{currUser?._id}</span>
                            <span className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>Email: {currUser?.email}</span>
                        </div>
                    </div>

                    <div className='flex flex-row items-center gap-4'>
                        <h3 className={`${isDark ? "text-gray-200" : "text-gray-800"} font-bold`}>Current Status</h3>
                        <div className={`flex  items-center gap-1 px-2 font-bold text-sm py-0.5 rounded-full whitespace-nowrap ${getActiveBadge(currUser?.isActive ? "true" : "false")}`}>
                            <GoDotFill size={10} />
                            <span>{currUser?.isActive ? "Active" : "Inactive"}</span>
                        </div>
                    </div>

                    <div>
                        <h3 className={`${isDark ? "text-gray-200" : "text-gray-800"} font-bold mb-1`}>
                            Update Status
                        </h3>

                        <div className="space-y-3">
                            {statusOptions.map((status) => (
                                <label
                                    key={status.label}
                                    className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition ${status.classes}`}
                                >
                                    {/* Hidden Radio */}
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={selectedStatus === status.value}
                                        onChange={() => setSelectedStatus(status.value)}
                                        className="hidden"
                                    />

                                    {/* Custom Radio */}
                                    <div className={`mt-0.5 min-w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${status.activeBorder}`}>
                                        {selectedStatus === status.value && (
                                            <div className={`w-2.5 h-2.5 rounded-full ${status.activeDot}`} />
                                        )}
                                    </div>

                                    <div>
                                        <p className={`font-bold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                                            {status.label}
                                        </p>

                                        <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                            {status.desc}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={`flex justify-end gap-3 pt-3 border-t ${isDark ? "border-slate-800" : "border-gray-200"}`}>
                        <button
                            disabled={loading}
                            onClick={() => setStatusModal(false)}
                            className={`py-2 px-4 rounded-lg font-medium transition-all ${isDark
                                ? "hover:bg-white/10 text-gray-300"
                                : "hover:bg-gray-100 text-gray-700"
                                }`}
                        >
                            Cancel
                        </button>

                        <button
                            disabled={loading}
                            className={"relative py-2 px-4 h-10 w-28 flex justify-center items-center overflow-hidden rounded-lg bg-linear-to-b from-purple-400 to-purple-600 text-white font-semibold gap-2 will-change-transform active:scale-95 transition-all hover:brightness-90"}
                            onClick={updateStatus}
                        >
                            {loading ? (
                                <Lottie
                                    animationData={loader}
                                    className="w-40 h-40 absolute invert brightness-0"
                                />
                            ) : (
                                <>
                                    <LuPencilLine className="text-lg" />
                                    <span>Update</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UpdateCustomerStatusModal