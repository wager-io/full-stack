// Update the placeBet method to send numeric risk values to the backend
placeBet = async (betAmount, risk, rows) => {
  if (!this.socket || !this.connected) {
    throw new Error('Not connected to server');
  }
  
  // Ensure risk is a number
  const numericRisk = Number(risk);
  
  return new Promise((resolve, reject) => {
    this.socket.emit('plinko-bet', {
      _id: this.user._id,
      name: this.user.username,
      hidden: this.user.hidden_from_public || false,
      avatar: this.user.profile_image || '',
      betAmount: betAmount,
      currencyName: 'USD', // Or your currency
      currencyImage: '/assets/token/usdt.png', // Or your currency image
      risk: numericRisk, // Send numeric risk value
      rows: rows
    }, (response) => {
      if (response.code === 0) {
        resolve(response.data);
      } else {
        reject(new Error(response.message));
      }
    });
  });
};