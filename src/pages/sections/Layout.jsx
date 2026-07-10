import React, { useState } from 'react';
import AllBets from './tabs/AllBets';
import MyBets from './tabs/Mybets';

export default function UsersBetLayout() {
  const [activeTab, setActive] = useState("all")
  return (
    <>
      <div className='py-5 flex flex-col gap-3 px-3'>
          <div className='w-fit p-1 flex gap-2 bg-[var(--secondary-bg)] rounded-lg'>
            <button onClick={()=> setActive("all")} className={`${activeTab === "all" ? "bg-[var(--accent-purple-dark)] hover:scale-95" : ""} p-2 px-6 rounded-lg scale-90 transition-all duration-200 `}>
                All Bets
            </button>
            <button onClick={()=> setActive("my")} className={`${activeTab != "all" ? "bg-[var(--accent-purple-dark)] hover:scale-95" : ""} p-2 px-6 rounded-lg scale-90 transition-all duration-200 `} >
                My Bets
            </button>
          </div>
          
          {/* Render the appropriate table based on active tab */}
          {activeTab === "all" && <AllBets />}
          {activeTab === "my" && <MyBets />}
      </div>
    </>
  );
}
