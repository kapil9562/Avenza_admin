import React, { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { IoIosArrowDown, IoIosSearch } from 'react-icons/io'
import { getOrders } from '../../api/api';
import Lottie from 'lottie-react';
import adminLoader from '../../assets/adminLoader.json'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GoDotFill, GoEye, GoTriangleUp } from "react-icons/go";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import { FaClipboardList } from "react-icons/fa6";
import { BiPencil } from "react-icons/bi";
import { FiCheckCircle, FiPrinter, FiRefreshCw } from "react-icons/fi";
import { LuDownload } from "react-icons/lu";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdCancel, MdOutlineLocalShipping } from 'react-icons/md';
import { FaShippingFast } from 'react-icons/fa';
import { IoRefresh } from 'react-icons/io5';
import { formatDate, formatStatus, formatTime, getPaymentBadge, normalizeGooglePhoto, statusColors } from '../../utils/format';
import DeleteOrderModal from '../../helpers/orderModals/DeleteOrderModal';
import EditOrderModal from '../../helpers/orderModals/EditOrderModal';
import OrderDetail from '../../helpers/orderModals/OrderDetail';
import UpdateStatusModal from '../../helpers/orderModals/UpdateStatusModal';
import { useOrders, useTheme } from '../../context/Context';
import { AnimatePresence, motion } from "framer-motion";

// Portal Dropdown
function ActionDropdown({ triggerRef, isDark, onClose, actions, title = "Order Actions" }) {
  const [pos, setPos] = useState(null);
  const dropdownRef = useRef(null);

  useLayoutEffect(() => {
    if (!triggerRef?.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownWidth = 190;
    const dropdownHeight = dropdownRef.current?.offsetHeight || 180;
    const spaceBelow = window.innerHeight - rect.bottom;

    const top =
      spaceBelow >= dropdownHeight
        ? rect.bottom + 4
        : rect.top - dropdownHeight - 4;

    const left = Math.max(
      8,
      Math.min(
        rect.right - dropdownWidth,
        window.innerWidth - dropdownWidth - 8
      )
    );

    setPos({ top, left });
  }, [triggerRef]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose, triggerRef]);

  // Close on scroll
  useEffect(() => {
    const handleScroll = () => onClose();
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [onClose]);

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        top: pos?.top ?? 0,
        left: pos?.left ?? 0,
        width: 190,
        visibility: pos ? "visible" : "hidden", // hidden until position is ready
      }}
      className={`fixed z-9999 whitespace-nowrap flex flex-col items-start text-start rounded-md overflow-hidden border-2 shadow-[0_4px_16px_rgba(0,0,0,0.18)] ${isDark
        ? "bg-gray-900 border-slate-700 text-gray-300"
        : "bg-white border-gray-200 text-gray-600"
        }`}
    >
      <h1 className={`${isDark ? "text-gray-400" : "text-gray-500"} text-xs px-2 py-1`}>
        {title}
      </h1>
      {actions.map(({ label, icon: Icon, colorClass, onClick }) => (
        <button
          key={label}
          className={`flex gap-2 items-center px-3 py-1.5 text-sm font-medium w-full cursor-pointer ${colorClass} ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
            }`}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onClick();
            onClose();
          }}
        >
          <Icon size={16} />
          <span>{label}</span>
        </button>
      ))}
    </div>,
    document.body
  );
}

// Main Component
function Orders() {
  const { isDark } = useTheme();
  const [inputValue, setInputValue] = useState("1");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [payment, setPayment] = useState("All");
  const [showDetail, setShowDetail] = useState([]);
  const [showActions, setShowActions] = useState(null); // orderId or null
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const location = useLocation();
  const [statusDropdown, setStatusDropdown] = useState(false);
  const statusDropdownRef = useRef();
  const [paymentDropdown, setPaymentDropdown] = useState(false);
  const paymentDropdownRef = useRef();
  const id = location?.state?.id;

  useEffect(() => {
    const handleClick = (e) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setStatusDropdown(false);
      }

      if (paymentDropdownRef.current && !paymentDropdownRef.current.contains(e.target)) {
        setPaymentDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [statusDropdownRef, paymentDropdownRef, setStatusDropdown, setPaymentDropdown]);

  useEffect(() => {
    const handleScroll = () => {
      setStatusDropdown(false);
      setPaymentDropdown(false);
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [setPaymentDropdown, setStatusDropdown]);

  // Per-row trigger refs
  const triggerRefs = useRef({});

  const { cache, setOrders, setCache, total, setTotal, stats, setStats, paymentMethods, setPaymentMethods } = useOrders();
  const cacheKey = `${status}-${page}-${payment}`;
  const orders = cache[cacheKey];
  const [loading, setLoading] = useState(!(cache?.[cacheKey]));

  const totalPages = useMemo(() => Math.ceil(total / 10), [total]);
  const skip = (page - 1) * 10;
  const showPagination = total > 10;

  const nextPage = () => {
    const next = Math.min(page + 1, totalPages);
    setPage(next);
    setInputValue(next);
  };

  const prevPage = () => {
    const prev = Math.max(page - 1, 1);
    setPage(prev);
    setInputValue(prev);
  };

  useEffect(() => {
    if (cache[cacheKey]) return;
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const params = { skip };

        if (status !== "All") params.status = status;
        if (payment !== "All") params.paymentMethod = payment;
        if (search.trim()) params.search = search.trim();

        const res = await getOrders(params);
        if (res?.data?.orders?.length === 0) setError("No any order found!");

        setTotal(res?.data?.total);
        setStats(res?.data?.stats);
        setPaymentMethods(res?.data?.paymentMethods);

        if (!orders) setOrders(cacheKey, res?.data?.orders);

        if (res?.data?.orders?.length === 0 && page > 1) {
          setPage(prev => prev - 1);
        }
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || "Something went wrong!";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [cacheKey, payment, status, page, search, cache, orders, setOrders, setPaymentMethods, setStats, setTotal, skip]);

  const handleStatusChange = (filter) => {
    if (status === filter) return;
    setCache({});
    setStatus(filter);
    setPage(1);
    setInputValue(1);
  };

  const handlePaymentChange = (filter) => {
    if (payment === filter) return;
    setCache({});
    setPayment(filter);
    setPage(1);
    setInputValue(1);
  };

  useEffect(() => {
    if (!input) return;
    const timer = setTimeout(() => {
      setSearch(input);
      setPage(1);
      setCache({});
    }, 500);
    return () => clearTimeout(timer);
  }, [input, setCache]);

  const handleToggle = (id) => {
    setShowDetail((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    if (stats?.total === total && payment === "All" && status === "All" && !search) return;
    setPayment("All");
    setStatus("All");
    setSearch("");
    setInput("");
    setCache({});
  };

  const statsList = [
    {
      icon: <FaClipboardList />,
      label: "Total Orders",
      value: stats?.total ?? "-",
      color: `${isDark ? "bg-blue-900/50 text-blue-600" : "bg-blue-100 text-blue-500"}`,
      className: `${isDark ? "bg-blue-900/40 text-blue-400 border-blue-700 border" : "bg-linear-to-b from-white via-white to-blue-50 border-b-blue-200"} border-b-4`,
    },
    {
      icon: <FiRefreshCw />,
      label: "Processing",
      value: stats?.processing ?? "-",
      color: `${isDark ? "bg-orange-900/50 text-orange-600" : "bg-orange-100 text-orange-500"}`,
      className: `${isDark ? "bg-orange-900/40 text-orange-400 border-orange-700 border" : "bg-linear-to-b from-white via-white to-orange-50 border-b-orange-200"} border-b-4`,
    },
    {
      icon: <MdOutlineLocalShipping />,
      label: "Shipped",
      value: stats?.shipped ?? "-",
      color: `${isDark ? "bg-purple-900/50 text-purple-600" : "bg-purple-100 text-purple-500"}`,
      className: `${isDark ? "bg-purple-900/40 text-purple-400 border-purple-700 border" : "bg-linear-to-b from-white via-white to-purple-50 border-b-purple-200"} border-b-4`,
    },
    {
      icon: <FaShippingFast />,
      label: "Out For Delivery",
      value: stats?.out_for_delivery ?? "-",
      color: `${isDark ? "bg-pink-900/50 text-pink-600" : "bg-pink-100 text-pink-500"}`,
      className: `${isDark ? "bg-pink-900/40 text-pink-400 border-pink-700 border" : "bg-linear-to-b from-white via-white to-pink-50 border-b-pink-200"} border-b-4`,
    },
    {
      icon: <FiCheckCircle />,
      label: "Delivered",
      value: stats?.delivered ?? "-",
      color: `${isDark ? "bg-green-900/50 text-green-600" : "bg-green-100 text-green-500"}`,
      className: `${isDark ? "bg-green-900/40 text-green-400 border-green-700 border" : "bg-linear-to-b from-white via-white to-green-50 border-b-green-200"} border-b-4`,
    },
    {
      icon: <MdCancel />,
      label: "Cancelled",
      value: stats?.cancelled ?? "-",
      color: `${isDark ? "bg-red-900/50 text-red-600" : "bg-red-100 text-red-500"}`,
      className: `${isDark ? "bg-red-900/40 text-red-400 border-red-700 border" : "bg-linear-to-b from-white via-white to-red-50 border-b-red-200"} border-b-4`,
    },
  ];

  return (
    <section className={`md:p-4 p-2 space-y-4 w-full ${isDark ? "bg-[#0F172A]" : "bg-[#F9F9FF]"}`}>

      {/* Stat Cards */}
      <div className='grid grid-cols-6 md:gap-4 gap-2 w-full animate-fadeIn'>
        {statsList.map((item, idx) => (
          <StatCard
            key={idx}
            icon={item.icon}
            label={item.label}
            value={item.value}
            color={item.color}
            className={item.className}
            isDark={isDark}
          />
        ))}
      </div>

      {/* Filters */}
      <div className='flex md:flex-row flex-col lg:gap-4 gap-2'>
        {/* Search */}
        <div className='relative md:w-xs w-full flex flex-row justify-center items-center'>
          <input
            value={input}
            maxLength={100}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            placeholder='Search orders...'
            className={`z-10 pr-8 flex w-full animate-fadeIn px-2 sm:py-1 py-2 pl-2 rounded-lg border-2 font-semibold text-gray-700 ${isDark ? "focus:border-gray-400 focus:outline-none bg-[#0F172A] placeholder:text-gray-500 text-white border-gray-500" : "border-gray-300 focus:border-[#6B6F9C] focus:outline-none bg-white placeholder:text-gray-500"}`}
          />
          <IoIosSearch className='absolute right-2 text-2xl font-semibold text-[#8b90c7] z-20 pointer-events-none' />
        </div>

        <div className='flex flex-wrap lg:gap-4 gap-2'>
          {/* Status filter */}
          <div
            className={`flex flex-row lg:gap-5 gap-4 items-center shadow font-semibold w-fit rounded-md px-2 py-1 relative group cursor-pointer ${isDark ? "border-slate-700 text-gray-300 border-2" : "border border-gray-200 text-gray-700"}`}
            onClick={() => setStatusDropdown(prev => !prev)}
            onMouseLeave={() => setStatusDropdown(false)}
            ref={statusDropdownRef}
          >
            <h1 className='animate-fadeIn'>All Status</h1>
            <IoIosArrowDown className={`group-hover:rotate-180 animate-fadeIn ${statusDropdown && "rotate-180"} transition-all duration-300 ${isDark ? "text-gray-300" : "text-gray-800"}`} />
            <div className={`absolute ${statusDropdown ? "flex" : "hidden"} group-hover:flex w-fit overflow-hidden left-0 top-full z-99 flex-col border-2 rounded-md ${isDark ? "bg-[#0F172A] border-slate-700" : "bg-white border-gray-200"}`}>
              <div onClick={() => handleStatusChange("All")} className={`flex flex-row justify-between items-center relative group py-2 px-3 ${isDark ? "hover:bg-slate-800 border-b-2 border-gray-700" : "hover:bg-gray-100 border-b-2 border-gray-200"}`}>
                <span>All</span>
              </div>
              {Object.keys(stats)?.filter((s) => s !== "total")?.map((stat, idx) => (
                <div key={idx} onClick={() => handleStatusChange(stat)} className={`flex flex-row justify-between items-center relative group py-2 px-3 ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-100"} ${(idx < (Object.keys(stats).length - 2)) && (isDark ? "border-b-2 border-gray-700" : "border-b-2 border-gray-200")}`}>
                  <span className='whitespace-nowrap'>{formatStatus(stat)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment filter */}
          <div
            className={`flex flex-row lg:gap-5 gap-4 items-center shadow font-semibold w-fit rounded-md px-2 py-1 relative group cursor-pointer ${isDark ? "border-slate-700 text-gray-300 border-2" : "border border-gray-200 text-gray-700"}`}
            onClick={() => setPaymentDropdown(prev => !prev)}
            onMouseLeave={() => setPaymentDropdown(false)}
            ref={paymentDropdownRef}
          >
            <h1 className='animate-fadeIn'>All Payments</h1>
            <IoIosArrowDown className={`animate-fadeIn group-hover:rotate-180 transition-all duration-300 ${isDark ? "text-gray-300" : "text-gray-800"}`} />
            <div className={`absolute w-full ${paymentDropdown ? "flex" : "hidden"} group-hover:flex overflow-hidden left-0 top-full z-99 flex-col border-2 rounded-md ${isDark ? "bg-[#0F172A] border-slate-700" : "bg-white border-gray-200"}`}>
              <div onClick={() => handlePaymentChange("All")} className={`flex flex-row justify-between items-center relative group py-2 px-3 ${isDark ? "hover:bg-slate-800 border-b-2 border-gray-700" : "hover:bg-gray-100 border-b-2 border-gray-200"}`}>
                <span>All</span>
              </div>
              {paymentMethods?.map((method, idx) => (
                <div key={idx} onClick={() => handlePaymentChange(method)} className={`flex flex-row justify-between items-center relative group py-2 px-3 ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-100"} ${(idx < (paymentMethods.length - 1)) && (isDark ? "border-b-2 border-gray-700" : "border-b-2 border-gray-200")}`}>
                  <span>{method}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Refresh Orders */}
          <button
            className={`animate-fadeIn px-3 py-1.5 bg-linear-to-b flex flex-row justify-center rounded-lg font-semibold items-center gap-2 from-purple-300 to-purple-500 cursor-pointer active:scale-95 transition-transform duration-300 will-change-transform text-sm text-white ${isDark ? "shadow-[0px_3px_8px_rgba(0,0,0,1)]" : "shadow-[0px_3px_8px_rgba(0,0,0,0.24)]"}`}
            onClick={clearFilters}
          >
            <FiRefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className={`border-2 rounded-lg overflow-x-auto animate-fadeIn ${isDark ? "border-gray-800 shadow-md shadow-[#0d1423]" : "border-gray-300 shadow-md"}`}>

        {/* TABLE */}
        <div className="h-[60dvh] overflow-y-auto tableBody scroll-smooth">
          <table className="w-full border-collapse">

            {/* Header */}
            {(!error && !loading) &&
              <thead className={`sticky top-0 z-50 border-b ${isDark ? "bg-slate-800 text-gray-100 border-b-slate-700" : "bg-slate-100 border-b-slate-200"}`}>
                <tr className={`text-left divide-slate-200 divide-x ${isDark ? "divide-slate-700" : "divide-slate-200"}`}>
                  <th className="px-4 py-4 w-[5%] font-semibold whitespace-nowrap">Order ID</th>
                  <th className="px-4 py-4 min-w-70 w-[30%] font-semibold">Customer</th>
                  <th className="px-4 py-4 w-[15%] font-semibold">Date</th>
                  <th className="px-4 py-4 w-[12%] font-semibold">Items</th>
                  <th className="px-4 py-4 w-[8%] font-semibold whitespace-nowrap">Total Amount</th>
                  <th className="px-4 py-4 w-[10%] font-semibold">Payment</th>
                  <th className="px-4 py-4 w-[10%] font-semibold">Status</th>
                  <th className="px-4 py-4 w-[10%] font-semibold">Action</th>
                </tr>
              </thead>
            }

            {/* Body */}
            <tbody className={`font-semibold divide-y ${isDark ? "divide-slate-700 text-gray-300" : "divide-slate-200 text-gray-800"} ${orders?.length > 0 ? (isDark ? "border-b border-b-slate-800" : "border-b border-b-slate-200") : "h-[50dvh]"}`}>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-20">
                    <div className="flex flex-col items-center justify-center relative">
                      <Lottie animationData={adminLoader} loop={true} className="w-40 h-40" />
                      <p className="text-gray-500 font-semibold absolute bottom-4">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="py-10">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className={`${isDark ? "bg-purple-800/10" : "bg-purple-100/50"} rounded-full p-5 flex items-center justify-center`}>
                        <img
                          src="/noResult.webp"
                          alt="img"
                          className="md:h-35 md:w-35 h-30 w-30 object-contain"
                        />
                      </div>
                      <h4 className={`${isDark ? "text-gray-300" : "text-gray-800"} font-bold text-2xl`}>{error}</h4>
                      <p className={`${isDark ? "text-gray-500" : "text-gray-400"} px-10 text-center font-semibold text-sm mt-2`}>
                        We couldn't find any orders matching your current filters.
                      </p>
                      <button
                        className={`p-2 flex flex-row justify-center rounded-lg font-semibold items-center gap-1 cursor-pointer active:scale-95 transition-transform duration-300 will-change-transform text-sm mt-4 text-purple-600 border ${isDark ? "bg-purple-600/10 border-purple-600 hover:brightness-110" : "bg-purple-100 border-purple-200 hover:bg-purple-200/60"}`}
                        onClick={clearFilters}
                      >
                        <IoRefresh size={24} />
                        <span>Refresh Orders</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                orders?.map((order, idx) => (
                  <React.Fragment key={order?._id || idx}>
                    <tr
                      className={`divide-x cursor-pointer ${isDark ? "divide-slate-700 hover:bg-slate-800/60" : "divide-slate-200 hover:bg-slate-100"}`}
                      onClick={() => handleToggle(order?._id)}
                    >

                      {/* Order ID */}
                      <td className={`px-4 py-1 ${id === order?.orderId ? "text-purple-500" : (isDark ? "text-gray-400" : "text-gray-500")}`}>
                        #{order.orderId}
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-1">
                        <div className="flex items-center gap-4">
                          <img
                            loading='lazy'
                            src={normalizeGooglePhoto(order?.user?.avatar) || (isDark ? "/user.png" : "/userLight.png")}
                            referrerPolicy="no-referrer"
                            alt="thumbnail"
                            className={`min-w-10 min-h-10 max-w-10 max-h-10 object-contain rounded-full ${isDark ? "bg-linear-to-br from-blue-900/40 to-purple-900/40" : "bg-linear-to-br from-blue-100 to-purple-100"}`}
                          />
                          <div className='flex flex-col'>
                            <span>{order?.user?.name}</span>
                            <span className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}>{order?.user?.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className={`px-4 py-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        <div className='flex flex-col'>
                          <span className={`${isDark ? "text-gray-300" : "text-gray-800"} text-sm whitespace-nowrap`}>{formatDate(order?.createdAt)}</span>
                          <span className='text-sm'>{formatTime(order?.createdAt)}</span>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-4 py-1">
                        <div className='flex flex-row gap-1 items-center w-18'>
                          <img
                            src={order?.orderItems[0]?.image}
                            loading='lazy'
                            alt="img"
                            className={`${isDark ? "bg-linear-to-br from-blue-900/40 to-purple-900/40" : "bg-linear-to-br from-blue-100 to-purple-100"} h-8 w-8 object-contain rounded`}
                          />
                          {order?.orderItems?.length > 1 && (
                            <div className={`ml-1 text-sm font-medium px-2 py-0.5 group rounded-full relative cursor-pointer ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}>
                              +{order.orderItems.length - 1}
                              <div className={`absolute p-1 z-50 left-0 ${idx !== orders?.length - 1 ? "top-full mt-2" : "bottom-full mb-2"} gap-1 rounded-md hidden group-hover:flex ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
                                <div className={`absolute ${idx !== orders?.length - 1 ? "-top-4" : "-bottom-4 rotate-180"} left-1 ${isDark ? "text-gray-800" : "text-gray-200"}`}>
                                  <GoTriangleUp size={26} />
                                </div>
                                {order?.orderItems?.slice(1).map((item, i) => (
                                  <div key={i}>
                                    <img loading='lazy' src={item?.image} alt="img" className={`${isDark ? "bg-linear-to-br from-blue-900/40 to-purple-900/40" : "bg-linear-to-br from-blue-100 to-purple-100"} min-h-10 min-w-10 object-contain rounded shadow-[0_0px_6px_rgba(0,0,0,0.28)]`} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-1">₹{order?.totalAmount?.toLocaleString("en-IN")}</td>

                      {/* Payment */}
                      <td className="px-4 py-1">
                        <button className={`px-3 text-sm py-1 rounded-full whitespace-nowrap ${getPaymentBadge(order?.paymentMethod)}`}>
                          {order?.paymentMethod}
                        </button>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-1">
                        <div className={`flex flex-row w-fit items-center gap-1 px-2 py-1 text-sm rounded-full whitespace-nowrap ${statusColors[order?.orderStatus.replace(/\s/g, "")]}`}>
                          <GoDotFill size={10} />
                          <span>{formatStatus(order?.orderStatus?.charAt(0).toUpperCase() + order?.orderStatus.slice(1))}</span>
                        </div>
                      </td>

                      {/* ── Action ── */}
                      <td className="px-4 py-1">
                        <div className="flex gap-2">

                          {/* Eye / detail toggle */}
                          <button
                            className={`text-purple-600 p-2 rounded-lg cursor-pointer ${isDark ? "bg-slate-800" : "bg-slate-200/60"}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggle(order?._id);
                            }}
                          >
                            <GoEye />
                          </button>

                          {/* Three-dot trigger */}
                          <div
                            ref={(el) => (triggerRefs.current[order?._id] = el)}
                            className={`p-2 rounded-lg cursor-pointer ${showActions === order?._id && "shadow-[inset_0_0_0_1px]"} ${isDark ? "bg-slate-800 text-gray-400 shadow-purple-600" : "bg-slate-200/60 text-gray-800 shadow-purple-400"}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowActions((prev) => (prev === order?._id ? null : order?._id))
                            }}
                          >
                            <PiDotsThreeVerticalBold />
                          </div>

                          {/* Portal dropdown */}
                          {showActions === order._id && (
                            <ActionDropdown
                              triggerRef={{ current: triggerRefs.current[order?._id] }}
                              isDark={isDark}
                              onClose={() => setShowActions(null)}
                              title="Order Actions"
                              actions={[
                                {
                                  label: "Edit Order",
                                  icon: BiPencil,
                                  colorClass: "text-blue-600",
                                  onClick: () => {
                                    setSelectedOrder(order);
                                    setEditModal(true);
                                  },
                                },
                                {
                                  label: "Update Status",
                                  icon: FiRefreshCw,
                                  colorClass: "text-violet-600",
                                  onClick: () => {
                                    setOrderId(order?.orderId);
                                    setOrderStatus(order?.orderStatus);
                                    setShowUpdateStatusModal(true);
                                  },
                                },
                                {
                                  label: "Print Invoice",
                                  icon: FiPrinter,
                                  colorClass: "text-emerald-600",
                                  onClick: () => { },
                                },
                                {
                                  label: "Download Invoice",
                                  icon: LuDownload,
                                  colorClass: "text-cyan-600",
                                  onClick: () => { },
                                },
                                {
                                  label: "Delete Order",
                                  icon: RiDeleteBin6Line,
                                  colorClass: "text-red-600",
                                  onClick: () => {
                                    setSelectedOrder(order);
                                    setOpenDeleteModal(true);
                                  },
                                },
                              ]}
                            />
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable detail row */}
                    <AnimatePresence initial={false}>
                      {showDetail.includes(order._id) && (
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <td colSpan={8} className="p-0 border-0">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              transition={{ duration: 0.5 }}
                              style={{ overflow: "hidden" }}
                            >
                              <OrderDetail
                                order={order}
                                formatPfpUrl={normalizeGooglePhoto}
                                setShowDetail={setShowDetail}
                              />
                            </motion.div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={`flex md:flex-row flex-col md:justify-between md:items-center px-4 py-2 md:py-0 border-t-2 min-h-13 ${isDark ? "border-t-gray-800" : "border-t-gray-100"}`}>
          <div>
            <span className='font-semibold text-gray-400'>
              Showing {total > 0 ? (skip + 1) : "0"} to {(skip + 10) < total ? skip + 10 : total} of {total} entries
            </span>
          </div>
          <div className='flex flex-row gap-4 items-center justify-between w-full md:w-fit'>

            <span className='font-semibold text-gray-400'>Page {totalPages > 0 ? page : "0"} of {totalPages}</span>

            {showPagination && (
              <div className="flex justify-center items-center">
                <div className="flex justify-center items-center p-1 sm:p-2 gap-1 sm:gap-2">
                  {/* Prev */}
                  <button
                    onClick={prevPage}
                    disabled={page === 1 || loading}
                    className={`${isDark ? "border-gray-700 text-gray-300 border-2" : "border-gray-200 text-white"} flex flex-row justify-center items-center disabled:opacity-50 border shadow cursor-pointer px-3 py-1 rounded-lg disabled:cursor-not-allowed`}
                  >
                    <span className='font-semibold text-gray-400'>Prev</span>
                  </button>

                  {/* Pages */}
                  <div className={`border font-semibold text-gray-400 rounded-lg shadow flex justify-center items-center px-1 py-1 ${isDark ? "border-gray-700 border-2" : "border-gray-200"}`}>
                    <input
                      disabled={loading}
                      type="number"
                      min="1"
                      max={totalPages}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          let value = Number(e.target.value);
                          if (value < 1) value = 1;
                          if (value > totalPages) value = totalPages;
                          setPage(value);
                          setInputValue(value);
                          e.target.blur();
                        }
                      }}
                      className="min-w-5 text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  {/* Next */}
                  <button
                    onClick={nextPage}
                    disabled={page === totalPages || loading}
                    className={`${isDark ? "border-gray-700 text-gray-300 border-2" : "border-gray-200 text-white"} flex flex-row justify-center items-center disabled:opacity-50 border shadow cursor-pointer px-3 py-1 rounded-lg disabled:cursor-not-allowed`}
                  >
                    <span className='font-semibold text-gray-400'>Next</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showUpdateStatusModal && (
        <UpdateStatusModal
          setShowUpdateStatusModal={setShowUpdateStatusModal}
          orderId={orderId}
          setOrderId={setOrderId}
          setCache={setCache}
          currentStatus={orderStatus}
        />
      )}
      {openDeleteModal && <DeleteOrderModal order={selectedOrder} setDeleteModal={setOpenDeleteModal} />}
      {editModal && <EditOrderModal order={selectedOrder} setEditModal={setEditModal} />}
    </section>
  );
}

//StatCard
const StatCard = ({ icon, label, value, color, className, isDark }) => (
  <div className={`w-full col-span-3 sm:col-span-2 xl:col-span-1 px-3 py-2 rounded-xl md:shadow-md shadow flex items-center gap-2 ${className}`}>
    <div className={`p-2 rounded-xl ${color} xl:text-3xl text-xl`}>{icon}</div>
    <div>
      <p className={`text-sm ${isDark ? "text-slate-100" : "text-slate-400"} font-medium`}>{label}</p>
      <p className={`xl:text-2xl text-xl font-bold ${isDark ? "text-white" : "text-slate-700"}`}>{value}</p>
    </div>
  </div>
);


export default Orders;