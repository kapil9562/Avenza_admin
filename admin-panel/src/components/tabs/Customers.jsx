import React, { useRef, useEffect, useLayoutEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  FiShoppingBag,
  FiUsers
} from "react-icons/fi";
import { IoMdArrowUp } from "react-icons/io";
import { LuCrown, LuUserCog } from "react-icons/lu";

import Lottie from 'lottie-react';
import { BiFilterAlt, BiPencil } from "react-icons/bi";
import { FiDownload, FiRefreshCw } from "react-icons/fi";
import { IoIosSearch } from 'react-icons/io';
import { IoRefresh } from 'react-icons/io5';
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import { getAllUsers } from '../../api/api';
import adminLoader from '../../assets/adminLoader.json';
import { useCustomers } from "../../context/CustomerContext";
import { useTheme } from '../../context/ThemeContext';
import { formatDate, formatTime, getActiveBadge, getRoleBadge, normalizeGooglePhoto } from '../../utils/format';
import { FaEye } from "react-icons/fa6";
import { EditRoleModal } from "../../helpers/EditRoleModal";

// Portal Dropdown
function ActionDropdown({ userId, triggerRef, isDark, onClose, actions }) {
  const [pos, setPos] = useState(null);
  const dropdownRef = useRef(null);

  useLayoutEffect(() => {
    if (!triggerRef?.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownWidth = 180;
    const dropdownHeight = dropdownRef.current?.offsetHeight || 160;
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
      style={{ top: pos?.top ?? 0, left: pos?.left ?? 0, width: 180, visibility: pos ? "visible" : "hidden" }}
      className={`fixed z-[9999] whitespace-nowrap flex flex-col items-start text-start rounded-md overflow-hidden border-2 shadow-[0_4px_16px_rgba(0,0,0,0.18)] ${
        isDark
          ? "bg-gray-900 border-slate-700 text-gray-300"
          : "bg-white border-gray-200 text-gray-600"
      }`}
    >
      <h1 className={`${isDark ? "text-gray-400" : "text-gray-500"} text-xs px-2 py-1`}>
        Customer Actions
      </h1>
      {actions.map(({ label, icon: Icon, colorClass, onClick }) => (
        <button
          key={label}
          className={`flex gap-2 items-center px-3 py-1.5 text-sm font-medium w-full cursor-pointer ${colorClass} ${
            isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
          }`}
          onClick={(e) => {
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

//Main Component
export default function Customers() {
  const { isDark } = useTheme();
  const [inputValue, setInputValue] = useState("1");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showActions, setShowActions] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [currUser, setCurrUser] = useState({});

  // Per-row trigger refs
  const triggerRefs = useRef({});

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
        const res = await getAllUsers({ skip });

        if (res?.data?.users?.length === 0) setError("No any user found!");

        setMeta(res?.data?.metaData);
        if (!users) setUsers(cacheKey, res?.data?.users);

        if (res?.data?.orders?.length === 0 && page > 1) {
          setPage((prev) => prev - 1);
        }
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || "Something went wrong!";
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

  const statCard = [
    {
      label: "Total Customers",
      value: meta?.total || "-",
      icon: FiUsers,
      light: { icon: "bg-pink-100 text-pink-500", card: "from-white via-white to-pink-50 border-b-pink-200" },
      dark: { icon: "bg-pink-900/50 text-pink-400", card: "bg-pink-900/40 text-pink-400 border-pink-700" },
    },
    {
      label: "New Customers",
      value: meta?.new?.count,
      percentageChange: meta?.new?.growth,
      icon: LuUserCog,
      light: { icon: "bg-purple-100 text-purple-500", card: "from-white via-white to-purple-50 border-b-purple-200" },
      dark: { icon: "bg-purple-900/50 text-purple-400", card: "bg-purple-900/40 text-purple-400 border-purple-700" },
    },
    {
      label: "Repeat Customers",
      value: meta?.repeat?.count,
      percentageChange: meta?.repeat?.growth,
      icon: FiShoppingBag,
      light: { icon: "bg-green-100 text-green-500", card: "from-white via-white to-green-50 border-b-green-200" },
      dark: { icon: "bg-green-900/50 text-green-400", card: "bg-green-900/40 text-green-400 border-green-700" },
    },
    {
      label: "Top Customers",
      value: meta?.top?.count,
      percentageChange: meta?.top?.growth,
      icon: LuCrown,
      light: { icon: "bg-orange-100 text-orange-500", card: "from-white via-white to-orange-50 border-b-orange-200" },
      dark: { icon: "bg-orange-900/50 text-orange-400", card: "bg-orange-900/40 text-orange-400 border-orange-700" },
    },
  ];

  return (
    <div
      className={`h-[calc(100dvh-60px)] w-fit lg:w-full p-4 font-sans text-slate-700 overflow-y-auto pb-20 scroll-smooth ${
        isDark ? "bg-[#0F172A]" : "bg-[#F9F9FF]"
      }`}
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
        {statCard.map((item) => (
          <StatCard key={item.label} item={item} isDark={isDark} />
        ))}
      </div>

      <div
        className={`${
          isDark ? "border-gray-800" : "bg-white border-gray-100"
        } border-2 rounded-2xl overflow-hidden`}
      >
        {/* Header */}
        <div className="p-4 flex flex-row justify-between items-center">
          <div className="flex flex-row gap-1 text-lg">
            <h2 className={`${isDark ? "text-gray-100" : "text-gray-800"} font-semibold`}>
              All Customers
            </h2>
            <span className={`${isDark ? "text-gray-400" : "text-gray-600"} font-medium`}>
              (1,248)
            </span>
          </div>

          <div className="flex flex-row gap-4">
            {/* Search */}
            <div className="relative w-xs flex flex-row justify-center items-center">
              <input
                value={input}
                maxLength={50}
                onChange={(e) => setInput(e.target.value)}
                type="text"
                placeholder="Search customers..."
                className={`z-10 w-full px-2 py-1 pl-2 rounded-lg border-2 font-semibold text-gray-700 ${
                  isDark
                    ? "focus:border-gray-400 focus:outline-none bg-[#0F172A] placeholder:text-gray-500 text-white border-gray-500"
                    : "border-gray-300 focus:border-[#6B6F9C] focus:outline-none bg-white placeholder:text-gray-500"
                }`}
              />
              <IoIosSearch className="absolute right-2 text-2xl font-semibold text-[#8b90c7] z-20 pointer-events-none" />
            </div>

            <div
              className={`flex flex-row gap-2 items-center shadow font-semibold w-fit rounded-md px-3 py-1 cursor-pointer ${
                isDark ? "border-slate-700 text-gray-300 border-2" : "border border-gray-200 text-gray-700"
              }`}
            >
              <BiFilterAlt className={`${isDark ? "text-gray-300" : "text-gray-800"}`} />
              <h1 className="text-sm">Filter</h1>
            </div>

            <div
              className={`flex flex-row gap-2 items-center shadow font-semibold w-fit rounded-md px-3 py-1 cursor-pointer ${
                isDark ? "border-slate-700 text-gray-300 border-2" : "border border-gray-200 text-gray-700"
              }`}
            >
              <FiDownload className={`${isDark ? "text-gray-300" : "text-gray-800"}`} />
              <h1 className="text-sm">Export</h1>
            </div>

            <button
              className={`px-3 py-1 bg-linear-to-b flex flex-row justify-center rounded-lg font-semibold items-center gap-2 from-purple-300 to-purple-500 cursor-pointer active:scale-95 transition-transform duration-300 will-change-transform text-sm text-white ${
                isDark ? "shadow-[0px_3px_8px_rgba(0,0,0,1)]" : "shadow-[0px_3px_8px_rgba(0,0,0,0.24)]"
              }`}
            >
              <FiRefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div
          className={`border-t-2 overflow-x-auto ${
            isDark ? "border-gray-800 shadow-xl shadow-[#0d1423]" : "border-gray-100 shadow-xl"
          }`}
        >
          <div className="h-[55dvh] overflow-y-auto tableBody scroll-smooth">
            <table className="w-full border-collapse">
              <thead
                className={`sticky top-0 z-50 ${
                  isDark ? "bg-slate-800 text-gray-100" : "bg-slate-100"
                }`}
              >
                <tr
                  className={`text-left divide-slate-200 divide-x ${
                    isDark ? "divide-slate-700" : "divide-slate-200"
                  }`}
                >
                  <th className="px-4 py-2 w-[25%] font-semibold whitespace-nowrap text-sm">Customer</th>
                  <th className="px-4 py-2 min-w-50 w-[20%] font-semibold text-sm">Email</th>
                  <th className="px-4 py-2 w-[15%] text-sm font-semibold">Orders</th>
                  <th className="px-4 py-2 w-[12%] text-sm font-semibold">Total Spent</th>
                  <th className="px-4 py-2 w-[8%] text-sm font-semibold whitespace-nowrap">Joined On</th>
                  <th className="px-4 py-2 w-[10%] text-sm font-semibold">Role</th>
                  <th className="px-4 py-2 w-[10%] text-sm font-semibold">Status</th>
                  <th className="px-4 py-2 w-[5%] text-sm font-semibold">Action</th>
                </tr>
              </thead>

              <tbody
                className={`font-semibold divide-y ${
                  isDark ? "divide-slate-700 text-gray-300" : "divide-slate-200 text-gray-800"
                } ${
                  users?.length > 0
                    ? isDark
                      ? "border-b border-b-slate-800"
                      : "border-b border-b-slate-200"
                    : "h-[50dvh]"
                }`}
              >
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
                        <img src="/noResult.webp" alt="img" className="h-40 w-40 object-contain" />
                        <p className="text-red-500 font-semibold text-lg">{error}</p>
                        <button
                          className={`px-2 py-2 bg-linear-to-b flex flex-row justify-center rounded-lg font-semibold items-center gap-2 cursor-pointer active:scale-95 transition-all duration-300 will-change-transform text-sm mt-2 text-white ${
                            isDark ? "from-purple-500 to-purple-700" : "from-purple-300 to-purple-500"
                          } hover:brightness-110`}
                        >
                          <IoRefresh size={26} />
                          <span>Refresh Customers</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users?.map((user, idx) => (
                    <React.Fragment key={user?._id || idx}>
                      <tr className={`divide-x ${isDark ? "divide-slate-700" : "divide-slate-200"}`}>

                        {/* Customer */}
                        <td className="px-4 py-1">
                          <div className="flex items-center gap-4">
                            <img
                              src={normalizeGooglePhoto(user?.avatar) || (isDark ? "/user.png" : "/userLight.png")}
                              referrerPolicy="no-referrer"
                              alt="thumbnail"
                              className={`min-w-10 min-h-10 max-w-10 max-h-10 object-contain rounded-full ${
                                isDark
                                  ? "bg-linear-to-br from-blue-900/40 to-purple-900/40"
                                  : "bg-linear-to-br from-blue-100 to-purple-100"
                              }`}
                            />
                            <div className="flex flex-col">
                              <span>{user?.name}</span>
                              <span className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}>
                                ID: #{user.uid}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className={`px-4 py-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          {user.email}
                        </td>

                        <td className="px-4 py-1">
                          <span className="py-1 px-3 rounded-md bg-pink-600/10 text-pink-600">
                            {user.ordersCount}
                          </span>
                        </td>

                        <td className="px-4 py-1">₹{user.totalSpent.toLocaleString("en-IN")}</td>

                        <td className={`px-4 py-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          <div className="flex flex-col">
                            <span className={`${isDark ? "text-gray-300" : "text-gray-800"} text-sm whitespace-nowrap`}>
                              {formatDate(user?.createdAt)}
                            </span>
                            <span className="text-sm">{formatTime(user?.createdAt)}</span>
                          </div>
                        </td>

                        <td className="px-4 py-1">
                          <span className={`px-3 text-sm py-1 rounded-full whitespace-nowrap ${getRoleBadge(user?.role)}`}>
                            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                          </span>
                        </td>

                        <td className="px-4 py-1">
                          <span
                            className={`px-3 text-sm py-1 rounded-full whitespace-nowrap ${getActiveBadge(
                              user?.isActive ? "true" : "false"
                            )}`}
                          >
                            {user?.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* ── Action Button ── */}
                        <td className="px-4 py-1">
                          <div
                            ref={(el) => (triggerRefs.current[user._id] = el)}
                            className={`inline-flex p-2 rounded-lg cursor-pointer ${showActions === user?._id && "shadow-[inset_0_0_0_1px]"} ${
                              isDark ? "bg-slate-800 text-gray-400 shadow-purple-600" : "bg-slate-100 text-gray-800 shadow-purple-400"
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              setShowActions((prev) => (prev === user._id ? null : user._id));
                            }}
                          >
                            <PiDotsThreeVerticalBold />
                          </div>

                          {/* Portal dropdown — renders outside ALL overflow containers */}
                          {showActions === user._id && (
                            <ActionDropdown
                              userId={user._id}
                              triggerRef={{ current: triggerRefs.current[user._id] }}
                              isDark={isDark}
                              onClose={() => setShowActions(null)}
                              actions={[
                                {
                                  label: "Edit Role",
                                  icon: BiPencil,
                                  colorClass: "text-blue-600",
                                  onClick: () => {
                                    setCurrUser(user);
                                    setEditModal(true);
                                  },
                                },
                                {
                                  label: "Update Status",
                                  icon: FiRefreshCw,
                                  colorClass: "text-violet-600",
                                  onClick: () => {},
                                },
                                {
                                  label: "View Customer",
                                  icon: FaEye,
                                  colorClass: "text-emerald-600",
                                  onClick: () => navigate(`/customers/${user._id}`),
                                },
                                {
                                  label: "Delete Customer",
                                  icon: RiDeleteBin6Line,
                                  colorClass: "text-red-600",
                                  onClick: () => {},
                                },
                              ]}
                            />
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            className={`flex flex-row justify-between items-center px-4 border-t-2 min-h-13 ${
              isDark ? "border-t-gray-800" : "border-t-gray-100"
            }`}
          >
            <div>
              <span className="font-semibold text-gray-400">
                Showing {meta?.total > 0 ? skip + 1 : "0"} to{" "}
                {skip + 10 < meta?.total ? skip + 10 : meta?.total} of {meta?.total} entries
              </span>
            </div>
            <div className="flex flex-row gap-4 items-center w-fit">
              <span className="font-semibold text-gray-400">
                Page {totalPages > 0 ? page : "0"} of {totalPages}
              </span>

              {showPagination && (
                <div className="flex justify-center items-center">
                  <div className="flex justify-center items-center p-1 sm:p-2 gap-1 sm:gap-2">
                    <button
                      onClick={prevPage}
                      disabled={page === 1 || loading}
                      className={`${
                        isDark ? "border-gray-700 text-gray-300 border-2" : "border-gray-200 text-white"
                      } flex flex-row justify-center items-center disabled:opacity-50 border shadow cursor-pointer px-3 py-1 rounded-lg disabled:cursor-not-allowed`}
                    >
                      <span className="font-semibold text-gray-400">Prev</span>
                    </button>

                    <div
                      className={`border font-semibold text-gray-400 rounded-lg shadow flex justify-center items-center px-1 py-1 ${
                        isDark ? "border-gray-700 border-2" : "border-gray-200"
                      }`}
                    >
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

                    <button
                      onClick={nextPage}
                      disabled={page === totalPages || loading}
                      className={`${
                        isDark ? "border-gray-700 text-gray-300 border-2" : "border-gray-200 text-white"
                      } flex flex-row justify-center items-center disabled:opacity-50 border shadow cursor-pointer px-3 py-1 rounded-lg disabled:cursor-not-allowed`}
                    >
                      <span className="font-semibold text-gray-400">Next</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {editModal && (
        <EditRoleModal editModal={editModal} setEditModal={setEditModal} currUser={currUser} />
      )}
    </div>
  );
}

//StatCard
const StatCard = ({ item, isDark }) => {
  const Icon = item.icon;
  const theme = isDark ? item.dark : item.light;

  return (
    <div
      className={`px-3 py-2 rounded-2xl shadow-[0px_3px_8px_rgba(0,0,0,0.15)] flex items-center gap-4 border-b-4 ${theme.card}`}
    >
      <div className={`p-4 rounded-xl ${theme.icon} text-3xl`}>
        <Icon />
      </div>
      <div>
        <p className={`text-sm ${isDark ? "text-slate-100" : "text-gray-600"} font-medium`}>
          {item.label}
        </p>
        <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
          {item.value}
        </p>
        {item.percentageChange !== undefined && (
          <div className="flex flex-row gap-1 font-medium text-sm mt-1">
            <div
              className={`${
                item.percentageChange >= 0 ? "text-green-500" : "text-red-500"
              } flex row gap-1 items-center`}
            >
              <IoMdArrowUp className={`${item.percentageChange < 0 && "rotate-180"}`} />
              <span>{item.percentageChange}%</span>
            </div>
            <p className={`${isDark ? "text-slate-300" : "text-slate-400"}`}>this month</p>
          </div>
        )}
      </div>
    </div>
  );
};