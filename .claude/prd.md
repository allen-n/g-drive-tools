Product Requirements Document (PRD)

Chrome Extension: “Drive Quick Link”
Author: Allen
Date: 2025-08-07
Status: Draft v1.0

⸻

1 — Goal

Provide a single-click way to copy the shareable URL for any file or folder inside Google Drive’s web UI. A small “copy-link” icon appears inline with every row; clicking it immediately writes the link to the user’s clipboard with no further dialogs or menus.

⸻

2 — Scope

2.1 In-Scope (MVP)
	•	Inject icon into each list-row and grid-tile on https://drive.google.com/*.
	•	Copy canonical viewer URL (https://drive.google.com/file/d/<FILE_ID>/view) or folder URL (https://drive.google.com/drive/folders/<FOLDER_ID>) to clipboard via the Clipboard API. Clipboard feedback should be silent or toast-style (“Link copied”).
	•	React to DOM changes so new rows (lazy-loaded, search results, etc.) also get icons.
	•	Support Manifest V3, service-worker background, and Google Drive’s dark/light themes.

2.2 Out of Scope (for now)
	•	Auto-setting file permissions (share-anyone).
	•	Bulk selection or multi-row copy.
	•	Options page, analytics, or i18n.

⸻

3 — User Stories

#	As a…	I want…	So that…	Acceptance Criteria
1	Drive power-user	to see a subtle copy-link icon on every item	I can grab links without right-clicking	Icon appears on hover and/or always if space permits; click copies URL; toast appears
2	Heavy keyboard user	to hit single click only (no context menu)	copying is frictionless	Copy occurs with one click and no extra UI from Drive
3	Security-aware admin	extension to request minimal permissions	auditing is simple	Manifest permissions limited to clipboardWrite and https://drive.google.com/* host permission


⸻

4 — Functional Requirements

4.1 Icon Injection
	•	Content script runs at document_idle on Drive pages.
	•	Use MutationObserver to watch .a-s-T rows (list view) and .aQG tiles (grid view); inject a <span class="dql-copy-icon"> with inline SVG of Google’s “link” symbol.
	•	Respect Drive’s CSS vars for color; hover state uses opacity 0.54→1.0.

4.2 Link Construction
	•	Each row has data-id attribute (aria-label fallback). Parse to extract File ID/Fold ID. (Drive keeps IDs stable even when renamed.  ￼)
	•	Build viewer URL for files; folders use folder URL.
	•	No Drive API calls → zero OAuth flow.

4.3 Clipboard Write
	•	navigator.clipboard.writeText(url) executed from content script (works in MV3 pages; no need for background). Requires "clipboardWrite" permission.  ￼

4.4 Visual Feedback
	•	After successful copy: show non-blocking toast (position: fixed; bottom: 24px;) for 1.5 s.
	•	ARIA live-region for screen-reader parity.

4.5 Performance
	•	Icon injection must not exceed 1 ms per element.
	•	Disconnect observer during DOM paint, reconnect after injection. (MutationObserver best practice).  ￼

⸻

5 — Non-Functional

Area	Requirement
Compatibility	Chrome 118+, Manifest V3 compliant
Security	No remote code, CSP-safe, minimal permissions
Privacy	No data leaves browser; no analytics in MVP
Accessibility	Icons have aria-label="Copy link"; toast announced via aria-live


⸻

6 — Technical Design Overview

6.1 Manifest (excerpt)

{
  "manifest_version": 3,
  "name": "Drive Quick Link",
  "version": "0.1",
  "description": "Copy Google Drive item links in one click.",
  "permissions": ["clipboardWrite"],
  "host_permissions": ["https://drive.google.com/*"],
  "content_scripts": [{
    "matches": ["https://drive.google.com/*"],
    "js": ["content.js"],
    "run_at": "document_idle"
  }],
  "icons": { "16": "icons/16.png", "32": "icons/32.png", "48": "icons/48.png" }
}

6.2 Content Script (content.js)
	1.	selectAllRows() → NodeList of relevant rows/tiles.
	2.	For each element without .dql-injected:
  a. Extract ID.
  b. Build URL.
  c. Append icon <span> with click handler:

icon.addEventListener('click', e => {
  e.stopPropagation();
  navigator.clipboard.writeText(url)
    .then(showToast)
    .catch(console.error);
});

	3.	observeDOM() with MutationObserver to call selectAllRows on childList events.

6.3 Clipboard Fallback

If clipboard API fails (edge cases), programmatically create <textarea> off-screen, select→document.execCommand('copy').

6.4 Styling
	•	Small (16 × 16) SVG matching Google Material Symbol “content_copy”.
	•	Default opacity = 0.54; hover = 1; active = 0.3.
	•	Place via position: absolute; right: 8px; top: 50%; transform: translateY(-50%);.

⸻

7 — Prompting Guidelines for Claude Code Autonomous Dev

System Prompt (example)
“You are Claude Code, a senior Chrome-extension engineer. Build ‘Drive Quick Link’ per attached PRD. Output a single drive-quick-link.zip containing: manifest.json, content.js, icons/, and README.md with install & usage notes. Validate Manifest V3. Self-test on the DOM of Google Drive list and grid views, ensuring <200 ms total runtime on first injection. When finished, print ‘BUILD_COMPLETE’ and no other text.”

Best-practice tips
	•	Break work into milestones: scaffolding, icon injection, clipboard logic, QA script.
	•	Add automated unit test using @web/test-runner.
	•	Use self-critique before final ZIP: check permissions, performance, accessibility.
	•	Provide npm run build if bundling.
	•	Keep console clean; guard against null IDs.

⸻

8 — Milestones & Timeline

Day	Deliverable
1	Project skeleton, manifest, icons
2	DOM injection & MutationObserver
3	Clipboard logic, toast UX
4	Edge-case handling, keyboard navigation, performance profiling
5	README, screencast GIF, CRX build & internal review


⸻

9 — Risks & Mitigations

Risk	Mitigation
Google Drive DOM changes	Encapsulate selectors; add fallback query; schedule weekly smoke test
Clipboard API blocked by permissions	Provide textarea fallback; surface error toast
Over-requesting permissions triggers Web Store review delays	Use only essential clipboardWrite & host scope


⸻

10 — Future Extensions (post-MVP)
	•	Bulk copy for multi-selection.
	•	Auto-set “Anyone with link can view” via Drive API (requires OAuth).
	•	Keyboard shortcut (e.g., L) to copy selected items.
	•	Options page to toggle toast duration or icon visibility.

⸻
