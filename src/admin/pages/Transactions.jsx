import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  CardGiftcard
} from '@mui/icons-material';

export default function Transactions() {
  const location = useLocation();

  const tabs = [
    {
      path: '/admin/transactions',
      name: 'Deposits',
      icon: TrendingUp,
      color: '#22c55e',
      description: 'View all deposit transactions'
    },
    {
      path: '/admin/transactions/withdrawals',
      name: 'Withdrawals',
      icon: TrendingDown,
      color: '#ff6b6b',
      description: 'View all withdrawal transactions'
    },
    {
      path: '/admin/transactions/bills',
      name: 'Bills',
      icon: Receipt,
      color: '#f59e0b',
      description: 'View all bills and fees'
    },
    {
      path: '/admin/transactions/bonus',
      name: 'Bonus',
      icon: CardGiftcard,
      color: '#8b5cf6',
      description: 'View all bonus transactions'
    }
  ];

  const isActiveTab = (tabPath) => {
    if (tabPath === '/admin/transactions') {
      return location.pathname === '/admin/transactions';
    }
    return location.pathname === tabPath;
  };

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--primary-bg)' }}>
      {/* Header */}


      {/* Tabs Navigation */}
      <div 
        className="rounded-xl p-2 mb-6"
        style={{
          background: 'linear-gradient(145deg, var(--secondary-bg), #1a1d3a)',
          border: '1px solid var(--border-color)',
          boxShadow: `
            0 15px 35px rgba(0, 0, 0, 0.3),
            0 5px 15px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.08)
          `
        }}
      >
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = isActiveTab(tab.path);
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className="flex-1 min-w-fit"
              >
                <div
                  className={`group relative flex items-center justify-center px-6 py-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 cursor-pointer ${
                    isActive ? 'shadow-2xl' : 'hover:shadow-xl'
                  }`}
                  style={{
                    background: isActive 
                      ? `linear-gradient(145deg, ${tab.color}, ${tab.color}dd)` 
                      : 'linear-gradient(145deg, #2a2d47, #1e213a)',
                    color: isActive ? '#ffffff' : 'var(--text-light)',
                    border: isActive ? `1px solid ${tab.color}50` : '1px solid var(--border-color)',
                    boxShadow: isActive
                      ? `0 20px 40px ${tab.color}40, 0 10px 25px ${tab.color}30, inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)`
                      : '0 8px 20px rgba(0, 0, 0, 0.3), 0 4px 10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {/* 3D Card Inner Shadow Effect */}
                  <div 
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                      background: isActive 
                        ? 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.1) 100%)'
                        : 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, rgba(0,0,0,0.2) 100%)',
                      opacity: 0.8
                    }}
                  />
                  
                  {/* 3D Highlight Edge */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-px rounded-t-lg pointer-events-none"
                    style={{
                      background: isActive 
                        ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
                        : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)'
                    }}
                  />
                  
                  {/* Content */}
                  <div className="relative z-10 flex  items-center gap-2">
                    {/* Icon Container with 3D Effect */}
                    <div 
                      className="flex items-center justify-center w-full p-1 rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                      style={{
                        background: isActive 
                          ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1))' 
                          : `linear-gradient(145deg, ${tab.color}, ${tab.color}dd)`,
                        boxShadow: isActive
                          ? '0 4px 12px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
                          : `0 4px 12px ${tab.color}40, inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)`
                      }}
                    >
                      <tab.icon 
                        style={{ 
                          fontSize: '20px',
                          color: isActive ? '#1a1a2e' : '#ffffff',
                          filter: isActive 
                            ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))' 
                            : 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.4))'
                        }} 
                      />
                    </div>
                    
                    {/* Text with 3D Effect */}
                    <div className="text-center">
                      <span 
                        className="font-semibold transition-all duration-300 group-hover:translate-x-1 block"
                        style={{
                          textShadow: isActive 
                            ? '0 1px 3px rgba(0, 0, 0, 0.4), 0 0 10px rgba(255, 255, 255, 0.1)' 
                            : '0 1px 3px rgba(0, 0, 0, 0.5)',
                          fontSize: '14px',
                          letterSpacing: '0.025em'
                        }}
                      >
                        {tab.name}
                      </span>
                    </div>
                  </div>
                  
                  {/* Hover Glow Effect */}
                  <div 
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${tab.color}20, ${tab.color}10)`,
                      boxShadow: `0 0 20px ${tab.color}30`
                    }}
                  />
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div 
        className="rounded-xl p-6"
        style={{
          background: 'linear-gradient(145deg, var(--secondary-bg), #1a1d3a)',
          border: '1px solid var(--border-color)',
          boxShadow: `
            0 15px 35px rgba(0, 0, 0, 0.3),
            0 5px 15px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.08)
          `
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
