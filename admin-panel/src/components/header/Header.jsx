import React, { useEffect, useState } from 'react'
import { IoIosSearch } from 'react-icons/io';
import { useTheme } from '../../context/ThemeContext';
import { IoIosArrowDown } from "react-icons/io";
import { FaRegBell } from "react-icons/fa";
import { BsMoonStarsFill } from "react-icons/bs";
import { useAuth } from '../../context/AuthContext';
import { LiaShoppingBagSolid } from "react-icons/lia";
import { FiLogOut } from "react-icons/fi";
import { HiMiniBars3BottomLeft } from 'react-icons/hi2';

function Header({ setSideMenu }) {

  const [input, setInput] = useState("");
  const [searchType, setSearchType] = useState("");
  const { isDark, toggleTheme } = useTheme();
  const [isActive, setIsActive] = useState(true);

  const { user, logout } = useAuth();

  const handleDropDown = () => {
    if (isActive) setIsActive(false);
    else setIsActive(true);
  };

  useEffect(() => {
    setIsActive(false);
  }, [user]);

  const normalizeGooglePhoto = (url) => {
    if (!url) return null;
    const base = url.split("=")[0];
    return `${base}=s200`;
  };

  return (
    <div className={`lg:px-8 px-2 ${isDark ? "bg-[#0F172A] border-b-2 border-gray-800" : "bg-[#F9F9FF] border-b-2 border-gray-200"} min-h-15 flex flex-row items-center justify-between`}>
      <button
        onClick={() => setSideMenu(true)}
        className={`${isDark ? "text-gray-300" : "text-gray-700"} cursor-pointer lg:hidden`}
      >
        <HiMiniBars3BottomLeft size={22} />
      </button>
      <div className='relative w-1/2 flex flex-row justify-center items-center'>
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
      <div className='flex flex-row gap-4 justify-center items-center'>
        <div className='flex justify-center items-center text-[16px]'>
          {/* Toggle for destop */}
          <button
            onClick={toggleTheme}
            className={`relative w-18 h-8 rounded-full items-center transition-all duration-500 cursor-pointer ${isDark ? "bg-[#2d323a] shadow-black" : "bg-[#e9ecef] shadow-gray-400"} shadow-inner flex`}
          >
            {/* Knob */}
            <span className={`absolute w-6 h-6 z-10 rounded-full shadow-md flex items-center justify-center transition-all duration-500 ${isDark ? "translate-x-11 bg-[#15171b] shadow-black" : "translate-x-1 bg-white"}`}
            >
              {isDark ? (<BsMoonStarsFill className='text-yellow-500' />) : (<img src="https://images.emojiterra.com/google/noto-emoji/unicode-16.0/color/svg/2600.svg" alt="" className='h-5 w-5' />)}
            </span>
            {isDark ? (<span className='absolute left-1 text-gray-500 font-semibold'>Light</span>) : (<span className='absolute right-1'>Dark</span>)}
          </button>
        </div>
        <div className='flex justify-center items-center'>
          <FaRegBell className={`text-xl ${isDark ? "text-gray-300" : "text-gray-800"}`} />
        </div>
        <div className={`relative group`} onClick={handleDropDown} >
          <div className={`flex flex-row gap-2 justify-center items-center cursor-pointer py-2 ${isActive && "shadow-[inset_0_-2px_0_0_#ff1774]"} group-hover:shadow-[inset_0_-2px_0_0_#ff1774]`}>
            <div>
              <img src={user?.avatar || (isDark ? "/user.png" : "/userLight.png")} alt="pfp" className='h-10 rounded-full' />
            </div>
            <div className='flex flex-col'>
              <h1 className={`font-semibold text-sm ${isDark ? "text-gray-300" : "text-gray-800"}`}>Hi, {user?.name?.trim().split(" ")[0]}</h1>
              <span className={`text-[12px] ${isDark ? "text-gray-400" : "text-gray-500"}`} >{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</span>
            </div>
            <div>
              <IoIosArrowDown className={`${isDark ? "text-gray-300" : "text-gray-800"}`} />
            </div>
          </div>

          {/* {dropDown} */}
          <div className={`transition-all duration-300 origin-top-right will-change-transform transform-gpu ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"} ${isDark ? "bg-[#0F172A] shadow-[#0F172A90] shadow-md border-gray-700" : "bg-white border-gray-200 shadow-md"} absolute top-full flex flex-col justify-center text-lg font-semibold border-2 lg:group-hover:opacity-100 lg:group-hover:scale-100 scale-50 lg:pointer-events-none lg:group-hover:pointer-events-auto rounded-lg overflow-hidden z-90 right-0`}>
            <button className={`${isDark ? "hover:bg-[#2e3d5f]" : "hover:bg-pink-100"} flex flex-row items-center whitespace-nowrap gap-2 px-4 py-2 cursor-pointer`}>
              {(user?.avatar) ? (
                <img
                  src={normalizeGooglePhoto(user?.avatar)}
                  alt="pfp"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className='md:max-h-12 md:max-w-12 max-h-10 max-w-10 rounded-full object-cover' />
              ) : (
                <div className={`flex flex-col justify-center items-center text-sm md:text-lg group-hover:text-pink-500 relative group cursor-pointer ${isDark ? "text-gray-300" : "text-[#373951]"}`}>
                  <img src={`${isDark ? '/assets/user.png' : '/assets/userLight.png'}`} alt="pfp" className='h-8 w-8 rounded-full' />
                </div>
              )}
              <span className={`text-start ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                <p className=''>Hi, {(user?.name) ? user?.name.split(" ")[0] : "User"}</p>
                <p className='text-sm font-medium'>{user?.email}</p>
              </span>
            </button>
            <div className={`${isDark ? "border-gray-700" : "border-gray-200"} w-full border-t-2`}></div>
            {/* <button className={`${isDark ? "text-gray-200 hover:bg-[#2e3d5f] active:bg-[#2e3d5f]" : "hover:bg-pink-100 active:bg-pink-100 text-gray-700"} flex flex-row items-center whitespace-nowrap gap-2 px-4 py-2 cursor-pointer text-green-500`}
              onClick={(e) => {
                e.stopPropagation();
                setIsActive(false);
                navigate('/my-account/my-orders');
              }}>
              <LiaShoppingBagSolid className='text-xl' />
              <span>My Orders</span>
            </button>
            <div className={`${isDark ? "border-gray-700" : "border-gray-200"} w-full border-t-2`}></div> */}
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
  )
}

export default Header