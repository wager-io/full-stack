import React, { useState } from 'react';
import KenoController from './KenoController';
import KenoNumbers from './KenoNumbers';
import KenoFooter from './KenoFooter';
import '../Keno.css';

const KenoLayout = () => {
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [betAmount, setBetAmount] = useState('0.00000000');
  const [risk, setRisk] = useState('Medium');

  const handleNumberClick = (number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== number));
    } else if (selectedNumbers.length < 10) {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };

  const handleAutoPick = () => {
    const numbers = [];
    while (numbers.length < 10) {
      const randomNumber = Math.floor(Math.random() * 40) + 1;
      if (!numbers.includes(randomNumber)) {
        numbers.push(randomNumber);
      }
    }
    setSelectedNumbers(numbers);
  };

  const handleClearTable = () => {
    setSelectedNumbers([]);
  };

  const handleBet = () => {
    console.log('Bet placed:', { selectedNumbers, betAmount, risk });
  };

  return (
    <div className="keno-wrapper">
      <div className="keno-container">
        <KenoController 
          betAmount={betAmount}
          setBetAmount={setBetAmount}
          risk={risk}
          setRisk={setRisk}
          handleAutoPick={handleAutoPick}
          handleClearTable={handleClearTable}
          handleBet={handleBet}
        />
        <KenoNumbers 
          selectedNumbers={selectedNumbers}
          handleNumberClick={handleNumberClick}
        />
      </div>
      <KenoFooter />
    </div>
  );
};

export default KenoLayout;
