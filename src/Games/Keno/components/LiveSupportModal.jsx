import React from 'react';
import { GrPowerReset } from "react-icons/gr";

const LiveStatsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-[120px] right-5 w-[320px] h-[85vh] bg-[#1e2832] border border-[#374151] rounded-xl shadow-[0_8px_25px_rgba(0,0,0,0.4)] z-[1000] font-sans flex flex-col overflow-hidden">
     
      <div className="flex justify-between items-center px-5 py-4 border-b border-[#374151] bg-[#242e3a] rounded-t-xl">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <span className="text-base">📊</span>
          <span>Live Stats</span>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 text-lg p-1 leading-none transition-colors duration-200 hover:text-white focus:outline-none"
        >
          ×
        </button>
      </div>

      <div className="flex justify-between items-center px-5 py-3 bg-[#242e3a] border-b border-[#374151]">
        <select className="bg-[#374151] border border-[#4b5563] text-white px-3 py-1.5 rounded-md text-xs outline-none cursor-pointer hover:bg-[#4b5563]">
          <option>All</option>
          <option>Wins</option>
          <option>Losses</option>
        </select>
        <button className="bg-transparent border-none text-gray-400 text-sm cursor-pointer p-1.5 rounded transition-colors hover:text-white hover:bg-[#374151]">
          <GrPowerReset />
        </button>
      </div>

      <div className="flex-1 flex flex-col bg-[#1e2832]">
        
        <div className="grid grid-cols-2 border-b border-[#374151] bg-[#242e3a]">
          <div className="p-4 border-r border-[#374151] bg-[#242e3a]">
            <div className="text-xs text-gray-400 mb-1">Profit</div>
            <div className="text-sm font-semibold text-green-500">
              0.00000000 <span className="text-[#f7931a] font-bold">₿</span>
            </div>
          </div>
          <div className="p-4 bg-[#242e3a]">
            <div className="text-xs text-gray-400 mb-1">Wins</div>
            <div className="text-sm font-semibold text-white">0</div>
          </div>
          <div className="p-4 border-r border-[#374151] border-t border-[#374151] bg-[#242e3a]">
            <div className="text-xs text-gray-400 mb-1">Wagered</div>
            <div className="text-sm font-semibold text-white">
              0.00000000 <span className="text-[#f7931a] font-bold">₿</span>
            </div>
          </div>
          <div className="p-4 border-t border-[#374151] bg-[#242e3a]">
            <div className="text-xs text-gray-400 mb-1">Losses</div>
            <div className="text-sm font-semibold text-red-500">0</div>
          </div>
        </div>

        <div className="flex-1 bg-[#1e2832] min-h-[200px]" />

        <div className="px-5 py-4 bg-[#242e3a] mt-auto border-t border-[#374151]">
          <div className="mb-4">
            <select className="w-full bg-[#374151] border border-[#4b5563] text-white px-3 py-2 rounded-md text-xs outline-none cursor-pointer hover:bg-[#4b5563]">
              <option>$100k Race</option>
            </select>
          </div>
          <div className="text-center text-xs text-gray-400">
            <p className="my-1">Wager to enter the race!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStatsModal;