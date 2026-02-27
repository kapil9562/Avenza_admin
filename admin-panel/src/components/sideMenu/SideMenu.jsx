import React, { useState } from 'react'
import { MdHome } from "react-icons/md";
import { LiaEnvelopeOpen } from "react-icons/lia";
import { AiOutlineProduct } from "react-icons/ai";
import { HiUser } from "react-icons/hi2";
import { GoGraph } from "react-icons/go";
import { IoMdSettings } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {useLocation} from 'react-router-dom'

function SideMenu() {
  const location = useLocation();
  const tab =  location.pathname.replace('/',"");
  const [activetab, setActiveTab] = useState(!tab ? "Dashboard" : tab.charAt(0).toUpperCase() + tab.slice(1));
  const navigate = useNavigate();
  const tabs = [
    {icon:<MdHome size={30}/>, tab:"Dashboard"},
    {icon:<AiOutlineProduct size={30}/>, tab:"Products"},
    {icon:<LiaEnvelopeOpen size={30}/>, tab:"Orders"},
    {icon:<HiUser size={30}/>, tab:"Customers"},
    {icon:<GoGraph size={30}/>, tab:"Analytics"},
    {icon:<IoMdSettings size={30}/>, tab:"Settings"},
  ];

  const handleTab = (tab) => {
    setActiveTab(tab);
    const param = tab.toLowerCase();
    if(tab === "Dashboard") {
      navigate('/');
    } else {
      navigate(`/${param}`);
    }
  }

  return (
    <div className='bg-purple-200 min-h-dvh min-w-50'>
      <div className='p-2 border-b-2 border-b-purple-300 flex justify-center items-center min-h-15'>
        <img src="/logo.png" alt="logo" className='object-contain h-10' />
      </div>
      <div className='flex flex-col pt-2 text-lg'>
        {tabs.map((item, idx) => (
          <div className={`flex flex-row items-center px-4 py-2 gap-2 text-white font-semibold hover:bg-purple-300 rounded-r-full cursor-pointer ${activetab===item.tab && "bg-purple-300"}`} key={idx} onClick={() => handleTab(item.tab)}>
          {item.icon}
          <h1>{item.tab}</h1>
        </div>
        ))}
      </div>
    </div>
  )
}

export default SideMenu