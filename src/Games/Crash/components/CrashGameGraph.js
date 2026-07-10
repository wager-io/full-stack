import pkg from 'lodash';
const { debounce } = pkg;
import EventEmitter from "./EventEmitter";
import { gsap } from "gsap";

// Game status enum
const GameStatus = {
  0: 'CONNECTION',
  1: 'STARTING',
  2: 'PROGRESS',
  3: 'ENDED',
  CONNECTION: 0,
  STARTING: 1,
  PROGRESS: 2,
  ENDED: 3,
};

const DEFAULT_COLORS = ["#FFFFFF", "#FFFFFF", "rgb(12, 70, 135)", "#3d444b", "red", "rgb(12, 70, 135)"];
function lightenColor(e) {
  e = e.replace(/#/, "");
  var t = parseInt(e, 16);
  return [(t >> 16) & 255, (t >> 8) & 255, 255 & t];
}
function getPayoutForTime(t) {
  return Math.pow(Math.E, 6e-5 * t);
}
// CrashGraph class
export default class CrashGameGraph extends EventEmitter {

  static XAxisPlotMinValue = 10000;
  static YAxisSizeMultiplier = 2;
  static fontFamily = "Montserrat";
  static RenderInterval = 3;

  constructor(game) {
    super();
    this.game = game;
    this.rendering = false;
    this.renderTimes = 0;
    this.currentTime = 0;
    this.currentGamePayout = 0;
    this.escapes = [];
    this.canvas;
    this.ctx;
    this.width = 0;
    this.height = 0;
    this.startPoint = [60, 40];
    this.plotSize = [0, 0];
    this.plotValue = [0, 0];
    this.increment = [0, 0];
    this.devicePixelRatio = 2;
    this.gradient;
    this.colors = DEFAULT_COLORS;

    this.resize = debounce(this.resize.bind(this), 200);
    this.render = this.render.bind(this);
    this.mountEffect = this.mountEffect.bind(this);

    if (this.game.on) {
      this.game.on("escape", this.escape.bind(this));
    }
  }

  // get colors() {
  //   return ["#FFFFFF", "#FFFFFF", "#7322FF", "#3d444b", "#ed6300"]
  // }

  mountEffect(canvas) {
    if (canvas) {
      this.startRendering(canvas);
    } else {
      this.stopRendering();
    }
  }

  startRendering(canvas) {
    if (!canvas.getContext) {
      console.error("No canvas");
      return;
    }

    this.rendering = true;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.resize();

    requestAnimationFrame(this.render);
  }

  stopRendering() {
    this.rendering = false;
    this.canvas = null;
    this.ctx = null;
  }

  resize() {
    if (this.width !== this.canvas.clientWidth) {
      this.width = this.canvas.clientWidth * this.devicePixelRatio;
      this.height = this.canvas.clientHeight * this.devicePixelRatio;

      this.canvas.width = this.width;
      this.canvas.height = this.height;

      this.plotSize = [
        this.width - 2 * this.startPoint[0],
        this.height - this.startPoint[1],
      ];

      this.gradient = this.ctx.createLinearGradient(
        this.width / 3,
        0,
        (2 * this.width) / 3,
        0
      );

      this.gradient.addColorStop(0, this.colors[1]);
      this.gradient.addColorStop(1, this.colors[2]);
    }
  }

  render() {
    if (!this.rendering) return;

    this.renderTimes++;

    if (this.renderTimes % CrashGameGraph.RenderInterval === 0) {
      this.calcGameData();
      this.calculatePlotValues();
      this.clean();
      this.drawGraph();
      this.drawAxes();
      this.drawGameData();
      this.drawEscapes();
    }

    requestAnimationFrame(this.render.bind(this));
  }

  clean() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGraph() {
    this.ctx.lineWidth = 7;
    this.ctx.strokeStyle = this.gradient;
    this.ctx.beginPath();

    let pos = [0, 0];
    let step = Math.max(this.currentTime / 1000, 100);

    for (let i = 0; i <= this.currentTime; i += step) {
      let payout = getPayoutForTime(i) - 1;
      let y = this.plotSize[1] - payout * this.increment[1];

      pos = [i * this.increment[0] + this.startPoint[0], y];

      this.ctx.lineTo(...pos);
    }

    this.ctx.stroke();
  }

  drawAxes() {
    const [originX, originY] = this.startPoint;
    const [plotWidth, plotHeight] = this.plotSize;

    const calculateStep = (value) => {
      let step = 0.4,
        increment = 0.1;
      while (!(value < step || ((increment *= 2), value < (step *= 5)))) {
        step *= 2;
        increment *= 5;
      }
      return increment;
    };

    const yStep = calculateStep(
      this.currentGamePayout ? this.currentGamePayout : 1
    );
    this.ctx.lineWidth = 1;
    let color = this.colors[3];
    this.ctx.strokeStyle = color;
    this.ctx.font = "22px Montserrat";
    this.ctx.fillStyle = color;
    this.ctx.textAlign = "center";

    const yScale = plotHeight / this.plotValue[1];
    for (let y = yStep, count = 0; y < this.plotValue[1]; y += yStep, count++) {
      let yPosition = plotHeight - y * yScale;
      this.ctx.fillText(y + 1 + "x", 30, yPosition);
      this.ctx.beginPath();
      this.ctx.moveTo(originX, yPosition);
      this.ctx.lineTo(originX + 5, yPosition);
      this.ctx.stroke();
      if (count > 100) {
        console.log("For 3 too long");
        break;
      }
    }

    const xStep = calculateStep(this.plotValue[0]);
    const xScale = plotWidth / (this.plotValue[0] / xStep);
    for (let x = 0, count = 0; x < this.plotValue[0]; x += xStep, count++) {
      const xPosition = count * xScale + originX;
      this.ctx.fillText((x / 1e3).toString(), xPosition, plotHeight + 20);
      if (count > 100) {
        console.log("For 4 too long");
        break;
      }
    }

    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(originX, 0);
    this.ctx.lineTo(originX, this.height - originY);
    this.ctx.lineTo(this.width - originX, this.height - originY);
    this.ctx.stroke();
  }

  drawGameData() {
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    if (this.game.status === GameStatus.PROGRESS) {
      this.ctx.fillStyle = this.colors[0];
      this.ctx.font = `bold ${this.fontSizePx(8)} ${CrashGameGraph.fontFamily}`;

      this.ctx.fillText(
        this.currentGamePayout.toFixed(2) + "×",
        this.width / 2,
        (2 * this.height) / 5
      );
    } else if (this.game.status === GameStatus.ENDED) {
      this.ctx.font = `bold ${this.fontSizePx(5)} ${CrashGameGraph.fontFamily}`;
      this.ctx.fillStyle = this.colors[4];

      this.ctx.fillText(
        "Bang" + " @" + this.game.rate.toFixed(2) + "×",
        this.width / 2,
        (2 * this.height) / 5
      );
    } else if (this.game.status === GameStatus.STARTING) {
      this.ctx.font = `bold ${this.fontSizePx(4)} ${CrashGameGraph.fontFamily}`;
      this.ctx.fillStyle = this.colors[0];

      // Fix the seconds calculation
      // 1. Make sure we have a valid startTime
      const currentTime = Date.now();
      const startTime = this.game.startTime || (currentTime + 5000); // Default to 5 seconds if not set

      // 2. Calculate seconds and ensure it's not negative
      const seconds = Math.max(0, (startTime - currentTime) / 1000);

      // 3. Only render if we have a positive countdown
      if (seconds > 0) {
        this.ctx.fillText(
          `Starts in ${seconds.toFixed(1)}s`,
          this.width / 2,
          (2 * this.height) / 5
        );

        // Optional: Add a progress bar for better visualization
        const barWidth = this.width * 0.4;
        const barHeight = this.height * 0.02;
        const barX = (this.width - barWidth) / 2;
        const barY = (2 * this.height) / 5 + 30;

        // Background bar
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        // Progress bar - assuming 5 second countdown
        const maxTime = 5;
        const progress = Math.min(seconds / maxTime, 1);
        this.ctx.fillStyle = this.colors[0];
        this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);
      } else {
        // If countdown is zero or negative, show "Starting..."
        this.ctx.fillText(
          "Starting...",
          this.width / 2,
          (2 * this.height) / 5
        );
      }
    } else if (this.game.status === GameStatus.CONNECTION) {
      this.ctx.font = `bold ${this.fontSizePx(3)} ${CrashGameGraph.fontFamily}`;
      this.ctx.fillStyle = this.colors[0];

      this.ctx.fillText(
        "Reconnecting...",
        this.width / 2,
        (2 * this.height) / 5
      );
    }
  }

  calcGameData() {
    if (this.game.status === GameStatus.PROGRESS) {
      // STOP if disconnected
      if (this.game.status === GameStatus.CONNECTION) {
        return;
      }
      let elapsed = Date.now() - this.game.startTime;
      if (!this.game.paused) {
        this.currentTime = elapsed > 0 ? elapsed : 0;
      }
    } else {
      this.currentTime = 0;
    }

    this.currentGamePayout = getPayoutForTime(this.currentTime);

    this.emit("payoutChange", this.currentGamePayout);
  }

  calculatePlotValues() {
    this.plotValue[1] = CrashGameGraph.YAxisSizeMultiplier;
    this.plotValue[0] = CrashGameGraph.XAxisPlotMinValue;

    if (this.currentTime > CrashGameGraph.XAxisPlotMinValue) {
      this.plotValue[0] = this.currentTime;
    }

    if (this.currentGamePayout > CrashGameGraph.YAxisSizeMultiplier) {
      this.plotValue[1] = this.currentGamePayout;
    }

    this.plotValue[1] -= 1;

    this.increment[0] = this.plotSize[0] / this.plotValue[0];
    this.increment[1] = this.plotSize[1] / this.plotValue[1];
  }

  fontSizePx(size) {
    const ratio = this.width / (this.width < 1000 ? 60 : 100);
    return (ratio * size).toFixed(2) + "px";
  }

  drawEscapes() {
    this.ctx.font = this.fontSizePx(1.5) + " Arial";

    this.escapes.forEach((escape) => {
      const [r, g, b] = lightenColor(this.colors[0]);

      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, .5)`;
      this.ctx.globalAlpha = escape.payoutTween / escape.payout;

      const x = this.startPoint[0] + this.increment[0] * escape.elapsed;
      const y = this.plotSize[1] - escape.payoutTween * this.increment[1];

      const rate = escape.rate.toFixed(2);
      this.ctx.fillText(`${escape.name} @${rate}`, x, y + 20);

      this.ctx.beginPath();
      this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.globalAlpha = 1;
    });
  }

  escape(escape) {
    // if (escape.usd < 1 && escape.userId !== this.game.user.userId) return;
    if (!this.rendering || document.hidden) return;


    const payout = getPayoutForTime(this.currentTime) - 1;
    let data = Object.assign(
      {
        elapsed: this.currentTime,
        payout: payout,
        payoutTween: payout,
      },
      escape
    );

    gsap.to(data, {
      duration: 8,
      payoutTween: 0,
      onComplete: () => {
        let index = this.escapes.indexOf(data);
        if (index !== -1) {
          this.escapes.splice(index, 1);
        }
      },
    });

    this.escapes.push(data);
  }
  drawMessages() {
    // Check if we have any messages to display
    if (!this.game.errorMessage && !this.game.statusMessage && !this.game.gameStateMessage) {
      return;
    }

    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;

    // Save the current context state
    ctx.save();

    // Determine which message to display and its style
    let message, bgColor;

    if (this.game.errorMessage) {
      message = this.game.errorMessage;
      bgColor = 'rgba(220, 38, 38, 0.8)'; // Red background for errors
    } else if (this.game.statusMessage) {
      message = this.game.statusMessage;
      bgColor = 'rgba(30, 64, 175, 0.8)'; // Blue background for status
    } else if (this.game.gameStateMessage) {
      message = this.game.gameStateMessage;
      bgColor = 'rgba(0, 0, 0, 0.7)'; // Black background for game state
    }

    // Draw semi-transparent background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Draw message text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${this.fontSizePx(8)} ${CrashGameGraph.fontFamily}`;
    ctx.fillText(message, width / 2, height / 2);

    // If reconnecting, draw a loading spinner
    if (this.game.reconnecting) {
      this.drawReconnectingSpinner(width / 2, height / 2 + 40);
    }

    // Restore the context state
    ctx.restore();
  }

  drawReconnectingSpinner(x, y) {
    const ctx = this.ctx;
    const time = Date.now();
    const radius = Math.round(this.height / 30);

    ctx.save();

    // Draw spinner circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw spinning arc
    ctx.beginPath();
    const startAngle = (time / 150) % (Math.PI * 2);
    ctx.arc(x, y, radius, startAngle, startAngle + Math.PI);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  }
}
