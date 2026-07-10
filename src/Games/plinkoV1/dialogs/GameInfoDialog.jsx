import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DetailsScreen from './bet-detail/layout';
import SeedSettingScreen from './seed-settings/layout';
import HotKeys from './hotkeys/layout';
import PlinkoHelp from './help/layout';
import PlinkoHelpAbout from './help/about';
import PlinkoHelpFairness from './help/fairness';

const GameInfoDialog = ({ launchConf, onClose }) => {
  const [gameID, setGameID] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [betID, setBetID] = useState('');
  const [startScreen, setStartScreen] = useState('');
  const [currentScreen, setCurrentScreen] = useState('');
  const [dialogParams, setDialogParams] = useState(null);

  // Initialize dialog configuration
  useEffect(() => {
    if (launchConf) {
      setGameID(launchConf.gameID || '');
      setBetID(launchConf.betID || '');
      setDialogParams(launchConf.params || null);
      setStartScreen(launchConf.startScreen || '');
      setCurrentScreen(launchConf.startScreen || 'Details');
    }
  }, [launchConf]);

  // Handle showing bet details
  const handleShowDetails = (detailBetID) => {
    if (!detailBetID) return;
    setBetID(detailBetID);
    setCurrentScreen('Details');
  };

  // Handle dialog close
  const handleClose = () => {
    if (isBusy) return;
    onClose();
  };

  // Handle setup seeds from details screen
  const handleSetupSeeds = () => {
    setDialogParams({ fromDetail: true });
    setCurrentScreen('Seeds');
  };

  // Handle close from seeds screen
  const handleSeedsClose = (fromDetail) => {
    if (fromDetail) {
      setCurrentScreen('Details');
    } else {
      onClose();
    }
  };

  // Animation variants
  const slideVariants = {
    enterFromRight: {
      x: 80,
      opacity: 0,
    },
    enterFromLeft: {
      x: -80,
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exitToLeft: {
      x: -80,
      opacity: 0,
    },
    exitToRight: {
      x: 80,
      opacity: 0,
    },
  };

  // Determine animation direction based on screen change
  const getAnimationDirection = (screen) => {
    const screenOrder = ['Details', 'Seeds', 'Help', 'What Game Is This?', 'Fairness', 'Hot keys'];
    const currentIndex = screenOrder.indexOf(currentScreen);
    const targetIndex = screenOrder.indexOf(screen);
    
    return targetIndex > currentIndex ? 'right' : 'left';
  };

  if (!startScreen || !currentScreen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        {currentScreen !== startScreen && (
          <button
            onClick={() => setCurrentScreen(startScreen)}
            className="dialog-back"
          >
            <svg
              xmlns="http://www.w3.org/1999/xlink"
              className="icon"
            >
              <use xlinkHref="#icon_Arrow"></use>
            </svg>
          </button>
        )}
        
        <div
          className={`dialog-head has-close ${
            currentScreen !== startScreen ? 'has-back' : ''
          }`}
        >
          <div className="dialog-title">{currentScreen}</div>
        </div>
        
        <button
          onClick={handleClose}
          className="close-icon dialog-close"
        >
          <svg
            xmlns="http://www.w3.org/1999/xlink"
            className="icon"
          >
            <use xlinkHref="#icon_Close"></use>
          </svg>
        </button>
        
        <AnimatePresence mode="wait">
          {currentScreen === 'Details' && (
            <motion.div
              key="details"
              initial="enterFromLeft"
              animate="center"
              exit="exitToLeft"
              variants={slideVariants}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="dialog-body default-style"
            >
              <DetailsScreen 
                betID={betID} 
                onSetupSeeds={handleSetupSeeds} 
              />
            </motion.div>
          )}
          
          {currentScreen === 'Seeds' && (
            <motion.div
              key="seeds"
              initial="enterFromLeft"
              animate="center"
              exit="exitToLeft"
              variants={slideVariants}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="dialog-body default-style"
            >
              <SeedSettingScreen 
                fromDetail={dialogParams?.fromDetail} 
                onClose={handleSeedsClose} 
              />
            </motion.div>
          )}
          
          {currentScreen === 'Help' && (
            <motion.div
              key="help"
              initial="enterFromRight"
              animate="center"
              exit="exitToRight"
              variants={slideVariants}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="dialog-body default-style"
            >
              <PlinkoHelp 
                onClick={(screen) => setCurrentScreen(screen)} 
              />
            </motion.div>
          )}
          
          {currentScreen === 'What Game Is This?' && (
            <motion.div
              key="about"
              initial="enterFromRight"
              animate="center"
              exit="exitToRight"
              variants={slideVariants}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="dialog-body default-style"
            >
              <PlinkoHelpAbout />
            </motion.div>
          )}
          
          {currentScreen === 'Fairness' && (
            <motion.div
              key="fairness"
              initial="enterFromRight"
              animate="center"
              exit="exitToRight"
              variants={slideVariants}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="dialog-body default-style"
            >
              <PlinkoHelpFairness />
            </motion.div>
          )}
          
          {currentScreen === 'Hot keys' && (
            <motion.div
              key="hotkeys"
              initial="enterFromRight"
              animate="center"
              exit="exitToRight"
              variants={slideVariants}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="dialog-body default-style"
            >
              <HotKeys />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GameInfoDialog;