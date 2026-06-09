import React, { useEffect, useState } from 'react'
import { IoIosArrowDown, IoIosSearch } from 'react-icons/io'
import { useTheme } from '../../context/ThemeContext'
import { HiPlus } from "react-icons/hi";
import { getOrders } from '../../api/api';
import Lottie from 'lottie-react';
import adminLoader from '../../assets/adminLoader.json'
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { GoDotFill, GoEye, GoTriangleUp } from "react-icons/go";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import { FaClipboardList } from "react-icons/fa6";
import OrderDetail from '../../helpers/OrderDetail';
import { BiPencil } from "react-icons/bi";
import { FiCheckCircle, FiPrinter, FiRefreshCw } from "react-icons/fi";
import { LuDownload } from "react-icons/lu";
import { ImBin } from 'react-icons/im';
import { RiDeleteBin6Line } from "react-icons/ri";
import UpdateStatusModal from '../../helpers/UpdateStatusModal';
import { MdCancel, MdOutlineLocalShipping } from 'react-icons/md';
import { FaShippingFast } from 'react-icons/fa';
import DeleteOrderModal from '../../helpers/DeleteOrderModal';
import { IoRefresh } from 'react-icons/io5';
import { formatDate, formatStatus, formatTime, getPaymentBadge, normalizeGooglePhoto, statusColors } from '../../utils/format';
import EditOrderModal from '../../helpers/EditOrderModal';

function Orders() {
  const { isDark } = useTheme();
  const [inputValue, setInputValue] = useState("1");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [payment, setPayment] = useState("All");
  const [showDetail, setShowDetail] = useState([]);
  const [showActions, setShowActions] = useState([]);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [editModal, setEditModal] = useState(false);

  const actionBtnClass = `flex gap-2 items-center px-3 py-1 text-sm font-medium w-full cursor-pointer ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`

  const { cache, setOrders, setCache, total, setTotal, stats, setStats, paymentMethods, setPaymentMethods } = useOrders();
  const cacheKey = `${status}-${page}-${payment}-${search}`;
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

        // filters
        if (status !== "All") params.status = status;
        if (payment !== "All") params.paymentMethod = payment;
        if (search.trim()) params.search = search.trim();

        const res = await getOrders(params);
        if (res?.data?.orders?.length === 0) {
          setError("No any order found!");
        }

        // meta
        setTotal(res?.data?.total);
        setStats(res?.data?.stats);
        setPaymentMethods(res?.data?.paymentMethods);

        // orders
        if (!orders) {
          setOrders(cacheKey, res?.data?.orders);
        }

        // pagination
        if (res?.data?.orders?.length === 0 && page > 1) {
          setPage(prev => prev - 1);
          return;
        }

      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || "Something went wrong !"
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
  }

  const handlePaymentChange = (filter) => {
    if (payment === filter) return;
    setCache({});
    setPayment(filter);
    setPage(1);
    setInputValue(1);
  }

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
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleShowActions = (id) => {
    setShowActions((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const clearFilters = () => {
    if(payment || search || status) {
      setPayment("All");
      setStatus("All");
      setSearch("");
    }
    return;
  }

  return (
    <section className={`p-4 space-y-4 h-[calc(100dvh-60px)] w-full ${isDark ? "bg-[#0F172A]" : "bg-[#F9F9FF]"}`}>
      <div className='grid grid-cols-6 gap-4 w-full'>
        <StatCard icon={<FaClipboardList />} label="Total Orders" value={stats?.total} color={`${isDark ? "bg-blue-900/50 text-blue-600" : "bg-blue-100 text-blue-500"}`} className={`${isDark ? "bg-blue-900/40 text-blue-400 border-blue-700 border" : "bg-linear-to-b from-white via-white to-blue-50 border-b-blue-200"} border-b-4`} isDark={isDark}
        />
        <StatCard icon={<FiRefreshCw />} label="Processing" value={stats?.processing} color={`${isDark ? "bg-orange-900/50 text-orange-600" : "bg-orange-100 text-orange-500"}`} className={`${isDark ? "bg-orange-900/40 text-orange-400 border-orange-700 border" : "bg-linear-to-b from-white via-white to-orange-50 border-b-orange-200"} border-b-4`} isDark={isDark}
        />
        <StatCard icon={<MdOutlineLocalShipping />} label="Shipped" value={stats?.shipped} color={`${isDark ? "bg-purple-900/50 text-purple-600" : "bg-purple-100 text-purple-500"}`} className={`${isDark ? "bg-purple-900/40 text-purple-400 border-purple-700 border" : "bg-linear-to-b from-white via-white to-purple-50 border-b-purple-200"} border-b-4`} isDark={isDark}
        />
        <StatCard icon={<FaShippingFast />} label="Out For Delivery" value={stats?.out_for_delivery} color={`${isDark ? "bg-pink-900/50 text-pink-600" : "bg-pink-100 text-pink-500"}`} className={`${isDark ? "bg-pink-900/40 text-pink-400 border-pink-700 border" : "bg-linear-to-b from-white via-white to-pink-50 border-b-pink-200"} border-b-4`} isDark={isDark}
        />
        <StatCard icon={<FiCheckCircle />} label="Delivered" value={stats?.delivered} color={`${isDark ? "bg-green-900/50 text-green-600" : "bg-green-100 text-green-500"}`} className={`${isDark ? "bg-green-900/40 text-green-400 border-green-700 border" : "bg-linear-to-b from-white via-white to-green-50 border-b-green-200"} border-b-4`} isDark={isDark}
        />
        <StatCard icon={<MdCancel />} label="Cancelled" value={stats?.cancelled} color={`${isDark ? "bg-red-900/50 text-red-600" : "bg-red-100 text-red-500"}`} className={`${isDark ? "bg-red-900/40 text-red-400 border-red-700 border" : "bg-linear-to-b from-white via-white to-red-50 border-b-red-200"} border-b-4`} isDark={isDark}
        />
      </div>

      {/* {filters} */}
      <div className='flex flex-row gap-4'>
        {/* {search} */}
        <div className='relative w-xs flex flex-row justify-center items-center'>
          <input
            value={input}
            maxLength={50}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            type="text"
            placeholder='Search orders...'
            className={`z-10 w-full px-2 py-1 pl-2 rounded-xl border-2 font-semibold text-gray-700 ${isDark ? "focus:border-gray-400 focus:outline-none bg-[#0F172A] placeholder:text-gray-500 text-white border-gray-500" : "border-gray-300 focus:border-[#6B6F9C] focus:outline-none bg-white placeholder:text-gray-500"}`}
          />
          <IoIosSearch className='absolute right-2 text-2xl font-semibold text-[#8b90c7] z-20 pointer-events-none' />
        </div>

        {/* {status} */}
        <div className={`flex flex-row gap-8 items-center shadow font-semibold w-fit rounded-md px-2 py-1 relative group cursor-pointer ${isDark ? "border-slate-700 text-gray-300  border-2" : "border border-gray-200 text-gray-700"}`}>
          <h1>All Status</h1>
          <IoIosArrowDown className={`group-hover:rotate-180 transition-all duration-300 ${isDark ? "text-gray-300" : "text-gray-800"}`} />
          <div className={`absolute group-hover:flex hidden w-fit overflow-hidden left-0 top-full z-99 flex-col border-2 rounded-md ${isDark ? "bg-[#0F172A] border-slate-700" : "bg-white border-gray-200 "}`}>
            <div
              onClick={() => handleStatusChange("All")}
              className={`flex flex-row justify-between items-center relative group py-2 px-3 ${isDark ? "hover:bg-slate-800 border-b-2 border-gray-700" : "hover:bg-gray-100 border-b-2 border-gray-200"}`}>
              <span>All</span>
            </div>
            {Object.keys(stats)?.filter((status) => status !== "total")?.map((stat, idx) => (
              <div
                key={idx}
                onClick={() => handleStatusChange(stat)}
                className={`flex flex-row justify-between items-center relative group py-2 px-3 ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-100"} ${(idx < (Object.keys(stats).length - 2)) && (isDark ? "border-b-2 border-gray-700" : "border-b-2 border-gray-200")}`}>
                <span className='whitespace-nowrap'>{formatStatus(stat)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* {payment methods} */}
        <div className={`flex flex-row gap-8 items-center shadow font-semibold w-fit rounded-md px-2 py-1 relative group cursor-pointer ${isDark ? "border-slate-700 text-gray-300  border-2" : "border border-gray-200 text-gray-700"}`}>
          <h1>All Payments</h1>
          <IoIosArrowDown className={`group-hover:rotate-180 transition-all duration-300 ${isDark ? "text-gray-300" : "text-gray-800"}`} />
          <div className={`absolute w-full group-hover:flex hidden overflow-hidden left-0 top-full z-99 flex-col border-2 rounded-md ${isDark ? "bg-[#0F172A] border-slate-700" : "bg-white border-gray-200 "}`}>
            <div
              onClick={() => handlePaymentChange("All")}
              className={`flex flex-row justify-between items-center relative group py-2 px-3 ${isDark ? "hover:bg-slate-800 border-b-2 border-gray-700" : "hover:bg-gray-100 border-b-2 border-gray-200"}`}>
              <span>All</span>
            </div>
            {paymentMethods?.map((method, idx) => (
              <div
                key={idx}
                onClick={() => handlePaymentChange(method)}
                className={`flex flex-row justify-between items-center relative group py-2 px-3 ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-100"} ${(idx < (paymentMethods.length - 1)) && (isDark ? "border-b-2 border-gray-700" : "border-b-2 border-gray-200")}`}>
                <span>{method}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Table Container */}
      <div className={`border-2 rounded-lg overflow-x-auto ${isDark ? "border-gray-800 shadow-xl shadow-[#0d1423]" : "border-gray-300 shadow-xl"}`}>

        {/* TABLE */}
        <div className="h-[60dvh] overflow-y-auto tableBody scroll-smooth">
          <table className="w-full border-collapse">

            {/* Header */}
            <thead className={`sticky top-0 z-50 ${isDark ? " bg-slate-800 text-gray-100" : "bg-slate-100"}`}>
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

            {/* Body */}
            <tbody className={`font-semibold divide-y ${isDark ? "divide-slate-700 text-gray-300" : "divide-slate-200 text-gray-800"} ${orders?.length > 0 ? (isDark ? "border-b border-b-slate-800" : "border-b border-b-slate-200") : "h-[50dvh]"}`}>
              {loading ? (
                <tr>
                  {/* {Loading} */}
                  <td colSpan="8" className="text-center py-20">
                    <div className="flex flex-col items-center justify-center relative">
                      <Lottie
                        animationData={adminLoader}
                        loop={true}
                        className="w-40 h-40"
                      />
                      <p className="text-gray-500 font-semibold absolute bottom-4">
                        Loading...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  {/* {Error Handler} */}
                  <td colSpan="8" className="py-10">
                    <div className="flex flex-col items-center justify-center text-center">
                      <img
                        src="/noResult.webp"
                        alt="img"
                        className="h-40 w-40 object-contain"
                      />
                      <p className="text-red-500 font-semibold text-lg">
                        {error}
                      </p>
                      <button
                        className={`px-2 py-2 bg-linear-to-b flex flex-row justify-center rounded-lg font-semibold items-center gap-2 cursor-pointer active:scale-95 transition-all duration-300 will-change-transform text-sm mt-2 text-white ${isDark ? " from-purple-500 to-purple-700" : " from-purple-300 to-purple-500"} hover:brightness-110`}
                        onClick={() => clearFilters()}
                      >
                        <IoRefresh size={26} />
                        <span>Refresh Orders</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (

                // {Orders}
                orders?.map((order, idx) => (
                  <React.Fragment key={order?._id || idx}>
                    <tr className={`divide-x ${isDark ? "divide-slate-700" : "divide-slate-200"} `}>

                      {/* Order ID */}
                      <td className={`px-4 py-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        #{order.orderId}
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-1">
                        <div className="flex items-center gap-4">
                          <img
                            src={normalizeGooglePhoto(order?.user?.avatar) || (isDark ? "/user.png" : "/userLight.png")}
                            referrerPolicy="no-referrer"
                            alt="thumbnail"
                            className={`min-w-10 min-h-10 max-w-10 max-h-10 object-contain rounded-full ${isDark ? "bg-linear-to-br from-blue-900/40 to-purple-900/40" : "bg-linear-to-br from-blue-100 to-purple-100"}`}
                          />
                          <div className='flex flex-col'>
                            <span>
                              {order?.user?.name}
                            </span>
                            <span className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}>
                              {order?.user?.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* date & time */}
                      <td className={`px-4 py-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        <div className='flex flex-col'>
                          <span className={`${isDark ? "text-gray-300" : "text-gray-800"} text-sm whitespace-nowrap`}>{formatDate(order?.createdAt)}</span>
                          <span className='text-sm'>{formatTime(order?.createdAt)}</span>
                        </div>
                      </td>

                      {/* order items */}
                      <td className="px-4 py-1">
                        <div className='flex flex-row gap-1 items-center'>
                          <img
                            src={order?.orderItems[0]?.image}
                            alt="img"
                            className={`${isDark ? "bg-linear-to-br from-blue-900/40 to-purple-900/40" : "bg-linear-to-br from-blue-100 to-purple-100"} h-8 w-8 object-contain rounded`}
                          />
                          {order?.orderItems?.length > 1 && (
                            <div
                              className={`ml-1 text-sm font-medium px-2 py-0.5 group rounded-full relative cursor-pointer ${isDark
                                ? "bg-gray-700 text-gray-300"
                                : "bg-gray-200 text-gray-600"
                                }`}
                            >
                              +{order.orderItems.length - 1}

                              <div className={`absolute p-1 z-50 left-0 ${idx !== orders?.length - 1 ? "top-full mt-2" : "bottom-full mb-2"} gap-1 rounded-md hidden group-hover:flex animate-fadeIn ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
                                <div className={`absolute ${idx !== orders?.length - 1 ? "-top-4" : "-bottom-4 rotate-180"} left-1 ${isDark ? "text-gray-800" : "text-gray-200"}`}>
                                  <GoTriangleUp size={26} />
                                </div>
                                {order?.orderItems?.slice(1).map((item, i) => (
                                  <div className='' key={i}>
                                    <img
                                      src={item?.image}
                                      alt="img"
                                      className={`${isDark ? "bg-linear-to-br from-blue-900/40 to-purple-900/40" : "bg-linear-to-br from-blue-100 to-purple-100"} min-h-10 min-w-10 object-contain rounded shadow-[0_0px_6px_rgba(0,0,0,0.28)]`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-1">
                        ₹{order?.totalAmount?.toLocaleString("en-IN")}
                      </td>

                      <td className="px-4 py-1">
                        <button className={`px-3 text-sm py-1 rounded-full whitespace-nowrap ${getPaymentBadge(order?.paymentMethod)}`}>
                          {order?.paymentMethod}
                        </button>
                      </td>

                      <td className="px-4 py-1">
                        <div className={`flex flex-row w-fit items-center gap-1 px-2 py-1 text-sm rounded-full whitespace-nowrap ${statusColors[order?.orderStatus.replace(/\s/g, "")]}`}>
                          <span>
                            <GoDotFill size={10} />
                          </span>
                          <span>
                            {formatStatus(order?.orderStatus?.charAt(0).toUpperCase() + order?.orderStatus.slice(1))}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-1">
                        <div className="flex gap-2">
                          <button className={`text-purple-600 p-2 rounded-lg cursor-pointer ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
                            onClick={() => handleToggle(order?._id)}>
                            <GoEye />
                          </button>
                          <div
                            className={`bg-slate-100 p-2 rounded-lg cursor-pointer ${isDark ? "bg-slate-800 text-gray-400" : "bg-slate-100 text-gray-800"} relative`}
                            onClick={() => handleShowActions(order?._id)}
                          >
                            <PiDotsThreeVerticalBold />
                            {showActions.includes(order._id) && (
                              <div>
                                <div className={`absolute top-full right-0 z-10 whitespace-nowrap flex flex-col items-start text-start rounded-md ${isDark ? "bg-gray-900 border-slate-700 text-gray-300" : "bg-white border-gray-200 text-gray-600"} overflow-hidden border-2 shadow-[0_0px_6px_rgba(0,0,0,0.15)]`}>
                                  <h1 className={`${isDark ? "text-gray-400" : "text-gray-500"} text-xs px-2 py-1`}>Order Actions</h1>
                                  <button
                                    className={`${actionBtnClass} text-blue-600`}
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setEditModal(true);
                                    }}>
                                    <span><BiPencil size={16} /></span>
                                    <span>Edit Order</span>
                                  </button>
                                  <button
                                    className={`${actionBtnClass} text-violet-600`}
                                    onClick={() => {
                                      setOrderId(order?.orderId)
                                      setOrderStatus(order?.orderStatus)
                                      setShowUpdateStatusModal(true);
                                    }}
                                  >
                                    <span><FiRefreshCw size={16} /></span>
                                    <span>Update Status</span>
                                  </button>
                                  <button className={`${actionBtnClass} text-emerald-600`}><FiPrinter size={16} />Print Invoice</button>
                                  <button className={`${actionBtnClass} text-cyan-600`}><LuDownload size={16} />Download Invoice</button>
                                  <button
                                    className={`${actionBtnClass} text-red-600`}
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setOpenDeleteModal(true);
                                    }}
                                  >
                                    <span><RiDeleteBin6Line size={16} /></span>
                                    <span>Delete Order</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                    </tr>
                    <tr>
                      <td colSpan={8} className="p-0 border-0">
                        <div
                          className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${showDetail.includes(order._id)
                            ? "grid-rows-[1fr]"
                            : "grid-rows-[0fr]"
                            }`}
                        >
                          <div className="min-h-0 overflow-hidden">
                            <OrderDetail
                              order={order}
                              formatPfpUrl={normalizeGooglePhoto}
                              setShowDetail={setShowDetail}
                              idx={order._id}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className={`flex flex-row justify-between items-center px-4 border-t-2 min-h-13 ${isDark ? "border-t-gray-800" : "border-t-gray-100"}`}>
          <div>
            <span className='font-semibold text-gray-400'>Showing {total > 0 ? (skip + 1) : "0"} to {(skip + 10) < total ? skip + 10 : total} of {total} entries</span>
          </div>
          <div className='flex flex-row gap-4 items-center w-fit'>

            <span className='font-semibold text-gray-400'>Page {totalPages > 0 ? page : "0"} of {totalPages}</span>

            {showPagination && (
              <div className="flex justify-center items-center">
                <div className={`${isDark ? " " : ""} flex justify-center items-center p-1 sm:p-2 gap-1 sm:gap-2`}>
                  {/* Prev */}
                  <button
                    onClick={() => {
                      prevPage();
                    }}
                    disabled={page === 1 || loading}
                    className={`${isDark ? "border-gray-700 text-gray-300 border-2" : "border-gray-200 text-white"} flex flex-row justify-center items-center disabled:opacity-50 border shadow  cursor-pointer px-3 py-1 rounded-lg disabled:cursor-not-allowed`}
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
                    onClick={() => {
                      nextPage();
                    }}
                    disabled={page === totalPages || loading}
                    className={`${isDark ? "border-gray-700 text-gray-300 border-2" : "border-gray-200 text-white"} flex flex-row justify-center items-center disabled:opacity-50 border shadow  cursor-pointer px-3 py-1 rounded-lg disabled:cursor-not-allowed`}
                  >
                    <span className='font-semibold text-gray-400'>Next</span>
                  </button>
                </div>
              </div>

            )}
          </div>
        </div>
      </div>
      {showUpdateStatusModal && <UpdateStatusModal setShowUpdateStatusModal={setShowUpdateStatusModal} orderId={orderId} setOrderId={setOrderId} setCache={setCache} currentStatus={orderStatus} />}

      {openDeleteModal && <DeleteOrderModal order={selectedOrder} setDeleteModal={setOpenDeleteModal} />}
      {editModal && <EditOrderModal order={selectedOrder} setEditModal={setEditModal} />}
    </section>
  )
}

const StatCard = ({ icon, label, value, color, className, isDark }) => (
  <div className={`w-full px-3 py-2 rounded-xl shadow-md flex items-center gap-2 ${className}`}>
    <div className={`p-2 rounded-xl ${color} text-3xl`}>{icon}</div>
    <div>
      <p className={`text-sm ${isDark ? "text-slate-100" : "text-slate-400"} font-medium`}>{label}</p>
      <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-700"} `}>{value}</p>
    </div>
  </div>
);

export default Orders