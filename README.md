# Speed Reader Firefox Extension

A Firefox web browser extension that allows you to "speed read" by using rapid presentation of text one word at a time, similar to Spritz Technology.

## Features

- **Rapid Text Presentation**: Displays text one word at a time at customizable speeds
- **Adjustable Reading Speed**: Control reading speed from 100 to 1000 words per minute
- **Customizable Appearance**: Adjust font size, colors, and focus point
- **Easy Controls**: Simple popup interface with intuitive controls
- **Click to Stop**: Click anywhere on the reading screen to stop
- **Settings Persistence**: Your preferences are saved automatically

## Installation

### Method 1: Load as Temporary Extension (Recommended for Testing)

1. Open Firefox
2. Navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Navigate to the extension folder and select `manifest.json`
6. The extension will be loaded and ready to use

### Method 2: Package and Install

1. Zip the entire extension folder
2. Rename the `.zip` file to `.xpi`
3. Open Firefox and go to `about:addons`
4. Click the gear icon and select "Install Add-on From File"
5. Select your `.xpi` file

## Usage

1. **Start Speed Reading**: Click the Speed Reader extension icon in your toolbar
2. **Adjust Settings**: Use the popup to adjust reading speed, font size, and colors
3. **Begin Reading**: Click "Start Speed Reading" to begin
4. **Stop Reading**: Click anywhere on the reading screen to stop

## Settings

- **Reading Speed**: 100-1000 words per minute (default: 300 WPM)
- **Font Size**: 16-48px (default: 24px)
- **Text Color**: Customize the text color
- **Background Color**: Customize the background color
- **Focus Color**: Color of the focus point (default: red)

## How It Works

The extension extracts all text content from the current webpage, removes navigation elements and scripts, then presents the text one word at a time with a focus point to guide your eye. The focus point is positioned at the optimal reading position (typically 1/3 from the beginning of each word).

## Technical Details

- **Manifest Version**: 2 (Firefox compatible)
- **Permissions**: activeTab, storage
- **Content Scripts**: Injected into all web pages
- **Storage**: Settings are saved locally using browser.storage.local

## Files Structure

```
speed-reader-extension/
├── manifest.json          # Extension manifest
├── popup.html             # Extension popup interface
├── popup.js               # Popup functionality
├── content.js             # Content script for speed reading
├── content.css            # Content script styles
├── background.js          # Background script
├── icons/                 # Extension icons
└── README.md              # This file
```

## Browser Compatibility

- Firefox 57+ (WebExtensions API)
- Tested on Firefox 90+

## Development

To modify the extension:

1. Edit the source files
2. Reload the extension in `about:debugging`
3. Test your changes

## License

This extension is provided as-is for educational and personal use.
