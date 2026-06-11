import React, { useRef } from "react";
import {
  FiShoppingBag,
  FiUsers
} from "react-icons/fi";
import { IoMdArrowUp } from "react-icons/io";
import { LuCrown, LuUserCog } from "react-icons/lu";

import Lottie from 'lottie-react';
import { useEffect, useMemo, useState } from 'react';
import { BiFilterAlt, BiPencil } from "react-icons/bi";
import { FiDownload, FiPrinter, FiRefreshCw } from "react-icons/fi";
import { IoIosSearch } from 'react-icons/io';
import { IoRefresh } from 'react-icons/io5';
import { LuDownload } from "react-icons/lu";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import { getAllUsers } from '../../api/api';
import adminLoader from '../../assets/adminLoader.json';
import { useCustomers } from "../../context/CustomerContext";
import { useTheme } from '../../context/ThemeContext';
import { formatDate, formatTime, getActiveBadge, getRoleBadge, normalizeGooglePhoto } from '../../utils/format';
import { FaEye } from "react-icons/fa6";
import EditRoleModal from "../../helpers/EditRoleModal";

export default function Customers() {
  const { isDark } = useTheme();
  const [inputValue, setInputValue] = useState("1");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showDetail, setShowDetail] = useState([]);
  const [showActions, setShowActions] = useState();
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [editModal, setEditModal] = useState(false);

  const actionRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        actionRef.current?.contains(e.target)
      ) return;

      setShowActions(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const actionBtnClass = `flex gap-2 items-center px-3 py-1 text-sm font-medium w-full cursor-pointer ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`

  const { cache, setUsers, setCache, meta, setMeta } = useCustomers();
  const cacheKey = `${page}`;
  const users = cache[cacheKey];
  const [loading, setLoading] = useState(!(cache?.[cacheKey]));

  const totalPages = useMemo(() => Math.ceil(meta?.total / 10), [meta?.total]);
  const skip = (page - 1) * 10;

  const showPagination = meta?.total > 10;

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

        // if (search.trim()) params.search = search.trim();

        const res = await getAllUsers(params);

        if (res?.data?.users?.length === 0) {
          setError("No any user found!");
        }

        // meta
        setMeta(res?.data?.metaData);

        // orders
        if (!users) {
          setUsers(cacheKey, res?.data?.users);
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
  }, [cacheKey, page, search, cache, setMeta, setUsers, skip, users]);

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
    (id !== showActions) ? setShowActions(id) : setShowActions("");
  };

  const statCard = [
    {
      label: "Total Customers",
      value: meta?.total || "-",
      icon: FiUsers,
      light: {
        icon: "bg-pink-100 text-pink-500",
        card: "from-white via-white to-pink-50 border-b-pink-200",
      },
      dark: {
        icon: "bg-pink-900/50 text-pink-400",
        card: "bg-pink-900/40 text-pink-400 border-pink-700",
      },
    },
    {
      label: "New Customers",
      value: meta?.new?.count,
      percentageChange: meta?.new?.growth,
      icon: LuUserCog,
      light: {
        icon: "bg-purple-100 text-purple-500",
        card: "from-white via-white to-purple-50 border-b-purple-200",
      },
      dark: {
        icon: "bg-purple-900/50 text-purple-400",
        card: "bg-purple-900/40 text-purple-400 border-purple-700",
      },
    },
    {
      label: "Repeat Customers",
      value: meta?.repeat?.count,
      percentageChange: meta?.repeat?.growth,
      icon: FiShoppingBag,
      light: {
        icon: "bg-green-100 text-green-500",
        card: "from-white via-white to-green-50 border-b-green-200",
      },
      dark: {
        icon: "bg-green-900/50 text-green-400",
        card: "bg-green-900/40 text-green-400 border-green-700",
      },
    },
    {
      label: "Top Customers",
      value: meta?.top?.count,
      percentageChange: meta?.top?.growth,
      icon: LuCrown,
      light: {
        icon: "bg-orange-100 text-orange-500",
        card: "from-white via-white to-orange-50 border-b-orange-200",
      },
      dark: {
        icon: "bg-orange-900/50 text-orange-400",
        card: "bg-orange-900/40 text-orange-400 border-orange-700",
      },
    },
  ];

  return (
    <div
      className={`h-[calc(100dvh-60px)] w-fit lg:w-full p-4 font-sans text-slate-700 overflow-y-auto pb-20 scroll-smooth ${isDark ? "bg-[#0F172A]" : "bg-[#F9F9FF]"
        }`}
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
        {statCard.map((item) => (
          <StatCard key={item.label} item={item} isDark={isDark} />
        ))}
      </div>

      <div className={`${isDark ? "border-gray-800" : "bg-white border-gray-100"} border-2 rounded-2xl overflow-hidden`}>

        <div className="p-4 flex flex-row justify-between items-center">

          <div className="flex flex-row gap-1 text-lg">
            <h2 className={`${isDark ? "text-gray-100" : "text-gray-800"} font-semibold`}>All Costomers</h2>
            <span className={`${isDark ? "text-gray-400" : "text-gray-600"} font-medium`}>(1,248)</span>
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
                placeholder='Search customers...'
                className={`z-10 w-full px-2 py-1 pl-2 rounded-lg border-2 font-semibold text-gray-700 ${isDark ? "focus:border-gray-400 focus:outline-none bg-[#0F172A] placeholder:text-gray-500 text-white border-gray-500" : "border-gray-300 focus:border-[#6B6F9C] focus:outline-none bg-white placeholder:text-gray-500"}`}
              />
              <IoIosSearch className='absolute right-2 text-2xl font-semibold text-[#8b90c7] z-20 pointer-events-none' />
            </div>

            {/* Filter btn */}
            <div className={`flex flex-row gap-2 items-center shadow font-semibold w-fit rounded-md px-3 py-1 relative cursor-pointer ${isDark ? "border-slate-700 text-gray-300  border-2" : "border border-gray-200 text-gray-700"}`}>
              <BiFilterAlt className={`${isDark ? "text-gray-300" : "text-gray-800"}`} />
              <h1 className="text-sm">Filter</h1>
            </div>
            {/* export btn */}
            <div className={`flex flex-row gap-2 items-center shadow font-semibold w-fit rounded-md px-3 py-1 relative cursor-pointer ${isDark ? "border-slate-700 text-gray-300  border-2" : "border border-gray-200 text-gray-700"}`}>
              <FiDownload className={`${isDark ? "text-gray-300" : "text-gray-800"}`} />
              <h1 className="text-sm">Export</h1>
            </div>
            {/* refresh customer */}
            <button
              className={`px-3 py-1 bg-linear-to-b flex flex-row justify-center rounded-lg font-semibold items-center gap-2 from-purple-300 to-purple-500 cursor-pointer active:scale-95 transition-transform duration-300 will-change-transform text-sm text-white ${isDark ? "shadow-[0px_3px_8px_rgba(0,0,0,1)]" : "shadow-[0px_3px_8px_rgba(0,0,0,0.24)]"}`}>
              <FiRefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className={`border-t-2 overflow-x-auto ${isDark ? "border-gray-800 shadow-xl shadow-[#0d1423]" : "border-gray-100 shadow-xl"}`}>

          {/* TABLE */}
          <div className="h-[60dvh] overflow-y-auto tableBody scroll-smooth">
            <table className="w-full border-collapse">

              {/* Header */}
              <thead className={`sticky top-0 z-50 ${isDark ? " bg-slate-800 text-gray-100" : "bg-slate-100"}`}>
                <tr className={`text-left divide-slate-200 divide-x ${isDark ? "divide-slate-700" : "divide-slate-200"}`}>
                  <th className="px-4 py-2 w-[25%] font-semibold whitespace-nowrap text-sm">Customer</th>
                  <th className="px-4 py-2 min-w-50 w-[20%] font-semibold text-sm">Email</th>
                  <th className="px-4 py-2 w-[15%] text-sm font-semibold">Orders</th>
                  <th className="px-4 py-2 w-[12%] text-sm font-semibold">Total Spent</th>
                  <th className="px-4 py-2 w-[8%]  text-sm font-semibold whitespace-nowrap">Joined On</th>
                  <th className="px-4 py-2 w-[10%] text-sm font-semibold">Role</th>
                  <th className="px-4 py-2 w-[10%] text-sm font-semibold">Status</th>
                  <th className="px-4 py-2 w-[5%]  text-sm font-semibold">Action</th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className={`font-semibold divide-y ${isDark ? "divide-slate-700 text-gray-300" : "divide-slate-200 text-gray-800"} ${users?.length > 0 ? (isDark ? "border-b border-b-slate-800" : "border-b border-b-slate-200") : "h-[50dvh]"}`}>
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

                        >
                          <IoRefresh size={26} />
                          <span>Refresh Customers</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (

                  // {users}
                  users?.map((user, idx) => (
                    <React.Fragment key={user?._id || idx}>
                      <tr className={`divide-x ${isDark ? "divide-slate-700" : "divide-slate-200"} `}>

                        {/* Customer */}
                        <td className="px-4 py-1">
                          <div className="flex items-center gap-4">
                            <img
                              src={normalizeGooglePhoto(user?.avatar) || (isDark ? "/user.png" : "/userLight.png")}
                              referrerPolicy="no-referrer"
                              alt="thumbnail"
                              className={`min-w-10 min-h-10 max-w-10 max-h-10 object-contain rounded-full ${isDark ? "bg-linear-to-br from-blue-900/40 to-purple-900/40" : "bg-linear-to-br from-blue-100 to-purple-100"}`}
                            />
                            <div className='flex flex-col'>
                              <span>
                                {user?.name}
                              </span>
                              <span className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}>
                                ID: #{user.uid}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* email */}
                        <td className={`px-4 py-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          {user.email}
                        </td>

                        {/* Total Orders */}
                        <td className="px-4 py-1">
                          <span className={`py-1 px-3 rounded-md bg-pink-600/10 text-pink-600`}>{user.ordersCount}</span>
                        </td>

                        <td className="px-4 py-1">
                          ₹{user.totalSpent.toLocaleString("en-IN")}
                        </td>

                        {/* date & time */}
                        <td className={`px-4 py-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          <div className='flex flex-col'>
                            <span className={`${isDark ? "text-gray-300" : "text-gray-800"} text-sm whitespace-nowrap`}>{formatDate(user?.createdAt)}</span>
                            <span className='text-sm'>{formatTime(user?.createdAt)}</span>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-1">
                          <span className={`px-3 text-sm py-1 rounded-full whitespace-nowrap ${getRoleBadge(user?.role)}`}>
                            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-1">
                          <span className={`px-3 text-sm py-1 rounded-full whitespace-nowrap ${getActiveBadge(user?.isActive ? "true" : "false")}`}>
                            {user?.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-4 py-1">
                          <div className="flex gap-2">
                            <div
                              className={`bg-slate-100 p-2 rounded-lg cursor-pointer ${isDark ? "bg-slate-800 text-gray-400" : "bg-slate-100 text-gray-800"} relative`}
                              onClick={() => handleShowActions(user?._id)}
                            >
                              <PiDotsThreeVerticalBold />
                              {(showActions === user._id) && (
                                <div ref={actionRef} className={`absolute top-full right-0 z-10 whitespace-nowrap flex flex-col items-start text-start rounded-md ${isDark ? "bg-gray-900 border-slate-700 text-gray-300" : "bg-white border-gray-200 text-gray-600"} overflow-hidden border-2 shadow-[0_0px_6px_rgba(0,0,0,0.15)]`}>
                                  <h1 className={`${isDark ? "text-gray-400" : "text-gray-500"} text-xs px-2 py-1`}>Customer Actions</h1>
                                  <button
                                    className={`${actionBtnClass} text-blue-600`}
                                    onClick={() => setEditModal(true)}
                                  >
                                    <span><BiPencil size={16} /></span>
                                    <span>Edit Role</span>
                                  </button>
                                  <button
                                    className={`${actionBtnClass} text-violet-600`}
                                  >
                                    <span><FiRefreshCw size={16} /></span>
                                    <span>Update Status</span>
                                  </button>
                                  <button className={`${actionBtnClass} text-emerald-600`}><FaEye size={16} />View Customer</button>
                                  <button
                                    className={`${actionBtnClass} text-red-600`}
                                  >
                                    <span><RiDeleteBin6Line size={16} /></span>
                                    <span>Delete Customer</span>
                                  </button>
                                </div>
                              )}
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
              <span className='font-semibold text-gray-400'>Showing {meta?.total > 0 ? (skip + 1) : "0"} to {(skip + 10) < meta?.total ? skip + 10 : meta?.total} of {meta?.total} entries</span>
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
      </div>

      {editModal && <EditRoleModal editModal={editModal} setEditModal={setEditModal} />}
    </div>
  );
}

const StatCard = ({ item, isDark }) => {
  const Icon = item.icon;
  const theme = isDark ? item.dark : item.light;

  return (
    <div className={`px-3 py-2 rounded-2xl shadow-[0px_3px_8px_rgba(0,0,0,0.15)] flex items-center gap-4 border-b-4 ${theme.card}`}>
      <div className={`p-4 rounded-xl ${theme.icon} text-3xl`}>
        <Icon />
      </div>

      <div>
        <p className={`text-sm ${isDark ? "text-slate-100" : "text-gary-600"} font-medium`}>
          {item.label}
        </p>
        <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
          {item.value}
        </p>
        {item.percentageChange !== undefined &&
          <div className="flex flex-row gap-1 font-medium text-sm mt-1">
            <div className={`${item.percentageChange >= 0 ? "text-green-500" : "text-red-500"} flex row gap-1 items-center`}>
              <IoMdArrowUp className={`${item.percentageChange < 0 && "rotate-180"}`} />
              <span>{item.percentageChange}%</span>
            </div>
            <p className={`${isDark ? "text-slate-300" : "text-slate-400"}`}>this month</p>
          </div>
        }
      </div>
    </div>
  );
};