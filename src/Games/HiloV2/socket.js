import io from 'socket.io-client';

export class SocketEvents {
  constructor(userId) {
    this.userId = userId;
    this.socket = io('/hilo', {
      auth: {
        token: localStorage.getItem('token')
      }
    });
    
    this.setupListeners();
  }
  
  setupListeners() {
    // Handle connection events
    this.socket.on('connect', () => {
      console.log('Connected to Hilo game server');
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from Hilo game server');
    });
    
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    // Game-specific events will be handled by the components
  }
  
  handleHiloInit(data) {
    return new Promise((resolve, reject) => {
      this.socket.emit('join_room', { roomId: 'hilo-main' }, (response) => {
        if (response.code === 0) {
          resolve(response.data);
        } else {
          reject(new Error(response.message || 'Failed to initialize Hilo game'));
        }
      });
    });
  }
  
  handleHiloBet(data) {
    return new Promise((resolve, reject) => {
      this.socket.emit('place_bet', data, (response) => {
        if (response.code === 0) {
          resolve(response.data);
        } else {
          reject(new Error(response.message || 'Failed to place bet'));
        }
      });
    });
  }
  
  handleHiloNextRound(data) {
    return new Promise((resolve, reject) => {
      // Determine which event to emit based on the data
      let eventName = 'make_choice';
      if (data.skip) {
        eventName = 'skip';
      }
      
      this.socket.emit(eventName, data, (response) => {
        if (response.code === 0) {
          resolve(response.data);
        } else {
          reject(new Error(response.message || 'Failed to make choice'));
        }
      });
    });
  }
  
  handleHiloCashout(data) {
    return new Promise((resolve, reject) => {
      this.socket.emit('cash_out', data, (response) => {
        if (response.code === 0) {
          resolve(response.data);
        } else {
          reject(new Error(response.message || 'Failed to cash out'));
        }
      });
    });
  }
  
  handleGetSeeds() {
    return new Promise((resolve, reject) => {
      this.socket.emit('get_seeds', { _id: this.userId }, (response) => {
        if (response.code === 0) {
          resolve(response.data);
        } else {
          reject(new Error(response.message || 'Failed to get seeds'));
        }
      });
    });
  }
  
  handleUpdateSeeds(clientSeed) {
    return new Promise((resolve, reject) => {
      this.socket.emit('update_seeds', { _id: this.userId, clientSeed }, (response) => {
        if (response.code === 0) {
          resolve(response.data);
        } else {
          reject(new Error(response.message || 'Failed to update seeds'));
        }
      });
    });
  }
  
  handleGetGameDetails(betId) {
    return new Promise((resolve, reject) => {
      this.socket.emit('get_game_details', { betId }, (response) => {
        if (response.code === 0) {
          resolve(response.data);
        } else {
          reject(new Error(response.message || 'Failed to get game details'));
        }
      });
    });
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}