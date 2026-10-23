import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  action: {
    onClicked: { addListener: vi.fn() },
    setBadgeText: vi.fn().mockResolvedValue(undefined),
    setBadgeBackgroundColor: vi.fn().mockResolvedValue(undefined),
    setTitle: vi.fn().mockResolvedValue(undefined),
  },
  scripting: { executeScript: vi.fn() },
  tabs: { create: vi.fn().mockResolvedValue(undefined) },
}));
vi.mock('wxt/browser', () => ({ browser: api }));
import background from '../entrypoints/background';

let click: (tab: { id: number; url: string }) => Promise<void>;
const tab = { id: 1, url: 'https://docs.google.com/document/d/example/edit' };

beforeEach(() => {
  vi.clearAllMocks();
  api.scripting.executeScript.mockReset();
  background.main();
  click = api.action.onClicked.addListener.mock.calls[0]![0];
});
afterEach(() => vi.useRealTimers());

it('opens a delayed folder from the picker frame, ignoring unsafe destinations', async () => {
  vi.useFakeTimers();
  api.scripting.executeScript
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([{ frameId: 0, result: null }])
    .mockResolvedValueOnce([
      { frameId: 0, result: 'https://evil.example/drive/folders/wrong' },
      { frameId: 4, result: 'https://drive.google.com/drive/u/1/folders/parent' },
    ])
    .mockResolvedValueOnce([]);
  const pending = click(tab);
  await vi.runAllTimersAsync();
  await pending;
  expect(api.tabs.create).toHaveBeenCalledExactlyOnceWith({
    url: 'https://drive.google.com/drive/u/1/folders/parent', openerTabId: 1,
  });
  expect(api.action.setBadgeText).toHaveBeenLastCalledWith({ tabId: 1, text: '' });
});

it('does not run on an unrelated page', async () => {
  await click({ ...tab, url: 'https://mail.google.com/' });
  expect(api.scripting.executeScript).not.toHaveBeenCalled();
  expect(api.tabs.create).not.toHaveBeenCalled();
  expect(api.action.setTitle).toHaveBeenCalledWith(expect.objectContaining({ title: expect.stringContaining('Open a Google') }));
});

it('times out safely without opening a tab and allows another attempt', async () => {
  vi.useFakeTimers();
  api.scripting.executeScript.mockResolvedValue([]);
  const pending = click(tab);
  await click(tab);
  await vi.runAllTimersAsync();
  await pending;
  expect(api.tabs.create).not.toHaveBeenCalled();
  expect(api.action.setTitle).toHaveBeenLastCalledWith(expect.objectContaining({ title: expect.stringContaining('No parent folder') }));
  api.scripting.executeScript.mockRejectedValueOnce(new Error('Move unavailable'));
  await click(tab);
  expect(api.action.setTitle).toHaveBeenLastCalledWith({ tabId: 1, title: 'Move unavailable' });
});
