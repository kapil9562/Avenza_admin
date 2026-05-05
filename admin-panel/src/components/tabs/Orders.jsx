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
import { GoEye } from "react-icons/go";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import { FaClipboardList } from "react-icons/fa6";

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

  const { cache, setOrders, setCache, total, setTotal, stats, setStats, paymentMethods, setPaymentMethods } = useOrders();
  const cacheKey = `${status}-${page}-${payment}-${search}`;
  const orders = cache[cacheKey];
  const [loading, setLoading] = useState(!cache.hasOwnProperty(cacheKey));

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
        console.log(err)
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [cacheKey, payment, status, page, search]);

  const statusColors = {
    processing: "text-yellow-600 bg-yellow-600/10 border border-yellow-400",
    shipped: "text-blue-600 bg-blue-600/10 border border-blue-400",
    delivered: "text-green-600 bg-green-600/10 border border-green-400",
    cancelled: "text-red-600 bg-red-600/10 border border-red-400",
  };

  const getPaymentBadge = (method) => {
    switch (method) {
      case "COD":
        return "bg-yellow-600/10 text-yellow-600 border border-yellow-400";
      case "Stripe":
        return "bg-teal-600/10 text-teal-600 border border-teal-400";
      case "Razorpay":
        return "bg-blue-600/10 text-blue-600 border border-blue-400";
      case "PayPal":
        return "bg-sky-600/10 text-sky-600 border border-sky-400";
      default:
        return "bg-gray-600/10 text-gray-600 border border-gray-400";
    }
  };

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

  const normalizeGooglePhoto = (url) => {
    if (!url) return null;
    const base = url.split("=")[0];
    return `${base}=s200`;
  };

  const formateDate = (date) => {
    const d = new Date(date);

    const day = d.getDate();
    const month = d.toLocaleString("en-IN", { month: "short" });
    const year = d.getFullYear();

    return `${month} ${day}, ${year}`;
  }

  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const formatStatus = (status) => {
    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  useEffect(() => {
    if(!input) return;
    const timer = setTimeout(() => {
      setSearch(input);
      setPage(1);
      setCache({});
    }, 500);

    return () => clearTimeout(timer);
  }, [input]);

  return (
    <section className={`p-4 space-y-4 h-[calc(100dvh-60px)] w-full ${isDark ? "bg-[#0F172A]" : "bg-[#F9F9FF]"}`}>
      <div className='grid grid-cols-6 gap-4 w-full'>
        <StatCard icon={<FaClipboardList />} label="Total Orders" value={stats?.total} color={`${isDark ? "bg-blue-900/50 text-blue-600" : "bg-blue-100 text-blue-500"}`} className={`${isDark ? "bg-blue-900/40 text-blue-400 border-blue-700 border" : "bg-linear-to-b from-white via-white to-blue-50 border-b-blue-200"} border-b-4`} isDark={isDark}
        />
        <StatCard icon={<FaClipboardList />} label="Processing" value={stats?.processing} color={`${isDark ? "bg-orange-900/50 text-orange-600" : "bg-orange-100 text-orange-500"}`} className={`${isDark ? "bg-orange-900/40 text-orange-400 border-orange-700 border" : "bg-linear-to-b from-white via-white to-orange-50 border-b-orange-200"} border-b-4`} isDark={isDark}
        />
        <StatCard icon={<FaClipboardList />} label="Shipped" value={stats?.shipped} color={`${isDark ? "bg-purple-900/50 text-purple-600" : "bg-purple-100 text-purple-500"}`} className={`${isDark ? "bg-purple-900/40 text-purple-400 border-purple-700 border" : "bg-linear-to-b from-white via-white to-purple-50 border-b-purple-200"} border-b-4`} isDark={isDark}
        />
        <StatCard icon={<FaClipboardList />} label="Out For Delivery" value={stats?.out_for_delivery} color={`${isDark ? "bg-pink-900/50 text-pink-600" : "bg-pink-100 text-pink-500"}`} className={`${isDark ? "bg-pink-900/40 text-pink-400 border-pink-700 border" : "bg-linear-to-b from-white via-white to-pink-50 border-b-pink-200"} border-b-4`} isDark={isDark}
        />
        <StatCard icon={<FaClipboardList />} label="Delivered" value={stats?.delivered} color={`${isDark ? "bg-green-900/50 text-green-600" : "bg-green-100 text-green-500"}`} className={`${isDark ? "bg-green-900/40 text-green-400 border-green-700 border" : "bg-linear-to-b from-white via-white to-green-50 border-b-green-200"} border-b-4`} isDark={isDark}
        />
        <StatCard icon={<FaClipboardList />} label="Cancelled" value={stats?.cancelled} color={`${isDark ? "bg-red-900/50 text-red-600" : "bg-red-100 text-red-500"}`} className={`${isDark ? "bg-red-900/40 text-red-400 border-red-700 border" : "bg-linear-to-b from-white via-white to-red-50 border-b-red-200"} border-b-4`} isDark={isDark}
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

        <button
          className={`px-2 py-1 bg-linear-to-b flex flex-row justify-center rounded-lg font-semibold items-center gap-2 from-purple-300 to-purple-500 cursor-pointer active:scale-95 transition-transform duration-300 text-white ${isDark ? "shadow-[0px_3px_8px_rgba(0,0,0,1)]" : "shadow-[0px_3px_8px_rgba(0,0,0,0.24)]"}`}
          onClick={() => navigate('/addproduct')}>
          <HiPlus size={26} />
          <span>Add Product</span>
        </button>
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
                    </div>
                  </td>
                </tr>
              ) : (
                orders?.map((order, idx) => (
                  <tr key={idx} className={`divide-x ${isDark ? "divide-slate-700" : "divide-slate-200"}`}>

                    {/* Order ID */}
                    <td className={`px-4 py-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      #{order.orderId}
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-1">
                      <div className="flex items-center gap-4">
                        <img
                          src={normalizeGooglePhoto(order?.userId?.avatar) || (isDark ? "/user.png" : "/userLight.png")}
                          alt="thumbnail"
                          className={`min-w-10 min-h-10 max-w-10 max-h-10 object-contain rounded-full ${isDark ? "bg-linear-to-br from-blue-900/40 to-purple-900/40" : "bg-linear-to-br from-blue-100 to-purple-100"}`}
                        />
                        <div className='flex flex-col'>
                          <span>
                            {order?.userId?.name}
                          </span>
                          <span className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}>
                            {order?.userId?.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* date & time */}
                    <td className={`px-4 py-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      <div className='flex flex-col'>
                        <span className={`${isDark ? "text-gray-300" : "text-gray-800"}`}>{formateDate(order?.createdAt)}</span>
                        <span className='text-sm'>{formatTime(order?.createdAt)}</span>
                      </div>
                    </td>

                    <td className="px-4 py-1">
                      <div className='flex flex-row gap-1 items-center'>
                        <img
                          src={order?.orderItems[0]?.image}
                          alt="img"
                          className={`${isDark ? "bg-linear-to-br from-blue-900/40 to-purple-900/40" : "bg-linear-to-br from-blue-100 to-purple-100"} h-8 w-8 object-contain rounded`}
                        />
                        {order?.orderItems?.length > 1 && (
                          <span
                            className={`ml-1 text-sm font-medium px-2 py-0.5 rounded-full ${isDark
                              ? "bg-gray-700 text-gray-300"
                              : "bg-gray-200 text-gray-600"
                              }`}
                          >
                            +{order.orderItems.length - 1}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-1">
                      ₹{order?.totalAmount?.toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-1">
                      <button className={`px-4 text-sm py-1 rounded-full whitespace-nowrap ${getPaymentBadge(order?.paymentMethod)}`}>
                        {order?.paymentMethod}
                      </button>
                    </td>

                    <td className="px-4 py-1">
                      <button className={`px-4 py-1 text-sm rounded-full whitespace-nowrap ${statusColors[order.orderStatus.replace(/\s/g, "")]}`}>
                        {order?.orderStatus}
                      </button>
                    </td>

                    <td className="px-4 py-1">
                      <div className="flex gap-2">
                        <button className={`text-purple-600 p-2 rounded-lg cursor-pointer ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                          <GoEye />
                        </button>
                        <button
                          className={`bg-slate-100 p-2 rounded-lg cursor-pointer ${isDark ? "bg-slate-800 text-gray-400" : "bg-slate-100 text-gray-800"}`}
                        >
                          <PiDotsThreeVerticalBold />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className={`flex flex-row justify-between items-center px-4 border-t-2 min-h-13 ${isDark ? "border-t-gray-800" : "border-t-gray-100"}`}>
          <div>
            <span className='font-semibold text-gray-400'>Showing {total>0 ? (skip + 1) : "0"} to {(skip + 10) < total ? skip + 10 : total} of {total} entries</span>
          </div>
          <div className='flex flex-row gap-4 items-center w-fit'>

            <span className='font-semibold text-gray-400'>Page {totalPages>0 ? page : "0"} of {totalPages}</span>

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