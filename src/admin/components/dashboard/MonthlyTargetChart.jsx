import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function MonthlyTargetChart() {
  const monthlyData = {
    target: 200000,
    achieved: 156000,
    deposits: 155000,
    withdrawals: 110000,
    revenue: 45000
  };

  const achievementPercentage = Math.round((monthlyData.achieved / monthlyData.target) * 100);
  const remaining = 100 - achievementPercentage;

  const data = {
    labels: ['Target Achieved', 'Remaining'],
    datasets: [
      {
        data: [achievementPercentage, remaining],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(148, 163, 184, 0.3)',
        ],
        borderColor: [
          '#22c55e',
          '#94a3b8',
        ],
        borderWidth: 3,
        cutout: '65%',
        hoverBackgroundColor: [
          'rgba(34, 197, 94, 0.9)',
          'rgba(148, 163, 184, 0.4)',
        ],
        hoverBorderColor: [
          '#16a34a',
          '#64748b',
        ],
        hoverBorderWidth: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'var(--text-light)',
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'bold'
          }
        },
      },
      tooltip: {
        backgroundColor: 'var(--secondary-bg)',
        titleColor: 'var(--text-light)',
        bodyColor: 'var(--text-light)',
        borderColor: 'var(--border-color)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return context.label + ': ' + context.parsed + '%';
          }
        }
      },
    },
  };

  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: function (chart) {
      const { width, height, ctx } = chart;
      ctx.restore();
      
      const fontSize = (height / 140).toFixed(2);
      ctx.font = `bold ${fontSize}em Arial`;
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'var(--text-light)';
      
      const text = `${achievementPercentage}%`;
      const textX = Math.round((width - ctx.measureText(text).width) / 2);
      const textY = height / 2 - 10;
      
      ctx.fillText(text, textX, textY);
      
      // Add subtitle
      ctx.font = `${fontSize * 0.6}em Arial`;
      ctx.fillStyle = 'var(--text-dark)';
      const subtitle = 'Monthly Target';
      const subtitleX = Math.round((width - ctx.measureText(subtitle).width) / 2);
      const subtitleY = textY + 20;
      
      ctx.fillText(subtitle, subtitleX, subtitleY);
      
      // Add amount
      ctx.font = `${fontSize * 0.5}em Arial`;
      ctx.fillStyle = '#22c55e';
      const amount = `$${(monthlyData.achieved / 1000).toFixed(0)}k / $${(monthlyData.target / 1000).toFixed(0)}k`;
      const amountX = Math.round((width - ctx.measureText(amount).width) / 2);
      const amountY = textY + 35;
      
      ctx.fillText(amount, amountX, amountY);
      ctx.save();
    }
  };

  return <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />;
}
