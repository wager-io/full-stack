import EventEmitter from './EventEmitter';

class CrashGameGraph {
  constructor(game) {
    this.game = game;
    this.canvas = null;
    this.ctx = null;
    this.width = 0;
    this.height = 0;
    this.animationFrameId = null;
    this.lastTimestamp = 0;
    
    // Bind event listeners
    this.onEscape = this.onEscape.bind(this);
    this.render = this.render.bind(this);
    
    // Listen for escape events from the game
    this.game.on('escape', this.onEscape);
  }
  
  mountEffect(canvas) {
    if (this.canvas === canvas) return;
    
    // Clean up previous canvas if any
    if (this.canvas && !canvas) {
      cancelAnimationFrame(this.animationFrameId);
      this.canvas = null;
      this.ctx = null;
      return;
    }
    
    // Set up new canvas
    this.canvas = canvas;
    if (canvas) {
      this.ctx = canvas.getContext('2d');
      this.resize();
      this.startAnimation();
    }
  }
  
  resize() {
    if (!this.canvas) return;
    
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.width = rect.width;
    this.height = rect.height;
  }
  
  startAnimation() {
    this.lastTimestamp = performance.now();
    const animate = (timestamp) => {
      // Calculate delta time for smooth animations
      const deltaTime = timestamp - this.lastTimestamp;
      this.lastTimestamp = timestamp;
      
      this.render(deltaTime);
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate(performance.now());
  }
  
  onEscape(escape) {
    // Handle escape events (player cashing out)
    console.log('Player escaped:', escape);
    // You can add visual effects for cashouts here
  }
  
  render(deltaTime) {
    if (!this.ctx) return;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw background
    this.ctx.fillStyle = '#1a202c';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Get current game state
    const { status, rate, errorMessage, statusMessage, gameStateMessage } = this.game;
    
    // Draw graph based on game status
    if (status === 2) { // PROGRESS
      this.drawProgressGraph(rate);
    } else if (status === 3) { // ENDED
      this.drawCrashedGraph(rate);
    } else if (status === 1) { // STARTING
      this.drawCountdown();
    } else {
      this.drawWaitingState();
    }
    
    // Draw messages
    this.drawMessages(errorMessage, statusMessage, gameStateMessage);
  }
  
  drawProgressGraph(rate) {
    if (!this.ctx) return;
    
    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;
    
    // Draw multiplier line
    ctx.strokeStyle = '#10b981'; // Green color
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    // Calculate points for the exponential curve
    const points = this.calculateCurvePoints(rate);
    
    // Draw the curve
    ctx.moveTo(0, height);
    for (const point of points) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
    
    // Draw current multiplier
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${rate.toFixed(2)}x`, width / 2, height / 2);
  }
  
  drawCrashedGraph(crashPoint) {
    if (!this.ctx) return;
    
    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;
    
    // Draw crashed line
    ctx.strokeStyle = '#ef4444'; // Red color
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    // Calculate points for the exponential curve
    const points = this.calculateCurvePoints(crashPoint);
    
    // Draw the curve
    ctx.moveTo(0, height);
    for (const point of points) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
    
    // Draw crash point
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`CRASHED AT ${crashPoint.toFixed(2)}x`, width / 2, height / 2);
  }
  
  drawCountdown() {
    if (!this.ctx) return;
    
    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;
    
    // Calculate remaining time until game starts
    const currentTime = Date.now();
    const startTime = this.game.startTime || 0;
    const timeLeft = Math.max(0, (startTime - currentTime) / 1000);
    
    // Draw countdown text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Starting in ${timeLeft.toFixed(1)}s`, width / 2, height / 2 - 30);
    
    // Draw countdown progress bar
    const maxTime = 5; // Assuming 5 seconds countdown
    const progress = Math.min(timeLeft / maxTime, 1);
    const barWidth = width * 0.6;
    const barHeight = 10;
    const barX = (width - barWidth) / 2;
    const barY = height / 2 + 20;
    
    // Draw background bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Draw progress bar
    ctx.fillStyle = '#10b981'; // Green color
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    
    // Draw pulsing "Get Ready" text
    const pulseScale = 1 + 0.1 * Math.sin(currentTime / 200);
    ctx.font = `bold ${24 * pulseScale}px Arial`;
    ctx.fillStyle = '#fbbf24'; // Amber color
    ctx.fillText('Get Ready!', width / 2, height / 2 + 60);
  }
  
  drawWaitingState() {
    if (!this.ctx) return;
    
    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;
    
    // Draw waiting message
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Waiting for next round...', width / 2, height / 2);
  }
  
  drawMessages(errorMessage, statusMessage, gameStateMessage) {
    if (!this.ctx) return;
    
    const ctx = this.ctx;
    const width = this.width;
    
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    
    if (errorMessage) {
      ctx.fillStyle = '#ef4444'; // Red
      ctx.fillText(errorMessage, width / 2, 30);
    } else if (statusMessage) {
      ctx.fillStyle = '#10b981'; // Green
      ctx.fillText(statusMessage, width / 2, 30);
    } else if (gameStateMessage) {
      ctx.fillStyle = '#ffffff';
      ctx.fillText(gameStateMessage, width / 2, 30);
    }
  }
  
  drawGameData() {
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    if (this.game.status === GameStatus.PROGRESS) {
      // Render running game state
      this.ctx.fillStyle = this.colors[0];
      this.ctx.font = `bold ${this.fontSizePx(8)} ${CrashGameGraph.fontFamily}`;

      this.ctx.fillText(
        this.currentGamePayout.toFixed(2) + "×",
        this.width / 2,
        (2 * this.height) / 5
      );
    } else if (this.game.status === GameStatus.ENDED) {
      // Render crashed state
      this.ctx.font = `bold ${this.fontSizePx(5)} ${CrashGameGraph.fontFamily}`;
      this.ctx.fillStyle = this.colors[4];

      this.ctx.fillText(
        "Bang" + " @" + this.game.rate.toFixed(2) + "×",
        this.width / 2,
        (2 * this.height) / 5
      );
    } else if (this.game.status === GameStatus.STARTING) {
        console.log(GameStatus)
      // Render starting state with countdown
      this.ctx.font = `bold ${this.fontSizePx(4)} ${CrashGameGraph.fontFamily}`;
      this.ctx.fillStyle = this.colors[0];

      // Calculate seconds remaining
      const seconds = Math.max(0, (this.game.startTime - Date.now()) / 1000);
      
      // Draw countdown text
      this.ctx.fillText(
        `Starts in ${seconds.toFixed(1)}s`,
        this.width / 2,
        (2 * this.height) / 5
      );
      
      // Draw countdown progress bar
      const barWidth = this.width * 0.4;
      const barHeight = this.height * 0.02;
      const barX = (this.width - barWidth) / 2;
      const barY = (2 * this.height) / 5 + 30;
      
      // Background bar
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      this.ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // Progress bar
      const maxTime = 5; // Assuming 5 seconds countdown
      const progress = Math.min(seconds / maxTime, 1);
      this.ctx.fillStyle = this.colors[0];
      this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    } else if (this.game.status === GameStatus.CONNECTION) {
      // Render connection state
      this.ctx.font = `bold ${this.fontSizePx(3)} ${CrashGameGraph.fontFamily}`;
      this.ctx.fillStyle = this.colors[0];

      this.ctx.fillText(
        "Reconnecting...",
        this.width / 2,
        (2 * this.height) / 5
      );
    }
    
    // Draw any error or status messages
    if (this.game.errorMessage) {
      this.ctx.font = `${this.fontSizePx(2)} ${CrashGameGraph.fontFamily}`;
      this.ctx.fillStyle = this.colors[4]; // Red color
      this.ctx.fillText(
        this.game.errorMessage,
        this.width / 2,
        this.height / 6
      );
    } else if (this.game.statusMessage) {
      this.ctx.font = `${this.fontSizePx(2)} ${CrashGameGraph.fontFamily}`;
      this.ctx.fillStyle = this.colors[0];
      this.ctx.fillText(
        this.game.statusMessage,
        this.width / 2,
        this.height / 6
      );
    } else if (this.game.gameStateMessage) {
      this.ctx.font = `${this.fontSizePx(2)} ${CrashGameGraph.fontFamily}`;
      this.ctx.fillStyle = this.colors[0];
      this.ctx.fillText(
        this.game.gameStateMessage,
        this.width / 2,
        this.height / 6
      );
    }
  }
  
  calculateCurvePoints(targetRate) {
    const points = [];
    const width = this.width;
    const height = this.height;
    
    // Calculate how many points to use based on canvas width
    const numPoints = Math.min(100, width);
    
    for (let i = 0; i < numPoints; i++) {
      const progress = i / (numPoints - 1);
      const currentRate = 1 + progress * (targetRate - 1);
      
      // Map rate to y-coordinate (inverse relationship)
      // Higher rates are higher on the canvas (lower y values)
      const x = progress * width;
      const y = height - (Math.log(currentRate) / Math.log(targetRate)) * (height * 0.8);
      
      points.push({ x, y });
    }
    
    return points;
  }
}

export default CrashGameGraph;