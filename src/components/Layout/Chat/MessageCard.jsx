import React from 'react';
import { getUserVipTier } from '../../../data/vipData';

export default function MessageCard({ message, isCurrentUser }) {
  // Get VIP tier details for the message
  const vipTier = getUserVipTier(message.vipLevel || 0);
  
  return (
    <div
      className={`flex items-start space-x-2.5 p-2.5 rounded-lg transition-all duration-200 
        ${isCurrentUser 
          ? 'bg-[#1f3242] border-l-2 border-blue-500' 
          : 'bg-[#1a2c38] hover:bg-[#213743]'
        } mb-2`}
    >
      {/* User VIP Icon - smaller and without round background */}
      <div className="flex-shrink-0 mt-0.5">
        <svg 
          fill="none" 
          viewBox={vipTier.icon.viewBox || "0 0 96 96"} 
          className={`w-4 h-4 ${message.vipLevel > 3 ? 'drop-shadow-md' : ''}`}
          style={{ 
            filter: message.vipLevel > 0 ? `drop-shadow(0 0 2px ${vipTier.color}40)` : 'none',
          }}
        >
          <path 
            fill={vipTier.color} 
            d={vipTier.icon.path}
          />
        </svg>
      </div>
      
      {/* Chat Content with improved styling */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center mb-1">
          {/* Username - now white with VIP color for higher levels */}
          <p 
            className={`text-sm font-medium truncate mr-2 ${message.vipLevel > 0 ? 'text-white' : 'text-gray-100'}`}
            style={{ 
              textShadow: message.vipLevel > 3 ? `0 0 4px ${vipTier.color}40` : 'none'
            }}
          >
            {message.username}
          </p>
          
          {/* VIP Badge for levels above 0 - more subtle */}
          {message.vipLevel > 0 && (
            <span 
              className="text-[10px] px-1 py-0.5 rounded-sm font-medium"
              style={{ 
                backgroundColor: `${vipTier.color}20`,
                color: vipTier.color,
                border: `1px solid ${vipTier.color}40`,
              }}
            >
              {vipTier.name}
            </span>
          )}
          
          {/* Timestamp (if available) - dimmer color */}
          {message.timestamp && (
            <span className="ml-auto text-[10px] text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        
        {/* Message content with improved readability - dimmer color */}
        <p className="text-sm text-gray-400 break-words leading-relaxed">
          {message.content}
        </p>
      </div>
    </div>
  );
}