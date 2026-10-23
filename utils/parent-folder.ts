export function isEditorUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.origin === 'https://docs.google.com' &&
      /^\/(document|spreadsheets|presentation)\/(u\/\d+\/)?d\/[\w-]+(?:\/|$)/.test(url.pathname);
  } catch { return false; }
}

export function isFolderUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.origin === 'https://drive.google.com' && !url.username && !url.password &&
      /^\/drive\/(u\/\d+\/)?(folders\/[\w-]+|my-drive)\/?$/.test(url.pathname);
  } catch { return false; }
}

// Injected functions must not capture module variables.
export function openMoveDialog(): void {
  function isVisible(element: HTMLElement): boolean {
    for (let current: HTMLElement | null = element; current; current = current.parentElement) {
      const style = getComputedStyle(current);
      if (current.hidden || current.getAttribute('aria-hidden') === 'true' || style.display === 'none' || style.visibility === 'hidden') return false;
    }
    return true;
  }
  const visibleDialog = [...document.querySelectorAll<HTMLElement>('[role="dialog"]')]
    .some(isVisible);
  if (visibleDialog) throw new Error('Close the existing dialog and try again.');
  const button = document.querySelector<HTMLElement>(
    '#docs-titlebar-folder-button, [role="button"][aria-label="Move"], [role="button"][aria-label="Move to folder"]',
  );
  if (!button || button.matches(':disabled, [aria-disabled="true"]') || !isVisible(button)) {
    throw new Error('Move control unavailable. Wait for the editor to load; an English Google UI is required.');
  }
  button.click();
}

export function readParentFolder(): string | null {
  // shortcut: English accessible label from both HARs; add localized labels when needed.
  for (const link of document.querySelectorAll<HTMLAnchorElement>('[role="dialog"] a[aria-label="Open folder in new tab"]')) {
    let visible = true;
    for (let element: HTMLElement | null = link; element; element = element.parentElement) {
      const style = getComputedStyle(element);
      if (element.hidden || element.getAttribute('aria-hidden') === 'true' || style.display === 'none' || style.visibility === 'hidden') {
        visible = false;
        break;
      }
    }
    if (visible) return link.href;
  }
  return null;
}

export function closeMoveDialog(): void {
  const dialog = document.querySelector('[role="dialog"] a[aria-label="Open folder in new tab"]')?.closest('[role="dialog"]');
  const cancel = [...(dialog?.querySelectorAll<HTMLElement>('button, [role="button"]') ?? [])]
    .find((button) => button.textContent?.trim() === 'Cancel');
  cancel?.click();
}
