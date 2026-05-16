import React, { useState, useEffect } from 'react'
import { MdHome } from "react-icons/md";
import { LiaEnvelopeOpen } from "react-icons/lia";
import { AiOutlineProduct } from "react-icons/ai";
import { HiUser, HiMiniBars3BottomLeft } from "react-icons/hi2";
import { GoGraph } from "react-icons/go";
import { IoMdSettings } from "react-icons/io";
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

function SideMenu({ sideMenu, setSideMenu }) {

  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const tab = location.pathname.replace('/', "");
  const [activetab, setActiveTab] = useState(!tab ? "Dashboard" : tab.charAt(0).toUpperCase() + tab.slice(1));
  const [open, setOpen] = useState({
    type: "",
    status: true
  });

  useEffect(() => {
    const current = !tab ? "Dashboard" : tab.charAt(0).toUpperCase() + tab.slice(1);
    setActiveTab(current);
  }, [location.pathname]);

  /*  STATIC COLOR SYSTEM (SAFE FOR TAILWIND) */

  const colorVariants = {
    Dashboard: {
      light: "text-blue-600 hover:bg-blue-100",
      dark: "text-blue-400 hover:bg-blue-900/40",
      activeLight: "bg-blue-100 border border-blue-300",
      activeDark: "bg-blue-900/40 border border-blue-700"
    },
    Products: {
      light: "text-green-600 hover:bg-green-100",
      dark: "text-green-400 hover:bg-green-900/40",
      activeLight: "bg-green-100 border border-green-300",
      activeDark: "bg-green-900/40 border border-green-700"
    },
    Orders: {
      light: "text-teal-600 hover:bg-teal-100",
      dark: "text-teal-400 hover:bg-teal-900/40",
      activeLight: "bg-teal-100 border border-teal-300",
      activeDark: "bg-teal-900/40 border border-teal-700"
    },
    Customers: {
      light: "text-orange-600 hover:bg-orange-100",
      dark: "text-orange-400 hover:bg-orange-900/40",
      activeLight: "bg-orange-100 border border-orange-300",
      activeDark: "bg-orange-900/40 border border-orange-700"
    },
    Analytics: {
      light: "text-purple-600 hover:bg-purple-100",
      dark: "text-purple-400 hover:bg-purple-900/40",
      activeLight: "bg-purple-100 border border-purple-300",
      activeDark: "bg-purple-900/40 border border-purple-700"
    },
    Settings: {
      light: "text-pink-600 hover:bg-pink-100",
      dark: "text-pink-400 hover:bg-pink-900/40",
      activeLight: "bg-pink-100 border border-pink-300",
      activeDark: "bg-pink-900/40 border border-pink-700"
    }
  };

  const tabs = [
    { icon: <MdHome size={24} />, tab: "Dashboard" },
    { icon: <AiOutlineProduct size={24} />, tab: "Products" },
    { icon: <LiaEnvelopeOpen size={24} />, tab: "Orders" },
    { icon: <HiUser size={24} />, tab: "Customers" },
    { icon: <GoGraph size={24} />, tab: "Analytics" },
    { icon: <IoMdSettings size={24} />, tab: "Settings" },
  ];

  const handleTab = (tab) => {
    setActiveTab(tab);
    tab === "Dashboard" ? navigate("/") : navigate(`/${tab.toLowerCase()}`);
  };

  return (
    <div>
      <div className={`${isDark? "bg-black/30" : "bg-black/50"} absolute min-h-dvh w-full z-100 ${sideMenu? "block" : "hidden"}`}></div>
      <div
        className={`${isDark ? "bg-[#0F172A] border-slate-800" : "bg-[#F9F9FF] border-gray-200"} 
      min-h-dvh border-r-2 transition-[width,transform] duration-300 pb-20 absolute left-0 z-200 lg:relative lg:translate-x-0 ${sideMenu ? "translate-x-0" : "-translate-x-full"}
      ${open.status ? "w-60" : "w-16"} overflow-hidden`}
      >

        {/* TOP */}
        <div className={`px-4 border-b-2 flex items-center justify-between min-h-15
        ${isDark ? "border-slate-800" : "border-gray-300"}`}
        >
          <img
            src="/logo.png"
            alt="logo"
            className={`h-10 transition-opacity duration-300 ${open.status ? "opacity-100" : "opacity-0 w-0"}`}
          />

          <button
            onClick={() => setOpen({
              type: "manual",
              status: !open.status
            })}
            className={`${isDark ? "text-gray-300" : "text-gray-700"} cursor-pointer hidden lg:block`}
          >
            <HiMiniBars3BottomLeft size={22} />
          </button>

          <button
            onClick={() => setSideMenu(false)}
            className={`${isDark ? "text-gray-300" : "text-gray-700"} cursor-pointer lg:hidden`}
          >
            <HiMiniBars3BottomLeft size={22} />
          </button>
        </div>

        {/* MENU */}
        <div className="flex flex-col mt-4 gap-1 h-full"
          onMouseEnter={() => {
            if (!open.status) {
              setOpen({ type: "hover", status: true });
            }
          }}

          onMouseLeave={() => {
            if (open.type === "hover") {
              setOpen({ type: "", status: false });
            }
          }}>

          {tabs.map((item, idx) => {

            const variant = colorVariants[item.tab];

            return (
              <div
                key={idx}
                onClick={() => {
                  handleTab(item.tab);
                  setSideMenu(false);
                }}
                className={`
                flex items-center gap-2 px-4 py-2 cursor-pointer
                rounded-r-full font-semibold
                ${isDark ? variant.dark : variant.light}
                ${activetab === item.tab ?
                    (isDark ? variant.activeDark : variant.activeLight) : "border border-transparent"}
              `}
              >
                <span className='text-xl'>{item.icon}</span>

                <span
                  className={`whitespace-nowrap transition-[opacity, width] duration-200 text-lg
                ${open.status ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}
                >
                  {item.tab}
                </span>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}

export default SideMenu;