import React from 'react'
import { NavLink } from 'react-router'

export default function GambleTabs() {
  
  let tabs = [
    { name: "Stake Smart", route: "stake-smart"},
    { name: "Recognise the Sign", route: "recognise-the-sign"},
    { name: "Self Assessment", route: "self-assessement"},
    { name: "Budget Calculator", route: "budget-calculator"},
    { name: "Responsible Gambling FAQ's", route: "responsible-gambling"},
  ]

  return (
    <div className="bg-[var(--grey-700)] min-w-[250px] sticky p-2 rounded">
      {tabs.map((item, index)=>(
        <div key={index} className="tabs-controllers py-1 w-full">
          <NavLink 
            to={item.route} 
            className={({ isActive }) => 
              `block text-white font-bold p-3 w-full rounded transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-600'
              }`
            }
          >  
            {item.name}
          </NavLink>
        </div>
      ))}
    </div>
  )
}
