// Background service worker for Screen Capture Extension
// TODO: Add error handling and logging
// TODO: Implement retry logic for failed operations

interface CaptureMessage {
  action: 'captureScreen';
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

type ExtensionMessage = CaptureMessage | WindowMessage | StorageMessage;

interface ResponseData {
  success: boolean;
  error?: string;
  imageData?: string;
  windowId?: number;
  data?: unknown;
}

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const msg = message as ExtensionMessage;
  console.log('Background received message:', msg);

  switch (msg.action) {
    case 'captureScreen':
      handleScreenCapture(sender, sendResponse);
      return true; // Keep message channel open for async response

    case 'openWindow':
      handleOpenWindow(msg, sendResponse);
      return true;

    case 'getStorage':
      handleGetStorage(msg, sendResponse);
      return true;

    case 'setStorage':
      handleSetStorage(msg, sendResponse);
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

// Handle opening the editor window
async function handleOpenWindow(
  message: WindowMessage,
  sendResponse: (response: ResponseData) => void
) {
  try {
    // Check if window already exists
    const existingWindows = await chrome.windows.getAll({ windowTypes: ['popup'] });
    const existingWindow = existingWindows.find((window) =>
      window.tabs?.some((tab) => tab.url?.includes('window.html'))
    );

    if (existingWindow) {
      // Focus existing window
      await chrome.windows.update(existingWindow.id!, { focused: true });
      sendResponse({ success: true, windowId: existingWindow.id });
      return;
    }

    // Create new window
    const window = await chrome.windows.create({
      url: chrome.runtime.getURL('window.html'),
      type: 'popup',
      width: 1200,
      height: 800,
      left: 100,
      top: 100,
    });

    // Send image data to window if provided
    if (message.data?.imageData && window.id) {
      // Store image data temporarily for the window to access
      await chrome.storage.local.set({
        [`window_${window.id}_imageData`]: message.data.imageData,
      });
    }

    sendResponse({ success: true, windowId: window.id });
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

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason);

  // Set default settings as a JSON string
  chrome.storage.sync.set({
    settings: JSON.stringify({
      autoSave: false,
      backgroundType: 'gradient',
      theme: 'light',
      quality: 'high',
      format: 'png',
    }),
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
