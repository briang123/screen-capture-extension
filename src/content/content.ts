// Content script for Screen Capture Extension
// TODO: Add element highlighting and selection
// TODO: Implement element snapping functionality
// TODO: Add keyboard shortcuts for capture

console.log('Screen Capture Extension content script loaded');

// Interface for element selection
interface ElementSelection {
  element: HTMLElement;
  rect: DOMRect;
  selector: string;
}

// State management
let isSelecting = false;
let selectedElement: ElementSelection | null = null;
let highlightElement: HTMLElement | null = null;

// Listen for messages from popup and background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);

  switch (message.action) {
    case 'startElementSelection':
      startElementSelection();
      sendResponse({ success: true });
      break;

    case 'stopElementSelection':
      stopElementSelection();
      sendResponse({ success: true });
      break;

    case 'captureElement':
      captureSelectedElement().then(sendResponse);
      return true; // Keep message channel open for async response

    case 'getElementInfo':
      const info = getElementInfo();
      sendResponse({ success: true, data: info });
      break;

    default:
      console.warn('Unknown message action:', message.action);
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Start element selection mode
function startElementSelection(): void {
  if (isSelecting) return;

  isSelecting = true;
  document.body.style.cursor = 'crosshair';

  // Add event listeners
  document.addEventListener('mouseover', handleMouseOver);
  document.addEventListener('click', handleElementClick);
  document.addEventListener('keydown', handleKeyDown);

  console.log('Element selection mode activated');
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

// Export functions for testing
export {
  startElementSelection,
  stopElementSelection,
  captureSelectedElement,
  getElementInfo,
  generateSelector,
};
