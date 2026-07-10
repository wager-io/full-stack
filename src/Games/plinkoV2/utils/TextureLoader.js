/**
 * Utility class for loading and managing game textures
 */
class TextureLoader {
  constructor() {
    this.textures = {};
    this.loaded = false;
  }

  /**
   * Load all required textures
   * @returns {Promise} Promise that resolves when all textures are loaded
   */
  async loadTextures() {
    const textureMap = {
      ball: '/assets/plinko/ball.3981f8e7.png',
      pin: '/assets/plinko/pin.07d34b2f.png'
    };

    const promises = [];

    for (const [name, path] of Object.entries(textureMap)) {
      const image = new Image();
      image.src = path;
      this.textures[name] = image;
      
      promises.push(new Promise((resolve) => {
        image.onload = resolve;
      }));
    }

    await Promise.all(promises);
    this.loaded = true;
    return this.textures;
  }

  /**
   * Get a loaded texture by name
   * @param {string} name - Texture name
   * @returns {Image} The loaded image
   */
  getTexture(name) {
    if (!this.loaded) {
      throw new Error('Textures not loaded yet. Call loadTextures() first.');
    }
    
    if (!this.textures[name]) {
      throw new Error(`Texture "${name}" not found.`);
    }
    
    return this.textures[name];
  }
}

export default new TextureLoader();