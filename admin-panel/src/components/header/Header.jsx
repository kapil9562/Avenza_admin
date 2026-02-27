import React, { useState } from 'react'
import { IoIosSearch } from 'react-icons/io';
import { useTheme } from '../../context/ThemeContext';
import { IoIosArrowDown } from "react-icons/io";
import { FaRegBell } from "react-icons/fa";
import { BsMoonStarsFill } from "react-icons/bs";

function Header() {

  const [input, setInput] = useState("");
  const [searchType, setSearchType] = useState("");
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`px-8 ${isDark ? "" : "border-b-2 border-gray-200"} min-h-15 flex flex-row items-center justify-between full`}>
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
          className={`z-10 w-full p-2 pl-10 rounded-4xl border-2 border-gray-300 font-semibold text-gray-700 ${isDark ? "focus:border-white focus:outline-none bg-[#0F172A] placeholder:text-gray-500 text-white" : "focus:border-[#6B6F9C] focus:outline-none bg-white placeholder:text-gray-500"}`} />
        <IoIosSearch className='absolute left-3 text-2xl font-semibold text-[#8b90c7] z-20' />
      </div>
      <div className='flex flex-row gap-4 justify-center items-center'>
        <div className='flex justify-center items-center text-[16px]'>
          {/* Toggle for destop */}
          <button
            onClick={toggleTheme}
            className={`relative w-18 h-8 rounded-full hidden items-center transition-all duration-500 cursor-pointer ${isDark ? "bg-[#2d323a] shadow-black" : "bg-[#e9ecef] shadow-gray-400"} shadow-inner md:flex`}
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
          <FaRegBell className={`text-xl ${isDark? "text-gray-300":"text-gray-800"}`} />
        </div>
        <div className='flex flex-row gap-2 justify-center items-center cursor-pointer'>
          <div>
            <img src="https://images.unsplash.com/photo-1771828312982-5e14cffd176b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8MXx8fGVufDB8fHx8fA%3D%3D" alt="pfp" className='h-10 rounded-full' />
          </div>
          <div className='flex flex-col'>
            <h1 className={`font-semibold text-sm ${isDark? "text-gray-300" : "text-gray-800"}`}>Hi, Kapil</h1>
            <span className={`text-[12px] ${isDark? "text-gray-400": "text-gray-500"}`} >Admin</span>
          </div>
          <div>
            <IoIosArrowDown className={`${isDark? "text-gray-300": "text-gray-800"}`}/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header