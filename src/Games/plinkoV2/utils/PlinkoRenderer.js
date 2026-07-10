/**
 * Renderer for the Plinko board using canvas
 */
export default class PlinkoRenderer {
  constructor(canvas, width, height) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = width;
    this.height = height;
    this.textures = {};
    this.bucketSprites = [];
  }

  /**
   * Load all required textures
   * @returns {Promise} Promise that resolves when all textures are loaded
   */
  async loadTextures() {
    const textureUrls = {
      pin: '/assets/plinko/pin.07d34b2f.png',
      target: '/assets/plinko/target.f3e8ae2a.png',
      ball: '/assets/plinko/ball.png'
    };

    const loadTexture = (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = url;
      });
    };

    // Load all textures in parallel
    const texturePromises = Object.entries(textureUrls).map(
      async ([name, url]) => {
        this.textures[name] = await loadTexture(url);
        return { name, texture: this.textures[name] };
      }
    );

    return Promise.all(texturePromises);
  }

  /**
   * Create sprites for buckets with multiplier text
   * @param {Array} buckets - Array of bucket bodies
   * @param {Array} payouts - Array of payout values
   */
  createBucketSprites(buckets, payouts) {
    this.bucketSprites = buckets.map((bucket, index) => {
      const multiplier = payouts[index] || 1;
      return {
        bucket,
        multiplier
      };
    });
  }

  /**
   * Update the renderer based on physics engine state
   * @param {Object} engine - Matter.js engine
   */
  update(engine) {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw background
    this.ctx.fillStyle = '#1E2024';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    const bodies = engine.world.bodies;
    
    // Draw pegs
    bodies.forEach(body => {
      if (body.label === 'peg') {
        this.drawPeg(body);
      } else if (body.label === 'bucket') {
        this.drawBucket(body);
      } else if (body.label === 'divider') {
        this.drawDivider(body);
      } else if (body.label === 'ball') {
        this.drawBall(body);
      } else if (body.label === 'wall') {
        this.drawWall(body);
      }
    });
    
    // Draw multiplier values above buckets
    this.bucketSprites.forEach(({ bucket, multiplier }) => {
      this.drawMultiplier(bucket, multiplier);
    });
  }
  
  /**
   * Draw a peg
   * @param {Object} peg - Peg body
   */
  drawPeg(peg) {
    const { x, y } = peg.position;
    const radius = peg.circleRadius;
    
    if (this.textures.pin) {
      // Draw pin texture
      const size = radius * 2.5;
      this.ctx.drawImage(
        this.textures.pin,
        x - size / 2,
        y - size / 2,
        size,
        size
      );
    } else {
      // Fallback to circle
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = '#555';
      this.ctx.fill();
      this.ctx.strokeStyle = '#777';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
  }
  
  /**
   * Draw a bucket
   * @param {Object} bucket - Bucket body
   */
  drawBucket(bucket) {
    const { x, y } = bucket.position;
    const width = bucket.bounds.max.x - bucket.bounds.min.x;
    const height = bucket.bounds.max.y - bucket.bounds.min.y;
    
    if (this.textures.target) {
      // Draw target texture
      this.ctx.drawImage(
        this.textures.target,
        x - width / 2,
        y - height / 2,
        width,
        height
      );
    } else {
      // Fallback to rectangle
      this.ctx.fillStyle = bucket.render.fillStyle || '#555';
      this.ctx.fillRect(x - width / 2, y - height / 2, width, height);
      this.ctx.strokeStyle = bucket.render.strokeStyle || '#777';
      this.ctx.lineWidth = bucket.render.lineWidth || 1;
      this.ctx.strokeRect(x - width / 2, y - height / 2, width, height);
    }
  }
  
  /**
   * Draw a multiplier value above a bucket
   * @param {Object} bucket - Bucket body
   * @param {Number} multiplier - Multiplier value
   */
  drawMultiplier(bucket, multiplier) {
    const { x, y } = bucket.position;
    const height = bucket.bounds.max.y - bucket.bounds.min.y;
    
    this.ctx.font = 'bold 14px Arial';
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      multiplier.toFixed(2) + 'x',
      x,
      y - height / 2 - 10
    );
  }
  
  /**
   * Draw a divider
   * @param {Object} divider - Divider body
   */
  drawDivider(divider) {
    const { x, y } = divider.position;
    const width = divider.bounds.max.x - divider.bounds.min.x;
    const height = divider.bounds.max.y - divider.bounds.min.y;
    
    this.ctx.fillStyle = divider.render.fillStyle || '#444';
    this.ctx.fillRect(x - width / 2, y - height / 2, width, height);
  }
  
  /**
   * Draw a ball
   * @param {Object} ball - Ball body
   */
  drawBall(ball) {
    const { x, y } = ball.position;
    const radius = ball.circleRadius;
    
    if (this.textures.ball) {
      // Draw ball texture
      const size = radius * 2;
      this.ctx.drawImage(
        this.textures.ball,
        x - size / 2,
        y - size / 2,
        size,
        size
      );
    } else {
      // Fallback to circle
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = ball.render.fillStyle || '#fff';
      this.ctx.fill();
      this.ctx.strokeStyle = ball.render.strokeStyle || '#ddd';
      this.ctx.lineWidth = ball.render.lineWidth || 1;
      this.ctx.stroke();
    }
  }
  
  /**
   * Draw a wall
   * @param {Object} wall - Wall body
   */
  drawWall(wall) {
    const { x, y } = wall.position;
    const width = wall.bounds.max.x - wall.bounds.min.x;
    const height = wall.bounds.max.y - wall.bounds.min.y;
    
    this.ctx.fillStyle = wall.render.fillStyle || 'rgba(0,0,0,0)';
    this.ctx.fillRect(x - width / 2, y - height / 2, width, height);
  }
}