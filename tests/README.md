# Test Organization

This directory contains the Playwright tests for the screen capture extension. The tests are organized by functionality to improve maintainability and discoverability.

## Directory Structure

```
tests/
├── README.md                    # This file
├── sidebar/                     # Sidebar-specific tests
│   ├── sidebar-core.spec.ts     # Core sidebar functionality (open, close, move, collapse)
│   ├── screenshot-capture.spec.ts # Screenshot capture functionality
│   └── area-selection.spec.ts   # Area selection functionality
├── helpers/                     # Test utilities and helpers
│   ├── test-utils-core.ts       # Core utilities (browser setup, extension management)
│   ├── sidebar-utils.ts         # Sidebar-specific utilities
│   ├── capture-utils.ts         # Screenshot capture utilities
│   ├── area-selection-utils.ts  # Area selection utilities
│   ├── test-setup.ts           # Playwright test configuration
│   ├── test-selectors.ts       # CSS selectors for test elements
│   └── test-constants.ts       # Test constants and configuration
├── media/                      # Test artifacts (screenshots, videos)
└── results/                    # Test results and reports
```

## Test Categories

### 1. Sidebar Core Functionality (`sidebar-core.spec.ts`)

Tests for basic sidebar behavior:

- Opening and closing the sidebar
- Moving sidebar between left and right sides
- Collapsing and expanding the sidebar

### 2. Screenshot Capture (`screenshot-capture.spec.ts`)

Tests for screenshot functionality:

- Capturing full screen screenshots
- Verifying images are copied to clipboard
- Image thumbnail generation

### 3. Area Selection (`area-selection.spec.ts`)

Tests for area selection functionality:

- Selecting areas by dragging
- Canceling selection via button or Escape key
- Resizing selection areas with drag handles
- Restarting selection by clicking elsewhere

## Utility Organization

### Core Utilities (`test-utils-core.ts`)

- Browser setup and extension loading
- Extension ID detection
- Page setup and navigation
- General test utilities

### Specialized Utilities

- **`sidebar-utils.ts`**: Sidebar state management and assertions
- **`capture-utils.ts`**: Screenshot capture and clipboard verification
- **`area-selection-utils.ts`**: Area selection, dragging, and UI assertions

## Running Tests

### Run all tests

```bash
npm test
```

### Run specific test categories

```bash
# Run only sidebar core tests
npx playwright test tests/sidebar/sidebar-core.spec.ts

# Run only area selection tests
npx playwright test tests/sidebar/area-selection.spec.ts

# Run only screenshot capture tests
npx playwright test tests/sidebar/screenshot-capture.spec.ts
```

### Run tests with specific options

```bash
# Run in headed mode (shows browser)
HEADLESS=false npm test

# Run with video recording
COLLECT_VIDEO=true npm test

# Run with devtools open
DEVTOOLS=1 npm test
```

## Adding New Tests

When adding new tests:

1. **Choose the appropriate test file** based on functionality
2. **Use existing utilities** from the specialized utility files
3. **Follow the naming convention**: `User can [action]` for test titles
4. **Group related tests** using `test.describe()` blocks
5. **Import utilities** from `test-utils-core.ts` (which re-exports from specialized files)

### Example

```typescript
import { test } from '../helpers/test-setup';
import { sidebarShouldBeOpen, someUtility } from '../helpers/test-utils-core';

test.describe('New Feature', () => {
  test('User can perform new action', async ({ page }) => {
    await sidebarShouldBeOpen(page);
    // Test implementation
  });
});
```

## Benefits of This Organization

1. **Separation of Concerns**: Each test file focuses on a specific feature
2. **Maintainability**: Easier to find and modify tests for specific functionality
3. **Reusability**: Utilities are organized by purpose and can be easily imported
4. **Scalability**: New test categories can be added without cluttering existing files
5. **Parallel Execution**: Tests can be run in parallel by category
6. **Clear Documentation**: Each file has a clear purpose and responsibility

## Future Improvements

Consider adding these test categories as the extension grows:

- `image-management.spec.ts` - Image history, deletion, sharing
- `settings.spec.ts` - Extension settings and preferences
- `keyboard-shortcuts.spec.ts` - Keyboard shortcut functionality
- `accessibility.spec.ts` - Accessibility and screen reader support
