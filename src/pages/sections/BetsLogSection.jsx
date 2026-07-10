import React, { useState, useContext } from 'react';
import AllBets from './tabs/AllBets';
import MyBets from './tabs/Mybets';
import { AuthContext } from '../../context/AuthContext';

export default function UsersBetLayout() {
  const [activeTab, setActive] = useState("all");
  const { user } = useContext(AuthContext);

  return (
    <>
      <div className='py-5 flex flex-col gap-3 px-3'>
          <div className='w-fit p-1 flex gap-2 bg-[var(--grey-700)] rounded-lg'>
            <button 
              onClick={()=> setActive("all")} 
              className={`${activeTab === "all" ? "bg-[var(--blue-600)] text-white scale-100" : "text-[var(--grey-200)] hover:bg-[var(--grey-600)]"} p-3 px-6 rounded-lg transition-all duration-200 font-medium`}
            >
              All Bets
            </button>
            <button 
              onClick={()=> setActive("my")} 
              className={`${activeTab !== "all" ? "bg-[var(--blue-600)] text-white scale-100" : "text-[var(--grey-200)] hover:bg-[var(--grey-600)]"} p-3 px-6 rounded-lg transition-all duration-200 font-medium`}
              disabled={!user}
            >
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
