import React, { useState, useEffect } from 'react';
import { usePlinkoGame } from '../../context/PlinkoContext';

const HotkeysLayout = () => {
  const { plinkoGame } = usePlinkoGame();
  const [hotkeysEnabled, setHotkeysEnabled] = useState(false);
  
  // Initialize hotkeys state from game settings
  useEffect(() => {
    if (plinkoGame) {
      setHotkeysEnabled(plinkoGame.settings.data.hotkeyEnable);
      
      // Subscribe to settings changes
      const unsubscribe = plinkoGame.settings.subscribe(() => {
        setHotkeysEnabled(plinkoGame.settings.data.hotkeyEnable);
      });
      
      return () => unsubscribe();
    }
  }, [plinkoGame]);
  
  // Handle toggle hotkeys
  const handleToggleHotKeys = () => {
    if (!plinkoGame) return;
    plinkoGame.settings.update("hotkeyEnable", !plinkoGame.settings.data.hotkeyEnable);
  };
  
  return (
    <div className="hotkeys-dialog scroll-view">
      <div className="hotkey-list">
        <div className="hotkey-item">
          <div className="hotkey-txt">Half bet amount</div>
          <div className="hotkey-key">A</div>
        </div>
        <div className="hotkey-item">
          <div className="hotkey-txt">Double bet amount</div>
          <div className="hotkey-key">S</div>
        </div>
        <div className="hotkey-item">
          <div className="hotkey-txt">Make a bet</div>
          <div className="hotkey-key">Space</div>
        </div>
      </div>
      <div className="hotkey-enabled" onClick={handleToggleHotKeys}>
        <div className={`hotkey-select ${hotkeysEnabled ? 'active' : ''}`}></div>
        <div>Hotkeys Enabled</div>
      </div>
    </div>
  );
};

export default HotkeysLayout;