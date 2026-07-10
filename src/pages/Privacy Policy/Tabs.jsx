import React from 'react'
import { NavLink } from 'react-router'

export default function PolicyTabs() {
  let tabs = [
   { name: "Terms and Services", route: "terms"},
    { name: "depositBonusRequirement", route: "deposit-bonus-requirement"},
   { name: "Anti-Money Laundering", route: "anti-money-laundering"},
    { name: "Privacy", route: "privacy"},
    { name: "Coin Mixing", route: "coin-mixing"},
    { name: "Providers", route: "providers"},
    { name: "Sports Book", route: "sportsbook"},
    { name: "Cookies Policy", route: "cookies policy"},
    { name: "Self-Exclusion", route: "self-exclusion"},
    { name: "Racing Rules", route: "racing-rles"},
    { name: "Poker cards Rooms rules", route: "poker cards"},
    { name: "Poker Refund Policy", route: "poker-refund-policy"},
    { name: "Affilate Terms", route: "affilate-terms"},
  
  ]
  return (
    <div className="bg-[var(--grey-700)] min-w-[250px] sticky p-2 ">
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
