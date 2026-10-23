import { defineConfig } from 'wxt';

export default defineConfig({
  manifestVersion: 3,
  manifest: {
    name: 'Workspace Tools',
    permissions: ['activeTab', 'scripting'],
    // Drive hosts the cross-origin folder picker embedded by Docs/Sheets/Slides.
    host_permissions: ['https://drive.google.com/*'],
    action: { default_title: 'Open parent folder' },
    commands: {
      _execute_action: {
        suggested_key: { default: 'Alt+Shift+P' },
      },
    },
  },
});
