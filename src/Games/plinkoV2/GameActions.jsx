import React, { useState } from 'react';
import { usePlinkoGame } from './PlinkoContext';
// import PlinkoInfoDialog from './dialogs/GameInfoDialog';

const GameActions = () => {
  const { 
    settings = {
      data: {
        bgSoundEnable: false,
        soundEnable: false,
        fastEnable: false,
        hotkeyEnable: false
      }
    },
    updateSettings
  } = usePlinkoGame();
  
  const [dialogData, setDialogData] = useState(null);
  const [showingStats, setShowingStats] = useState(false);
  
  const handleToggleSettings = (setting) => {
    return () => {
      if (updateSettings) {
        updateSettings(setting, !settings.data[setting]);
      }
    };
  };
  
  const { 
    bgSoundEnable = false, 
    soundEnable = false, 
    fastEnable = false, 
    hotkeyEnable = false 
  } = settings.data || {};
  
  return (
    <>
      {/* {Boolean(dialogData) && (
        <PlinkoInfoDialog
          launchConf={dialogData}
          onClose={() => setDialogData(null)}
        />
      )} */}
      
      <div className="flex items-center h-16 relative game-actions">
        <div className="flex-1"></div>
        
        <button
          onClick={handleToggleSettings('bgSoundEnable')}
          className={`mr-2 w-11 h-11 rounded-full flex items-center justify-center action-item ${bgSoundEnable ? 'active' : ''}`}
        >
          <svg
            xmlns="http://www.w3.org/1999/xlink"
            className="icon"
          >
            <use xlinkHref={`#${bgSoundEnable ? "icon_MusicOn" : "icon_MusicOff"}`}></use>
          </svg>
        </button>
        
        <button
          onClick={handleToggleSettings('soundEnable')}
          className={`mr-2 w-11 h-11 rounded-full flex items-center justify-center action-item ${soundEnable ? 'active' : ''}`}
        >
          <svg
            xmlns="http://www.w3.org/1999/xlink"
            className="icon"
          >
            <use xlinkHref={`#${soundEnable ? "icon_SoundOn" : "icon_SoundOff"}`}></use>
          </svg>
        </button>
        
        <button
          onClick={handleToggleSettings('fastEnable')}
          className={`mr-2 w-11 h-11 rounded-full flex items-center justify-center action-item ${fastEnable ? 'active' : ''}`}
        >
          <svg
            xmlns="http://www.w3.org/1999/xlink"
            className="icon"
          >
            <use xlinkHref="#icon_TurboBet"></use>
          </svg>
        </button>
        
        <button
          onClick={() => {
            setDialogData({
              startScreen: 'Hot keys',
            });
          }}
          className="mr-2 w-11 h-11 rounded-full flex items-center justify-center action-item"
        >
          <svg
            xmlns="http://www.w3.org/1999/xlink"
            className="icon"
          >
            <use xlinkHref="#icon_HotKeys"></use>
          </svg>
        </button>
        
        <button
          onClick={() => {
            setDialogData({
              startScreen: 'Seeds',
              params: {}
            });
          }}
          className="mr-2 w-11 h-11 rounded-full flex items-center justify-center action-item"
          id="set_seed"
        >
          <svg
            xmlns="http://www.w3.org/1999/xlink"
            className="icon"
          >
            <use xlinkHref="#icon_Seed"></use>
          </svg>
        </button>
        
        <button 
          onClick={() => setShowingStats(true)} 
          className="mr-2 w-11 h-11 rounded-full flex items-center justify-center action-item"
        >
          <svg
            xmlns="http://www.w3.org/1999/xlink"
            className="icon"
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
          className="mr-2 w-11 h-11 rounded-full flex items-center justify-center action-item"
        >
          <svg
            xmlns="http://www.w3.org/1999/xlink"
            className="icon"
          >
            <use xlinkHref="#icon_Help"></use>
          </svg>
        </button>
      </div>
      
      <style jsx>{`
        .action-item:hover {
          background: rgba(49, 52, 60, 0.35);
        }
        .action-item:hover .icon {
          font-size: 1rem;
          fill: rgb(245, 246, 247);
        }
        .action-item .icon {
          fill: rgb(153, 164, 176);
          transition: all 0.3s ease-in-out 0s;
        }
        .action-item.active .icon {
          fill: rgb(67, 179, 9);
        }
        .game-actions::after {
          content: '';
          position: absolute;
          left: 0px;
          top: 0px;
          right: 0px;
          height: 1px;
          opacity: 0.3;
          background-color: rgb(49, 52, 60);
        }
      `}</style>
    </>
  );
};

export default GameActions;