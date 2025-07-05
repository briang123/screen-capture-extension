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

## UI Mode Configuration

The extension supports three different UI modes for testing:

### 1. Headless Mode (Default)

- Runs tests without showing the browser
- Fastest execution
- Best for CI/CD pipelines
- Default mode when no `TEST_MODE` is specified

### 2. Headed Mode

- Shows the browser during test execution
- Useful for debugging and development
- Slower than headless but provides visual feedback

### 3. UI Mode

- Opens Playwright's interactive UI mode
- Provides time-travel debugging experience
- Shows timeline view, actions, and DOM snapshots
- Best for complex debugging and test development

## Available Test Projects

The tests are organized into different projects based on the extension's UI components:

- **popup-mode**: Tests the extension popup interface
- **sidebar-mode**: Tests the sidebar overlay for area selection
- **window-mode**: Tests the new window interface

## Running Tests

### Basic Commands

```bash
# Headless mode (default)
npm run test:pw:headless

# Headed mode (shows browser)
npm run test:pw:headed

# UI mode (interactive debugging)
npm run test:pw:ui
```

### Project-Specific Tests

```bash
# Test popup interface
npm run test:pw:popup
npm run test:pw:popup:headed
npm run test:pw:popup:ui

# Test sidebar interface
npm run test:pw:sidebar
npm run test:pw:sidebar:headed
npm run test:pw:sidebar:ui

# Test window interface
npm run test:pw:window
npm run test:pw:window:headed
npm run test:pw:window:ui
```

### Development Mode

```bash
# UI mode with development environment
npm run test:pw:ui:dev
```

## Environment Variables

You can customize test behavior using environment variables:

```bash
# Set test mode
TEST_MODE=headless    # Run in headless mode
TEST_MODE=headed      # Run in headed mode
TEST_MODE=ui          # Run in UI mode

# Media collection
COLLECT_SCREENSHOTS=true              # Capture screenshots
COLLECT_VIDEO=true                    # Record videos
COLLECT_FULLPAGE_SCREENSHOTS=true     # Full-page screenshots

# Test configuration
TEST_URL=https://example.com          # Target URL for tests
TEST_TIMEOUT=30000                    # Test timeout in milliseconds

# Logging
LOG_TEST_RESULTS=true                 # Enable detailed logging
DEV_MODE=true                         # Enable development features
```

## UI Mode Features

When using UI mode (`npm run test:pw:ui`), you get access to:

### Timeline View

- Visual timeline of test actions
- Hover to see snapshots at each step
- Color-coded action types

### Actions Panel

- Detailed list of all test actions
- Locator information for each action
- Before/after DOM snapshots

### DOM Inspection

- Pop out DOM snapshots for detailed inspection
- Use browser DevTools on snapshots
- Compare different states side-by-side

### Pick Locator

- Interactive locator picker
- Hover to see element locators
- Test and refine locators

### Source Code

- Highlighted source code for each action
- Direct link to VS Code
- Line-by-line debugging

### Console & Network

- Browser console logs
- Network request details
- Filtered by selected actions

### Watch Mode

- Auto-rerun tests on file changes
- Watch individual tests or all tests
- Real-time feedback during development

## Test Structure

```
tests/
├── helpers/                 # Test utilities and setup
│   ├── test-constants.ts    # Environment constants
│   ├── test-setup.ts        # Playwright configuration
│   ├── test-utils-core.ts   # Core test utilities
│   ├── sidebar-utils.ts     # Sidebar-specific utilities
│   └── capture-utils.ts     # Capture-specific utilities
├── sidebar/                 # Sidebar interface tests
│   ├── sidebar-core.spec.ts # Core sidebar functionality
│   ├── area-selection.spec.ts # Area selection tests
│   └── screenshot-capture.spec.ts # Screenshot capture tests
└── results/                 # Test results and artifacts
```

## Debugging Tips

### Using UI Mode for Debugging

1. **Start with UI mode**: `npm run test:pw:ui`
2. **Run specific test**: Click the play button next to the test name
3. **Watch for changes**: Enable watch mode for the test
4. **Inspect failures**: Use timeline to see where tests fail
5. **Pick locators**: Use the pick locator tool to find elements

### Common Issues

#### Extension Not Loading

- Ensure extension is built: `npm run build`
- Check extension path in configuration
- Verify Chrome arguments are correct

#### Tests Failing in Headless Mode

- Run in headed mode to see what's happening
- Use UI mode for detailed debugging
- Check console logs for errors

#### Video Recording Issues

- Set `COLLECT_VIDEO=true` for video recording
- Videos are saved to `tests/media/` directory
- Use UI mode to view videos with timeline

## Best Practices

1. **Use appropriate mode for the task**:
   - Headless for CI/CD and quick runs
   - Headed for development and debugging
   - UI mode for complex debugging

2. **Organize tests by project**:
   - Group related tests in the same project
   - Use descriptive project names

3. **Use environment variables**:
   - Configure behavior without code changes
   - Easy switching between modes

4. **Leverage UI mode features**:
   - Use timeline for understanding test flow
   - Pick locators for reliable element selection
   - Watch mode for rapid development

## Configuration Files

- `playwright.config.cjs`: Main Playwright configuration
- `tests/helpers/test-constants.ts`: Environment constants
- `tests/helpers/test-setup.ts`: Test setup and fixtures
- `playwright.global-setup.cjs`: Global setup for extension loading
