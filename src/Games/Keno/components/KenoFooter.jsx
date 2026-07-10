import React, { useState, useRef, useEffect } from 'react';
import { IoSettingsOutline } from "react-icons/io5";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { CiStar } from "react-icons/ci";
import { BsLightningChargeFill } from "react-icons/bs";
import { MdAnimation } from "react-icons/md";
import { FaFire } from "react-icons/fa6";
import { FaRegListAlt } from "react-icons/fa";
import { FaRegKeyboard } from "react-icons/fa";
import LiveStatsModal from './LiveSupportModal';
import FairnessModal from './FairnessModal'; // ✅ Import your modal

const KenoFooter = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isFairnessOpen, setIsFairnessOpen] = useState(false); // ✅ State for Fairness modal
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="bottom-bar">
        <div className="nav-icons">
          <div className="nav-icon-wrapper" ref={dropdownRef}>
            <button className="nav-icon" onClick={() => setDropdownOpen(prev => !prev)}>
              <IoSettingsOutline />
            </button>
            {!dropdownOpen && <span className="tooltip">Game Settings</span>}
            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-item volume-control">
                  <label>Volume</label>
                  <input type="range" min="0" max="100" defaultValue="50" />
                </div>
                <div className="dropdown-item"><span><BsLightningChargeFill /></span> Instant Bet</div>
                <div className="dropdown-item"><span><MdAnimation /></span> Animation</div>
                <div className="dropdown-item"><span><FaFire /></span> Max Bet</div>
                <div className="dropdown-item"><span><FaRegListAlt /></span> Game Info</div>
                <div className="dropdown-item"><span><FaRegKeyboard /></span> Hotkeys</div>
              </div>
            )}
          </div>

          <div className="nav-icon-wrapper">
            <button className="nav-icon" onClick={() => setIsSupportOpen(true)}>
              <LuChartNoAxesCombined />
            </button>
            <span className="tooltip">Live Stats</span>
          </div>

          <div className="nav-icon-wrapper">
            <button className="nav-icon">
              <CiStar />
            </button>
            <span className="tooltip">Favorites</span>
          </div>
        </div>

        <button className="fairness-btn" onClick={() => setIsFairnessOpen(true)}>
          Fairness
        </button>
      </div>

      <LiveStatsModal 
        isOpen={isSupportOpen} 
        onClose={() => setIsSupportOpen(false)} 
      />

      <FairnessModal 
        isOpen={isFairnessOpen} 
        onClose={() => setIsFairnessOpen(false)} 
      />
    </>
  );
};

export default KenoFooter;
