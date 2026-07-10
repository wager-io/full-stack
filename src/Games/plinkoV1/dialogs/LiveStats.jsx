import React, { useState, useEffect, useRef } from 'react';
import { usePlinkoGame } from '../context/PlinkoContext';
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Filler,
} from 'chart.js';

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Filler
);

const LiveStats = ({ onClose }) => {
  const { plinkoGame } = usePlinkoGame();
  const [stats, setStats] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth / 2 - 150,
    y: window.innerHeight / 2 - 227
  });
  const [initialPointer, setInitialPointer] = useState({ x: 0, y: 0 });
  
  const chartContainerRef = useRef(null);
  const draggableContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  
  // Initialize stats from localStorage or create new stats
  useEffect(() => {
    const getStats = () => {
      try {
        const savedStats = localStorage.getItem('PLINKO_LIVE_STATS');
        if (savedStats) {
          return JSON.parse(savedStats);
        }
      } catch (error) {
        console.error('Error loading stats from localStorage:', error);
      }
      
      // Default stats
      return {
        wagered: 0,
        profit: 0,
        wins: 0,
        loses: 0,
        points: [],
        token_img: '/assets/token/usdt.png'
      };
    };
    
    setStats(getStats());
  }, []);
  
  // Record game results
  const recordGame = (won, amount, profit, tokenImg) => {
    setStats(prevStats => {
      const newStats = {
        ...prevStats,
        wagered: prevStats.wagered + amount,
        profit: prevStats.profit + profit,
        wins: won ? prevStats.wins + 1 : prevStats.wins,
        loses: won ? prevStats.loses : prevStats.loses + 1,
        points: [...prevStats.points, profit],
        token_img: tokenImg || prevStats.token_img
      };
      
      // Save to localStorage
      localStorage.setItem('PLINKO_LIVE_STATS', JSON.stringify(newStats));
      return newStats;
    });
  };
  
  // Reset stats
  const handleResetStats = () => {
    const tokenImg = stats?.token_img || '/assets/token/usdt.png';
    const newStats = {
      wagered: 0,
      profit: 0,
      wins: 0,
      loses: 0,
      points: [],
      token_img: tokenImg
    };
    
    localStorage.setItem('PLINKO_LIVE_STATS', JSON.stringify(newStats));
    setStats(newStats);
  };
  
  // Subscribe to game events
  useEffect(() => {
    if (!plinkoGame) return;
    
    const handleBetResult = (bet) => {
      recordGame(
        bet.odds >= 1,
        parseFloat(bet.amount),
        parseFloat(bet.profit),
        bet.currencyImage
      );
    };
    
    plinkoGame.on("betEnd", handleBetResult);
    
    return () => {
      plinkoGame.off("betEnd", handleBetResult);
    };
  }, [plinkoGame]);
  
  // Initialize and update chart
  useEffect(() => {
    if (!chartContainerRef.current || !stats) return;
    
    const ctx = chartContainerRef.current.getContext('2d');
    
    // Destroy previous chart instance if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    
    // Create new chart
    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: Array.from({ length: stats.points.length }, (_, i) => `${i}`),
        datasets: [
          {
            data: stats.points.map((p) => (p > 0 ? p : 0)),
            fill: true,
            backgroundColor: "rgba(93, 160, 0, 0.8)",
            borderColor: "#5da000",
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "#FFFFFF",
            borderWidth: 3,
            tension: 0.3,
          },
          {
            data: stats.points.map((p) => (p < 0 ? p : 0)),
            fill: true,
            backgroundColor: "rgba(237, 99, 0, 0.8)",
            borderColor: "#ed6300",
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "#FFFFFF",
            borderWidth: 3,
            tension: 0.3,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            mode: "nearest",
            intersect: false,
            callbacks: {
              label: function (context) {
                return !!context.parsed.y ? parseFloat(context.parsed.y).toFixed(4) : "";
              },
            },
          },
        },
        scales: {
          x: {
            display: false,
            stacked: true,
          },
          y: {
            display: false,
            stacked: true,
          },
        },
      },
    });
    
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [stats]);
  
  // Update chart when stats change
  useEffect(() => {
    if (!chartInstanceRef.current || !stats) return;
    
    chartInstanceRef.current.data.labels = Array.from(
      { length: stats.points.length },
      (_, i) => `${i}`
    );
    chartInstanceRef.current.data.datasets[0].data = stats.points.map((p) =>
      p > 0 ? p : 0
    );
    chartInstanceRef.current.data.datasets[1].data = stats.points.map((p) =>
      p < 0 ? p : 0
    );
    chartInstanceRef.current.update();
  }, [stats]);
  
  // Handle dragging
  const handlePointerDown = (e) => {
    setDragging(true);
    setInitialPointer({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };
  
  const handlePointerMove = (e) => {
    if (!dragging) return;
    
    const maxX = window.innerWidth - (draggableContainerRef.current?.clientWidth || 0);
    const maxY = window.innerHeight - (draggableContainerRef.current?.clientHeight || 0);
    
    setPosition({
      x: Math.min(Math.max(e.clientX - initialPointer.x, 0), maxX),
      y: Math.min(Math.max(e.clientY - initialPointer.y, 0), maxY)
    });
  };
  
  // Add global pointer event handlers
  useEffect(() => {
    const stopDragging = () => {
      setDragging(false);
    };
    
    document.addEventListener("pointerup", stopDragging);
    
    return () => {
      document.removeEventListener("pointerup", stopDragging);
    };
  }, []);
  
  // Helper function to format numbers
  const formatNumber = (number, decimals = 6) => {
    const parts = number.toFixed(decimals).split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    
    // Remove trailing zeros
    const cleanDecimal = decimalPart.replace(/0+$/, '');
    
    return {
      main: integerPart + (cleanDecimal ? '.' + cleanDecimal : ''),
      suffix: ''
    };
  };
  
  if (!stats) return null;
  
  const formattedWagered = formatNumber(stats.wagered);
  const formattedProfit = formatNumber(Math.abs(stats.profit));

  return (
    <div
      ref={draggableContainerRef}
      onPointerMove={handlePointerMove}
      className="dragpop"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div
        onPointerDown={handlePointerDown}
        className={`dragpop-title ${dragging ? 'grabbing' : ''}`}
      >
        Live Stats
      </div>
      <button onClick={onClose} className="dragpop-close hover">
        <svg
          xmlns="http://www.w3.org/1999/xlink"
          className="icon">
          <use xlinkHref="#icon_Close"></use>
        </svg>
      </button>
      <div className="dragpop-content">
        <div className="scroll-view">
          <div className="stats-container">
            <div className="trigger flex-center m-item fold">
              <div className="current">Bet</div>
            </div>
            <div className="stats-item">
              <div className="title flex-center">
                <span>Bet</span>
                <button onClick={handleResetStats} className="title-btn">
                  <svg
                    xmlns="http://www.w3.org/1999/xlink"
                    className="icon">
                    <use xlinkHref="#icon_Clear"></use>
                  </svg>
                </button>
              </div>
              <div className="chart-cont">
                <div className="item-wrap wagered">
                  <div className="item-label">Wagered</div>
                  <div className="coin notranslate">
                    <img alt="" className="coin-icon" src={stats.token_img} />
                    <div className="amount">
                      <span className="amount-str">
                        {formattedWagered.main}
                        <span className="suffix">{formattedWagered.suffix}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="item-wrap profit">
                  <div className="item-label">Profit</div>
                  <div
                    className={`coin notranslate ${stats.profit > 0
                      ? 'cl-success'
                      : 'cl-require'}`}
                  >
                    <img alt="" className="coin-icon" src={stats.token_img} />
                    <div className="amount">
                      <span className="amount-str">
                        {formattedProfit.main}
                        <span className="suffix">{formattedProfit.suffix}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="chart-wrap">
                <canvas ref={chartContainerRef}></canvas>
              </div>
              <div className="bet-wrap">
                <div className="bet-item win">
                  <span className="txt ttc">win</span>
                  <span className="num cl-success">{stats.wins}</span>
                </div>
                <div className="bet-item lose">
                  <span className="txt ttc">lose</span>
                  <span className="num false">{stats.loses}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStats;