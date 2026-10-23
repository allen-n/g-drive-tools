# Workspace Tools

A minimal [WXT](https://wxt.dev/) + TypeScript Chrome extension for small Google Workspace enhancements. Manifest V3, no UI framework, no Google Cloud project, and no OAuth setup.

The first tool opens the current Google Docs, Sheets, or Slides file's parent folder in a new tab. It also supports Office files opened in those editors, provided Google's Move control is available. Gmail features are not implemented yet.

## Develop and install

Use Node 22.12+ (the existing `.nvmrc` selects Node 22) and pnpm 10.12.3.

```sh
nvm use
pnpm install --frozen-lockfile
pnpm dev
```

WXT launches a development Chrome profile. For your normal signed-in Chrome profile:

1. Run `pnpm build`.
2. Open `chrome://extensions`, enable **Developer mode**, and choose **Load unpacked**.
3. Select `.output/chrome-mv3` in this repo.
4. Pin **Workspace Tools** in Chrome's extensions menu.

Reload the extension after rebuilding. `pnpm zip` creates a distributable ZIP under `.output/`.

## Open parent folder

Open a file in Docs, Sheets, or Slides, then click the extension's toolbar button or press **Alt+Shift+P** (Option+Shift+P on Mac). Customize the binding at `chrome://extensions/shortcuts`; Chrome or your OS may already reserve it.

The tool opens Google's Move picker, reads the **Open folder in new tab** link beside **Current location**, opens that URL using Chrome, and clicks **Cancel** to dismiss the picker. It never clicks Move or selects a new destination. The new tab uses Google's own link, preserving its account routing when present.

A `!` badge indicates failure; hover over the toolbar button for the reason. Close any existing dialog before trying again. If no current-folder link appears within 15 seconds, the operation stops. On failure the picker may remain open for inspection; close it with Cancel.

## Permissions and privacy

- `activeTab`: access the editor when you click the button or use the shortcut.
- `scripting`: automate the editor and read the picker in its iframe.
- `https://drive.google.com/*`: read the cross-origin Drive picker embedded in the editor. Chrome host permissions apply to the whole origin.

No persistent Docs/Gmail permission, cookies permission, background scraping, storage, analytics, or external API calls. The extension runs only on explicit invocation and retains no document metadata. Your existing Google session handles access to the picker.

## Checks

```sh
pnpm test
pnpm typecheck
pnpm build
```

Tests cover sanitized markup from both supplied HAR recordings (a Google Doc and an Excel file in Sheets), URL validation, delayed picker rendering, timeout handling, and duplicate clicks. HARs are private debugging inputs and are ignored by Git.

Manual smoke check in signed-in Chrome: open a Doc and a Sheet, invoke each via the toolbar and shortcut, and verify the correct folder opens and the file stays in place. Also check a second Google account, a shared-drive file, a root-level file, and a file whose parent you cannot access. Repeat invocations should open one tab per completed action. An unrelated page should show a helpful error.

## Limits and structure

English Google interface required. Google can change its DOM, and read-only files or inaccessible parents may not expose the required controls. Docs and Sheets have recorded fixture coverage; Slides, multiple accounts, shared drives, and root-folder behavior need live verification.

- `wxt.config.ts`: manifest, permissions, shortcut.
- `entrypoints/background.ts`: toolbar action, polling, tab opening, error badge.
- `utils/parent-folder.ts`: editor/folder validation and self-contained injected DOM functions.
- `tests/`: UI fixtures and behavior checks.

Add future tools as small feature modules and WXT entrypoints as needed. Expand permissions only for functionality that exists.

## Icon

The original plum, cream, and peach tray/arrow mark is independent of Google's branding. Its editable source is `assets/icon.svg`; `public/icon-*.png` contains exports at 16, 24, 32, 48, 64, 96, and 128 pixels. WXT discovers these files for the manifest; toolbar sizes are also declared explicitly. No icon-generation dependency is required.
