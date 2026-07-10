import { makeAutoObservable, runInAction } from 'mobx';
import CrashGame from '../models/CrashGame';

class GraphStore {
  game = new CrashGame();
  escapes = [];

  constructor() {
    makeAutoObservable(this, {
      game: false // Don't make the EventEmitter observable
    });
  }

  updateGameStatus(status) {
    runInAction(() => {
      this.game.updateStatus(status);
    });
  }

  updateGameRate(rate) {
    runInAction(() => {
      this.game.updateRate(rate);
    });
  }

  setStartTime(time) {
    runInAction(() => {
      this.game.setStartTime(time);
    });
  }

  addEscape(escape) {
    runInAction(() => {
      this.escapes.push(escape);
      this.game.emitEscape(escape);
    });
  }

  resetEscapes() {
    runInAction(() => {
      this.escapes = [];
    });
  }
  
  setErrorMessage(message, isReconnecting = false) {
    runInAction(() => {
      this.game.setErrorMessage(message, isReconnecting);
    });
  }
  
  setStatusMessage(message) {
    runInAction(() => {
      this.game.setStatusMessage(message);
    });
  }
  
  setGameStateMessage(message) {
    runInAction(() => {
      this.game.setGameStateMessage(message);
    });
  }
  
  clearMessages() {
    runInAction(() => {
      this.game.clearMessages();
    });
  }

  setGameData(data) {
    runInAction(() => {
      this.game.setGameData(data);
    });
  }
}

const graphStore = new GraphStore();
export default graphStore;