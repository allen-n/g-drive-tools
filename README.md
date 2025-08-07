# Drive Quick Link

A Chrome extension that adds one-click copying of shareable links for Google Drive files and folders.

## Features

- 🔗 One-click link copying for any Google Drive item
- 📁 Support for both files and folders  
- 🎨 Seamless integration with Drive's UI (light/dark themes)
- 📱 Works in both list and grid view
- ♿ Accessible with keyboard navigation and screen reader support
- ⚡ Minimal permissions and lightweight performance

## Installation

### From Source
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension will now be active on Google Drive pages

### Build Package
```bash
npm run build
```
This creates `drive-quick-link.zip` ready for Chrome Web Store submission.

## Usage

1. Navigate to [Google Drive](https://drive.google.com)
2. Look for the small copy icon (📋) that appears on each file/folder row
3. Click the icon to instantly copy the shareable link to your clipboard
4. A toast notification confirms the link was copied
5. Paste the link anywhere you need to share it

## Permissions

This extension requests minimal permissions:
- `clipboardWrite` - To copy links to your clipboard
- `https://drive.google.com/*` - To run only on Google Drive pages

No data leaves your browser. No analytics or tracking.

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Compatibility**: Chrome 118+
- **Performance**: <1ms injection time per element
- **Accessibility**: Full ARIA support with screen reader announcements

## Development

The extension consists of:
- `manifest.json` - Extension configuration
- `content.js` - Main logic for DOM injection and clipboard operations
- `icons/` - Extension icons in multiple sizes

## Privacy

This extension:
- ✅ Works entirely offline after installation
- ✅ Makes no network requests
- ✅ Stores no user data
- ✅ Accesses only Google Drive pages you visit

## Support

For issues or feature requests, please file an issue in the project repository.

## License

MIT License - see LICENSE file for details.