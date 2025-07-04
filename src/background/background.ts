// Background service worker for Screen Capture Extension
// TODO: Add error handling and logging
// TODO: Implement retry logic for failed operations
import 'mv3-hot-reload/background';
console.log('[DEV] mv3-hot-reload/background imported');

import { DEFAULT_SETTINGS } from '@/shared/settings';

interface CaptureMessage {
  action: 'captureScreen';
}

interface CaptureAreaMessage {
  action: 'captureArea';
  data: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface WindowMessage {
  action: 'openWindow';
  data?: {
    imageData?: string;
  };
}

interface StorageMessage {
  action: 'getStorage' | 'setStorage';
  key?: string;
  value?: unknown;
}

interface OpenSidebarMessage {
  action: 'openSidebar';
}

type ExtensionMessage =
  | CaptureMessage
  | CaptureAreaMessage
  | WindowMessage
  | StorageMessage
  | OpenSidebarMessage;

interface ResponseData {
  success: boolean;
  error?: string;
  imageData?: string;
  windowId?: number;
  data?: unknown;
}

// if (import.meta.env.MODE === 'development') {
//   import('mv3-hot-reload/background').then(() => {
//     console.log('[DEV] mv3-hot-reload/background imported');
//   });
// }

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const msg = message as ExtensionMessage;
  console.log('Background received message:', msg);

  switch (msg.action) {
    case 'captureScreen':
      handleScreenCapture(sender, sendResponse);
      return true; // Keep message channel open for async response

    case 'captureArea':
      handleAreaCapture(msg, sendResponse);
      return true;

    case 'openWindow':
      handleOpenWindow(msg, sendResponse);
      return true;

    case 'getStorage':
      handleGetStorage(msg, sendResponse);
      return true;

    case 'setStorage':
      handleSetStorage(msg, sendResponse);
      return true;

    case 'openSidebar':
      handleOpenSidebar(sendResponse);
      return true;

    default:
      if ('action' in msg) {
        console.warn('Unknown message action:', (msg as ExtensionMessage).action);
      } else {
        console.warn('Unknown message:', msg);
      }
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Handle screen capture
async function handleScreenCapture(
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: ResponseData) => void
) {
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.id) {
      throw new Error('No active tab found');
    }

    // Capture the visible area of the tab
    const imageDataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: 'png',
      quality: 100,
    });

    sendResponse({ success: true, imageData: imageDataUrl });
  } catch (error) {
    console.error('Screen capture failed:', error);
    sendResponse({ success: false, error: (error as Error).message });
  }
}

// Handle area capture
async function handleAreaCapture(
  message: CaptureAreaMessage,
  sendResponse: (response: ResponseData) => void
) {
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.id) {
      throw new Error('No active tab found');
    }

    // Delegate area capture to content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'captureArea',
      data: message.data,
    });

    if (response && response.success) {
      sendResponse({ success: true, imageData: response.imageData });
    } else {
      throw new Error(response?.error || 'Area capture failed');
    }
  } catch (error) {
    console.error('Area capture failed:', error);
    sendResponse({ success: false, error: (error as Error).message });
  }
}

// Handle opening the editor window
async function handleOpenWindow(
  message: WindowMessage,
  sendResponse: (response: ResponseData) => void
) {
  try {
    // Always create a new window for annotation
    const window = await chrome.windows.create({
      url: chrome.runtime.getURL('window.html'), // temp, will update below
      type: 'popup',
      width: 1200,
      height: 800,
      left: 100,
      top: 100,
    });

    if (!window.id) throw new Error('Failed to create annotation window');

    // Store image data with window-specific key
    if (message.data?.imageData) {
      await chrome.storage.local.set({
        [`window_${window.id}_imageData`]: message.data.imageData,
      });
    }

    // Update the window's tab to include the windowId in the URL
    const windowId = window.id;
    const tabId = window.tabs && window.tabs[0]?.id;
    if (tabId) {
      const urlWithId = `${chrome.runtime.getURL('window.html')}?windowId=${windowId}`;
      await chrome.tabs.update(tabId, { url: urlWithId });
    }

    sendResponse({ success: true, windowId });
  } catch (error) {
    console.error('Failed to open window:', error);
    sendResponse({ success: false, error: (error as Error).message });
  }
}

// Handle storage operations
async function handleGetStorage(
  message: StorageMessage,
  sendResponse: (response: ResponseData) => void
) {
  try {
    if (!message.key) {
      throw new Error('Storage key is required');
    }

    const result = await chrome.storage.sync.get(message.key);
    sendResponse({ success: true, data: result[message.key] });
  } catch (error) {
    console.error('Get storage failed:', error);
    sendResponse({ success: false, error: (error as Error).message });
  }
}

async function handleSetStorage(
  message: StorageMessage,
  sendResponse: (response: ResponseData) => void
) {
  try {
    if (!message.key || message.value === undefined) {
      throw new Error('Storage key and value are required');
    }

    await chrome.storage.sync.set({ [message.key]: message.value });
    sendResponse({ success: true });
  } catch (error) {
    console.error('Set storage failed:', error);
    sendResponse({ success: false, error: (error as Error).message });
  }
}

async function handleOpenSidebar(sendResponse: (response: ResponseData) => void) {
  try {
    console.log('Background script: handleOpenSidebar called');

    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.id) {
      throw new Error('No active tab found');
    }

    console.log('Background script: Found active tab:', tab.id);

    // Send message to content script to open sidebar
    chrome.tabs.sendMessage(tab.id, { action: 'openSidebar' }, async (response) => {
      console.log('Background script: Content script response:', response);
      if (chrome.runtime.lastError) {
        console.log('Background script: Content script not found, injecting...');
        // If the content script is not injected, inject it
        await chrome.scripting.executeScript({
          target: { tabId: tab.id! },
          files: ['content.js'],
        });
        // Try sending the message again
        chrome.tabs.sendMessage(tab.id!, { action: 'openSidebar' }, (retryResponse) => {
          console.log('Background script: Retry response:', retryResponse);
        });
      }
    });

    sendResponse({ success: true });
  } catch (error) {
    console.error('Failed to open sidebar:', error);
    sendResponse({ success: false, error: (error as Error).message });
  }
}

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason);

  // Set default settings as an object only if not already present
  chrome.storage.sync.get('settings', (result) => {
    if (!result.settings) {
      chrome.storage.sync.set({
        settings: DEFAULT_SETTINGS,
      });
    }
  });
});

// Handle window close to clean up storage
chrome.windows.onRemoved.addListener(async (windowId) => {
  try {
    // Clean up any temporary data for this window
    await chrome.storage.local.remove(`window_${windowId!}_imageData`);
  } catch (error) {
    console.error('Failed to clean up window data:', error);
  }
});

// Listen for extension button click to open the sidebar panel
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  // Try to send the message first
  chrome.tabs.sendMessage(tab.id!, { action: 'openSidebar' }, async () => {
    if (chrome.runtime.lastError) {
      // If the content script is not injected, inject it
      await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        files: ['content.js'],
      });
      // Try sending the message again
      chrome.tabs.sendMessage(tab.id!, { action: 'openSidebar' });
    }
  });
});

// Export functions for use in other modules
export const captureScreen = handleScreenCapture;
export const openWindow = handleOpenWindow;
