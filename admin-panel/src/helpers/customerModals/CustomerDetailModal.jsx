import React, { useEffect, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { FiX } from 'react-icons/fi';
import { formatAddress, formatDate, formatRole, formatTime, getActiveBadge, getRoleBadge, normalizeGooglePhoto } from '../../utils/format';
import { IoCalendarOutline, IoCartOutline, IoStatsChartOutline } from 'react-icons/io5';
import { GoDotFill } from 'react-icons/go';
import { RiShoppingBagLine } from 'react-icons/ri';
import { MdClearAll, MdCurrencyRupee, MdOutlineEmail, MdOutlineLocationOn, MdOutlinePhone } from 'react-icons/md';
import { LuSquareActivity } from 'react-icons/lu';
import { TiContacts } from "react-icons/ti";
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { getAddress, getOrdersById } from '../../api/api';
import { useCustomers } from '../../context/CustomerContext';
import { toast } from '../../context/ToastContext';

function CustomerDetailModal({ detailModal, setDetailModal, currUser, pageNo }) {

    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState("overview");
    const { ordersCache, setOrdersCache, addressCache, setAddressCache } = useCustomers();
    const cacheKey = `${currUser?._id}`;
    const ordersData = ordersCache[cacheKey];
    const address = addressCache[cacheKey];

    useEffect(() => {
        const fetchOrders = async () => {
            if (!currUser) return;
            try {
                const res = await getOrdersById({ userId: currUser?._id });
                setOrdersCache(prev => ({
                    ...prev,
                    [cacheKey]: res?.data
                }));
            } catch (err) {
                console.log(err);
            }
        }

        const fetchAddress = async () => {
            if (!currUser) return;
            try {
                const res = await getAddress({ userId: currUser?._id });
                setAddressCache(prev => ({
                    ...prev,
                    [cacheKey]: res?.data?.address
                }));
            } catch (err) {
                console.log(err);
            }
        }

        fetchOrders();
        fetchAddress();
    }, [currUser]);

    return (
        <div className="fixed inset-0 z-999 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-3 md:p-6 nunitoFont">
            <div className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden zoom-modal ${isDark ? "bg-slate-900" : "bg-white"}`}>
                {/* Header */}
                <div className={`flex items-center justify-between px-4 py-1 border-b ${isDark ? "border-slate-800" : "border-gray-200"}`}>

                    <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                        Customer Detail
                    </h2>

                    <button
                        onClick={() => setDetailModal(false)}
                        className={`p-2 rounded-xl transition ${isDark
                            ? "hover:bg-slate-800 text-gray-400"
                            : "hover:bg-gray-100 text-gray-500"
                            }`}
                    >
                        <FiX size={22} />
                    </button>
                </div>

                {/* Body */}
                <div className='px-4 py-3 space-y-2'>
                    <div className={`flex flex-row gap-4 items-center border-b pb-4 ${isDark ? "border-slate-800" : "border-gray-200"}`}>
                        <div className='relative h-fit w-fit'>
                            <img
                                src={normalizeGooglePhoto(currUser?.avatar) || (isDark ? "/user.png" : "/userLight.png")}
                                referrerPolicy="no-referrer"
                                alt="profile photo"
                                className='min-h-15 min-w-15 max-h-15 max-w-15 rounded-full'
                            />
                            <div className={`absolute right-0 bottom-0 border-2 p-1.5 rounded-full ${isDark ? "border-slate-900" : "border-white"} ${currUser?.isActive ? "bg-green-500" : "bg-red-500"}`} ></div>
                        </div>
                        <div className={`flex flex-col justify-center font-semibold text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            <h2 className={`${isDark ? "text-gray-200" : "text-gray-800"}`}>{currUser?.name}</h2>
                            <span>ID: #{currUser?._id}</span>
                            <div className="flex gap-1 items-center">
                                <IoCalendarOutline />
                                <span>Member since {formatDate(currUser?.createdAt)}</span>
                            </div>
                        </div>

                        <div className={`border-l-2 ${isDark ? "border-l-slate-700" : "border-l-slate-100"} px-4`}>
                            <RiShoppingBagLine size={30} className='bg-purple-600/10 text-purple-500 p-2 rounded-lg' />
                            <div className={`${isDark ? "text-gray-200" : "text-gray-800"} font-bold mt-2`}>{currUser?.ordersCount}</div>
                            <div className={`${isDark ? "text-gray-400" : "text-gray-500"} font-semibold text-sm`}>Orders</div>
                        </div>

                        <div className={`border-l-2 ${isDark ? "border-l-slate-700" : "border-l-slate-100"} px-4`}>
                            <MdCurrencyRupee size={30} className='bg-orange-600/10 text-orange-500 p-2 rounded-lg' />
                            <div className={`${isDark ? "text-gray-200" : "text-gray-800"} font-bold mt-2`}>₹{currUser?.totalSpent?.toLocaleString("en-IN")}</div>
                            <div className={`${isDark ? "text-gray-400" : "text-gray-500"} font-semibold text-sm`}>Total Spent</div>
                        </div>

                        <div className={`border-l-2 ${isDark ? "border-l-slate-700" : "border-l-slate-100"} px-4`}>
                            <IoCalendarOutline size={30} className='bg-blue-600/10 text-blue-500 p-1 rounded-lg' />
                            <div className={`${isDark ? "text-gray-200" : "text-gray-800"} font-bold mt-2`}>{Math.floor(
                                (Date.now() - new Date(currUser?.createdAt).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}</div>
                            <div className={`${isDark ? "text-gray-400" : "text-gray-500"} font-semibold text-sm whitespace-nowrap`}>Days as Customer</div>
                        </div>
                    </div>

                    <div className={`flex border-b-2 ${isDark ? "border-b-slate-700" : "border-b-slate-100"}`}>
                        {tabs?.map((tab, idx) => (
                            <button
                                className={`w-fit font-bold flex gap-1 text-sm items-center px-6 py-1 ${activeTab === tab?.value ? "text-purple-500 border-b-3 border-purple-500" : `border-b-3 border-transparent ${isDark ? "text-gray-400" : "text-gray-500"}`}`}
                                onClick={() => setActiveTab(tab?.value)}
                            >
                                {tab?.icon}
                                <span>{tab?.title} {tab?.value === "orders" && `(${currUser?.ordersCount > 99 ? "99+" : currUser?.ordersCount})`}</span>
                            </button>
                        ))}
                    </div>

                    <div>
                        {activeTab === "overview" && <Overview isDark={isDark} currUser={currUser} ordersData={ordersData} address={address} />}
                        {activeTab === "orders" && <Orders />}
                        {activeTab === "address" && <Address />}
                        {activeTab === "activityLog" && <ActivityLog />}
                    </div>
                </div>
            </div>
        </div>
    )
}

const tabs = [
    {
        title: "Overview",
        value: "overview",
        icon: <MdClearAll size={20} />
    },
    {
        title: "Orders",
        value: "orders",
        icon: <IoCartOutline size={20} />
    },
    {
        title: "Address",
        value: "address",
        icon: <MdOutlineLocationOn size={20} />
    },
    {
        title: "Activity Log",
        value: "activityLog",
        icon: <LuSquareActivity size={18} />
    },
]

const Overview = ({ isDark, currUser, ordersData, address }) => {
    return (
        <div className='grid grid-cols-2 grid-rows-2 gap-2'>

            {/* Contact information */}
            <div className={`shadow rounded-lg p-3 flex flex-col col-span-1 row-span-1 gap-2 ${isDark? "border-2 border-slate-800" : "shadow"}`}>
                <div className='flex gap-2 items-center'>
                    <TiContacts size={28} className='p-1 bg-purple-600/10 text-purple-500 rounded-md' />
                    <h2 className={`${isDark ? "text-[#FFFFFF]" : "text-gray-800"} font-bold`}>Contact information</h2>
                </div>
                <div className='space-y-2'>
                    <div className='flex flex-row justify-between items-center text-sm font-bold'>
                        <div className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                            <h2>Email</h2>
                            <span>{currUser?.email}</span>
                        </div>
                        <div><MdOutlineEmail size={24} className='p-1 bg-purple-600/10 text-purple-500 rounded-md' /></div>
                    </div>
                    <div className='flex flex-row justify-between items-center text-sm font-bold'>
                        <div className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                            <h2>Phone</h2>
                            <span>{address?.phone ? `+91 ${address?.phone}` : "-"}</span>
                        </div>
                        <div><MdOutlinePhone size={24} className='p-1 bg-purple-600/10 text-purple-500 rounded-md' /></div>
                    </div>
                    <div className='flex flex-row justify-between items-center text-sm font-bold'>
                        <div className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                            <h2>Joined On</h2>
                            <span>{formatDate(currUser?.createdAt)} {formatTime(currUser?.createdAt)}</span>
                        </div>
                        <div><IoCalendarOutline size={24} className='p-1 bg-purple-600/10 text-purple-500 rounded-md' /></div>
                    </div>
                </div>
            </div>

            {/* Customer Statistics */}
            <div className={`shadow rounded-lg p-3 flex flex-col col-span-1 row-span-1 gap-4 ${isDark? "border-2 border-slate-800" : "shadow"}`}>
                <div className='flex gap-2 items-center'>
                    <IoStatsChartOutline size={28} className='p-1 bg-green-600/10 text-green-500 rounded-md' />
                    <h2 className={`${isDark ? "text-[#FFFFFF]" : "text-gray-800"} font-bold`}>Customer Statistics</h2>
                </div>
                <div className={`space-y-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    <div className='flex flex-row justify-between items-center text-sm font-bold'>
                        <span>Total Orders</span>
                        <span>{currUser?.ordersCount}</span>
                    </div>
                    <div className='flex flex-row justify-between items-center text-sm font-bold'>
                        <span>Completed Orders</span>
                        <span>{ordersData?.completed}</span>
                    </div>
                    <div className='flex flex-row justify-between items-center text-sm font-bold'>
                        <span>Pending Orders</span>
                        <span>{ordersData?.pending}</span>
                    </div>
                    <div className='flex flex-row justify-between items-center text-sm font-bold'>
                        <span>Total Spent</span>
                        <span>₹{currUser?.totalSpent?.toLocaleString("en-IN")}</span>
                    </div>
                </div>
            </div>

            {/* Address Information */}
            <div className={`rounded-lg p-3 flex flex-col col-span-1 row-span-1 ${isDark? "border-2 border-slate-800" : "shadow"}`}>
                <div className='flex gap-2 items-center'>
                    <MdOutlineLocationOn size={28} className='p-1 bg-rose-600/10 text-rose-500 rounded-md' />
                    <h2 className={`${isDark ? "text-[#FFFFFF]" : "text-gray-800"} font-bold`}>Address Information</h2>
                </div>
                <div className='flex flex-row justify-between items-center mt-4 text-sm font-bold'>
                    <span className='px-2 py-1 bg-rose-600/10 text-rose-500 rounded-2xl text-xs'>Default Address</span>
                </div>
                <div className={`flex flex-row max-w-3/4 items-center mt-4 text-sm font-bold ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    {address ? formatAddress(address) : "Not found."}
                </div>
            </div>

            {/* Additional Information */}
            <div className={`rounded-lg p-3 flex flex-col col-span-1 row-span-1 ${isDark ? "text-gray-300 border-2 border-slate-800" : "text-gray-600 shadow"}`}>
                <div className='flex gap-2 items-center'>
                    <IoMdInformationCircleOutline size={28} className='p-1 bg-orange-600/10 text-orange-500 rounded-md' />
                    <h2 className={`${isDark ? "text-[#FFFFFF]" : "text-gray-800"} font-bold`}>Additional information</h2>
                </div>
                <div className='flex flex-row justify-between items-center mt-4 text-sm font-bold'>
                    <h2>Role</h2>
                    <span className={`px-2 py-0.5 rounded-full whitespace-nowrap text-xs ${getRoleBadge(currUser?.role)}`}>
                        {formatRole(currUser?.role)}
                    </span>
                </div>
                <div className='flex flex-row justify-between items-center mt-4 text-sm font-bold'>
                    <h2>Account Status</h2>
                    <span className={`px-2 text-xs py-0.5 rounded-full whitespace-nowrap ${getActiveBadge(currUser?.isActive ? "true" : "false")}`}>
                        {currUser?.isActive ? "Active" : "Blocked"}
                    </span>
                </div>
                <div className='flex flex-row justify-between items-center mt-4 text-sm font-bold'>
                    <h2>Last Login</h2>
                    <span>{formatDate(currUser?.updatedAt)} {formatTime(currUser?.updatedAt)}</span>
                </div>
            </div>
        </div>
    )
}
const Orders = () => {
    return (
        <div>
            Orders
        </div>
    )
}
const Address = () => {
    return (
        <div>
            Address
        </div>
    )
}
const ActivityLog = () => {
    return (
        <div>
            Activity Log
        </div>
    )
}

export default CustomerDetailModal