import React from 'react';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DepositWithdrawChart() {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Deposits',
        data: [85000, 95000, 110000, 120000, 115000, 125000, 130000, 135000, 128000, 140000, 145000, 155000],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: '#22c55e',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(34, 197, 94, 0.9)',
        hoverBorderColor: '#16a34a',
      },
      {
        label: 'Withdrawals',
        data: [65000, 72000, 78000, 85000, 81000, 89000, 95000, 88000, 92000, 98000, 105000, 110000],
        backgroundColor: 'rgba(251, 146, 60, 0.8)',
        borderColor: '#fb923c',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(251, 146, 60, 0.9)',
        hoverBorderColor: '#ea580c',
      },
      {
        label: 'Net Flow',
        data: [20000, 23000, 32000, 35000, 34000, 36000, 35000, 47000, 36000, 42000, 40000, 45000],
        type: 'line',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3b82f6',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
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
            return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
          }
        }
      },
    },
    scales: {
      x: {
        ticks: { 
          color: 'var(--text-dark)',
          font: { size: 11 }
        },
        grid: { 
          display: false
        },
        border: {
          display: false
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: { 
          color: 'var(--text-dark)',
          font: { size: 11 },
          callback: function(value) {
            return '$' + (value >= 1000 ? (value / 1000) + 'k' : value);
          }
        },
        grid: { 
          color: 'var(--border-color)',
          drawBorder: false,
        },
        border: {
          display: false
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        ticks: { 
          color: 'var(--text-dark)',
          font: { size: 11 },
          callback: function(value) {
            return '$' + (value >= 1000 ? (value / 1000) + 'k' : value);
          }
        },
        grid: {
          drawOnChartArea: false,
        },
        border: {
          display: false
        }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return <Chart type='bar' data={data} options={options} />;
}
