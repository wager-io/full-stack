import { PAYOUTS, calculateProbabilities, simulatePlinkoDrop, getPayout } from './PlinkoLogic';

export default class PlinkoCanvas {
  constructor(canvas, { rows = 8, width = 560, height = 470, pegRadius = 4, ballRadius = 10, risk = 1, betAmount = 1 } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.rows = rows;
    this.width = width;
    this.height = height;
    this.pegRadius = pegRadius;
    this.ballRadius = ballRadius;
    this.pegColor = '#fff';
    this.backgroundColor = '#0f212e';
    this.buttonColor = '#1a2c38';
    this.buttonHighlightColor = '#4a9ea1';
    this.risk = risk;
    this.betAmount = betAmount;
    this.payouts = PAYOUTS[this.risk]?.[this.rows] || [];
    this.probabilities = calculateProbabilities(this.rows, this.rows)[this.rows] || [];
    this.pegs = this.getPegPositions();
    this.hoveredSlot = null;
    this.activeSlot = null;
    this.animationFrameId = null;

    // Load peg image
    this.pegImg = new window.Image();
    this.pegImg.src = '/assets/plinko/pin.png';
    this.pegImgLoaded = false;
    this.pegImg.onload = () => {
      this.pegImgLoaded = true;
      this.drawBoard();
    };

    // Add mouse move event listener to track hover
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseout', () => {
      this.hoveredSlot = null;
      this.drawBoard();
    });
    
    // Track multiple balls
    this.activeBalls = new Map(); // Map of ballId -> ball animation data
  }

  // New method to animate multiple ball drops simultaneously
  animateBallDrop(ballImg, path, ballId, onComplete) {
    // Parse the path string (e.g., "10011110")
    const pathArray = path.split('').map(bit => parseInt(bit));
    
    // Start position at the top center
    const startX = this.width / 2;
    const startY = 20;
    
    // Calculate the final slot based on the path
    let finalSlot = 0;
    for (let i = 0; i < pathArray.length; i++) {
      if (pathArray[i] === 1) {
        finalSlot++;
      }
    }
    
    // Calculate positions for each step of the animation
    const positions = [];
    let currentX = startX;
    let currentY = startY;
    
    // Add starting position
    positions.push({ x: currentX, y: currentY, isPeg: false });
    
    // Calculate row spacing
    const rowSpacing = this.height / (this.rows + 2);
    
    // Calculate the positions for each row based on the path
    for (let row = 0; row < this.rows; row++) {
      currentY += rowSpacing;
      
      // Move left or right based on the path bit (0 = left, 1 = right)
      if (row < pathArray.length) {
        const colSpacing = this.width / (this.rows + 1);
        if (pathArray[row] === 1) {
          currentX += colSpacing / 2; // Move right
        } else {
          currentX -= colSpacing / 2; // Move left
        }
      }
      
      // Add this position to the array (mark as a peg position)
      positions.push({ x: currentX, y: currentY, isPeg: true, pegRow: row, pegCol: pathArray[row] });
    }
    
    // Add intermediate positions for bouncing effect
    const interpolatedPositions = [];
    for (let i = 0; i < positions.length - 1; i++) {
      const current = positions[i];
      const next = positions[i + 1];
      
      // Add the current position
      interpolatedPositions.push(current);
      
      // If this is a peg to the next position, add bounce points
      if (current.isPeg && i < positions.length - 2) {
        const bounceHeight = rowSpacing * 0.2; // 20% of row spacing for bounce height
        
        // First bounce point (slightly to the side)
        interpolatedPositions.push({
          x: current.x + (next.x - current.x) * 0.25,
          y: current.y + rowSpacing * 0.25 - bounceHeight,
          isPeg: false
        });
        
        // Second bounce point (middle)
        interpolatedPositions.push({
          x: current.x + (next.x - current.x) * 0.5,
          y: current.y + rowSpacing * 0.5,
          isPeg: false
        });
        
        // Third bounce point (almost to next peg)
        interpolatedPositions.push({
          x: current.x + (next.x - current.x) * 0.75,
          y: current.y + rowSpacing * 0.75 - bounceHeight * 0.5,
          isPeg: false
        });
      }
    }
    
    // Add the final position
    interpolatedPositions.push(positions[positions.length - 1]);
    
    // Add final position at the bottom
    const finalY = this.height - 15;
    interpolatedPositions.push({ x: currentX, y: finalY, isPeg: false });
    
    // Store this ball's animation data
    this.activeBalls.set(ballId, {
      positions: interpolatedPositions,
      step: 0,
      progress: 0,
      finalSlot,
      onComplete,
      shakingPegs: []
    });
    
    // Start the animation loop if it's not already running
    if (!this.animationFrameId) {
      this.animateAllBalls(ballImg);
    }
  }
  
  // Animate all active balls in a single animation loop
  animateAllBalls(ballImg) {
    // Store the current pegs to restore after drawing
    const originalPegs = [...this.pegs];
    
    // Apply shaking effects to pegs from all balls
    const allShakingPegs = [];
    for (const ball of this.activeBalls.values()) {
      allShakingPegs.push(...ball.shakingPegs);
    }
    
    // Apply shaking effect to pegs that were hit
    for (let i = 0; i < allShakingPegs.length; i++) {
      const shaking = allShakingPegs[i];
      
      // Find the peg in the original pegs array
      const pegIndex = originalPegs.findIndex(p => 
        p.row === shaking.row && p.col === shaking.col
      );
      
      if (pegIndex !== -1) {
        // Calculate shake amount based on time elapsed
        const shakeAmount = Math.sin(shaking.time * 30) * shaking.intensity;
        
        // Apply shake to the peg position
        this.pegs[pegIndex] = {
          ...originalPegs[pegIndex],
          x: originalPegs[pegIndex].x + shakeAmount,
          y: originalPegs[pegIndex].y + shakeAmount * 0.5
        };
        
        // Reduce intensity over time
        shaking.intensity *= 0.9;
        shaking.time += 0.1;
        
        // Remove shaking effect if intensity is too low
        if (shaking.intensity < 0.1) {
          allShakingPegs.splice(i, 1);
          i--;
        }
      }
    }
    
    // Draw the board with potentially shaking pegs
    this.drawBoard();
    
    // Restore original peg positions
    this.pegs = originalPegs;
    
    // Process each active ball
    const animationSpeed = 10;
    const ballsToRemove = [];
    
    for (const [ballId, ball] of this.activeBalls.entries()) {
      if (ball.step < ball.positions.length - 1) {
        // Interpolate between current position and next position
        const current = ball.positions[ball.step];
        const next = ball.positions[ball.step + 1];
        
        // If we're at a peg position, add a slight pause
        const speedMultiplier = current.isPeg ? 0.85 : 1;
        
        const x = current.x + (next.x - current.x) * ball.progress;
        const y = current.y + (next.y - current.y) * ball.progress;
        
        // Draw the ball
        this.drawBall(ballImg, x, y);
        
        // Update progress
        ball.progress += (animationSpeed / 100) * speedMultiplier;
        
        // Move to next step if we've reached it
        if (ball.progress >= 1) {
          ball.step++;
          ball.progress = 0;
          
          // If we just hit a peg, add a visual effect and start the peg shaking
          if (ball.step < ball.positions.length && ball.positions[ball.step].isPeg) {
            const hitPeg = ball.positions[ball.step];
            
            // Find the peg in our pegs array
            const pegIndex = this.pegs.findIndex(p => 
              Math.abs(p.x - hitPeg.x) < 5 && Math.abs(p.y - hitPeg.y) < 5
            );
            
            if (pegIndex !== -1) {
              // Add this peg to the shaking pegs list
              ball.shakingPegs.push({
                row: hitPeg.pegRow,
                col: hitPeg.pegCol,
                intensity: 2, // Initial shake intensity
                time: 0      // Time counter for the shake
              });
              
              // Draw a small "impact" effect
              const pegX = hitPeg.x * (this.canvas.width / this.width);
              const pegY = hitPeg.y * (this.canvas.height / this.height);
              
              // Draw a small flash
              this.ctx.beginPath();
              this.ctx.arc(pegX, pegY, 8, 0, Math.PI * 2);
              this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
              this.ctx.fill();
              this.ctx.closePath();
            }
          }
        }
      } else {
        // We've reached the end of the animation for this ball
        this.setActiveSlot(ball.finalSlot);
        this.drawBall(ballImg, ball.positions[ball.positions.length - 1].x, ball.positions[ball.positions.length - 1].y);
        
        // Call the completion callback
        if (ball.onComplete) {
          ball.onComplete(ball.finalSlot);
        }
        
        // Mark this ball for removal
        ballsToRemove.push(ballId);
      }
    }
    
    // Remove completed balls
    for (const ballId of ballsToRemove) {
      this.activeBalls.delete(ballId);
    }
    
    // Continue the animation loop if there are still active balls
    if (this.activeBalls.size > 0) {
      this.animationFrameId = requestAnimationFrame(() => this.animateAllBalls(ballImg));
    } else {
      this.animationFrameId = null;
      
      // Reset active slot after a delay
      setTimeout(() => {
        this.setActiveSlot(null);
        this.drawBoard();
      }, 2000);
    }
  }

  // Handle mouse move to detect hover over slots
  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if mouse is over the slots area
    const slots = this.rows + 1;
    const pegSpacing = this.width / slots;
    const startX = pegSpacing / 2;
    const buttonWidth = pegSpacing * 0.8;
    
    const slotHeight = 25 * (this.canvas.height / this.height);
    const slotY = this.canvas.height - slotHeight - 15 * (this.canvas.height / this.height);
    
    if (y >= slotY && y <= slotY + slotHeight) {
      // Calculate which button the mouse is over
      for (let i = 0; i < slots; i++) {
        const slotX = (startX + i * pegSpacing - buttonWidth / 2) * (this.canvas.width / this.width);
        const buttonWidthScaled = buttonWidth * (this.canvas.width / this.width);
        
        if (x >= slotX && x <= slotX + buttonWidthScaled) {
          if (this.hoveredSlot !== i) {
            this.hoveredSlot = i;
            this.drawBoard();
          }
          return;
        }
      }
    }
    
    // Not hovering over any slot
    if (this.hoveredSlot !== null) {
      this.hoveredSlot = null;
      this.drawBoard();
    }
  }  // Set active slot (when ball lands)
  setActiveSlot(slotIndex) {
    this.activeSlot = slotIndex;
    this.drawBoard();
  }

  // Calculate profit for a given payout
  calculateProfit(payout) {
    if (payout === undefined) return 0;
    return (payout * this.betAmount - this.betAmount).toFixed(2);
  }

  // Draw pegs in a triangular pattern starting with 3 pegs at the top
  getPegPositions() {
    const positions = [];
    const totalRows = this.rows;
    const rowSpacing = this.height / (totalRows + 2);
    
    // Calculate the number of slots at the bottom
    const slots = totalRows + 2; // This creates the right number of slots for the pegs
    
    for (let row = 0; row < totalRows; row++) {
      // Calculate vertical position
      const y = rowSpacing * (row + 1);
      
      // Determine number of pegs in this row
      // Start with 3 pegs in the first row and add 1 peg in each subsequent row
      const pegsInRow = 3 + row;
      
      // Calculate horizontal spacing to center the pegs
      const colSpacing = this.width / (slots);
      
      // Calculate starting x-offset to center the pegs
      const startOffset = (this.width - (pegsInRow - 1) * colSpacing) / 2;
      
      for (let col = 0; col < pegsInRow; col++) {
        const x = startOffset + col * colSpacing;
        positions.push({ x, y, row, col });
      }
    }
    return positions;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Fill the background with a dark blue color
    // this.ctx.fillStyle = this.backgroundColor;
    // this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // Helper function to draw a rounded rectangle
  roundRect(x, y, width, height, radius) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  drawBoard() {
    this.clear();
    const scaleX = this.canvas.width / this.width;
    const scaleY = this.canvas.height / this.height;

    // Draw pegs as images - SMALLER SIZE
    this.pegs.forEach(peg => {
      if (this.pegImgLoaded) {
        const imgSize = 10 * scaleX; // Smaller pegs
        this.ctx.drawImage(
          this.pegImg,
          peg.x * scaleX - imgSize / 2,
          peg.y * scaleY - imgSize / 2,
          imgSize,
          imgSize
        );
      } else {
        // fallback: draw a small circle
        this.ctx.beginPath();
        this.ctx.arc(peg.x * scaleX, peg.y * scaleY, this.pegRadius * scaleX, 0, Math.PI * 2);
        this.ctx.fillStyle = this.pegColor;
        this.ctx.fill();
        this.ctx.closePath();
      }
    });

    // Draw ending slots as buttons - ALIGNED WITH PEGS
    // Only draw buttons for slots that have a payout
    const slots = this.payouts.length;
    const slotHeight = 28 * scaleY; // Reduced from 45 to 28 for a shorter button
    const buttonBottomMargin = 15 * scaleY;

    // Calculate the positions of the bottom row pegs to align buttons between them
    const lastRow = this.rows - 1;
    const pegsInLastRow = 3 + lastRow;
    const colSpacing = this.width / (slots);
    const startOffset = (this.width - (pegsInLastRow - 1) * colSpacing) / 2;

    // Calculate button centers (between pegs)
    let pegXs = [];
    for (let col = 0; col < pegsInLastRow; col++) {
      pegXs.push(startOffset + col * colSpacing);
    }
    let buttonCenters = [];
    for (let i = 0; i < pegXs.length + 1; i++) {
      if (i === 0) {
        buttonCenters.push(pegXs[0] - colSpacing / 2);
      } else if (i === pegXs.length) {
        buttonCenters.push(pegXs[pegXs.length - 1] + colSpacing / 2);
      } else {
        buttonCenters.push((pegXs[i - 1] + pegXs[i]) / 2);
      }
    }

    // Filter out buttons with no payout and center the row
    const validButtons = [];
    for (let i = 0; i < slots; i++) {
      if (this.payouts[i] !== undefined && this.payouts[i] !== null) {
        validButtons.push({ index: i, center: buttonCenters[i], payout: this.payouts[i] });
      }
    }

    // Center the valid buttons horizontally
    const buttonWidth = colSpacing * 1;
    const totalButtonsWidth = validButtons.length * buttonWidth;
    const centerOffset = (this.width - totalButtonsWidth) / 2;

    validButtons.forEach((btn, idx) => {
      const slotX = centerOffset + idx * buttonWidth;
      const slotY = this.canvas.height - slotHeight - buttonBottomMargin;
      const buttonHeight = slotHeight - 2 * scaleY;
      const cornerRadius = 3 * scaleX;

      // Determine button color based on hover/active state
      let buttonFillColor = this.buttonColor;
      if (this.activeSlot === btn.index) {
        buttonFillColor = this.buttonHighlightColor;
      } else if (this.hoveredSlot === btn.index) {
        buttonFillColor = '#243845';
      }

      // Draw button shadow
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      this.ctx.shadowBlur = 4 * scaleX;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 2 * scaleY;

      // Draw button background
      this.ctx.fillStyle = buttonFillColor;
      this.roundRect(slotX, slotY, buttonWidth * scaleX, buttonHeight, cornerRadius);
      this.ctx.fill();

      // Reset shadow
      this.ctx.shadowColor = 'transparent';
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;

      // Draw button highlight at the top (gradient effect)
      const gradient = this.ctx.createLinearGradient(slotX, slotY, slotX, slotY + buttonHeight * 0.3);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      this.ctx.fillStyle = gradient;
      this.roundRect(slotX, slotY, buttonWidth * scaleX, buttonHeight * 0.3, cornerRadius);
      this.ctx.fill();

      // Draw colored border for high payout buttons
      if (btn.payout > 5) {
        this.ctx.strokeStyle = this.buttonHighlightColor;
        this.ctx.lineWidth = 1 * scaleX;
        this.roundRect(slotX, slotY, buttonWidth * scaleX, buttonHeight, cornerRadius);
        this.ctx.stroke();
      }

      // Draw payout text
      this.ctx.fillStyle = "#fff";
      this.ctx.font = `bold ${8 * scaleY}px Arial`;
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        `${btn.payout}x`,
        slotX + buttonWidth * scaleX / 2,
        slotY + buttonHeight / 2 + 2 * scaleY
      );

      // Draw hover card if this slot is hovered
      if (this.hoveredSlot === btn.index && btn.payout !== undefined) {
        this.drawHoverCard(btn.index, slotX + buttonWidth * scaleX / 2, slotY);
      }
    });
  }

  // Draw hover card with profit and chance info
  drawHoverCard(slotIndex, x, y) {
    const scaleX = this.canvas.width / this.width;
    const scaleY = this.canvas.height / this.height;
    
    const cardWidth = 300 * scaleX;
    const cardHeight = 100 * scaleY;
    const cardX = Math.max(10, Math.min(x - cardWidth / 2, this.canvas.width - cardWidth - 10));
    const cardY = y - cardHeight - 10 * scaleY;
    const cornerRadius = 6 * scaleX;
    
    // Draw card shadow
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 10 * scaleX;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 3 * scaleY;
    
    // Draw card background
    this.ctx.fillStyle = '#1f2937';
    this.roundRect(cardX, cardY, cardWidth, cardHeight, cornerRadius);
    this.ctx.fill();
    
    // Reset shadow
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    // Draw card border
    this.ctx.strokeStyle = '#374151';
    this.ctx.lineWidth = 1 * scaleX;
    this.roundRect(cardX, cardY, cardWidth, cardHeight, cornerRadius);
    this.ctx.stroke();
    
    // Draw triangle pointer
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - 5 * scaleY);
    this.ctx.lineTo(x - 8 * scaleX, y - 15 * scaleY);
    this.ctx.lineTo(x + 8 * scaleX, y - 15 * scaleY);
    this.ctx.closePath();
    this.ctx.fillStyle = '#1f2937';
    this.ctx.fill();
    
    // Draw card content
    const padding = 15 * scaleX;
    const halfWidth = (cardWidth - padding * 3) / 2;
    
    // Draw labels
    this.ctx.fillStyle = '#9ca3af';
    this.ctx.font = `${12 * scaleY}px Arial`;
    this.ctx.textAlign = "left";
    this.ctx.fillText("Profit on win", cardX + padding, cardY + 25 * scaleY);
    this.ctx.fillText("Win Chance", cardX + padding * 2 + halfWidth, cardY + 25 * scaleY);
    
    // Draw profit box
    this.ctx.fillStyle = '#374151';
    this.roundRect(cardX + padding, cardY + 35 * scaleY, halfWidth, 30 * scaleY, 4 * scaleX);
    this.ctx.fill();
    
    // Draw chance box
    this.ctx.fillStyle = '#374151';
    this.roundRect(cardX + padding * 2 + halfWidth, cardY + 35 * scaleY, halfWidth, 30 * scaleY, 4 * scaleX);
    this.ctx.fill();
    
    // Draw profit value
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `${13 * scaleY}px Arial`;
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      `${this.calculateProfit(this.payouts[slotIndex])}`,
      cardX + padding + halfWidth / 2,
      cardY + 55 * scaleY
    );
    
    // Draw chance value
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(
      `${(this.probabilities[slotIndex] * 100).toFixed(2)}%`,
      cardX + padding * 2 + halfWidth * 1.5,
      cardY + 55 * scaleY
    );
  }

  drawBall(ballImg, x, y) {
    const scaleX = this.canvas.width / this.width;
    const scaleY = this.canvas.height / this.height;
    const imgSize = this.ballRadius * 2 * scaleX;
    if (ballImg) {
      this.ctx.drawImage(
        ballImg,
        (x * scaleX) - imgSize / 2,
        (y * scaleY) - imgSize / 2,
        imgSize,
        imgSize
      );
    }
  }

  // New method to animate multiple ball drops simultaneously
  animateBallDrop(ballImg, path, ballId, onComplete) {
    // Parse the path string (e.g., "10011110")
    const pathArray = path.split('').map(bit => parseInt(bit));
    
    // Start position at the top center
    const startX = this.width / 2;
    const startY = 20;
    
    // Calculate the final slot based on the path
    let finalSlot = 0;
    for (let i = 0; i < pathArray.length; i++) {
      if (pathArray[i] === 1) {
        finalSlot++;
      }
    }
    
    // Calculate positions for each step of the animation
    const positions = [];
    let currentX = startX;
    let currentY = startY;
    
    // Add starting position
    positions.push({ x: currentX, y: currentY, isPeg: false });
    
    // Calculate row spacing
    const rowSpacing = this.height / (this.rows + 2);
    
    // Calculate the positions for each row based on the path
    for (let row = 0; row < this.rows; row++) {
      currentY += rowSpacing;
      
      // Move left or right based on the path bit (0 = left, 1 = right)
      if (row < pathArray.length) {
        const colSpacing = this.width / (this.rows + 1);
        if (pathArray[row] === 1) {
          currentX += colSpacing / 2; // Move right
        } else {
          currentX -= colSpacing / 2; // Move left
        }
      }
      
      // Add this position to the array (mark as a peg position)
      positions.push({ x: currentX, y: currentY, isPeg: true, pegRow: row, pegCol: pathArray[row] });
    }
    
    // Add intermediate positions for bouncing effect
    const interpolatedPositions = [];
    for (let i = 0; i < positions.length - 1; i++) {
      const current = positions[i];
      const next = positions[i + 1];
      
      // Add the current position
      interpolatedPositions.push(current);
      
      // If this is a peg to the next position, add bounce points
      if (current.isPeg && i < positions.length - 2) {
        const bounceHeight = rowSpacing * 0.2; // 20% of row spacing for bounce height
        
        // First bounce point (slightly to the side)
        interpolatedPositions.push({
          x: current.x + (next.x - current.x) * 0.25,
          y: current.y + rowSpacing * 0.25 - bounceHeight,
          isPeg: false
        });
        
        // Second bounce point (middle)
        interpolatedPositions.push({
          x: current.x + (next.x - current.x) * 0.5,
          y: current.y + rowSpacing * 0.5,
          isPeg: false
        });
        
        // Third bounce point (almost to next peg)
        interpolatedPositions.push({
          x: current.x + (next.x - current.x) * 0.75,
          y: current.y + rowSpacing * 0.75 - bounceHeight * 0.5,
          isPeg: false
        });
      }
    }
    
    // Add the final position
    interpolatedPositions.push(positions[positions.length - 1]);
    
    // Add final position at the bottom
    const finalY = this.height - 15;
    interpolatedPositions.push({ x: currentX, y: finalY, isPeg: false });
    
    // Store this ball's animation data
    this.activeBalls.set(ballId, {
      positions: interpolatedPositions,
      step: 0,
      progress: 0,
      finalSlot,
      onComplete,
      shakingPegs: []
    });
    
    // Start the animation loop if it's not already running
    if (!this.animationFrameId) {
      this.animateAllBalls(ballImg);
    }
  }
  
  // Animate all active balls in a single animation loop
  animateAllBalls(ballImg) {
    // Store the current pegs to restore after drawing
    const originalPegs = [...this.pegs];
    
    // Apply shaking effects to pegs from all balls
    const allShakingPegs = [];
    for (const ball of this.activeBalls.values()) {
      allShakingPegs.push(...ball.shakingPegs);
    }
    
    // Apply shaking effect to pegs that were hit
    for (let i = 0; i < allShakingPegs.length; i++) {
      const shaking = allShakingPegs[i];
      
      // Find the peg in the original pegs array
      const pegIndex = originalPegs.findIndex(p => 
        p.row === shaking.row && p.col === shaking.col
      );
      
      if (pegIndex !== -1) {
        // Calculate shake amount based on time elapsed
        const shakeAmount = Math.sin(shaking.time * 30) * shaking.intensity;
        
        // Apply shake to the peg position
        this.pegs[pegIndex] = {
          ...originalPegs[pegIndex],
          x: originalPegs[pegIndex].x + shakeAmount,
          y: originalPegs[pegIndex].y + shakeAmount * 0.5
        };
        
        // Reduce intensity over time
        shaking.intensity *= 0.9;
        shaking.time += 0.1;
        
        // Remove shaking effect if intensity is too low
        if (shaking.intensity < 0.1) {
          allShakingPegs.splice(i, 1);
          i--;
        }
      }
    }
    
    // Draw the board with potentially shaking pegs
    this.drawBoard();
    
    // Restore original peg positions
    this.pegs = originalPegs;
    
    // Process each active ball
    const animationSpeed = 10;
    const ballsToRemove = [];
    
    for (const [ballId, ball] of this.activeBalls.entries()) {
      if (ball.step < ball.positions.length - 1) {
        // Interpolate between current position and next position
        const current = ball.positions[ball.step];
        const next = ball.positions[ball.step + 1];
        
        // If we're at a peg position, add a slight pause
        const speedMultiplier = current.isPeg ? 0.85 : 1;
        
        const x = current.x + (next.x - current.x) * ball.progress;
        const y = current.y + (next.y - current.y) * ball.progress;
        
        // Draw the ball
        this.drawBall(ballImg, x, y);
        
        // Update progress
        ball.progress += (animationSpeed / 100) * speedMultiplier;
        
        // Move to next step if we've reached it
        if (ball.progress >= 1) {
          ball.step++;
          ball.progress = 0;
          
          // If we just hit a peg, add a visual effect and start the peg shaking
          if (ball.step < ball.positions.length && ball.positions[ball.step].isPeg) {
            const hitPeg = ball.positions[ball.step];
            
            // Find the peg in our pegs array
            const pegIndex = this.pegs.findIndex(p => 
              Math.abs(p.x - hitPeg.x) < 5 && Math.abs(p.y - hitPeg.y) < 5
            );
            
            if (pegIndex !== -1) {
              // Add this peg to the shaking pegs list
              ball.shakingPegs.push({
                row: hitPeg.pegRow,
                col: hitPeg.pegCol,
                intensity: 2, // Initial shake intensity
                time: 0      // Time counter for the shake
              });
              
              // Draw a small "impact" effect
              const pegX = hitPeg.x * (this.canvas.width / this.width);
              const pegY = hitPeg.y * (this.canvas.height / this.height);
              
              // Draw a small flash
              this.ctx.beginPath();
              this.ctx.arc(pegX, pegY, 8, 0, Math.PI * 2);
              this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
              this.ctx.fill();
              this.ctx.closePath();
            }
          }
        }
      } else {
        // We've reached the end of the animation for this ball
        this.setActiveSlot(ball.finalSlot);
        this.drawBall(ballImg, ball.positions[ball.positions.length - 1].x, ball.positions[ball.positions.length - 1].y);
        
        // Call the completion callback
        if (ball.onComplete) {
          ball.onComplete(ball.finalSlot);
        }
        
        // Mark this ball for removal
        ballsToRemove.push(ballId);
      }
    }
    
    // Remove completed balls
    for (const ballId of ballsToRemove) {
      this.activeBalls.delete(ballId);
    }
    
    // Continue the animation loop if there are still active balls
    if (this.activeBalls.size > 0) {
      this.animationFrameId = requestAnimationFrame(() => this.animateAllBalls(ballImg));
    } else {
      this.animationFrameId = null;
      
      // Reset active slot after a delay
      setTimeout(() => {
        this.setActiveSlot(null);
        this.drawBoard();
      }, 2000);
    }
  }

  // Update bet amount
  setBetAmount(amount) {
    this.betAmount = amount;
    this.drawBoard(); // Redraw to update any hover cards that might be showing
  }

  // Update risk level
  setRisk(risk) {
    this.risk = risk;
    this.payouts = PAYOUTS[this.risk]?.[this.rows] || [];
    this.drawBoard();
  }

  // Update number of rows
  setRows(rows) {
    this.rows = rows;
    this.payouts = PAYOUTS[this.risk]?.[this.rows] || [];
    this.probabilities = calculateProbabilities(this.rows, this.rows)[this.rows] || [];
    this.pegs = this.getPegPositions();
    this.drawBoard();
  }

  // Utility to simulate a drop and get the slot index and payout
  simulateDrop(rng) {
    const slotIndex = simulatePlinkoDrop({ rows: this.rows, rng });
    const payout = getPayout(this.risk, this.rows, slotIndex);
    return { slotIndex, payout };
  }
}
