# Chrome Extension Boilerplate Generator

[![Build](https://github.com/briang123/chrome-extension-boilerplate/actions/workflows/ci.yml/badge.svg)](https://github.com/briang123/chrome-extension-boilerplate/actions)
[![License](https://img.shields.io/github/license/briang123/chrome-extension-boilerplate)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/briang123/chrome-extension-boilerplate.svg)](https://github.com/briang123/chrome-extension-boilerplate/commits/master)
[![GitHub stars](https://img.shields.io/github/stars/briang123/chrome-extension-boilerplate.svg)](https://github.com/briang123/chrome-extension-boilerplate/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/briang123/chrome-extension-boilerplate.svg)](https://github.com/briang123/chrome-extension-boilerplate/network)
[![Use this template](https://img.shields.io/badge/template-use%20this%20template-blue)](https://github.com/briang123/chrome-extension-boilerplate/generate)

A modern, AI-powered generator for Chrome Extension projects with React, TypeScript, and more.

## Features

- Interactive CLI and web UI
- Dynamic scaffolding (no hardcoded boilerplate)
- Supports React + Vite and React + Next.js
- Optional website, authentication, AI integrations, analytics, and more
- Smart validation and incremental feature addition
- Comprehensive documentation and Chrome Web Store guidance

## Quick Start

### CLI

```bash
npm install
npm run init
```

### Web App

```bash
npm run web:dev
# Then open http://localhost:5173
```

## Scripts

Below are the available npm scripts and their purposes:

| Script       | Command                                      | Description                                                                |
| ------------ | -------------------------------------------- | -------------------------------------------------------------------------- |
| `init`       | `ts-node --esm scripts/init.ts`              | Launches the interactive CLI to scaffold or update your extension project. |
| `web`        | `vite`                                       | Starts the Vite dev server for the web app (default mode).                 |
| `web:dev`    | `vite --mode development`                    | Starts the Vite dev server in development mode for the web app.            |
| `web:build`  | `vite build`                                 | Builds the production-ready web app.                                       |
| `dev`        | `vite`                                       | Alias for `web` (starts the dev server).                                   |
| `build`      | `vite build`                                 | Alias for `web:build` (builds the web app).                                |
| `zip`        | `zip -r dist.zip dist/`                      | Zips the `dist/` directory for Chrome Web Store submission.                |
| `validate`   | `node scripts/validate-generated-project.ts` | Runs type-checking and linting to validate the generated project.          |
| `test`       | `vitest`                                     | Runs all tests using Vitest.                                               |
| `test:ui`    | `vitest --ui`                                | Launches the Vitest UI for interactive test running.                       |
| `test:run`   | `vitest run`                                 | Runs tests in non-interactive (CI) mode.                                   |
| `lint`       | `eslint . --ext .ts,.tsx --fix`              | Lints and auto-fixes code using ESLint.                                    |
| `type-check` | `tsc --noEmit`                               | Runs TypeScript type-checking only.                                        |
| `format`     | `prettier --write .`                         | Formats all code using Prettier.                                           |

## Recommended Workflow

Follow this workflow for a smooth development and release process:

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Initialize or update your project**
   - Run the interactive CLI to scaffold or add features:
     ```bash
     npm run init
     ```
3. **Develop your extension and/or web app**
   - For the web app UI:
     ```bash
     npm run web:dev
     # or
     npm run dev
     # Then open http://localhost:5173
     ```
4. **Test and validate your code**
   - Run tests:
     ```bash
     npm test
     # or for UI:
     npm run test:ui
     ```
   - Lint and type-check:
     ```bash
     npm run lint
     npm run type-check
     ```
   - Validate the generated project:
     ```bash
     npm run validate
     ```
5. **Format your code**
   ```bash
   npm run format
   ```
6. **Build for production**
   ```bash
   npm run build
   # or
   npm run web:build
   ```
7. **Package for Chrome Web Store**
   ```bash
   npm run zip
   # This creates dist.zip for upload
   ```

> **Tip:** You can re-run `npm run init` at any time to add new features or update your configuration. The CLI is idempotent and will not overwrite your custom code.

## Documentation

- [Project Structure](docs/example-project-structure.md)
- [Prompt Reference](docs/ai-project-prompt.md)
- [Feature Summary](docs/feature-summary.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Code Formatting

This project uses [Prettier](https://prettier.io/) for code formatting.

- To format all files manually, run:
  ```bash
  npm run format
  ```
- If you use VS Code, workspace settings in `.vscode/settings.json` enable format on save and set Prettier as the default formatter for JS/TS/JSON files.
- You can also install the Prettier extension in your editor for best results.

## License

[MIT](LICENSE)
