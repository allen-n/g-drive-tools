# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome Manifest V3 extension called "Drive Quick Link" that adds one-click copying of shareable links for Google Drive files and folders. The extension injects copy icons into Google Drive's web interface and uses the Clipboard API to copy URLs to the user's clipboard.

## Commands

```bash
# Build extension package for distribution
npm run build

# Run validation (minimal test)
npm run test

# Manual testing: Load unpacked extension in Chrome
# 1. Navigate to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" and select this directory
```

## Architecture

### Core Components

- **manifest.json**: Manifest V3 configuration with minimal permissions (`clipboardWrite`, `https://drive.google.com/*`)
- **content.js**: Main content script that runs on Google Drive pages
- **icons/**: Extension icons in multiple sizes (16px, 32px, 48px)

### Content Script Architecture

The extension uses a single content script with the following key patterns:

**DOM Injection Strategy**:
- Targets `.a-s-T` selectors for list view rows and `.aQG` for grid view tiles
- Uses `data-id` attributes and `aria-label` fallbacks to extract Google Drive file/folder IDs
- Adds `dql-injected` class to prevent duplicate icon injection
- Performance requirement: <1ms per element injection

**URL Construction**:
- Files: `https://drive.google.com/file/d/{FILE_ID}/view`
- Folders: `https://drive.google.com/drive/folders/{FOLDER_ID}`
- Folder detection via DOM class/attribute inspection

**Observer Pattern**:
- Uses `MutationObserver` to watch for new DOM elements (lazy-loaded content, search results)
- Disconnects observer during processing to prevent performance issues
- Debounces injection with 100ms delay

**Clipboard Handling**:
- Primary: `navigator.clipboard.writeText()` (requires `clipboardWrite` permission)
- Fallback: Creates temporary `<textarea>` with `document.execCommand('copy')`
- Shows toast notification for user feedback (1.5s duration)

## Key Implementation Details

### File ID Extraction
The extension extracts Google Drive file/folder IDs using multiple strategies:
1. `data-id` attribute (primary)
2. Regex parsing of `aria-label` attributes (fallback)

### Performance Considerations  
- Icon injection is batched and timed
- Uses `isProcessing` flag to prevent concurrent injection runs
- MutationObserver is disconnected during DOM modifications

### Accessibility
- Icons have `aria-label="Copy link"` and `role="button"`
- Keyboard navigation support (Enter/Space keys)
- Toast notifications for screen reader feedback

## Development Notes

- Extension runs only on `https://drive.google.com/*` pages
- Uses Google Material Design copy icon SVG
- Integrates with Drive's CSS custom properties for theming
- No external dependencies or build tools required