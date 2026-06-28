import {
    FiX,
    FiUsers,
    FiShoppingBag,
    FiPackage,
    FiTruck,
    FiBarChart2,
    FiSettings,
} from "react-icons/fi";
import { useCustomers, useTheme, useToast } from "../../context/Context";
import { LuPencilLine } from "react-icons/lu";
import { TbFileTextSpark, TbUserShield } from "react-icons/tb";
import { formatRole, getRoleDescription } from "../../utils/format";
import { IoIosArrowDown } from "react-icons/io";
import { useState } from "react";
import { updateUserRole } from "../../api/api";
import Lottie from 'lottie-react';
import loader from "../../assets/loader2.json"

const permissions = [
    {
        title: "User Management",
        icon: FiUsers,
        permissions: [
            "View Users",
            "Create Users",
            "Edit Users",
            "Delete Users",
        ],
    },
    {
        title: "Orders",
        icon: FiShoppingBag,
        permissions: [
            "View Orders",
            "Update Orders",
            "Cancel Orders",
            "Refund Orders",
        ],
    },
    {
        title: "Products",
        icon: FiPackage,
        permissions: [
            "View Products",
            "Create Products",
            "Edit Products",
            "Delete Products",
        ],
    },
    {
        title: "Shipping",
        icon: FiTruck,
        permissions: [
            "View Shipments",
            "Update Shipment Status",
            "Create Labels",
            "Manage Carriers",
        ],
    },
    {
        title: "Reports",
        icon: FiBarChart2,
        permissions: [
            "View Reports",
            "Export Reports",
            "Sales Analytics",
            "Customer Analytics",
        ],
    },
    {
        title: "Settings",
        icon: FiSettings,
        permissions: [
            "General Settings",
            "Payment Settings",
            "Email Settings",
            "Security Settings",
        ],
    },
];

const roles = ["super_admin", "admin", "user", "demo"];

export const EditRoleModal = ({ editModal, setEditModal, currUser, pageNo }) => {

    const { isDark } = useTheme();
    const [openRoleDropDown, setOpenRoleDropDown] = useState(false);
    const [selectedRole, setSelectedRole] = useState(currUser?.role || "");
    const [loading, setLoading] = useState(false);
    const { setCache } = useCustomers();
    const toast = useToast();

    const roleHandler = (role) => {
        setSelectedRole(role);
        setOpenRoleDropDown(false);
    }

    const updateRole = async () => {
        if (!selectedRole || !currUser || selectedRole === currUser?.role) return;

        try {
            setLoading(true);
            const res = await updateUserRole({ role: selectedRole, userId: currUser?._id });
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
            setEditModal(false);
        } catch (error) {
            const msg = error?.response?.data?.message || error?.data?.message || "Failed to update role!";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-999 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-3 md:p-6">
            <div className={`w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden zoom-modal ${isDark ? "bg-slate-900" : "bg-white"}`}>

                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-slate-800" : "border-gray-200"}`}>
                    <div>
                        <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                            Edit Role
                        </h2>

                        <p className={`text-sm mt-1 font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            Update role details & permission settings.
                        </p>
                    </div>

                    <button
                        onClick={() => setEditModal(false)}
                        className={`p-2 rounded-xl transition ${isDark
                            ? "hover:bg-slate-800 text-gray-400"
                            : "hover:bg-gray-100 text-gray-500"
                            }`}
                    >
                        <FiX size={22} />
                    </button>
                </div>

                {/* Body */}
                <div className="max-h-[70vh] overflow-y-auto px-6 py-4 space-y-4">
                    {/* Role Information */}
                    <div>
                        <div className="space-y-2">
                            <label className={`text-sm font-semibold mb-2 block ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                                Role Name
                            </label>

                            <div className={`w-full relative flex flex-row gap-4 px-2 py-2 rounded-lg border items-center cursor-pointer ${isDark
                                ? "bg-slate-800 border-slate-700 text-white focus:border-purple-500"
                                : "bg-white border-gray-300 focus:border-purple-500"
                                }`}
                                onClick={() => setOpenRoleDropDown((prev) => !prev)}
                            >
                                <div>
                                    <TbUserShield size={20} className="text-purple-600" />
                                </div>
                                <span>{formatRole(selectedRole)}</span>

                                <div className={`absolute right-2 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                                    <IoIosArrowDown />
                                </div>

                                {openRoleDropDown &&
                                    <div className={`${isDark ? "bg-slate-800 border-gray-700 shadow" : "bg-[#FFFFFF] border-gray-200 shadow"} border w-full rounded-md overflow-hidden absolute top-full mt-0.5 left-0 flex flex-col`}>
                                        {roles?.map((role, idx) => (
                                            <span
                                                key={idx}
                                                className={`py-1 px-4 ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    roleHandler(role);
                                                }}
                                            >
                                                {formatRole(role)}
                                            </span>
                                        ))}
                                    </div>
                                }
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mt-5 space-y-2 w-full">
                            <label className={`text-sm font-semibold block ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                                Role Description
                            </label>

                            <div className={`min-w-full px-2 py-2 rounded-lg border flex flex-row gap-4 items-center ${isDark
                                ? "bg-slate-800 border-slate-700 text-white"
                                : "bg-white border-gray-300"
                                }`}>
                                <TbFileTextSpark size={20} className="text-purple-600" />
                                <span>{getRoleDescription(selectedRole)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Permissions */}
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                                Permissions
                            </h3>

                            <label className={`text-sm font-medium cursor-pointer flex items-center gap-2 ${isDark
                                ? "text-purple-400 hover:text-purple-300"
                                : "text-purple-600 hover:text-purple-700"
                                }`}>
                                <span>Select All</span>

                                <input
                                    type="checkbox"
                                    defaultChecked
                                    className="w-4 h-4 accent-purple-600 cursor-pointer ring-0 foring"
                                />
                            </label>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {permissions.map((section) => {
                                const Icon = section.icon;

                                return (
                                    <div
                                        key={section.title}
                                        className={`rounded-2xl border p-5 ${isDark
                                            ? "bg-slate-800/50 border-slate-700"
                                            : "bg-gray-50 border-gray-200"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className={`p-2 rounded-xl ${isDark
                                                ? "bg-purple-500/10 text-purple-400"
                                                : "bg-purple-100 text-purple-600"
                                                }`}>
                                                <Icon size={18} />
                                            </div>

                                            <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                                                {section.title}
                                            </h4>
                                        </div>

                                        <div className="space-y-3">
                                            {section.permissions.map((permission) => (
                                                <label
                                                    key={permission}
                                                    className="flex items-center gap-3 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        defaultChecked
                                                        className="w-4 h-4 accent-purple-600 cursor-pointer"
                                                    />

                                                    <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                                        {permission}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`border-t px-6 py-4 flex items-center justify-end gap-3 shrink-0 ${isDark ? "border-white/10" : "border-gray-200"}`}>
                    <button
                        disabled={loading}
                        onClick={() => setEditModal(false)}
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
                        onClick={updateRole}
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
    );
}