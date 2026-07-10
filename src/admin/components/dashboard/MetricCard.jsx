import React from 'react';

export default function MetricCard({ title, value, icon, trend, trendUp, description }) {
  return (
    <div 
      className="relative p-5 w-full rounded-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer group overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, var(--secondary-bg), #1a1d3a)',
        border: '1px solid var(--border-color)',
        boxShadow: `
          0 20px 40px rgba(0, 0, 0, 0.4),
          0 15px 12px rgba(0, 0, 0, 0.22),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 -1px 0 rgba(0, 0, 0, 0.3)
        `,
        minHeight: '120px'
      }}
    >
      {/* Gradient overlay for 3D effect */}
      <div 
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, rgba(0,0,0,0.15) 100%)'
        }}
      />
      
      {/* Top highlight for glass effect */}
      <div 
        className="absolute top-0 left-4 right-4 h-px rounded-t-xl pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
        }}
      />
      
      {/* Side highlights */}
      <div 
        className="absolute left-0 top-4 bottom-4 w-px rounded-l-xl pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.2), transparent)'
        }}
      />
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Value at the top */}
        <div className="flex items-center justify-between mb-3">
          <p 
            className="text-2xl font-bold leading-tight"
            style={{ 
              color: 'var(--text-light)',
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.7)',
              filter: 'drop-shadow(0 0 10px rgba(224, 224, 224, 0.3))',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)'
            }}
          >
            {value}
          </p>
          
          {trend && (
            <div className="text-right">
              <span 
                className={`text-sm font-bold ${trendUp ? 'text-green-400' : 'text-red-400'}`}
                style={{ 
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.7)',
                  filter: `drop-shadow(0 0 8px ${trendUp ? '#00e676' : '#ff5252'})`
                }}
              >
                {trend}
              </span>
            </div>
          )}
        </div>
        
        {/* Icon and content section */}
        <div className="flex items-center gap-4 flex-1">
          <div 
            className="p-3 rounded-lg group-hover:scale-110 transition-all duration-300 shrink-0"
            style={{
              background: `linear-gradient(145deg, var(--accent-purple), #8b3db8)`,
              boxShadow: `
                0 8px 16px rgba(106, 13, 173, 0.4),
                0 4px 8px rgba(106, 13, 173, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.2),
                inset 0 -1px 0 rgba(0, 0, 0, 0.2)
              `
            }}
          >
            {React.cloneElement(icon, { 
              style: { 
                color: 'white', 
                fontSize: '24px',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
              } 
            })}
          </div>
          
          <div className="flex-1">
            <h3 
              className="text-sm font-medium mb-1 leading-tight"
              style={{ 
                color: 'var(--text-light)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
              }}
            >
              {title}
            </h3>
            
            {description && (
              <p 
                className="text-xs leading-tight"
                style={{ color: 'var(--text-dark)' }}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Hover glow effect */}
      <div 
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, rgba(106, 13, 173, 0.15) 0%, transparent 70%),
            linear-gradient(135deg, rgba(106, 13, 173, 0.1), rgba(139, 61, 184, 0.05))
          `,
          boxShadow: `
            0 0 30px rgba(106, 13, 173, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `
        }}
      />
      
      {/* Bottom shadow for depth */}
      <div 
        className="absolute -bottom-2 left-2 right-2 h-4 rounded-xl opacity-60 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.4) 0%, transparent 70%)',
          filter: 'blur(8px)'
        }}
      />
    </div>
  );
}
