import React, { useEffect, useState } from 'react'
import { IoIosSearch } from 'react-icons/io';
import { useTheme } from '../../context/Context';
import { IoIosArrowDown } from "react-icons/io";
import { FaRegBell } from "react-icons/fa";
import { BsMoonStarsFill } from "react-icons/bs";
import { LiaShoppingBagSolid } from "react-icons/lia";
import { FiLogOut } from "react-icons/fi";
import { HiMiniBars3BottomLeft } from 'react-icons/hi2';
import { formatRole, normalizeGooglePhoto } from '../../utils/format';
import { useAuth } from '../../context/Context';

function Header({ setSideMenu }) {

  const [input, setInput] = useState("");
  const [searchType, setSearchType] = useState("");
  const { isDark, toggleTheme } = useTheme();
  const [isActive, setIsActive] = useState(false);

  const { user, logout } = useAuth();

  const handleDropDown = () => {
    if (isActive) setIsActive(false);
    else setIsActive(true);
  };

  return (
    <div className={`sticky min-h-15 top-0 z-100 lg:px-8 px-2 pb-2 sm:pb-0 border-b-2 ${isDark ? "bg-[#0F172A] border-slate-800" : "bg-[#F9F9FF] border-slate-200"}`}>
      <div className={`flex flex-row items-center justify-between`}>
        <div className='flex gap-2 lg:hidden'>
          <button
            onClick={() => setSideMenu(true)}
            className={`${isDark ? "text-gray-300" : "text-gray-700"} cursor-pointer`}
          >
            <HiMiniBars3BottomLeft size={22} />
          </button>
          <img
            src="/logo.png"
            alt="logo"
            className={`h-8 sm:w-40 w-25 sm:hidden`}
          />
        </div>

        {/* Search Bar for large screens */}
        <div className='relative w-1/2 flex-row justify-center items-center hidden sm:flex'>
          <input
            value={input}
            maxLength={20}
            onChange={(e) => {
              setInput(e.target.value);
              setSearchType(null);
            }}
            type="text"
            placeholder='Type to search...'
            className={`z-10 w-full p-2 pl-10 rounded-4xl border-2 font-semibold text-gray-700 ${isDark ? "focus:border-gray-400 focus:outline-none bg-[#0F172A] placeholder:text-gray-500 text-white border-gray-500" : "border-gray-300 focus:border-[#6B6F9C] focus:outline-none bg-white placeholder:text-gray-500"}`} />
          <IoIosSearch className='absolute left-3 text-2xl font-semibold text-[#8b90c7] z-20' />
        </div>

        {/* Theme Toggle */}
        <div className='flex flex-row gap-4 justify-center items-center'>
          <div className='flex justify-center items-center text-[16px]'>

            {/* Theme Toggle for destop */}
            <button
              onClick={toggleTheme}
              className={`relative w-18 h-8 rounded-full items-center transition-all duration-500 cursor-pointer hidden lg:flex ${isDark ? "bg-[#2d323a] shadow-black" : "bg-[#e9ecef] shadow-gray-400"} shadow-inner`}
            >
              {/* Knob */}
              <span className={`absolute w-6 h-6 z-10 rounded-full shadow-md flex items-center justify-center transition-all duration-500 ${isDark ? "translate-x-11 bg-[#15171b] shadow-black" : "translate-x-1 bg-white"}`}
              >
                {isDark ? (<BsMoonStarsFill className='text-yellow-500' />) : (<img src="https://images.emojiterra.com/google/noto-emoji/unicode-16.0/color/svg/2600.svg" alt="" className='h-5 w-5' />)}
              </span>
              {isDark ? (<span className='absolute left-1 text-gray-500 font-semibold'>Light</span>) : (<span className='absolute right-1'>Dark</span>)}
            </button>

            {/* Theme Toggle for mobile */}
            <button onClick={toggleTheme} className='lg:hidden flex justify-center items-center cursor-pointer'>
              {isDark ? <img src="https://images.emojiterra.com/google/noto-emoji/unicode-16.0/color/svg/2600.svg" alt="" className='min-h-6 min-w-6' /> : <BsMoonStarsFill className='text-yellow-400 text-xl' />}
            </button>
          </div>
          <div className='flex justify-center items-center'>
            <FaRegBell className={`text-xl ${isDark ? "text-gray-300" : "text-gray-800"}`} />
          </div>
          <div
            className={`relative group`}
            onClick={handleDropDown}
            onMouseLeave={() => setIsActive(false)}
          >
            <div className={`flex flex-row gap-2 justify-center items-center cursor-pointer py-2 ${isActive && "shadow-[inset_0_-2px_0_0_#ff1774]"} group-hover:shadow-[inset_0_-2px_0_0_#ff1774]`}>
              <div>
                <img
                  src={normalizeGooglePhoto(user?.avatar) || (isDark ? "/user.png" : "/userLight.png")}
                  alt="pfp"
                  className='h-10 rounded-full'
                />
              </div>
              <div className='flex-col hidden sm:flex'>
                <h1 className={`font-semibold text-sm ${isDark ? "text-gray-300" : "text-gray-800"}`}>Hi, {user?.name?.trim().split(" ")[0]}</h1>
                <span className={`text-[12px] font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`} >{formatRole(user?.role)}</span>
              </div>
              <div className='hidden sm:block'>
                <IoIosArrowDown className={`${isDark ? "text-gray-300" : "text-gray-800"} group-hover:rotate-180 transition-transform duration-300 group-hover:text-[#ff1774] ${isActive && "rotate-180 text-[#ff1774]"}`} />
              </div>
            </div>

            {/* {dropDown} */}
            <div className={`transition-all duration-300 origin-top-right will-change-transform transform-gpu ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"} ${isDark ? "bg-[#0F172A] shadow-[#0F172A90] shadow-md border-gray-700" : "bg-white border-gray-200 shadow-md"} absolute top-full flex flex-col justify-center text-lg font-semibold border-2 lg:group-hover:opacity-100 lg:group-hover:scale-100 scale-50 lg:pointer-events-none lg:group-hover:pointer-events-auto rounded-lg overflow-hidden z-90 right-0`}>
              <button className={`${isDark ? "hover:bg-[#2e3d5f]" : "hover:bg-pink-100"} flex flex-row items-center whitespace-nowrap gap-2 px-4 py-2 cursor-pointer`}>
                <img
                  src={normalizeGooglePhoto(user?.avatar) || (isDark ? "/user.png" : "/userLight.png")}
                  alt="pfp"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className='md:max-h-12 md:max-w-12 max-h-10 max-w-10 rounded-full object-cover'
                />
                <span className={`text-start ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                  <p className=''>Hi, {(user?.name) ? user?.name.split(" ")[0] : "User"}</p>
                  <p className='text-sm font-medium'>{user?.email}</p>
                </span>
              </button>
              <div className={`${isDark ? "border-gray-700" : "border-gray-200"} w-full border-t-2`}></div>
              <button
                className={`${isDark ? "hover:bg-[#2e3d5f]" : "hover:bg-pink-100"} flex flex-row items-center whitespace-nowrap gap-2 text-red-500 px-4 py-2 cursor-pointer`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsActive(false);
                  logout();
                }}>
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar for small screens */}
      <div className='relative w-full flex-row justify-center items-center sm:hidden flex'>
        <input
          value={input}
          maxLength={20}
          onChange={(e) => {
            setInput(e.target.value);
            setSearchType(null);
          }}
          type="text"
          placeholder='Type to search...'
          className={`z-10 w-full p-2 pl-8 rounded-4xl border-2 font-semibold text-gray-700 ${isDark ? "focus:border-slate-500 focus:outline-none bg-[#0F172A] placeholder:text-gray-500 text-white border-slate-700" : "border-gray-300 focus:border-gray-400 focus:outline-none bg-white placeholder:text-gray-500"}`} />
        <IoIosSearch className='absolute left-2 text-xl font-semibold text-[#8b90c7] z-20 pointer-events-none' />
      </div>

    </div>
  )
}

export default Header