// Speed Reader Content Script
class SpeedReader {
  constructor() {
    this.isActive = false;
    this.words = [];
    this.currentWordIndex = 0;
    this.speed = 300; // Words per minute (default)
    this.interval = null;
    this.overlay = null;
    this.wordDisplay = null;
    this.settings = {
      speed: 300,
      fontSize: 24,
      fontColor: '#000000',
      backgroundColor: '#ffffff',
      centerColor: '#ff0000'
    };
    
    this.init();
  }

  init() {
    // Listen for messages from popup
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'startSpeedReading') {
        this.startSpeedReading();
        sendResponse({success: true});
      } else if (request.action === 'stopSpeedReading') {
        this.stopSpeedReading();
        sendResponse({success: true});
      } else if (request.action === 'updateSettings') {
        this.updateSettings(request.settings);
        sendResponse({success: true});
      } else if (request.action === 'getSettings') {
        sendResponse({settings: this.settings});
      }
    });
  }

  extractText() {
    // Remove script and style elements
    const scripts = document.querySelectorAll('script, style, nav, header, footer, aside');
    scripts.forEach(el => el.style.display = 'none');
    
    // Get all text content
    const bodyText = document.body.innerText || document.body.textContent || '';
    
    // Clean up the text
    const cleanText = bodyText
      .replace(/\s+/g, ' ')
      .replace(/\n/g, ' ')
      .trim();
    
    // Split into words
    this.words = cleanText.split(/\s+/).filter(word => word.length > 0);
    
    return this.words.length;
  }

  createOverlay() {
    // Remove existing overlay if it exists
    if (this.overlay) {
      this.overlay.remove();
    }

    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.id = 'speed-reader-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: ${this.settings.backgroundColor};
      z-index: 999999;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: Arial, sans-serif;
    `;

    // Create word display
    this.wordDisplay = document.createElement('div');
    this.wordDisplay.id = 'speed-reader-word';
    this.wordDisplay.style.cssText = `
      font-size: ${this.settings.fontSize}px;
      color: ${this.settings.fontColor};
      text-align: center;
      line-height: 1.2;
      max-width: 80%;
      word-wrap: break-word;
    `;

    // Create center focus point
    const centerPoint = document.createElement('div');
    centerPoint.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 4px;
      height: 4px;
      background-color: ${this.settings.centerColor};
      border-radius: 50%;
      z-index: 1;
    `;

    this.overlay.appendChild(this.wordDisplay);
    this.overlay.appendChild(centerPoint);
    document.body.appendChild(this.overlay);

    // Add click to stop functionality
    this.overlay.addEventListener('click', () => {
      this.stopSpeedReading();
    });
  }

  startSpeedReading() {
    if (this.isActive) return;

    const wordCount = this.extractText();
    if (wordCount === 0) {
      alert('No text found on this page to speed read.');
      return;
    }

    this.isActive = true;
    this.currentWordIndex = 0;
    this.createOverlay();

    // Calculate interval based on words per minute
    const intervalMs = (60 * 1000) / this.settings.speed;

    this.interval = setInterval(() => {
      if (this.currentWordIndex < this.words.length) {
        this.displayWord(this.words[this.currentWordIndex]);
        this.currentWordIndex++;
      } else {
        this.stopSpeedReading();
      }
    }, intervalMs);
  }

  displayWord(word) {
    if (this.wordDisplay) {
      // Find the optimal reading point (usually around 1/3 from the left)
      const optimalPoint = Math.max(1, Math.floor(word.length * 0.3));
      const beforePoint = word.substring(0, optimalPoint);
      const atPoint = word.substring(optimalPoint, optimalPoint + 1);
      const afterPoint = word.substring(optimalPoint + 1);

      this.wordDisplay.innerHTML = `
        <span style="color: #666;">${beforePoint}</span>
        <span style="color: ${this.settings.centerColor}; font-weight: bold;">${atPoint}</span>
        <span style="color: #666;">${afterPoint}</span>
      `;
    }
  }

  stopSpeedReading() {
    this.isActive = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
      this.wordDisplay = null;
    }
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    if (this.isActive && this.overlay) {
      // Update overlay styles if active
      this.overlay.style.backgroundColor = this.settings.backgroundColor;
      this.wordDisplay.style.fontSize = this.settings.fontSize + 'px';
      this.wordDisplay.style.color = this.settings.fontColor;
    }
  }
}

// Initialize speed reader when content script loads
const speedReader = new SpeedReader();
