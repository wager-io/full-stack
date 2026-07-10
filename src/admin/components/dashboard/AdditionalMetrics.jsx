import React from 'react';
import { 
  AccessTime, 
  TrendingUp, 
  People, 
  SportsEsports,
  Security,
  Speed,
  Storage,
  CloudDone 
} from '@mui/icons-material';

export default function AdditionalMetrics() {
  const metrics = [
    { label: 'Average Session Time', value: '24m 32s', icon: <AccessTime />, color: 'var(--accent-purple)' },
    { label: 'Conversion Rate', value: '8.4%', icon: <TrendingUp />, color: 'var(--success-green)' },
    { label: 'Active Players Today', value: '2,847', icon: <People />, color: '#42a5f5' },
    { label: 'Top Game Category', value: 'Slots', icon: <SportsEsports />, color: '#ff7043' },
  ];

  const systemHealth = [
    { label: 'Server Uptime', value: '99.9%', icon: <CloudDone />, color: 'var(--success-green)' },
    { label: 'Database Response', value: '12ms', icon: <Speed />, color: 'var(--success-green)' },
    { label: 'API Health', value: 'Healthy', icon: <Security />, color: 'var(--success-green)' },
    { label: 'Storage Usage', value: '67%', icon: <Storage />, color: '#ffa726' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Additional Metrics */}
      <div 
        className="p-6 rounded-xl"
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
        <h3 
          className="text-lg font-semibold mb-6"
          style={{ 
            color: 'var(--text-light)',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
          }}
        >
          Performance Metrics
        </h3>
        
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(145deg, #1a1d2e, #15182a)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{
                    background: `${metric.color}20`,
                    border: `1px solid ${metric.color}`
                  }}
                >
                  {React.cloneElement(metric.icon, { 
                    style: { color: metric.color, fontSize: '20px' } 
                  })}
                </div>
                <span style={{ color: 'var(--text-dark)' }}>{metric.label}</span>
              </div>
              <span 
                className="font-bold"
                style={{ color: 'var(--text-light)' }}
              >
                {metric.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div 
        className="p-6 rounded-xl"
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
        <h3 
          className="text-lg font-semibold mb-6"
          style={{ 
            color: 'var(--text-light)',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
          }}
        >
          System Health
        </h3>
        
        <div className="space-y-4">
          {systemHealth.map((health, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(145deg, #1a1d2e, #15182a)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{
                    background: `${health.color}20`,
                    border: `1px solid ${health.color}`
                  }}
                >
                  {React.cloneElement(health.icon, { 
                    style: { color: health.color, fontSize: '20px' } 
                  })}
                </div>
                <span style={{ color: 'var(--text-dark)' }}>{health.label}</span>
              </div>
              <span 
                className="font-bold"
                style={{ color: health.color }}
              >
                {health.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
