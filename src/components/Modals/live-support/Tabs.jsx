import React from 'react'
import { RiHomeSmileFill } from "react-icons/ri";
import { LuMessageSquareText } from "react-icons/lu";
import { IoMdHelpCircleOutline } from "react-icons/io";
import './styles/Tabs.css'; 

export default function Tabs({tab, setTab}) {

  return (
    <div className="tabs-container">
      <div onClick={()=> setTab("home")} className={`tab-item ${tab === "home" ? "active" : ""}`} >
        <RiHomeSmileFill />
        <span>Home</span>
      </div>
      <div onClick={()=> setTab("message")} className={`tab-item ${tab === "message" ? "active" : ""} `}>
        <LuMessageSquareText />
        <span>Messages</span>
      </div>
     <div onClick={()=> setTab("help")} className={`tab-item ${tab === "help" ? "active" : ""} `}>
        <IoMdHelpCircleOutline />
        <span>Help</span>
      </div>
    </div>
  )
}