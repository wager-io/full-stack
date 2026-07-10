import React from 'react';

export default function ChartContainer({ title, children, className = "" }) {
  return (
    <div 
      className={`p-6 rounded-xl ${className}`}
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
      {/* Glass effect overlay */}
      <div 
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 50%, rgba(0,0,0,0.1) 100%)'
        }}
      />
      
      <div className="relative z-10">
        <h3 
          className="text-lg font-semibold mb-6"
          style={{ 
            color: 'var(--text-light)',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
          }}
        >
          {title}
        </h3>
        <div className="h-80">
          {children}
        </div>
      </div>
    </div>
  );
}
