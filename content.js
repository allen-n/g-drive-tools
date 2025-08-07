(function() {
  'use strict';

  const INJECTED_CLASS = 'dql-injected';
  const ICON_CLASS = 'dql-copy-icon';
  
  let observer = null;
  let isProcessing = false;

  const copyIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
  </svg>`;

  function extractFileId(element) {
    const dataId = element.getAttribute('data-id');
    if (dataId) return dataId;
    
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) {
      const match = ariaLabel.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match) return match[1];
    }
    
    return null;
  }

  function buildUrl(fileId, element) {
    const isFolder = element.classList.contains('folder') || 
                    element.querySelector('[aria-label*="folder"]') ||
                    element.querySelector('[data-tooltip*="folder"]');
    
    if (isFolder) {
      return `https://drive.google.com/drive/folders/${fileId}`;
    } else {
      return `https://drive.google.com/file/d/${fileId}/view`;
    }
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(60, 64, 67, 0.9);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-family: "Google Sans", Roboto, Arial, sans-serif;
      z-index: 10000;
      animation: fadeInOut 1.5s ease-in-out;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
        20%, 80% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 1500);
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      let success = false;
      try {
        success = document.execCommand('copy');
      } catch (e) {
        console.error('Fallback copy failed:', e);
      }
      
      document.body.removeChild(textarea);
      return success;
    }
  }

  function createCopyIcon(url) {
    const iconElement = document.createElement('span');
    iconElement.className = ICON_CLASS;
    iconElement.innerHTML = copyIcon;
    iconElement.setAttribute('aria-label', 'Copy link');
    iconElement.setAttribute('role', 'button');
    iconElement.setAttribute('tabindex', '0');
    
    iconElement.style.cssText = `
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      cursor: pointer;
      opacity: 0.54;
      color: var(--gm-color-primary, #1a73e8);
      transition: opacity 0.2s ease;
      z-index: 1;
    `;
    
    iconElement.addEventListener('mouseenter', () => {
      iconElement.style.opacity = '1';
    });
    
    iconElement.addEventListener('mouseleave', () => {
      iconElement.style.opacity = '0.54';
    });
    
    iconElement.addEventListener('click', async (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      iconElement.style.opacity = '0.3';
      
      const success = await copyToClipboard(url);
      if (success) {
        showToast('Link copied');
      } else {
        showToast('Copy failed');
      }
      
      setTimeout(() => {
        iconElement.style.opacity = '0.54';
      }, 200);
    });
    
    iconElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        iconElement.click();
      }
    });
    
    return iconElement;
  }

  function injectIcons() {
    if (isProcessing) return;
    isProcessing = true;

    const startTime = performance.now();
    
    const listViewRows = document.querySelectorAll('.a-s-T:not(.dql-injected)');
    const gridViewTiles = document.querySelectorAll('.aQG:not(.dql-injected)');
    
    const allElements = [...listViewRows, ...gridViewTiles];
    
    allElements.forEach(element => {
      const fileId = extractFileId(element);
      if (!fileId) return;
      
      const url = buildUrl(fileId, element);
      if (!url) return;
      
      element.style.position = 'relative';
      
      const copyIconElement = createCopyIcon(url);
      element.appendChild(copyIconElement);
      element.classList.add(INJECTED_CLASS);
    });
    
    const endTime = performance.now();
    if (endTime - startTime > 1) {
      console.warn(`Drive Quick Link: Icon injection took ${endTime - startTime}ms`);
    }
    
    isProcessing = false;
  }

  function observeDOM() {
    if (observer) {
      observer.disconnect();
    }
    
    observer = new MutationObserver((mutations) => {
      let shouldInject = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldInject = true;
        }
      });
      
      if (shouldInject) {
        setTimeout(injectIcons, 100);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function init() {
    if (window.location.hostname !== 'drive.google.com') {
      return;
    }
    
    injectIcons();
    observeDOM();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();