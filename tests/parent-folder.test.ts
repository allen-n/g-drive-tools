// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { isEditorUrl, isFolderUrl, openMoveDialog, readParentFolder } from '../utils/parent-folder';

afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks(); });

describe('supported editor URLs', () => {
  it.each(['document', 'spreadsheets', 'presentation'])('accepts %s editor and account paths', (app) => {
    expect(isEditorUrl(`https://docs.google.com/${app}/d/example/edit`)).toBe(true);
    expect(isEditorUrl(`https://docs.google.com/${app}/u/1/d/example/edit`)).toBe(true);
  });
  it.each([undefined, 'garbage', 'https://docs.google.com/document/', 'https://evil.example/document/d/id/edit', 'http://docs.google.com/document/d/id/edit', 'https://docs.google.com/forms/d/id/edit'])('rejects %s', (url) => {
    expect(isEditorUrl(url)).toBe(false);
  });
});

describe('folder destinations', () => {
  it.each(['https://drive.google.com/drive/folders/example', 'https://drive.google.com/drive/u/1/folders/example?usp=sharing', 'https://drive.google.com/drive/u/2/my-drive'])('accepts %s', (url) => {
    expect(isFolderUrl(url)).toBe(true);
  });
  it.each(['javascript:alert(1)', 'https://drive.google.com.evil.test/drive/folders/id', 'https://evil.test/', 'https://drive.google.com/drive/trash', 'https://user:pass@drive.google.com/drive/folders/id'])('rejects %s', (url) => {
    expect(isFolderUrl(url)).toBe(false);
  });
});

describe('picker UI', () => {
  it.each(['docs', 'sheets'])('reads only the current-location link from the %s fixture', (app) => {
    document.body.innerHTML = readFileSync(`tests/fixtures/${app}-picker.html`, 'utf8');
    expect(readParentFolder()).toBe(`https://drive.google.com/drive/folders/example-${app}-parent`);
  });
  it('ignores other links and hidden dialogs', () => {
    document.body.innerHTML = '<a href="https://drive.google.com/drive/folders/wrong">Folder</a><div role="dialog" style="display:none"><a aria-label="Open folder in new tab" href="https://drive.google.com/drive/folders/stale"></a></div>';
    expect(readParentFolder()).toBeNull();
  });
  it('returns null until the picker renders', () => {
    expect(readParentFolder()).toBeNull();
    document.body.innerHTML = '<div role="dialog"><a aria-label="Open folder in new tab" href="https://drive.google.com/drive/folders/ready"></a></div>';
    expect(readParentFolder()).toContain('/ready');
  });
  it('clicks the editor folder button without clicking Move confirmation', () => {
    document.body.innerHTML = '<button id="docs-titlebar-folder-button">Move</button><div role="dialog"><button>Move</button></div>';
    const titleButton = document.querySelector<HTMLButtonElement>('#docs-titlebar-folder-button')!;
    const confirm = vi.spyOn(document.querySelector<HTMLButtonElement>('[role="dialog"] button')!, 'click');
    const click = vi.spyOn(titleButton, 'click');
    // Existing dialogs must be left alone rather than toggled or confirmed.
    expect(openMoveDialog()).toEqual({ ok: false, error: 'Close the existing dialog and try again.' });
    document.querySelector('[role="dialog"]')!.remove();
    expect(openMoveDialog()).toEqual({ ok: true });
    expect(click).toHaveBeenCalledOnce();
    expect(confirm).not.toHaveBeenCalled();
  });
  it('reports missing or disabled controls', () => {
    expect(openMoveDialog()).toMatchObject({ ok: false, error: expect.stringContaining('Move control unavailable') });
    document.body.innerHTML = '<button id="docs-titlebar-folder-button" disabled>Move</button>';
    expect(openMoveDialog()).toMatchObject({ ok: false, error: expect.stringContaining('Move control unavailable') });
  });
});

it('closes only the current-location dialog using Cancel', async () => {
  const { closeMoveDialog } = await import('../utils/parent-folder');
  document.body.innerHTML = '<div role="dialog"><a aria-label="Open folder in new tab"></a><button>Move</button><button>Cancel</button></div>';
  const buttons = document.querySelectorAll('button');
  const move = vi.spyOn(buttons[0]!, 'click');
  const cancel = vi.spyOn(buttons[1]!, 'click');
  closeMoveDialog();
  expect(cancel).toHaveBeenCalledOnce();
  expect(move).not.toHaveBeenCalled();
});

it('ignores dialogs hidden by an ancestor', () => {
  document.body.innerHTML = '<div style="display:none"><div role="dialog">Old dialog</div></div><button id="docs-titlebar-folder-button">Move</button>';
  const click = vi.spyOn(document.querySelector<HTMLButtonElement>('button')!, 'click');
  expect(openMoveDialog()).toEqual({ ok: true });
  expect(click).toHaveBeenCalledOnce();
});

it('opens a mouse-driven toolbar control before reading the parent folder', () => {
  document.body.innerHTML = '<div id="docs-titlebar-folder-button" role="button" tabindex="0">Move</div>';
  const button = document.querySelector<HTMLElement>('[role="button"]')!;
  let pressed = false;
  // Closure controls activate on mouse down and perform their action on mouse up.
  button.addEventListener('mousedown', (event) => { pressed = event.button === 0; });
  button.addEventListener('mouseup', () => {
    if (!pressed) return;
    document.body.insertAdjacentHTML('beforeend', '<div role="dialog"><a aria-label="Open folder in new tab" href="https://drive.google.com/drive/folders/parent"></a><button>Move</button></div>');
    pressed = false;
  });
  openMoveDialog();
  expect(readParentFolder()).toBe('https://drive.google.com/drive/folders/parent');
});
