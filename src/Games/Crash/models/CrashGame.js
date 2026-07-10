import EventEmitter from '../components/EventEmitter';

// Game status enum - matches backend GameStatus
export const GameStatus = {
  0: 'CONNECTION',
  1: 'STARTING',
  2: 'PROGRESS',
  3: 'ENDED',
  CONNECTION: 0,
  STARTING: 1,
  PROGRESS: 2,
  ENDED: 3,
};

// Create a game object that extends EventEmitter
export default class CrashGame extends EventEmitter {
  status = 0; // CONNECTION
  rate = 1.0;
  startTime = Date.now();
  paused = false;
  errorMessage = null;
  statusMessage = null;
  gameStateMessage = null;
  reconnecting = false;
  gameId = 0;
  hash = "";
  prepareTime = 5000;
  maxRate = 1;

  constructor() {
    super();
  }

  updateStatus(status) {
    this.status = status;
  }

  updateRate(rate) {
    this.rate = rate;
  }

  setStartTime(time) {
    this.startTime = time;
  }

  emitEscape(escape) {
    this.emit('escape', escape);
  }
  
  setErrorMessage(message, isReconnecting = false) {
    this.errorMessage = message;
    this.statusMessage = null;
    this.gameStateMessage = null;
    this.reconnecting = isReconnecting;
  }
  
  setStatusMessage(message) {
    this.statusMessage = message;
    this.errorMessage = null;
    this.gameStateMessage = null;
    this.reconnecting = false;
  }
  
  setGameStateMessage(message) {
    if (!this.errorMessage && !this.statusMessage) {
      this.gameStateMessage = message;
    }
  }
  
  clearMessages() {
    this.errorMessage = null;
    this.statusMessage = null;
    this.gameStateMessage = null;
    this.reconnecting = false;
  }

  setGameData(data) {
    this.gameId = data.gameId;
    this.status = data.status;
    this.prepareTime = data.prepareTime;
    this.startTime = data.startTime;
    this.hash = data.hash;
    this.maxRate = data.maxRate / 100;
  }
}