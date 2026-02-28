import React, { useState } from 'react'
import { MdHome } from "react-icons/md";
import { LiaEnvelopeOpen } from "react-icons/lia";
import { AiOutlineProduct } from "react-icons/ai";
import { HiUser } from "react-icons/hi2";
import { GoGraph } from "react-icons/go";
import { IoMdSettings } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom'
import { HiMiniBars3BottomLeft } from "react-icons/hi2";
import { useTheme } from '../../context/ThemeContext';

function SideMenu() {
  const location = useLocation();
  const tab = location.pathname.replace('/', "");
  const [activetab, setActiveTab] = useState(!tab ? "Dashboard" : tab.charAt(0).toUpperCase() + tab.slice(1));
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    const current = !tab ? "Dashboard" : tab.charAt(0).toUpperCase() + tab.slice(1);
    setActiveTab(current);
  }, [location.pathname]);

  const baseTabs = [
    { icon: <MdHome size={26} />, tab: "Dashboard", color: "blue" },
    { icon: <AiOutlineProduct size={26} />, tab: "Products", color: "green" },
    { icon: <LiaEnvelopeOpen size={26} />, tab: "Orders", color: "teal" },
    { icon: <HiUser size={26} />, tab: "Customers", color: "orange" },
    { icon: <GoGraph size={26} />, tab: "Analytics", color: "purple" },
    { icon: <IoMdSettings size={26} />, tab: "Settings", color: "pink" },
  ];

  const tabs = baseTabs.map(item => ({
    ...item,
    className: isDark
      ? `text-${item.color}-400`
      : `text-${item.color}-600`,
    bg: isDark
      ? `bg-${item.color}-900/40 border border-${item.color}-700`
      : `bg-${item.color}-100 border border-${item.color}-300`,
    hoverColors: {
      blue: {
        light: "hover:bg-blue-100",
        dark: "hover:bg-blue-900/40",
      },
      green: {
        light: "hover:bg-green-100",
        dark: "hover:bg-green-900/40",
      },
      teal: {
        light: "hover:bg-teal-100",
        dark: "hover:bg-teal-900/40",
      },
      orange: {
        light: "hover:bg-orange-100",
        dark: "hover:bg-orange-900/40",
      },
      purple: {
        light: "hover:bg-purple-100",
        dark: "hover:bg-purple-900/40",
      },
      pink: {
        light: "hover:bg-pink-100",
        dark: "hover:bg-pink-900/40",
      },
    }
  }));

  const handleTab = (tab) => {
    setActiveTab(tab);
    const param = tab.toLowerCase();
    if (tab === "Dashboard") {
      navigate('/');
    } else {
      navigate(`/${param}`);
    }
  }

  return (
    <div className={`${isDark ? "bg-[#0F172A] border-slate-800" : "bg-[#F9F9FF] border-gray-200"} min-h-dvh border-r-2 transition-transform duration-300 pb-20 ${open ? "w-60" : "w-17"}`} >
      <div className={`px-6 border-b-2 flex justify-center items-center min-h-15 gap-4 ${isDark ? "border-b-slate-800" : "border-b-gray-300"}`}>
        <img src="/logo.png" alt="logo" className={`object-contain h-10 transition-all duration-300   ${open ? "opacity-100" : "opacity-0 w-0 overflow-hidden hidden"}`} />
        <button className={`cursor-pointer ${isDark ? "text-gray-300" : "text-gray-800"}`}>
          <HiMiniBars3BottomLeft size={24} onClick={() => setOpen(!open)} />
        </button>
      </div>
      <div className='flex flex-col pt-2 text-lg gap-1' onMouseEnter={() => setOpen(true)}>
        {tabs.map((item, idx) => (
          <div className={`flex flex-row items-center px-4 py-2 gap-2 font-semibold rounded-r-full cursor-pointer  transition-transform duration-300 ${item.className} ${activetab === item.tab && item.bg} ${isDark
            ? item.hoverColors[item.color].dark
            : item.hoverColors[item.color].light
            }`} key={idx} onClick={() => handleTab(item.tab)}>
            <span className="text-xl">
              {item.icon}
            </span>
            <h1 className={`${item.className} whitespace-nowrap transition-all duration-200  ${open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>{item.tab}</h1>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SideMenu