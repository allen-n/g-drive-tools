# Parent folder tool

Approved scope: WXT, TypeScript, Chrome Manifest V3; toolbar button and Alt+Shift+P open the active Docs/Sheets/Slides file's current folder in a new tab. Automate the existing interface, with no Google Cloud or OAuth setup. Work on the current branch.

1. Scaffold WXT config, background entrypoint, npm scripts and strict TypeScript.
2. Test UI helpers against sanitized picker links from both supplied HARs, missing/unsafe links, supported editor URLs, and asynchronous rendering.
3. Open the editor's Move dialog; poll permitted frames for the current-location link. Validate it again in the background before creating a tab. Never click Move, folder rows, or unrelated links. Report unavailable folders and timeouts through the toolbar badge/title.
4. Document installation, shortcut configuration, narrow permissions, English UI limitation and manual smoke checks. Run tests, typecheck, production build and zip.

Files: wxt.config.ts, entrypoints/background.ts, utils/parent-folder.ts, tests/parent-folder.test.ts, tests/fixtures/*.html, README.md, AGENTS.md, package.json/lock, tsconfig.json, .gitignore.

Review focus: cross-origin picker iframe; delayed rendering; wrong tab/page; missing or malicious destination; repeated invocations. HARs remain outside the repo; fixtures retain only the relevant markup with invented names and IDs.
