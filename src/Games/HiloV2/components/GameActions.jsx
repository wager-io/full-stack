import React from 'react';
import { useHiloGame } from '../context/HiloContext';

const GameActions = () => {
  const { 
    hotkeysEnabled, 
    setHotkeysEnabled, 
    soundSettings, 
    setSoundSettings,
    soundManager
  } = useHiloGame();

  // Toggle hotkeys
  const toggleHotkeys = () => {
    setHotkeysEnabled(!hotkeysEnabled);
    
    // Play button sound
    if (soundManager) {
      soundManager.playGameEvent('button');
    }
  };

  // Toggle music
  const toggleMusic = () => {
    const newSettings = { ...soundSettings, music: !soundSettings.music };
    setSoundSettings(newSettings);
    
    // Play button sound
    if (soundManager) {
      soundManager.playGameEvent('button');
    }
  };

  // Toggle sound effects
  const toggleSoundFx = () => {
    const newSettings = { ...soundSettings, soundFx: !soundSettings.soundFx };
    setSoundSettings(newSettings);
    
    // Play button sound if enabling sound effects
    if (soundManager && !soundSettings.soundFx) {
      soundManager.playGameEvent('button');
    }
  };

  return (
    <div className="game-actions mt-4 flex justify-center space-x-4">
      {/* Hotkeys toggle */}
      <button
        onClick={toggleHotkeys}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg
          ${hotkeysEnabled ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}
          transition-colors
        `}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>Hotkeys {hotkeysEnabled ? 'On' : 'Off'}</span>
      </button>
      
      {/* Music toggle */}
      <button
        onClick={toggleMusic}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg
          ${soundSettings.music ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}
          transition-colors
        `}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <span>Music {soundSettings.music ? 'On' : 'Off'}</span>
      </button>
      
      {/* Sound effects toggle */}
      <button
        onClick={toggleSoundFx}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg
          ${soundSettings.soundFx ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}
          transition-colors
        `}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 010-7.072m12.728 0l-3.536 3.536m-9.192 0l3.536-3.536" />
        </svg>
        <span>Sound FX {soundSettings.soundFx ? 'On' : 'Off'}</span>
      </button>
      
      {/* Help button */}
      <button
        onClick={() => {
          // Show help modal or tooltip
          if (soundManager) {
            soundManager.playGameEvent('button');
          }
        }}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Help</span>
      </button>
      
      {/* Fullscreen toggle */}
      <button
        onClick={() => {
          // Toggle fullscreen
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
          
          if (soundManager) {
            soundManager.playGameEvent('button');
          }
        }}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
        </svg>
        <span>Fullscreen</span>
      </button>
    </div>
  );
};

export default GameActions;