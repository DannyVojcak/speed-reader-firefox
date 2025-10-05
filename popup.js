// Speed Reader Popup Script
class PopupController {
  constructor() {
    this.isActive = false;
    this.settings = {
      speed: 300,
      fontSize: 24,
      fontColor: '#000000',
      backgroundColor: '#ffffff',
      centerColor: '#ff0000'
    };
    
    this.init();
  }

  async init() {
    // Load saved settings
    await this.loadSettings();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Update UI with current settings
    this.updateUI();
    
    // Check if speed reading is currently active
    await this.checkActiveStatus();
  }

  async loadSettings() {
    try {
      const result = await browser.storage.local.get(['speedReaderSettings']);
      if (result.speedReaderSettings) {
        this.settings = { ...this.settings, ...result.speedReaderSettings };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async saveSettings() {
    try {
      await browser.storage.local.set({ speedReaderSettings: this.settings });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  setupEventListeners() {
    // Toggle button
    document.getElementById('toggleButton').addEventListener('click', () => {
      this.toggleSpeedReading();
    });

    // Speed control
    const speedSlider = document.getElementById('speed');
    const speedValue = document.getElementById('speedValue');
    
    speedSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      speedValue.value = value;
      this.settings.speed = value;
      this.saveSettings();
      this.updateContentScript();
    });
    
    speedValue.addEventListener('input', (e) => {
      const value = Math.max(100, Math.min(1000, parseInt(e.target.value) || 300));
      speedSlider.value = value;
      speedValue.value = value;
      this.settings.speed = value;
      this.saveSettings();
      this.updateContentScript();
    });

    // Font size control
    const fontSizeSlider = document.getElementById('fontSize');
    const fontSizeValue = document.getElementById('fontSizeValue');
    
    fontSizeSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      fontSizeValue.value = value;
      this.settings.fontSize = value;
      this.saveSettings();
      this.updateContentScript();
    });
    
    fontSizeValue.addEventListener('input', (e) => {
      const value = Math.max(16, Math.min(48, parseInt(e.target.value) || 24));
      fontSizeSlider.value = value;
      fontSizeValue.value = value;
      this.settings.fontSize = value;
      this.saveSettings();
      this.updateContentScript();
    });

    // Color controls
    document.getElementById('fontColor').addEventListener('change', (e) => {
      this.settings.fontColor = e.target.value;
      this.saveSettings();
      this.updateContentScript();
    });

    document.getElementById('backgroundColor').addEventListener('change', (e) => {
      this.settings.backgroundColor = e.target.value;
      this.saveSettings();
      this.updateContentScript();
    });

    document.getElementById('centerColor').addEventListener('change', (e) => {
      this.settings.centerColor = e.target.value;
      this.saveSettings();
      this.updateContentScript();
    });
  }

  updateUI() {
    // Update sliders and inputs
    document.getElementById('speed').value = this.settings.speed;
    document.getElementById('speedValue').value = this.settings.speed;
    document.getElementById('fontSize').value = this.settings.fontSize;
    document.getElementById('fontSizeValue').value = this.settings.fontSize;
    document.getElementById('fontColor').value = this.settings.fontColor;
    document.getElementById('backgroundColor').value = this.settings.backgroundColor;
    document.getElementById('centerColor').value = this.settings.centerColor;
  }

  async checkActiveStatus() {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      const response = await browser.tabs.sendMessage(tab.id, { action: 'getActiveStatus' });
      if (response && response.isActive) {
        this.setActiveState(true);
      }
    } catch (error) {
      // Content script might not be loaded yet, that's okay
      console.log('Could not check active status:', error);
    }
  }

  async toggleSpeedReading() {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      
      if (this.isActive) {
        // Stop speed reading
        await browser.tabs.sendMessage(tab.id, { action: 'stopSpeedReading' });
        this.setActiveState(false);
      } else {
        // Start speed reading
        await browser.tabs.sendMessage(tab.id, { 
          action: 'startSpeedReading',
          settings: this.settings
        });
        this.setActiveState(true);
      }
    } catch (error) {
      console.error('Error toggling speed reading:', error);
      document.getElementById('status').textContent = 'Error: Could not start speed reading. Please refresh the page and try again.';
    }
  }

  setActiveState(active) {
    this.isActive = active;
    const button = document.getElementById('toggleButton');
    const status = document.getElementById('status');
    
    if (active) {
      button.textContent = 'Stop Speed Reading';
      button.classList.add('active');
      status.textContent = 'Speed reading is active. Click anywhere on the reading screen to stop.';
    } else {
      button.textContent = 'Start Speed Reading';
      button.classList.remove('active');
      status.textContent = 'Click the button to start speed reading this page';
    }
  }

  async updateContentScript() {
    if (this.isActive) {
      try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        await browser.tabs.sendMessage(tab.id, { 
          action: 'updateSettings',
          settings: this.settings
        });
      } catch (error) {
        console.error('Error updating content script:', error);
      }
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
