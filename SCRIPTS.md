# NPM Scripts Documentation

This document explains the available npm scripts in this project, their purpose, and when to use them. Use this as a reference for development, testing, building, and releasing the Chrome extension.

---

## Workflow Overview

- **Development:** Use `dev` for local development with hot reload. Use `build:main` or `build:content:dev` for fast, partial builds.
- **Testing:** Use `test` for unit/integration tests, `test:pw` for Playwright browser tests, and `test:e2e:extension` for end-to-end extension tests.
- **UI Mode Testing:** Use `test:pw:ui` for interactive debugging, `test:pw:headed` for visual debugging, and `test:pw:headless` for fast execution.
- **Linting/Formatting:** Use `lint`, `format`, and `type-check` to ensure code quality before committing or building.
- **Build & Release:** Use `build` for a full, production-ready build. Use `zip` to package the extension for distribution.
- **Cleanup:** Use `clean` to remove build artifacts.

---

## Scripts Summary Table

| Script               | Description                                                                      | When to Use                       |
| -------------------- | -------------------------------------------------------------------------------- | --------------------------------- |
| `init`               | Project initialization/setup script                                              | Once after cloning or setup       |
| `validate`           | Validates the generated project                                                  | After code generation or changes  |
| `dev`                | Starts Vite dev server with hot reload                                           | During local development          |
| `prebuild`           | Cleans the `dist/` directory before building (runs automatically before `build`) | Before every build (auto)         |
| `build:main`         | Builds main extension code (background, popup, sidebar, etc.)                    | When only main code changes       |
| `build:content`      | Builds content script (prod) and runs postbuild                                  | When only content script changes  |
| `build:content:dev`  | Builds content script in dev mode and runs postbuild                             | Fast local dev for content script |
| `build`              | Runs both main and content builds (full production build)                        | Before release, packaging, or CI  |
| `postbuild`          | Copies static assets to `dist/`                                                  | Always after content build        |
| `zip`                | Zips the `dist/` directory for distribution                                      | Before submitting to Chrome Store |
| `clean`              | Removes the `dist/` directory                                                    | Before/after builds as needed     |
| `test`               | Runs unit/integration tests with Vitest                                          | During development or CI          |
| `test:ui`            | Runs Vitest in UI mode                                                           | For interactive test debugging    |
| `test:run`           | Runs Vitest tests in run mode                                                    | For CI or quick test runs         |
| `test:pw`            | Runs Playwright browser tests                                                    | For browser/E2E testing           |
| `test:pw:ui`         | Opens Playwright's interactive UI mode                                           | For interactive debugging         |
| `test:pw:ui:dev`     | UI mode with development environment settings                                    | For development debugging         |
| `test:e2e:extension` | Runs extension E2E tests via Playwright script                                   | For full extension E2E testing    |
| `lint`               | Lints and auto-fixes code with ESLint                                            | Before commit or build            |
| `type-check`         | Runs TypeScript type checking                                                    | Before commit or build            |
| `format`             | Formats code with Prettier                                                       | Before commit or build            |

### UI Mode Testing Scripts

| Script                   | Description                                        | When to Use                         |
| ------------------------ | -------------------------------------------------- | ----------------------------------- |
| `test:pw:headless`       | Runs tests in headless mode (fastest)              | CI/CD, quick test runs              |
| `test:pw:headed`         | Runs tests with browser visible                    | Development, visual debugging       |
| `test:pw:ui`             | Opens Playwright UI mode for interactive debugging | Complex debugging, test development |
| `test:pw:ui:dev`         | UI mode with development environment               | Development with UI mode            |
| `test:pw:popup`          | Tests popup interface (headless)                   | Popup-specific testing              |
| `test:pw:sidebar`        | Tests sidebar interface (headless)                 | Sidebar-specific testing            |
| `test:pw:window`         | Tests window interface (headless)                  | Window-specific testing             |
| `test:pw:popup:headed`   | Tests popup interface (headed)                     | Popup debugging                     |
| `test:pw:sidebar:headed` | Tests sidebar interface (headed)                   | Sidebar debugging                   |
| `test:pw:window:headed`  | Tests window interface (headed)                    | Window debugging                    |
| `test:pw:popup:ui`       | Tests popup interface (UI mode)                    | Popup complex debugging             |
| `test:pw:sidebar:ui`     | Tests sidebar interface (UI mode)                  | Sidebar complex debugging           |
| `test:pw:window:ui`      | Tests window interface (UI mode)                   | Window complex debugging            |

---

## Detailed Script Explanations

### Setup & Validation

- **`init`**: Runs project initialization (e.g., sets up configs, installs hooks).
- **`validate`**: Validates the generated project structure or code.

### Development

- **`dev`**: Starts the Vite dev server for local development with hot reload.

### Build

- **`prebuild`**: Cleans the `dist/` directory before every build (runs automatically before `build`).
- **`build:main`**: Builds the main extension code (background, popup, sidebar, etc.).
- **`build:content`**: Builds the content script for production and runs `postbuild` to copy assets.
- **`build:content:dev`**: Builds the content script in development mode (faster, less optimized) and runs `postbuild`.
- **`build`**: Runs both `build:main` and `build:content` for a full, production-ready build. Use this before packaging, testing, or releasing.
- **`postbuild`**: Copies static assets (e.g., icons, CSS) to the `dist/` directory. Always runs after content builds.

### Packaging & Cleanup

- **`zip`**: Zips the `dist/` directory for Chrome Web Store or backup.
- **`clean`**: Removes the `dist/` directory and all build artifacts.

### Testing

- **`test`**: Runs all unit/integration tests using Vitest.
- **`test:ui`**: Runs Vitest in UI mode for interactive test debugging.
- **`test:run`**: Runs Vitest tests in run mode (non-interactive, for CI).
- **`test:pw`**: Runs Playwright browser tests for E2E/browser automation.
- **`test:e2e:extension`**: Runs full extension E2E tests using a Playwright script.

### UI Mode Testing

- **`test:pw:headless`**: Runs tests without showing the browser (fastest, best for CI/CD).
- **`test:pw:headed`**: Runs tests with browser visible (good for development debugging).
- **`test:pw:ui`**: Opens Playwright's interactive UI mode with timeline view, DOM snapshots, and time-travel debugging.
- **`test:pw:ui:dev`**: UI mode with development environment settings.
- **`test:pw:popup`**: Tests only the popup interface in headless mode.
- **`test:pw:sidebar`**: Tests only the sidebar interface in headless mode.
- **`test:pw:window`**: Tests only the window interface in headless mode.
- **`test:pw:popup:headed`**: Tests popup interface with browser visible.
- **`test:pw:sidebar:headed`**: Tests sidebar interface with browser visible.
- **`test:pw:window:headed`**: Tests window interface with browser visible.
- **`test:pw:popup:ui`**: Tests popup interface in interactive UI mode.
- **`test:pw:sidebar:ui`**: Tests sidebar interface in interactive UI mode.
- **`test:pw:window:ui`**: Tests window interface in interactive UI mode.

### Linting, Formatting, Type-checking

- **`lint`**: Lints and auto-fixes code using ESLint.
- **`type-check`**: Runs TypeScript type checking (no emit).
- **`format`**: Formats code using Prettier.

---

## **Recommended Workflow**

1. **Development:**
   - Use `dev` for local development.
   - Use `build:main` or `build:content:dev` for fast partial builds.
2. **Testing:**
   - Use `test` for unit/integration tests.
   - Use `test:pw:headless` for fast browser tests.
   - Use `test:pw:headed` for visual debugging.
   - Use `test:pw:ui` for complex debugging and test development.
3. **UI-Specific Testing:**
   - Use `test:pw:popup`, `test:pw:sidebar`, or `test:pw:window` for specific interface testing.
   - Add `:headed` or `:ui` suffix for debugging specific interfaces.
4. **Lint/Format/Type-check:**
   - Run `lint`, `format`, and `type-check` before committing or building.
5. **Build & Release:**
   - Use `build` for a full, production-ready build.
   - Use `zip` to package the extension for distribution.
6. **Cleanup:**
   - Use `clean` as needed to remove build artifacts.

---

## UI Mode Features

When using UI mode scripts (`test:pw:ui`), you get access to:

- **Timeline View**: Visual timeline of test actions with hover snapshots
- **Actions Panel**: Detailed list of all test actions with locator information
- **DOM Inspection**: Pop out DOM snapshots for detailed inspection
- **Pick Locator**: Interactive locator picker for element selection
- **Source Code**: Highlighted source code with direct VS Code links
- **Console & Network**: Browser logs and network request details
- **Watch Mode**: Auto-rerun tests on file changes

For detailed UI mode documentation, see [e2e/README.md](e2e/README.md).

---

For any questions about scripts or workflow, see this file or ask the project maintainers.
