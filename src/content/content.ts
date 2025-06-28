// Content script for Screen Capture Extension
// TODO: Add element highlighting and selection
// TODO: Implement element snapping functionality
// TODO: Add keyboard shortcuts for capture

import './content.css';
import { mountSidebar, unmountSidebar } from '../sidebar/sidebar';

console.log('Screen Capture Extension content script loaded');

// Interface for element selection
interface ElementSelection {
  element: HTMLElement;
  rect: DOMRect;
  selector: string;
}

// Message interface
interface ContentScriptMessage {
  action:
    | 'startElementSelection'
    | 'stopElementSelection'
    | 'captureElement'
    | 'getElementInfo'
    | 'openSidebar'
    | 'closeSidebar'
    | 'startAreaSelection'
    | 'getScrollInfo';
  [key: string]: unknown;
}

// State management
let isSelecting = false;
let selectedElement: ElementSelection | null = null;
let highlightElement: HTMLElement | null = null;
let isAreaSelecting = false;
let areaStart: { x: number; y: number } | null = null;
let areaOverlay: HTMLDivElement | null = null;

// Sidebar injection logic
const SIDEBAR_PIN_KEY = 'sc_sidebar_pinned';

function injectSidebar() {
  mountSidebar();
}

function removeSidebar() {
  unmountSidebar();
}

// Listen for messages from popup and background
chrome.runtime.onMessage.addListener(
  (
    message: ContentScriptMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void
  ) => {
    console.log('Content script received message:', message);

    switch (message.action) {
      case 'startElementSelection': {
        startElementSelection(sendResponse);
        break;
      }

      case 'stopElementSelection': {
        stopElementSelection();
        sendResponse({ success: true });
        break;
      }

      case 'captureElement': {
        captureSelectedElement().then(sendResponse);
        return true; // Keep message channel open for async response
      }

      case 'getElementInfo': {
        const info = getElementInfo();
        sendResponse({ success: true, data: info });
        break;
      }

      case 'openSidebar': {
        injectSidebar();
        sendResponse({ success: true });
        break;
      }

      case 'closeSidebar': {
        removeSidebar();
        sendResponse({ success: true });
        break;
      }

      case 'startAreaSelection': {
        startAreaSelection(sendResponse);
        return true;
      }

      case 'getScrollInfo': {
        // Provide scroll position and viewport information for area capture
        const scrollInfo = {
          scrollX: window.pageXOffset || document.documentElement.scrollLeft,
          scrollY: window.pageYOffset || document.documentElement.scrollTop,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          pageWidth: document.documentElement.scrollWidth,
          pageHeight: document.documentElement.scrollHeight,
        };
        sendResponse({ success: true, ...scrollInfo });
        break;
      }

      default:
        console.warn('Unknown message action:', message.action);
        sendResponse({ success: false, error: 'Unknown action' });
    }
  }
);

// Auto-inject if pinned
if (localStorage.getItem(SIDEBAR_PIN_KEY) === 'true') {
  injectSidebar();
}

// Start element selection mode
function startElementSelection(sendResponse: (response?: unknown) => void) {
  if (isSelecting) return;
  isSelecting = true;
  document.body.style.cursor = 'crosshair';

  function onMouseOver(event: MouseEvent): void {
    if (!isSelecting) return;
    const target = event.target as HTMLElement;
    if (!target || target === document.body) return;
    if (highlightElement) highlightElement.remove();
    highlightElement = document.createElement('div');
    highlightElement.style.position = 'fixed';
    highlightElement.style.border = '2px solid #3b82f6';
    highlightElement.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
    highlightElement.style.pointerEvents = 'none';
    highlightElement.style.zIndex = '999999';
    highlightElement.style.transition = 'all 0.2s ease';
    const rect = target.getBoundingClientRect();
    highlightElement.style.left = `${rect.left}px`;
    highlightElement.style.top = `${rect.top}px`;
    highlightElement.style.width = `${rect.width}px`;
    highlightElement.style.height = `${rect.height}px`;
    document.body.appendChild(highlightElement);
  }

  async function onClick(event: MouseEvent): Promise<void> {
    if (!isSelecting) return;
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    if (!target || target === document.body) return;
    const rect = target.getBoundingClientRect();
    if (highlightElement) highlightElement.remove();
    isSelecting = false;
    document.body.style.cursor = '';
    document.removeEventListener('mouseover', onMouseOver);
    document.removeEventListener('click', onClick, true);
    // Capture screenshot of the visible tab
    chrome.runtime.sendMessage({ action: 'captureScreen' }, async (response) => {
      if (response?.success && response.imageData) {
        // Crop the image to the element's bounding box
        const cropped = await cropImage(
          response.imageData,
          rect.left,
          rect.top,
          rect.width,
          rect.height
        );
        sendResponse({ success: true, imageData: cropped });
      } else {
        sendResponse({ success: false });
      }
    });
  }

  document.addEventListener('mouseover', onMouseOver);
  document.addEventListener('click', onClick, true);
}

// Stop element selection mode
function stopElementSelection(): void {
  if (!isSelecting) return;

  isSelecting = false;
  document.body.style.cursor = '';

  // Remove event listeners
  document.removeEventListener('mouseover', handleMouseOver);
  document.removeEventListener('click', handleElementClick);
  document.removeEventListener('keydown', handleKeyDown);

  // Remove highlight
  if (highlightElement) {
    highlightElement.remove();
    highlightElement = null;
  }

  console.log('Element selection mode deactivated');
}

// Handle mouse over events for element highlighting
function handleMouseOver(event: MouseEvent): void {
  if (!isSelecting) return;

  const target = event.target as HTMLElement;
  if (!target || target === document.body) return;

  // Remove previous highlight
  if (highlightElement) {
    highlightElement.remove();
  }

  // Create highlight element
  highlightElement = document.createElement('div');
  highlightElement.style.position = 'fixed';
  highlightElement.style.border = '2px solid #3b82f6';
  highlightElement.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
  highlightElement.style.pointerEvents = 'none';
  highlightElement.style.zIndex = '999999';
  highlightElement.style.transition = 'all 0.2s ease';

  // Position highlight
  const rect = target.getBoundingClientRect();
  highlightElement.style.left = `${rect.left}px`;
  highlightElement.style.top = `${rect.top}px`;
  highlightElement.style.width = `${rect.width}px`;
  highlightElement.style.height = `${rect.height}px`;

  document.body.appendChild(highlightElement);
}

// Handle element click for selection
function handleElementClick(event: MouseEvent): void {
  if (!isSelecting) return;

  event.preventDefault();
  event.stopPropagation();

  const target = event.target as HTMLElement;
  if (!target || target === document.body) return;

  // Create element selection
  selectedElement = {
    element: target,
    rect: target.getBoundingClientRect(),
    selector: generateSelector(target),
  };

  console.log('Element selected:', selectedElement);

  // Stop selection mode
  stopElementSelection();

  // Notify background script
  chrome.runtime.sendMessage({
    action: 'elementSelected',
    data: {
      selector: selectedElement.selector,
      rect: {
        x: selectedElement.rect.x,
        y: selectedElement.rect.y,
        width: selectedElement.rect.width,
        height: selectedElement.rect.height,
      },
    },
  });
}

// Handle keyboard shortcuts
function handleKeyDown(event: KeyboardEvent): void {
  if (!isSelecting) return;

  if (event.key === 'Escape') {
    stopElementSelection();
  }
}

// Generate CSS selector for element
function generateSelector(element: HTMLElement): string {
  if (element.id) {
    return `#${element.id}`;
  }

  if (element.className) {
    const classes = element.className.split(' ').filter((c) => c.trim());
    if (classes.length > 0) {
      return `.${classes.join('.')}`;
    }
  }

  // Generate path-based selector
  const path: string[] = [];
  let current = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector = `#${current.id}`;
      path.unshift(selector);
      break;
    }

    if (current.className) {
      const classes = current.className.split(' ').filter((c) => c.trim());
      if (classes.length > 0) {
        selector += `.${classes.join('.')}`;
      }
    }

    const siblings = Array.from(current.parentNode?.children || []);
    const index = siblings.indexOf(current) + 1;
    if (siblings.length > 1) {
      selector += `:nth-child(${index})`;
    }

    path.unshift(selector);
    current = current.parentNode as HTMLElement;
  }

  return path.join(' > ');
}

// Capture selected element
async function captureSelectedElement(): Promise<{
  success: boolean;
  imageData?: string;
  error?: string;
}> {
  try {
    if (!selectedElement) {
      throw new Error('No element selected');
    }

    // Use html2canvas to capture the element
    const html2canvas = await import('html2canvas');
    const canvas = await html2canvas.default(selectedElement.element, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    const imageData = canvas.toDataURL('image/png');

    return { success: true, imageData };
  } catch (error) {
    console.error('Failed to capture element:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Get information about selected element
function getElementInfo(): {
  selector: string;
  rect: DOMRect;
  tagName: string;
  className: string;
} | null {
  if (!selectedElement) {
    return null;
  }

  return {
    selector: selectedElement.selector,
    rect: selectedElement.rect,
    tagName: selectedElement.element.tagName,
    className: selectedElement.element.className,
  };
}

function startAreaSelection(sendResponse: (response?: unknown) => void) {
  if (isAreaSelecting) return;
  isAreaSelecting = true;
  areaStart = null;

  areaOverlay = document.createElement('div');
  areaOverlay.style.position = 'fixed';
  areaOverlay.style.zIndex = '999999';
  areaOverlay.style.pointerEvents = 'none';
  areaOverlay.style.border = '2px dashed #3b82f6';
  areaOverlay.style.background = 'rgba(59,130,246,0.1)';
  document.body.appendChild(areaOverlay);

  function onMouseDown(e: MouseEvent) {
    areaStart = { x: e.clientX, y: e.clientY };
    areaOverlay!.style.left = `${e.clientX}px`;
    areaOverlay!.style.top = `${e.clientY}px`;
    areaOverlay!.style.width = '0px';
    areaOverlay!.style.height = '0px';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function onMouseMove(e: MouseEvent) {
    if (!areaStart) return;
    const x = Math.min(areaStart.x, e.clientX);
    const y = Math.min(areaStart.y, e.clientY);
    const w = Math.abs(areaStart.x - e.clientX);
    const h = Math.abs(areaStart.y - e.clientY);
    areaOverlay!.style.left = `${x}px`;
    areaOverlay!.style.top = `${y}px`;
    areaOverlay!.style.width = `${w}px`;
    areaOverlay!.style.height = `${h}px`;
  }

  async function onMouseUp(e: MouseEvent) {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    if (!areaStart) return;
    const x = Math.min(areaStart.x, e.clientX);
    const y = Math.min(areaStart.y, e.clientY);
    const w = Math.abs(areaStart.x - e.clientX);
    const h = Math.abs(areaStart.y - e.clientY);
    areaOverlay?.remove();
    areaOverlay = null;
    isAreaSelecting = false;
    // Capture screenshot of the visible tab
    chrome.runtime.sendMessage({ action: 'captureScreen' }, async (response) => {
      if (response?.success && response.imageData) {
        // Crop the image to the selected area
        const cropped = await cropImage(response.imageData, x, y, w, h);
        sendResponse({ success: true, imageData: cropped });
      } else {
        sendResponse({ success: false });
      }
    });
  }

  document.addEventListener('mousedown', onMouseDown, { once: true });
}

async function cropImage(
  dataUrl: string,
  x: number,
  y: number,
  w: number,
  h: number
): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}

// Export functions for testing
export {
  startElementSelection,
  stopElementSelection,
  captureSelectedElement,
  getElementInfo,
  generateSelector,
};
