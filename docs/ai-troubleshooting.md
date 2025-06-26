# AI Troubleshooting Guide

## Screen Capture Extension

### Version: 1.0.0

**Last Updated:** 2024-01-15

---

## 1. Introduction

This troubleshooting guide provides solutions for common issues encountered during development, testing, and deployment of the Screen Capture Extension. Each issue includes symptoms, causes, and step-by-step solutions.

### 1.1 How to Use This Guide

1. **Identify the Issue**: Look for symptoms that match your problem
2. **Check Common Causes**: Review the likely causes
3. **Follow Solutions**: Apply the step-by-step solutions
4. **Verify Fix**: Test to ensure the issue is resolved
5. **Document**: Add new issues and solutions as they arise

---

## 2. Build and Development Issues

### 2.1 TypeScript Compilation Errors

#### Issue: Cannot find name 'chrome'

**Symptoms**: TypeScript errors about undefined 'chrome' namespace
**Error Message**: `Cannot find name 'chrome'`

**Causes**:

- Missing Chrome extension types
- Incorrect TypeScript configuration
- Missing type declarations

**Solutions**:

```bash
# Install Chrome extension types
npm install --save-dev @types/chrome

# Add to tsconfig.json
{
  "compilerOptions": {
    "types": ["chrome"]
  }
}
```

#### Issue: Module resolution errors

**Symptoms**: Cannot find module errors for internal imports
**Error Message**: `Cannot find module '@utils/storage'`

**Causes**:

- Incorrect path aliases configuration
- Missing Vite alias configuration
- TypeScript path mapping issues

**Solutions**:

```typescript
// vite.config.ts
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@components': resolve(__dirname, 'src/components'),
    },
  },
});

// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@utils/*": ["src/utils/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```

### 2.2 Vite Build Issues

#### Issue: Multiple entry points not working

**Symptoms**: Only one entry point builds correctly
**Error Message**: Build fails or missing files

**Causes**:

- Incorrect rollup configuration
- Missing entry point files
- Output configuration issues

**Solutions**:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        window: resolve(__dirname, 'src/window/window.html'),
        options: resolve(__dirname, 'src/options/options.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
        content: resolve(__dirname, 'src/content/content.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
});
```

#### Issue: CSS not processing correctly

**Symptoms**: Tailwind CSS not working, styles missing
**Error Message**: CSS compilation errors

**Causes**:

- Missing PostCSS configuration
- Incorrect Tailwind setup
- Build pipeline issues

**Solutions**:

```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

// tailwind.config.js
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./index.html",
  ],
  // ... rest of config
}
```

---

## 3. Chrome Extension Issues

### 3.1 Manifest V3 Issues

#### Issue: Service worker not loading

**Symptoms**: Background script not working, messages not received
**Error Message**: Service worker registration failed

**Causes**:

- Incorrect manifest configuration
- Service worker syntax errors
- Missing permissions

**Solutions**:

```json
// manifest.json
{
  "manifest_version": 3,
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "permissions": ["activeTab", "storage", "clipboardWrite", "downloads"]
}
```

#### Issue: Content script not injecting

**Symptoms**: Content script not running on pages
**Error Message**: Content script injection failed

**Causes**:

- Incorrect matches pattern
- Missing content script files
- Permission issues

**Solutions**:

```json
// manifest.json
{
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["content.css"]
    }
  ]
}
```

### 3.2 Message Passing Issues

#### Issue: Messages not received

**Symptoms**: Background script not responding to messages
**Error Message**: No response from background script

**Causes**:

- Incorrect message format
- Missing return true for async responses
- Service worker not active

**Solutions**:

```typescript
// background.ts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'captureScreen':
      handleScreenCapture(sender, sendResponse);
      return true; // Keep message channel open for async response
  }
});
```

#### Issue: Cross-origin messaging errors

**Symptoms**: Messages fail between different contexts
**Error Message**: Cross-origin messaging not allowed

**Causes**:

- Incorrect origin permissions
- Missing host permissions
- Security policy restrictions

**Solutions**:

```json
// manifest.json
{
  "host_permissions": ["<all_urls>"],
  "permissions": ["activeTab"]
}
```

---

## 4. UI and React Issues

### 4.1 React Component Issues

#### Issue: Components not rendering

**Symptoms**: Blank popup or window, no UI visible
**Error Message**: React rendering errors

**Causes**:

- Missing React imports
- Incorrect component structure
- Build configuration issues

**Solutions**:

```typescript
// popup.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import Popup from './Popup';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>
  );
}
```

#### Issue: State not updating

**Symptoms**: UI not reflecting state changes
**Error Message**: State updates not triggering re-renders

**Causes**:

- Incorrect state management
- Missing dependencies in useEffect
- State mutation instead of replacement

**Solutions**:

```typescript
// Correct state update
const [settings, setSettings] = useState({});

const updateSetting = (key: string, value: any) => {
  setSettings((prev) => ({ ...prev, [key]: value }));
};

// Correct useEffect
useEffect(() => {
  loadSettings();
}, []); // Empty dependency array for initial load
```

### 4.2 Styling Issues

#### Issue: Tailwind classes not working

**Symptoms**: CSS classes not applying, styles missing
**Error Message**: Tailwind compilation errors

**Causes**:

- Missing Tailwind imports
- Incorrect content paths
- Build configuration issues

**Solutions**:

```css
/* In your CSS file */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```javascript
// tailwind.config.js
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './index.html'],
  // ... rest of config
};
```

#### Issue: Dark mode not working

**Symptoms**: Theme switching not functional
**Error Message**: Dark mode classes not applying

**Causes**:

- Missing dark mode configuration
- Incorrect class application
- JavaScript theme switching issues

**Solutions**:

```javascript
// tailwind.config.js
export default {
  darkMode: 'class',
  // ... rest of config
};
```

```typescript
// Theme switching
const toggleTheme = () => {
  const isDark = document.documentElement.classList.contains('dark');
  document.documentElement.classList.toggle('dark', !isDark);
};
```

---

## 5. Storage and Data Issues

### 5.1 Chrome Storage Issues

#### Issue: Settings not saving

**Symptoms**: Settings not persisting between sessions
**Error Message**: Storage quota exceeded or permission denied

**Causes**:

- Storage quota exceeded
- Incorrect storage API usage
- Permission issues

**Solutions**:

```typescript
// Proper storage usage
const saveSettings = async (settings: any) => {
  try {
    await chrome.storage.sync.set({ settings });
  } catch (error) {
    console.error('Failed to save settings:', error);
    // Fallback to local storage
    await chrome.storage.local.set({ settings });
  }
};
```

#### Issue: Data not syncing

**Symptoms**: Settings not syncing across devices
**Error Message**: Sync storage not working

**Causes**:

- Using local storage instead of sync
- Chrome sync disabled
- Data size too large

**Solutions**:

```typescript
// Use sync storage for settings
await chrome.storage.sync.set({ settings });

// Use local storage for large data
await chrome.storage.local.set({ imageData });
```

### 5.2 Data Validation Issues

#### Issue: Invalid data causing errors

**Symptoms**: Extension crashes or behaves unexpectedly
**Error Message**: Data validation errors

**Causes**:

- Missing input validation
- Corrupted storage data
- Type mismatches

**Solutions**:

```typescript
// Data validation
const validateSettings = (settings: any): boolean => {
  const required = ['theme', 'quality', 'format'];
  return required.every((key) => key in settings);
};

const loadSettings = async () => {
  const result = await chrome.storage.sync.get(['settings']);
  if (result.settings && validateSettings(result.settings)) {
    return result.settings;
  }
  return getDefaultSettings();
};
```

---

## 6. Performance Issues

### 6.1 Memory Leaks

#### Issue: Extension using too much memory

**Symptoms**: Slow performance, browser crashes
**Error Message**: Memory usage warnings

**Causes**:

- Unclosed event listeners
- Large image data in memory
- Inefficient canvas operations

**Solutions**:

```typescript
// Clean up event listeners
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    // Handle message
  };

  window.addEventListener('message', handleMessage);

  return () => {
    window.removeEventListener('message', handleMessage);
  };
}, []);

// Clean up canvas
useEffect(() => {
  return () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
    }
  };
}, []);
```

### 6.2 Slow Rendering

#### Issue: UI lag or slow response

**Symptoms**: Slow popup opening, delayed interactions
**Error Message**: Performance warnings

**Causes**:

- Large bundle size
- Inefficient React rendering
- Heavy synchronous operations

**Solutions**:

```typescript
// Lazy load components
const Editor = lazy(() => import('./Editor'));

// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* component content */}</div>;
});

// Debounce expensive operations
const debouncedSave = debounce(async (settings) => {
  await saveSettings(settings);
}, 500);
```

---

## 7. Testing Issues

### 7.1 Unit Testing Issues

#### Issue: Tests not running

**Symptoms**: Test suite fails to start
**Error Message**: Test configuration errors

**Causes**:

- Missing test dependencies
- Incorrect test configuration
- Environment setup issues

**Solutions**:

```bash
# Install test dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Configure vitest
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
});
```

#### Issue: Chrome APIs not available in tests

**Symptoms**: Tests fail due to missing Chrome APIs
**Error Message**: Chrome is not defined

**Causes**:

- Chrome APIs not mocked
- Test environment not configured
- Missing test setup

**Solutions**:

```typescript
// Mock Chrome APIs
const mockChrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: { addListener: jest.fn() },
  },
  storage: {
    sync: { get: jest.fn(), set: jest.fn() },
  },
};

beforeEach(() => {
  global.chrome = mockChrome as any;
});
```

### 7.2 Integration Testing Issues

#### Issue: Extension not loading in tests

**Symptoms**: Extension context not available
**Error Message**: Extension APIs not working

**Causes**:

- Test environment not simulating extension
- Missing manifest loading
- Incorrect test setup

**Solutions**:

```typescript
// Test extension loading
const loadExtension = async () => {
  // Mock extension environment
  global.chrome = {
    runtime: { getURL: (path: string) => path },
    storage: { sync: { get: jest.fn(), set: jest.fn() } },
  } as any;
};
```

---

## 8. Deployment Issues

### 8.1 Build Issues

#### Issue: Build fails

**Symptoms**: npm run build fails
**Error Message**: Build compilation errors

**Causes**:

- TypeScript errors
- Missing dependencies
- Configuration issues

**Solutions**:

```bash
# Check for TypeScript errors
npm run type-check

# Install missing dependencies
npm install

# Clean and rebuild
npm run clean
npm run build
```

#### Issue: ZIP creation fails

**Symptoms**: npm run zip fails
**Error Message**: ZIP creation errors

**Causes**:

- Missing dist folder
- ZIP command not available
- File permission issues

**Solutions**:

```bash
# Ensure build completed
npm run build

# Check if dist folder exists
ls -la dist/

# Use alternative ZIP method
cd dist && zip -r ../extension.zip .
```

### 8.2 Chrome Web Store Issues

#### Issue: Extension rejected

**Symptoms**: Chrome Web Store rejection
**Error Message**: Policy violation or functionality issues

**Causes**:

- Missing privacy policy
- Excessive permissions
- Functionality not working
- Poor user experience

**Solutions**:

- Review Chrome Web Store policies
- Reduce permissions to minimum required
- Test all functionality thoroughly
- Improve user experience and documentation

#### Issue: Extension not loading in store

**Symptoms**: Extension fails to load after installation
**Error Message**: Extension loading errors

**Causes**:

- Missing files in package
- Incorrect manifest
- Permission issues

**Solutions**:

- Verify all files included in ZIP
- Check manifest.json syntax
- Test extension in developer mode first
- Review Chrome extension documentation

---

## 9. Common Error Messages

### 9.1 TypeScript Errors

```
Cannot find name 'chrome'
```

**Solution**: Install @types/chrome and configure TypeScript

```
Module not found
```

**Solution**: Check import paths and Vite configuration

```
Type 'any' is not assignable
```

**Solution**: Add proper type annotations

### 9.2 Chrome Extension Errors

```
Service worker registration failed
```

**Solution**: Check manifest.json and service worker syntax

```
Content script injection failed
```

**Solution**: Verify content script configuration and permissions

```
Message passing failed
```

**Solution**: Check message format and async handling

### 9.3 React Errors

```
React is not defined
```

**Solution**: Add React import and check build configuration

```
Cannot read property of undefined
```

**Solution**: Add null checks and proper state initialization

```
Maximum update depth exceeded
```

**Solution**: Fix infinite re-render loops in useEffect

---

## 10. Prevention and Best Practices

### 10.1 Development Best Practices

- **Use TypeScript**: Catch errors at compile time
- **Test Regularly**: Run tests after each change
- **Code Review**: Review code before committing
- **Documentation**: Keep documentation updated

### 10.2 Testing Best Practices

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Manual Testing**: Test in real Chrome environment

### 10.3 Deployment Best Practices

- **Staging**: Test in staging environment first
- **Versioning**: Use semantic versioning
- **Rollback Plan**: Have rollback strategy ready
- **Monitoring**: Monitor extension after deployment

---

## 11. Getting Help

### 11.1 Resources

- **Chrome Extension Documentation**: https://developer.chrome.com/docs/extensions/
- **Chrome Web Store Policies**: https://developer.chrome.com/docs/webstore/program_policies/
- **Stack Overflow**: Search for Chrome extension issues
- **GitHub Issues**: Check existing issues in similar projects

### 11.2 Support Channels

- **Chrome Web Store Support**: https://support.google.com/chrome_webstore/
- **Developer Forums**: Chrome extension developer community
- **Documentation**: This troubleshooting guide

---

**Document Version:** 1.0.0  
**Last Updated:** 2024-01-15  
**Next Review:** 2024-02-15
