import * as PIXI from 'pixi.js';

export class PlinkoRenderer {
  constructor(canvas, width, height) {
    this.app = new PIXI.Application({
      view: canvas,
      width,
      height,
      backgroundColor: 0x1E2024,
      antialias: true
    });
    
    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);
    
    this.textures = {};
    this.sprites = {};
    this.textSprites = {};
  }
  
  loadTextures() {
    // Load all required textures
    return new Promise((resolve) => {
      PIXI.Loader.shared
        .add('pin', '/assets/plinko/pin.07d34b2f.png')
        .add('target', '/assets/plinko/target.f3e8ae2a.png')
        .add('ball', '/assets/plinko/ball.png')
        .load((loader, resources) => {
          this.textures.pin = resources.pin.texture;
          this.textures.target = resources.target.texture;
          this.textures.ball = resources.ball.texture;
          resolve();
        });
    });
  }
  
  createBucketSprites(buckets, payouts) {
    buckets.forEach((bucket, i) => {
      // Create target sprite
      const sprite = new PIXI.Sprite(this.textures.target);
      sprite.anchor.set(0.5);
      sprite.width = bucket.width;
      sprite.height = bucket.height;
      sprite.position.set(bucket.position.x, bucket.position.y);
      this.container.addChild(sprite);
      this.sprites[`bucket_${i}`] = sprite;
      
      // Create multiplier text
      const multiplier = payouts[i] || 1;
      const text = new PIXI.Text(multiplier.toFixed(2) + 'x', {
        fontFamily: 'Arial',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 'white',
        align: 'center'
      });
      
      text.anchor.set(0.5);
      text.position.set(bucket.position.x, bucket.position.y - bucket.height / 2 - 10);
      this.container.addChild(text);
      this.textSprites[`bucket_text_${i}`] = text;
    });
  }
  
  // Update the renderer based on physics engine state
  update(engine) {
    const bodies = engine.world.bodies;
    
    bodies.forEach(body => {
      if (body.label === 'ball') {
        // Update ball sprite
        const sprite = this.sprites[`ball_${body.id}`] || this.createBallSprite(body);
        sprite.position.set(body.position.x, body.position.y);
        sprite.rotation = body.angle;
      }
    });
  }
  
  createBallSprite(body) {
    const sprite = new PIXI.Sprite(this.textures.ball);
    sprite.anchor.set(0.5);
    sprite.width = body.circleRadius * 2;
    sprite.height = body.circleRadius * 2;
    sprite.position.set(body.position.x, body.position.y);
    this.container.addChild(sprite);
    this.sprites[`ball_${body.id}`] = sprite;
    return sprite;
  }
  
  // Clean up resources
  destroy() {
    this.app.destroy(true);
  }
}