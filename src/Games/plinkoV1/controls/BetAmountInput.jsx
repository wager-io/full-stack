import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Decimal from 'decimal.js';

const BetAmountInput = ({ plinkoGame }) => {
  const { user, balance, setBalance } = useContext(AuthContext);
  const [currentAmount, setCurrentAmount] = useState('1.00000000');
  const [betting, setBetting] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [coinImage, setCoinImage] = useState('/assets/USDT.webp');
  const [coinName, setCoinName] = useState('USDT');
  const [canViewInFiat, setCanViewInFiat] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [sliderOpened, setSliderOpened] = useState(false);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [sliderPercentage, setSliderPercentage] = useState(0);
  
  const sliderRef = useRef(null);
  
  // Initialize component data
  useEffect(() => {
    if (!plinkoGame) return;
    
    // Set initial values
    setCurrentAmount(balance || '1.0000');
    
    // Handle game updates
    const handleGameUpdate = () => {
      setCurrentAmount(balance || '1.0000');
      setBetting(plinkoGame.isBetting || false);
      setCoinImage( '/assets/USDT.webp');
      setCoinName( 'USDT');
      setInputDisabled(false );
      setCanViewInFiat(false );
    };
    
    // Initial update
    handleGameUpdate();
    
    // Subscribe to updates
    plinkoGame.on('update', handleGameUpdate);
    
    // Set up document event listeners for slider
    document.body.addEventListener('click', handleSliderClose);
    document.body.addEventListener('pointerup', handlePointUp);
    document.body.addEventListener('pointermove', handleSliderMove);
    
    // Cleanup function
    return () => {
      plinkoGame.off('update', handleGameUpdate);
      document.body.removeEventListener('click', handleSliderClose);
      document.body.removeEventListener('pointerup', handlePointUp);
      document.body.removeEventListener('pointermove', handleSliderMove);
    };
  }, [plinkoGame]);
  
  // Input validation
  const inputValidate = (e) => {
    const validateInput = (input) => {
      if (!isNaN(Number(input))) {
        if ((input.match(/\./g) || []).length <= 1) {
          return true;
        }
      }
      return false;
    };
    
    let currentValue = e.target.value;
    if (!validateInput(currentValue)) {
      e.target.value = currentValue.slice(0, -1);
    }
  };
  
  // Handle amount changes
  const handleSetAmount = (opr) => {
    return (e) => {
      if (!plinkoGame || betting) return;
      
      if (opr === '=') {
        plinkoGame.setAmount(
          new Decimal(
            canViewInFiat
              ? plinkoGame.walletManager.fiatToAmount(parseFloat(e.target.value || '0'))
              : e.target.value
          ) || 1
        );
      } else if (opr === '/') {
        plinkoGame.setAmount(plinkoGame.amount.div(2));
      } else if (opr === '*') {
        plinkoGame.setAmount(plinkoGame.amount.mul(2));
      } else if (opr === 'min') {
        plinkoGame.setAmount(
          new Decimal(plinkoGame.walletManager.dict[coinName].minAmount)
        );
      } else if (opr === 'max') {
        plinkoGame.setAmount(
          new Decimal(plinkoGame.walletManager.dict[coinName].maxAmount)
        );
      }
      
      setCurrentAmount(plinkoGame.amount.toFixed(4));
    };
  };
  
  // Slider functions
  const handleSliderClose = () => {
    if (isGrabbing) return;
    setSliderOpened(false);
  };
  
  const handlePointUp = () => {
    setIsGrabbing(false);
  };
  
  const handleSliderMove = (e) => {
    if (isGrabbing && sliderRef.current) {
      const offsetX = sliderRef.current.getBoundingClientRect().left || 0;
      const newPercentage = Math.max(
        0,
        Math.min(
          100,
          ((e.clientX - offsetX) / (sliderRef.current.getBoundingClientRect().width || 100)) * 100
        )
      );
      
      setSliderPercentage(newPercentage);
      
      const amount =
        (newPercentage / 100) *
          (plinkoGame.walletManager.dict[coinName].maxAmount -
            plinkoGame.walletManager.dict[coinName].minAmount) +
        plinkoGame.walletManager.dict[coinName].minAmount;
      
      handleSetAmount('=')({ target: { value: amount } });
    }
  };
  
  // Format amount for display
  const getDisplayAmount = () => {
    if (canViewInFiat) {
      return plinkoGame.walletManager.amountToFiat(currentAmount).toFixed(4);
    }
    return currentAmount;
  };
  


  return (
    <div
      className={`input game-coininput ${
        betting || inputDisabled ? 'disabled' : ''
      }`}
    >
      <div className="input-label">
        <div className="label">
          <div>Amount</div>
          <div className="max-profit">
            <svg
              xmlns="http://www.w3.org/1999/xlink"
              className="icon"
            >
              <use xlinkHref="#icon_Inform"></use>
            </svg>
            <div className="tip">
              <span className="tit">Max Profit:&nbsp;</span>
              <div className="coin notranslate">
                <div className="amount">
                  <span className="locale hidden">$</span>
                  <span className="amount-str">
                    5000.<span className="suffix">00000</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      
      <div className="input-control">
        <input
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onInput={inputValidate}
          disabled={betting || inputDisabled}
          onChange={handleSetAmount('=')}
          type="text"
          value={currentAmount}
        />
        <img
          alt=""
          className="coin-icon"
          src={canViewInFiat ? '/assets/coin.png' : coinImage}
        />
        
        <div className="button-group">
          <button
            disabled={betting || inputDisabled}
            onClick={handleSetAmount('/')}
          >
            /2
          </button>
          <button
            disabled={betting || inputDisabled}
            onClick={handleSetAmount('*')}
          >
            x2
          </button>
          
          {sliderOpened && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="fix-layer"
              style={{ opacity: 1, transform: 'none' }}
            >
              <button
                onClick={handleSetAmount('min')}
                className={
                  currentAmount <= plinkoGame.walletManager.dict[coinName].minAmount
                    ? 'active'
                    : ''
                }
              >
                Min
              </button>
              
              <div ref={sliderRef} className="slider">
                <div
                  className="slider-after"
                  style={{ transform: 'scaleX(2.27273e-06)' }}
                ></div>
                <div
                  onPointerDown={() => setIsGrabbing(true)}
                  className="slider-handler-wrap"
                  style={{ transform: `translateX(${sliderPercentage}%)` }}
                >
                  <button className="slider-handler"></button>
                </div>
                <div
                  className="slider-before"
                  style={{ transform: 'scaleX(0.999998)' }}
                ></div>
              </div>
              
              <button
                onClick={handleSetAmount('max')}
                className={
                  currentAmount === plinkoGame.walletManager.dict[coinName].maxAmount
                    ? 'active'
                    : ''
                }
              >
                Max
              </button>
            </div>
          )}
          
          <button
            disabled={betting || inputDisabled}
            className="slider-toggle"
            onClick={(e) => {
              e.stopPropagation();
              if (betting || inputDisabled) return;
              setSliderOpened(true);
            }}
          >
            <svg
              xmlns="http://www.w3.org/1999/xlink"
              className="icon"
            >
              <use xlinkHref="#icon_Arrow"></use>
            </svg>
            <svg
              xmlns="http://www.w3.org/1999/xlink"
              className="icon"
            >
              <use xlinkHref="#icon_Arrow"></use>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BetAmountInput;