import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';
import { closeMoveDialog, isEditorUrl, isFolderUrl, openMoveDialog, readParentFolder } from '../utils/parent-folder';

export default defineBackground(() => {
  const running = new Set<number>();

  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id === undefined || running.has(tab.id)) return;
    const tabId = tab.id;
    running.add(tabId);
    try {
      await browser.action.setBadgeText({ tabId, text: '…' });
      if (!isEditorUrl(tab.url)) throw new Error('Open a Google Docs, Sheets, or Slides file first.');
      await browser.scripting.executeScript({ target: { tabId }, func: openMoveDialog });
      const deadline = Date.now() + 15_000;
      while (Date.now() < deadline) {
        const results = await browser.scripting.executeScript({
          target: { tabId, allFrames: true },
          func: readParentFolder,
        });
        const folder = results.find(({ result }) => typeof result === 'string' && isFolderUrl(result));
        if (folder && typeof folder.result === 'string') {
          await browser.tabs.create({ url: folder.result, openerTabId: tabId });
          // Closing is best effort: the parent tab has already opened successfully.
          await browser.scripting.executeScript({
            target: { tabId, frameIds: [folder.frameId] }, func: closeMoveDialog,
          }).catch(() => {});
          await browser.action.setBadgeText({ tabId, text: '' });
          await browser.action.setTitle({ tabId, title: 'Open parent folder' });
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      throw new Error('No parent folder found. The picker may be unavailable or Google’s interface may have changed.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not open the parent folder.';
      // The source tab may have been closed while the picker was loading.
      await Promise.all([
        browser.action.setBadgeBackgroundColor({ tabId, color: '#b3261e' }),
        browser.action.setBadgeText({ tabId, text: '!' }),
        browser.action.setTitle({ tabId, title: message }),
      ]).catch(() => {});
    } finally {
      running.delete(tabId);
    }
  });
});
