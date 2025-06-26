# Chrome Extension Recipes

## Screen Capture Extension

### Version: 1.0.0

**Last Updated:** 2024-01-15

---

## 1. Introduction

This cookbook provides common patterns, solutions, and best practices for Chrome extension development. Each recipe includes code examples, explanations, and troubleshooting tips.

### 1.1 How to Use This Guide

- **Copy and paste** code examples directly into your project
- **Modify** patterns to fit your specific use case
- **Combine** multiple recipes for complex functionality
- **Reference** troubleshooting sections when debugging

### 1.2 Prerequisites

- Basic knowledge of JavaScript/TypeScript
- Understanding of Chrome Extension APIs
- Familiarity with React and modern web development

---

## 2. Messaging Patterns

### 2.1 Popup to Background Communication

**Problem**: Send data from popup to background script

**Solution**:

```typescript
// In popup component
const sendMessageToBackground = async (data: any) => {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'performAction',
      data: data,
    });

    if (response.success) {
      console.log('Action completed:', response.result);
    } else {
      console.error('Action failed:', response.error);
    }
  } catch (error) {
    console.error('Message failed:', error);
  }
};

// Usage
sendMessageToBackground({ type: 'capture', area: 'visible' });
```

**Background Script Handler**:

```typescript
// In background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'performAction':
      handleAction(message.data)
        .then((result) => sendResponse({ success: true, result }))
        .catch((error) => sendResponse({ success: false, error: error.message }));
      return true; // Keep message channel open
  }
});

async function handleAction(data: any) {
  // Perform the action
  return { status: 'completed' };
}
```

### 2.2 Content Script to Background Communication

**Problem**: Send data from content script to background script

**Solution**:

```typescript
// In content script
const notifyBackground = async (event: string, data?: any) => {
  try {
    await chrome.runtime.sendMessage({
      action: 'contentScriptEvent',
      event: event,
      data: data,
    });
  } catch (error) {
    console.error('Failed to notify background:', error);
  }
};

// Usage
notifyBackground('elementSelected', { selector: '#button', rect: { x: 100, y: 200 } });
```

### 2.3 Cross-Window Communication

**Problem**: Communicate between popup and detached window

**Solution**:

```typescript
// In popup
const openWindow = async () => {
  const window = await chrome.windows.create({
    url: chrome.runtime.getURL('window.html'),
    type: 'popup',
    width: 1200,
    height: 800,
  });

  // Store window ID for communication
  chrome.storage.local.set({ currentWindowId: window.id });
};

// In detached window
const sendToPopup = async (data: any) => {
  const result = await chrome.storage.local.get(['currentWindowId']);
  if (result.currentWindowId) {
    // Send message to popup via background
    await chrome.runtime.sendMessage({
      action: 'windowToPopup',
      windowId: result.currentWindowId,
      data: data,
    });
  }
};
```

---

## 3. Storage Patterns

### 3.1 Settings Management

**Problem**: Store and retrieve user settings

**Solution**:

```typescript
// Settings interface
interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  quality: 'low' | 'medium' | 'high';
  autoSave: boolean;
  format: 'png' | 'jpg' | 'webp';
}

// Settings manager
class SettingsManager {
  private static instance: SettingsManager;
  private settings: UserSettings;

  private constructor() {
    this.settings = this.getDefaultSettings();
  }

  static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  async loadSettings(): Promise<UserSettings> {
    try {
      const result = await chrome.storage.sync.get(['settings']);
      this.settings = { ...this.getDefaultSettings(), ...result.settings };
      return this.settings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return this.getDefaultSettings();
    }
  }

  async saveSettings(settings: Partial<UserSettings>): Promise<void> {
    try {
      this.settings = { ...this.settings, ...settings };
      await chrome.storage.sync.set({ settings: this.settings });
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  getSettings(): UserSettings {
    return this.settings;
  }

  private getDefaultSettings(): UserSettings {
    return {
      theme: 'light',
      quality: 'high',
      autoSave: false,
      format: 'png',
    };
  }
}

// Usage
const settingsManager = SettingsManager.getInstance();
await settingsManager.loadSettings();
await settingsManager.saveSettings({ theme: 'dark' });
```

### 3.2 Data Caching

**Problem**: Cache frequently accessed data

**Solution**:

```typescript
// Cache manager
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 300000): void {
    // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  remove(key: string): void {
    this.cache.delete(key);
  }
}

// Usage
const cache = new CacheManager();
cache.set('userData', { name: 'John', id: 123 }, 60000); // 1 minute TTL
const userData = cache.get('userData');
```

---

## 4. UI Patterns

### 4.1 Modal Component

**Problem**: Create reusable modal dialogs

**Solution**:

```typescript
// Modal component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-4`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// Usage
const [isModalOpen, setIsModalOpen] = useState(false);

<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Settings"
  size="md"
>
  <p>Modal content goes here</p>
</Modal>
```

### 4.2 Toast Notifications

**Problem**: Show temporary notifications to users

**Solution**:

```typescript
// Toast manager
class ToastManager {
  private static instance: ToastManager;
  private toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info'; duration: number }> = [];
  private listeners: Array<(toasts: any[]) => void> = [];

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  show(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000): void {
    const id = Date.now().toString();
    const toast = { id, message, type, duration };

    this.toasts.push(toast);
    this.notifyListeners();

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  remove(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  subscribe(listener: (toasts: any[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }
}

// Toast component
const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = ToastManager.getInstance().subscribe(setToasts);
    return unsubscribe;
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-white ${
            toast.type === 'success' ? 'bg-green-500' :
            toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};

// Usage
const toast = ToastManager.getInstance();
toast.show('Settings saved successfully!', 'success');
toast.show('An error occurred', 'error');
```

### 4.3 Loading States

**Problem**: Show loading states during async operations

**Solution**:

```typescript
// Loading hook
const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState<string | null>(null);

  const withLoading = async <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, withLoading };
};

// Loading component
const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
    </div>
  );
};

// Usage
const { isLoading, error, withLoading } = useLoading();

const handleSave = async () => {
  await withLoading(async () => {
    await saveSettings(settings);
  });
};

{isLoading && <LoadingSpinner />}
{error && <div className="text-red-500">{error}</div>}
```

---

## 5. Permission Patterns

### 5.1 Dynamic Permission Requests

**Problem**: Request permissions only when needed

**Solution**:

```typescript
// Permission manager
class PermissionManager {
  static async requestPermission(permission: string): Promise<boolean> {
    try {
      const result = await chrome.permissions.request({ permissions: [permission] });
      return result;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  static async hasPermission(permission: string): Promise<boolean> {
    try {
      const result = await chrome.permissions.contains({ permissions: [permission] });
      return result;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  static async getAllPermissions(): Promise<string[]> {
    try {
      const permissions = await chrome.permissions.getAll();
      return permissions.permissions || [];
    } catch (error) {
      console.error('Failed to get permissions:', error);
      return [];
    }
  }
}

// Usage
const handleCapture = async () => {
  if (!(await PermissionManager.hasPermission('activeTab'))) {
    const granted = await PermissionManager.requestPermission('activeTab');
    if (!granted) {
      alert('Permission required to capture screenshots');
      return;
    }
  }

  // Proceed with capture
  await captureScreen();
};
```

### 5.2 Optional Permissions

**Problem**: Handle optional permissions gracefully

**Solution**:

```typescript
// Optional permission handler
const withOptionalPermission = async <T>(
  permission: string,
  action: () => Promise<T>,
  fallback?: () => T
): Promise<T | null> => {
  try {
    if (await PermissionManager.hasPermission(permission)) {
      return await action();
    } else {
      const granted = await PermissionManager.requestPermission(permission);
      if (granted) {
        return await action();
      } else if (fallback) {
        return fallback();
      }
    }
  } catch (error) {
    console.error(`Action with permission ${permission} failed:`, error);
    if (fallback) {
      return fallback();
    }
  }

  return null;
};

// Usage
const handleDownload = async () => {
  await withOptionalPermission(
    'downloads',
    async () => {
      await chrome.downloads.download({ url: imageDataUrl, filename: 'screenshot.png' });
    },
    () => {
      // Fallback: open in new tab
      window.open(imageDataUrl, '_blank');
    }
  );
};
```

---

## 6. Error Handling Patterns

### 6.1 Global Error Handler

**Problem**: Handle errors consistently across the extension

**Solution**:

```typescript
// Error handler
class ErrorHandler {
  static handle(error: Error, context?: string): void {
    console.error(`Error in ${context || 'unknown context'}:`, error);

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logToService(error, context);
    }

    // Show user-friendly message
    this.showUserMessage(error);
  }

  static async wrapAsync<T>(asyncFn: () => Promise<T>, context?: string): Promise<T | null> {
    try {
      return await asyncFn();
    } catch (error) {
      this.handle(error instanceof Error ? error : new Error(String(error)), context);
      return null;
    }
  }

  private static showUserMessage(error: Error): void {
    const toast = ToastManager.getInstance();
    toast.show('An error occurred. Please try again.', 'error');
  }

  private static logToService(error: Error, context?: string): void {
    // Implement logging to external service
    console.log('Logging to service:', { error: error.message, context, stack: error.stack });
  }
}

// Usage
const result = await ErrorHandler.wrapAsync(async () => await captureScreen(), 'screen capture');
```

### 6.2 Retry Pattern

**Problem**: Retry failed operations with exponential backoff

**Solution**:

```typescript
// Retry utility
const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
};

// Usage
const result = await retry(async () => await chrome.tabs.captureVisibleTab(), 3, 1000);
```

---

## 7. Performance Patterns

### 7.1 Debounced Functions

**Problem**: Prevent excessive function calls

**Solution**:

```typescript
// Debounce utility
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Usage
const debouncedSave = debounce(async (settings: any) => {
  await saveSettings(settings);
}, 500);

// Call multiple times, but only executes once after 500ms
debouncedSave(settings);
debouncedSave(settings);
debouncedSave(settings);
```

### 7.2 Throttled Functions

**Problem**: Limit function execution rate

**Solution**:

```typescript
// Throttle utility
const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Usage
const throttledScroll = throttle(() => {
  console.log('Scrolled');
}, 100);

// Will only execute once every 100ms
window.addEventListener('scroll', throttledScroll);
```

---

## 8. Testing Patterns

### 8.1 Mock Chrome APIs

**Problem**: Test extension code without Chrome APIs

**Solution**:

```typescript
// Mock Chrome APIs for testing
const mockChrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
    },
  },
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn(),
    },
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
  tabs: {
    captureVisibleTab: jest.fn(),
    query: jest.fn(),
  },
  windows: {
    create: jest.fn(),
    update: jest.fn(),
  },
};

// Setup in test file
beforeEach(() => {
  global.chrome = mockChrome as any;
});

// Test example
test('should capture screen', async () => {
  mockChrome.tabs.captureVisibleTab.mockResolvedValue('data:image/png;base64,test');

  const result = await captureScreen();

  expect(result).toBe('data:image/png;base64,test');
  expect(mockChrome.tabs.captureVisibleTab).toHaveBeenCalled();
});
```

### 8.2 Component Testing

**Problem**: Test React components with Chrome extension context

**Solution**:

```typescript
// Test wrapper with Chrome context
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ChromeProvider>
      {children}
    </ChromeProvider>
  );
};

// Test example
test('should render popup', () => {
  render(
    <TestWrapper>
      <Popup />
    </TestWrapper>
  );

  expect(screen.getByText('Screen Capture')).toBeInTheDocument();
});
```

---

## 9. Debugging Patterns

### 9.1 Debug Logging

**Problem**: Debug extension issues in production

**Solution**:

```typescript
// Debug logger
class DebugLogger {
  private static isDebugMode = process.env.NODE_ENV === 'development';

  static log(message: string, data?: any): void {
    if (this.isDebugMode) {
      console.log(`[DEBUG] ${message}`, data);
    }
  }

  static error(message: string, error?: any): void {
    if (this.isDebugMode) {
      console.error(`[ERROR] ${message}`, error);
    }
  }

  static group(label: string, fn: () => void): void {
    if (this.isDebugMode) {
      console.group(label);
      fn();
      console.groupEnd();
    }
  }
}

// Usage
DebugLogger.group('Screen Capture', () => {
  DebugLogger.log('Starting capture');
  DebugLogger.log('Capture completed', { size: '1024x768' });
});
```

### 9.2 Performance Monitoring

**Problem**: Monitor extension performance

**Solution**:

```typescript
// Performance monitor
class PerformanceMonitor {
  private static marks = new Map<string, number>();

  static start(label: string): void {
    this.marks.set(label, performance.now());
  }

  static end(label: string): number {
    const startTime = this.marks.get(label);
    if (!startTime) {
      console.warn(`No start mark found for: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(label);

    if (process.env.NODE_ENV === 'development') {
      console.log(`${label}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }
}

// Usage
PerformanceMonitor.start('screen-capture');
await captureScreen();
PerformanceMonitor.end('screen-capture');
```

---

## 10. Security Patterns

### 10.1 Input Validation

**Problem**: Validate user inputs securely

**Solution**:

```typescript
// Input validator
class InputValidator {
  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static validateImageData(dataUrl: string): boolean {
    const pattern = /^data:image\/(png|jpeg|webp);base64,/;
    return pattern.test(dataUrl);
  }

  static sanitizeHtml(html: string): string {
    // Basic HTML sanitization
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  }

  static validateSettings(settings: any): boolean {
    const required = ['theme', 'quality', 'format'];
    return required.every((key) => key in settings);
  }
}

// Usage
if (!InputValidator.validateImageData(imageData)) {
  throw new Error('Invalid image data');
}
```

### 10.2 Content Security Policy

**Problem**: Implement proper CSP for extension

**Solution**:

```json
{
  "manifest_version": 3,
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; style-src 'self' 'unsafe-inline';"
  }
}
```

---

## 11. Troubleshooting

### 11.1 Common Issues

#### Extension Not Loading

```typescript
// Check manifest.json syntax
// Verify all required files exist
// Check Chrome extension page for errors
chrome.runtime.getManifest(); // Should not throw error
```

#### Message Passing Not Working

```typescript
// Ensure background script is registered
// Check message format
// Verify permissions
chrome.runtime.sendMessage({ action: 'test' }, (response) => {
  console.log('Response:', response);
});
```

#### Storage Not Persisting

```typescript
// Check storage quota
// Verify storage permissions
// Handle storage errors
chrome.storage.sync.get(null, (items) => {
  console.log('All storage items:', items);
});
```

### 11.2 Debug Checklist

- [ ] Check Chrome extension page for errors
- [ ] Verify manifest.json syntax
- [ ] Test message passing
- [ ] Check storage permissions
- [ ] Validate content scripts
- [ ] Test in incognito mode
- [ ] Check for conflicting extensions

---

## 12. Best Practices

### 12.1 Code Organization

- Separate concerns (UI, logic, storage)
- Use TypeScript for type safety
- Implement proper error handling
- Follow consistent naming conventions

### 12.2 Performance

- Minimize bundle size
- Use lazy loading for large components
- Implement proper caching
- Monitor memory usage

### 12.3 Security

- Validate all inputs
- Use minimal permissions
- Implement proper CSP
- Sanitize user data

### 12.4 User Experience

- Provide clear feedback
- Handle errors gracefully
- Implement loading states
- Follow accessibility guidelines

---

**Document Version:** 1.0.0  
**Last Updated:** 2024-01-15  
**Next Review:** 2024-02-15
