// If you have any helper functions that deal with risk values
export const getRiskLabel = (riskValue) => {
  const riskLabels = {
    1: 'Low',
    2: 'Medium',
    3: 'High'
  };
  
  return riskLabels[riskValue] || 'Medium';
};

export const getRiskColor = (riskValue) => {
  const riskColors = {
    1: '#43B309', // Green for low risk
    2: '#f39c12', // Yellow for medium risk
    3: '#e74c3c'  // Red for high risk
  };
  
  return riskColors[riskValue] || riskColors[2];
};