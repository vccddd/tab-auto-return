# Tab Auto Return

A Chrome extension that automatically returns to a designated tab after a period of user inactivity, helping you stay focused on your work.

## Features

- Set any tab as your "home" target tab
- Configurable inactivity timeout (default: 60 seconds)
- Detects user activity: mouse movements, clicks, keyboard input, scrolling, and touch events
- Automatically switches back to the target tab when you're idle
- Works across all browser windows

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder

## Usage

1. Click the extension icon in your browser toolbar
2. Navigate to the tab you want to set as your target
3. Click "Set Current Tab as Target"
4. Adjust the timeout duration if needed
5. Toggle the switch to enable auto-return

When enabled, if you switch to another tab and remain inactive for the configured duration, the extension will automatically switch you back to the target tab.

## Permissions

| Permission | Purpose |
|------------|---------|
| `tabs` | Detect tab switches, monitor tab closures, and switch to target tab |
| `storage` | Save user preferences (enabled state, target tab, timeout duration) |
| `activeTab` | Access current tab information for setting as target |
| `alarms` | Reliable timer for inactivity detection (required for MV3 Service Workers) |
| `<all_urls>` | Detect user activity on all web pages |

## License

MIT License
