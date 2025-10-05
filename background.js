// Speed Reader Background Script
class BackgroundController {
  constructor() {
    this.init();
  }

  init() {
    // Handle extension installation
    browser.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        console.log('Speed Reader extension installed');
        this.setDefaultSettings();
      }
    });

    // Handle messages from content scripts and popup
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Handle tab updates to inject content script if needed
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.ensureContentScriptInjected(tabId);
      }
    });
  }

  async setDefaultSettings() {
    const defaultSettings = {
      speed: 300,
      fontSize: 24,
      fontColor: '#000000',
      backgroundColor: '#ffffff',
      centerColor: '#ff0000'
    };

    try {
      await browser.storage.local.set({ speedReaderSettings: defaultSettings });
    } catch (error) {
      console.error('Error setting default settings:', error);
    }
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'getSettings':
          const settings = await this.getSettings();
          sendResponse({ settings });
          break;

        case 'saveSettings':
          await this.saveSettings(request.settings);
          sendResponse({ success: true });
          break;

        case 'broadcastToAllTabs':
          await this.broadcastToAllTabs(request.message);
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ error: error.message });
    }
  }

  async getSettings() {
    try {
      const result = await browser.storage.local.get(['speedReaderSettings']);
      return result.speedReaderSettings || {
        speed: 300,
        fontSize: 24,
        fontColor: '#000000',
        backgroundColor: '#ffffff',
        centerColor: '#ff0000'
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return null;
    }
  }

  async saveSettings(settings) {
    try {
      await browser.storage.local.set({ speedReaderSettings: settings });
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  async broadcastToAllTabs(message) {
    try {
      const tabs = await browser.tabs.query({});
      for (const tab of tabs) {
        try {
          await browser.tabs.sendMessage(tab.id, message);
        } catch (error) {
          // Tab might not have content script loaded, that's okay
          console.log(`Could not send message to tab ${tab.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error broadcasting to tabs:', error);
    }
  }

  async ensureContentScriptInjected(tabId) {
    try {
      // Check if content script is already injected
      await browser.tabs.sendMessage(tabId, { action: 'ping' });
    } catch (error) {
      // Content script not loaded, inject it
      try {
        await browser.tabs.executeScript(tabId, {
          file: 'content.js'
        });
        await browser.tabs.insertCSS(tabId, {
          file: 'content.css'
        });
      } catch (injectionError) {
        // Some pages (like chrome:// or about:) can't be injected
        console.log('Could not inject content script:', injectionError);
      }
    }
  }
}

// Initialize background controller
new BackgroundController();
