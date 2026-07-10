import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  People as UsersIcon,
  Assignment as TasksIcon,
  CreditCard as TransactionsIcon,
  PersonAdd as PersonAddIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

export default function Sidebar() {

  const sidebarLinks = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: DashboardIcon },
    { path: '/admin/users', name: 'Users', icon: UsersIcon },
    { path: '/admin/reports', name: 'Reports', icon: TasksIcon },
    { path: '/admin/transactions', name: 'Transactions', icon: TransactionsIcon },
    { path: '/admin/create-admin', name: 'Create New Admin', icon: PersonAddIcon }
  ];

  const handleLogout = () => {
    // Add logout logic here (clear tokens, redirect, etc.)
    console.log('Logging out...');
    // Example: localStorage.removeItem('authToken');
    // Example: navigate('/login');
  };

  return (
    <div 
      className="fixed top-[60px] left-0 h-[calc(100vh-60px)] z-40 transition-all duration-300 w-full md:w-[232px]"
      style={{
        background: 'var(--primary-bg)',
        borderRight: '1px solid var(--border-color)',
        boxShadow: '4px 0 20px rgba(106, 13, 173, 0.15), 0 0 40px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="flex flex-col h-full py-6">
        <nav className="flex-1">
          <ul className="space-y-2 px-3">
            {sidebarLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  children={({ isActive }) => (
                    <div
                      className={`group relative flex items-center px-4 py-3 mx-1 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 cursor-pointer ${
                        isActive ? 'shadow-2xl' : 'hover:shadow-2xl'
                      }`}
                      style={{
                        background: isActive 
                          ? 'linear-gradient(145deg, #7c3aed, #a855f7, #c084fc)' 
                          : 'linear-gradient(145deg, #2a2d47, #1e213a)',
                        color: isActive ? '#ffffff' : 'var(--text-light)',
                        border: isActive ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid var(--border-color)',
                        boxShadow: isActive
                          ? '0 20px 40px rgba(124, 58, 237, 0.4), 0 10px 25px rgba(124, 58, 237, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
                          : '0 8px 20px rgba(0, 0, 0, 0.3), 0 4px 10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
                      }}
                    >
                  {/* 3D Card Inner Shadow Effect */}
                  <div 
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      background: isActive 
                        ? 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.1) 100%)'
                        : 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, rgba(0,0,0,0.2) 100%)',
                      opacity: 0.8
                    }}
                  />
                  
                  {/* 3D Highlight Edge */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-px rounded-t-xl pointer-events-none"
                    style={{
                      background: isActive 
                        ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
                        : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)'
                    }}
                  />
                  
                  {/* Icon Container with 3D Effect */}
                  <div 
                    className="relative z-10 flex items-center justify-center w-9 h-9 rounded-lg mr-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{
                      background: isActive 
                        ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1))' 
                        : 'linear-gradient(145deg, #6366f1, #4f46e5)',
                      boxShadow: isActive
                        ? '0 4px 12px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
                        : '0 4px 12px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <link.icon 
                      style={{ 
                        fontSize: '19px',
                        color: isActive ? '#1e1b4b' : '#ffffff',
                        filter: isActive 
                          ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))' 
                          : 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.4))'
                      }} 
                    />
                  </div>
                  
                  {/* Text with 3D Effect */}
                  <span 
                    className="relative z-10 font-semibold transition-all duration-300 group-hover:translate-x-1"
                    style={{
                      textShadow: isActive 
                        ? '0 1px 3px rgba(0, 0, 0, 0.4), 0 0 10px rgba(255, 255, 255, 0.1)' 
                        : '0 1px 3px rgba(0, 0, 0, 0.5)',
                      fontSize: '15px',
                      letterSpacing: '0.025em'
                    }}
                  >
                    {link.name}
                  </span>
                  
                  {/* Hover Glow Effect */}
                  <div 
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(106, 13, 173, 0.1), rgba(139, 61, 184, 0.05))',
                      boxShadow: '0 0 20px rgba(106, 13, 173, 0.2)'
                    }}
                  />
                    </div>
                  )}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button at Bottom */}
        <div className="px-3 mt-4">
          <button
            onClick={handleLogout}
            className="group relative flex items-center w-full px-4 py-3 mx-1 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 cursor-pointer hover:shadow-2xl"
            style={{
              background: 'linear-gradient(145deg, #dc2626, #b91c1c)',
              color: '#ffffff',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              boxShadow: '0 8px 20px rgba(220, 38, 38, 0.3), 0 4px 10px rgba(220, 38, 38, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* 3D Card Inner Shadow Effect */}
            <div 
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.1) 100%)',
                opacity: 0.8
              }}
            />
            
            {/* 3D Highlight Edge */}
            <div 
              className="absolute top-0 left-0 right-0 h-px rounded-t-xl pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
              }}
            />
            
            {/* Icon Container with 3D Effect */}
            <div 
              className="relative z-10 flex items-center justify-center w-9 h-9 rounded-lg mr-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
              style={{
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1))',
                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
              }}
            >
              <LogoutIcon 
                style={{ 
                  fontSize: '19px',
                  color: '#7f1d1d',
                  filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))'
                }} 
              />
            </div>
            
            {/* Text with 3D Effect */}
            <span 
              className="relative z-10 font-semibold transition-all duration-300 group-hover:translate-x-1"
              style={{
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.4), 0 0 10px rgba(255, 255, 255, 0.1)',
                fontSize: '15px',
                letterSpacing: '0.025em'
              }}
            >
              Logout
            </span>
            
            {/* Hover Glow Effect */}
            <div 
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(185, 28, 28, 0.05))',
                boxShadow: '0 0 20px rgba(220, 38, 38, 0.2)'
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
