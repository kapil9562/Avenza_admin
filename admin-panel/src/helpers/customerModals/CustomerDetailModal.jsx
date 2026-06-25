import React, { useEffect, useState } from 'react'
import { FiX } from 'react-icons/fi';
import { formatAddress, formatDate, formatRole, formatStatus, formatTime, getActiveBadge, getRoleBadge, normalizeGooglePhoto, statusColors } from '../../utils/format';
import { IoCalendarOutline, IoCartOutline, IoRefresh, IoStatsChartOutline } from 'react-icons/io5';
import { GoDotFill, GoTriangleUp } from 'react-icons/go';
import { RiShoppingBagLine } from 'react-icons/ri';
import { MdClearAll, MdCurrencyRupee, MdKeyboardDoubleArrowRight, MdOutlineEmail, MdOutlineLocationOn, MdOutlinePhone } from 'react-icons/md';
import { TiContacts } from "react-icons/ti";
import { IoIosArrowDown, IoMdInformationCircleOutline } from 'react-icons/io';
import { getAddress, getOrdersById } from '../../api/api';
import { BiFilterAlt } from 'react-icons/bi';
import OrderSkeleton from '../skeletonLoadings/OrderSkeleton';
import { useCustomers, useTheme } from '../../context/Context';

const limit = 5;

function CustomerDetailModal({ setDetailModal, currUser }) {

    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState("overview");
    const { ordersCache, setOrdersCache, addressCache, setAddressCache } = useCustomers();
    const cacheKey = `${currUser?._id}`;
    const ordersData = ordersCache[cacheKey];
    const address = addressCache[cacheKey];
    const [skip, setSkip] = useState(0);
    const [loading, setLoading] = useState(false);
    const [orderError, setOrderError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            if (!currUser?._id) return;
            try {
                setLoading(true);
                const res = await getOrdersById({ userId: currUser?._id, limit, skip });
                setOrderError("");
                const newData = res?.data;
                setOrdersCache(prev => ({
                    ...prev,
                    [cacheKey]: {
                        ...newData,
                        orders: [
                            ...(prev[cacheKey]?.orders || []),
                            ...(newData?.orders || [])
                        ]
                    }
                }));
            } catch (err) {
                const msg = err?.response?.data?.message || err?.data?.message || "Something went wrong!"
                setOrderError(msg);
            } finally {
                setLoading(false);
            }
        }

        fetchOrders();
    }, [currUser?._id, cacheKey, skip, setOrdersCache]);

    useEffect(() => {
        const fetchAddress = async () => {
            if (!currUser?._id) return;
            try {
                const res = await getAddress({ userId: currUser?._id });
                setAddressCache(prev => ({
                    ...prev,
                    [cacheKey]: res?.data?.address
                }));
            } catch (err) {
                const msg = err?.response?.data?.message || err?.data?.message || "Something went wrong!"
                console.log(msg);
            }
        }

        fetchAddress();
    }, [currUser?._id, cacheKey, setAddressCache]);

    useEffect(() => {
        setSkip(0);
    }, [currUser?._id]);

    return (
        <div className="fixed inset-0 z-999 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-3 md:p-6 nunitoFont">
            <div className={`w-full min-h-[86dvh] max-w-3xl rounded-2xl shadow-2xl overflow-hidden zoom-modal ${isDark ? "bg-slate-900" : "bg-white"}`}>
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
                            <div className={`${isDark ? "text-gray-200" : "text-gray-800"} font-bold mt-2`}>{currUser?.createdAt
                                ? Math.floor(
                                    (Date.now() - new Date(currUser.createdAt).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )
                                : 0}</div>
                            <div className={`${isDark ? "text-gray-400" : "text-gray-500"} font-semibold text-sm whitespace-nowrap`}>Days as Customer</div>
                        </div>
                    </div>

                    <div className={`flex border-b-2 ${isDark ? "border-b-slate-700" : "border-b-slate-100"}`}>
                        {tabs?.map((tab, idx) => (
                            <button
                                key={idx}
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
                        <div className={activeTab === "orders" ? "block" : "hidden"}>
                            <Orders isDark={isDark} ordersData={ordersData} setSkip={setSkip} loading={loading} orderError={orderError} />
                        </div>
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
    }
];

const Overview = ({ isDark, currUser, ordersData, address }) => {
    return (
        <div className='grid grid-cols-2 grid-rows-2 gap-2'>

            {/* Contact information */}
            <div className={`shadow rounded-lg p-3 flex flex-col col-span-1 row-span-1 gap-2 ${isDark ? "border-2 border-slate-800" : "shadow"}`}>
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
            <div className={`shadow rounded-lg p-3 flex flex-col col-span-1 row-span-1 gap-4 ${isDark ? "border-2 border-slate-800" : "shadow"}`}>
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
            <div className={`rounded-lg p-3 flex flex-col col-span-1 row-span-1 ${isDark ? "border-2 border-slate-800" : "shadow"}`}>
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


const Orders = ({ isDark, ordersData, setSkip, loading, orderError }) => {

    return (
        <div className='nunitoFont space-y-2'>

            {/* Header */}
            {!orderError &&
                <div className='text-sm font-bold flex flex-row items-center justify-between'>
                    <h2 className={`${isDark ? "text-gray-100" : "text-gray-800"} font-bold`}>All Orders ({ordersData?.total})</h2>

                    {/* filter btn */}
                    <button
                        // onClick={() => setOpen((p) => !p)}
                        className={`
                            flex items-center gap-1 px-2 py-1.5 rounded-md shadow
                            text-sm font-bold cursor-pointer
                            ${isDark
                                ? "border-2 border-slate-700 text-gray-300 hover:bg-slate-800 bg-slate-900"
                                : "border border-gray-200 text-gray-700 hover:bg-gray-50 bg-white"
                            }
                          `}
                    >
                        <BiFilterAlt className="text-sm" />
                        <span>Filters</span>
                        <IoIosArrowDown className={`text-sm transition-transform duration-200`} />
                    </button>
                </div>
            }

            {/* Body */}
            <div className='min-h-[55dvh] max-h-[55dvh] overflow-y-auto scroll-smooth space-y-2'>
                {!ordersData?.orders?.length && loading ? (
                    [...Array(5)].map((_, i) => (
                        <OrderSkeleton key={i} isDark={isDark} />
                    ))
                ) : orderError ? (
                    <div className="flex flex-col items-center justify-center text-center h-[55dvh]">
                        <div className={`${isDark ? "bg-purple-800/10" : "bg-purple-100/50"} rounded-full p-5 flex items-center justify-center`}>
                            <img
                                src="/noResult.webp"
                                alt="img"
                                className="h-30 w-30 object-contain"
                            />
                        </div>
                        <h4 className={`${isDark ? "text-gray-300" : "text-gray-800"} font-bold text-2xl`}>
                            {orderError}
                        </h4>
                        <p className={`${isDark ? "text-gray-500" : "text-gray-400"} font-semibold text-sm mt-2`}>
                            We couldn't find any orders matching your current filters.
                        </p>
                        <button
                            className={`p-2 flex flex-row justify-center rounded-lg font-semibold items-center gap-1 cursor-pointer active:scale-95 transition-transform duration-300 will-change-transform text-sm mt-4 text-purple-600 border ${isDark ? "bg-purple-600/10  border-purple-600 hover:brightness-110" : "bg-purple-100 border-purple-200 hover:bg-purple-200/60"}`}
                        // onClick={() => clearFilters()}
                        >
                            <IoRefresh size={24} />
                            <span>Refresh order</span>
                        </button>
                    </div>
                ) : (
                    ordersData?.orders?.map((order, idx) => (
                        <div key={idx} className={`flex items-center justify-between border-2 rounded-lg px-2 py-1 ${isDark ? "border-slate-800" : "border-slate-200"}`}>

                            <div className='flex w-[40%] space-x-2 items-center'>
                                <img src={order?.orderItems[0]?.image} alt={order?.orderItems[0]?.name} loading='lazy' className='h-15 w-15' />
                                <div>
                                    <label className={`${isDark ? "text-gray-400" : "text-gray-500"} font-semibold text-sm`}>Order ID</label>
                                    <h3 className={`${isDark ? "text-gray-100" : "text-gray-800"} font-bold`}>#{order?.orderId}</h3>
                                    <span className={`${isDark ? "text-gray-400" : "text-gray-500"} font-semibold text-sm`}>{formatDate(order?.createdAt)} at {formatTime(order?.createdAt)}</span>
                                </div>
                            </div>

                            <div className='flex flex-col w-[25%]'>
                                <span className={`${isDark ? "text-gray-400" : "text-gray-500"} font-semibold text-sm`}>{order?.orderItems?.length} {order?.orderItems?.length > 1 ? "items" : "item"}</span>
                                <div className='flex space-x-1'>
                                    {order?.orderItems?.slice(0, 2)?.map((item, i) => (
                                        <img
                                            key={i}
                                            src={item?.image}
                                            alt="img"
                                            loading='lazy'
                                            className={`${isDark ? "bg-linear-to-br from-blue-900/40 to-purple-900/40" : "bg-linear-to-br from-blue-100 to-purple-100"} h-8 w-8 object-contain rounded`}
                                        />
                                    ))}
                                    {order?.orderItems?.length > 2 && (
                                        <div className={`h-8 w-8 flex justify-center items-center text-sm font-medium px-2 py-0.5 group rounded relative cursor-pointer ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}>
                                            <span>
                                                +{order.orderItems.length - 2}
                                            </span>
                                            <div className={`absolute p-1 z-50 left-0 ${idx !== ordersData?.orders?.length - 2 ? "top-full mt-2" : "bottom-full mb-2"} gap-1 rounded-md hidden group-hover:flex animate-fadeIn ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
                                                <div className={`absolute ${idx !== ordersData?.orders?.length - 2 ? "-top-4" : "-bottom-4 rotate-180"} left-1 ${isDark ? "text-gray-800" : "text-gray-200"}`}>
                                                    <GoTriangleUp size={26} />
                                                </div>
                                                {order?.orderItems?.slice(2).map((item, i) => (
                                                    <div key={i}>
                                                        <img src={item?.image} alt="img" className={`${isDark ? "bg-linear-to-br from-blue-900/40 to-purple-900/40" : "bg-linear-to-br from-blue-100 to-purple-100"} min-h-10 min-w-10 object-contain rounded shadow-[0_0px_6px_rgba(0,0,0,0.28)]`} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className='flex flex-col w-[15%]'>
                                <span className={`${isDark ? "text-gray-100" : "text-gray-800"} font-bold`}>₹{order?.totalAmount?.toLocaleString("en-IN")}</span>
                                <span className={`${isDark ? "text-gray-400" : "text-gray-500"} font-semibold text-sm`}>{order?.paymentMethod?.toUpperCase()}</span>
                            </div>

                            <div className='flex items-center justify-center w-[20%]'>
                                <div className={`flex flex-row w-fit items-center gap-1 px-2 py-0.5 text-sm rounded-full whitespace-nowrap ${statusColors[order?.orderStatus.replace(/\s/g, "")]}`}>
                                    <GoDotFill size={10} />
                                    <span>{formatStatus(order?.orderStatus?.charAt(0).toUpperCase() + order?.orderStatus.slice(1))}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {loading ? (
                    <OrderSkeleton />
                ) : !orderError && (
                    <button
                        className={`text-purple-500 font-bold hover:underline flex items-center justify-center`}
                        onClick={() => setSkip(prev => prev + limit)}
                        disabled={(ordersData?.orders?.length >= ordersData?.total) || orderError}
                    >
                        {ordersData?.orders?.length >= ordersData?.total ? "No more results to display" : (
                            <>
                                Load More
                                <MdKeyboardDoubleArrowRight size={22} />
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}

export default CustomerDetailModal;