import React, { useState, useEffect } from 'react';
import { usePlinkoGame } from './PlinkoContext';
import PlinkoInfoDialog from './dialogs/GameInfoDialog';
import LiveStats from './dialogs/LiveStats';

const GameActions = () => {
  const { plinkoGame } = usePlinkoGame();
  const [dialogData, setDialogData] = useState(null);
  const [showingStats, setShowingStats] = useState(false);
  const [bgSoundEnabled, setBgSoundEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [fastEnabled, setFastEnabled] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update settings from game instance
  useEffect(() => {
    if (!plinkoGame) return;
    
    const updateSettings = () => {
      setBgSoundEnabled(plinkoGame.settings?.data?.bgSoundEnable || false);
      setSoundEnabled(plinkoGame.settings?.data?.soundEnable || false);
      setFastEnabled(plinkoGame.settings?.data?.fastEnable || false);
    };
    
    // Initial update
    updateSettings();
    
    // Subscribe to settings updates
    const unsubscribe = plinkoGame.subscribeToSettings(updateSettings);
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [plinkoGame]);

  // Handle toggle settings
  const handleToggleSettings = (setting) => {
    return () => {
      if (!plinkoGame) return;
      
      const currentValue = plinkoGame.settings.data[setting];
      plinkoGame.settings.update(setting, !currentValue);
    };
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogData(null);
  };

  // Handle stats close
  const handleCloseStats = () => {
    setShowingStats(false);
  };

  return (
    <>
      {dialogData && (
        <PlinkoInfoDialog
          launchConf={dialogData}
          onClose={handleCloseDialog}
        />
      )}
      
      {showingStats && (
        <LiveStats onClose={handleCloseStats} />
      )}
      
      <div className="game-actions">
        <button
          onClick={handleToggleSettings('bgSoundEnable')}
          className={`action-item ${bgSoundEnabled ? 'active' : ''}`}
        >
          <svg
            xmlns="http://www.w3.org/1999/xlink"
            className="sc-gsDKAQ hxODWG icon"
          >
            <use xlinkHref={`#${bgSoundEnabled ? "icon_MusicOn" : "icon_MusicOff"}`}></use>
          </svg>
        </button>
        
        <button
          onClick={handleToggleSettings('soundEnable')}
          className={`action-item ${soundEnabled ? 'active' : ''}`}
        >
          <svg
            xmlns="http://www.w3.org/1999/xlink"
            className="sc-gsDKAQ hxODWG icon"
          >
            <use xlinkHref={`#${soundEnabled ? "icon_SoundOn" : "icon_SoundOff"}`}></use>
          </svg>
        </button>
        
        <button
          onClick={handleToggleSettings('fastEnable')}
          className={`action-item ${fastEnabled ? 'active' : ''}`}
        >
          <svg
            xmlns="http://www.w3.org/1999/xlink"
            className="sc-gsDKAQ hxODWG icon"
          >
            <use xlinkHref="#icon_TurboBet"></use>
          </svg>
        </button>
        
        {screenWidth > 660 && (
          <button
            onClick={() => {
              setDialogData({
                startScreen: 'Hot keys',
              });
            }}
            className="action-item"
          >
            <svg
              xmlns="http://www.w3.org/1999/xlink"
              className="sc-gsDKAQ hxODWG icon"
            >
              <use xlinkHref="#icon_HotKeys"></use>
            </svg>
          </button>
        )}
        
        <button
          onClick={() => {
            setDialogData({
              startScreen: 'Seeds',
              params: {}
            });
          }}
          className="action-item"
          id="set_seed"
        >
          <svg
            xmlns="http://www.w3.org/1999/xlink"
            className="sc-gsDKAQ hxODWG icon"
          >
            <use xlinkHref="#icon_Seed"></use>
          </svg>
        </button>
        
        <button 
          onClick={() => setShowingStats(true)} 
          className="action-item"
        >
          <svg
            xmlns="http://www.w3.org/1999/xlink"
            className="sc-gsDKAQ hxODWG icon"
          >
            <use xlinkHref="#icon_LiveStats"></use>
          </svg>
        </button>
        
        <button
          onClick={() => {
            setDialogData({
              startScreen: 'Help',
            });
          }}
          className="action-item"
        >
          <svg
            xmlns="http://www.w3.org/1999/xlink"
            className="sc-gsDKAQ hxODWG icon"
          >
            <use xlinkHref="#icon_Help"></use>
          </svg>
        </button>
      </div>
    </>
  );
};

export default GameActions;