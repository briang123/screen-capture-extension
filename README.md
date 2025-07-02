![Build Status (master)](https://github.com/briang123/screen-capture-extension/actions/workflows/ci.yml/badge.svg?branch=master)
![Last Commit](https://img.shields.io/github/last-commit/briang123/screen-capture-extension)
![Unit Tests](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/briang123/b417ceac6cfcf12a0910ef90196e7512/raw/tests-badge.json&query=$.screen-capture-extension.unit&cacheSeconds=60)
![E2E Tests](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/briang123/b417ceac6cfcf12a0910ef90196e7512/raw/tests-badge.json&query=$.screen-capture-extension.e2e&cacheSeconds=60)

<!-- ![Chrome Web Store Installs](https://img.shields.io/chrome-web-store/users/EXTENSION_ID) -->
<!-- ![Chrome Web Store Version](https://img.shields.io/chrome-web-store/v/EXTENSION_ID) -->

<!-- Replace GIST_URL with your actual Gist raw URL after first workflow run -->

# Screen Capture Extension

A powerful Chrome extension for capturing and annotating web pages with beautiful backgrounds and editing tools.

## 🚦 Continuous Integration & Live Badges

This project uses GitHub Actions for continuous integration:

- **Linting, unit tests, and e2e tests** run automatically on every push and pull request to `master`.
- **Live test badges** at the top of this README show the current number of passing unit and e2e tests.
  - Test results are written to a public Gist by CI.
  - [Shields.io](https://shields.io/) reads the Gist and displays the latest test counts as badges.
  - Badges refresh every minute.
- **Dependency caching** is enabled for faster CI runs (`node_modules` and Playwright browsers).
- **No secrets or sensitive data** are ever committed; all tokens are managed via GitHub Secrets.

See `.github/workflows/ci.yml` for details.

## 🎯 Features

### 📸 Screen Capture

- **One-click capture** of entire web pages or specific elements
- **Element snapping** like Chrome DevTools for precise selection
- **High-quality output** in PNG, JPEG, and WebP formats
- **Configurable quality** settings for optimal file size

### 🎨 Image Editor

- **Detached window** for distraction-free editing
- **Fabric.js powered canvas** for smooth interactions
- **Multiple annotation tools**: text, arrows, shapes, highlights
- **Color picker** with unlimited color options
- **Drag and drop** functionality for annotations

### 🖼️ Background Configuration

- **Gradient backgrounds** with custom colors
- **Solid color backgrounds**
- **Image backgrounds**
- **Transparent backgrounds** for overlays

### 📋 Export Options

- **Copy to clipboard** with one click
- **File export** in multiple formats
- **Quality settings** for optimal file size
- **Automatic filename** generation

### ⚙️ Advanced Settings

- **Comprehensive options page**
- **Theme customization** (light/dark/auto)
- **Auto-save functionality**
- **Keyboard shortcuts**

## 🚀 Quick Start

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/screen-capture-extension.git
   cd screen-capture-extension
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Usage

1. **Capture Screen**
   - Click the extension icon in the toolbar
   - Click "Capture Screen" to capture the current tab
   - Or click "Open Editor" to start with a blank canvas

2. **Edit and Annotate**
   - Use the tools panel to add text, arrows, shapes, or highlights
   - Choose colors with the color picker
   - Drag elements to reposition them

3. **Export**
   - Click "Copy to Clipboard" to copy the image
   - Click "Save Image" to download the file

## 🛠️ Development

### Project Structure

```
src/
├── popup/           # Extension popup interface
├── window/          # Detached editor window
├── options/         # Options page
├── background/      # Background service worker
├── content/         # Content script for element selection
└── utils/           # Utility functions
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run zip` - Create ZIP file for Chrome Web Store
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run type-check` - Check TypeScript types

### Technology Stack

- **React 18+** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool
- **Fabric.js** - Canvas manipulation
- **Chrome Extension APIs** - Manifest V3

## 📚 Documentation

- **[Product Requirements](docs/prd.md)** - Complete feature specification
- **[Design System](docs/design-system.md)** - Visual design guidelines
- **[Recipes](docs/recipes.md)** - Common development patterns
- **[Chrome Store Guide](docs/chrome-store-listing.md)** - Publishing instructions
- **[Troubleshooting](docs/ai-troubleshooting.md)** - Common issues and solutions

## 🎯 Perfect For

- **Developers**: Capture UI elements for documentation
- **Designers**: Create annotated mockups and feedback
- **QA Testers**: Highlight bugs and issues
- **Content Creators**: Create tutorial screenshots
- **Project Managers**: Visual communication and feedback

## 🔒 Privacy & Security

- **No data collection** - All processing happens locally
- **Minimal permissions** - Only what's necessary for functionality
- **Secure storage** - Uses Chrome's secure storage APIs
- **Open source** - Transparent and auditable code

## 🚀 Why Choose Screen Capture Extension?

✅ **Fast & Efficient**: One-click capture and editing  
✅ **Professional Quality**: High-resolution captures with beautiful backgrounds  
✅ **User-Friendly**: Intuitive interface designed for all skill levels  
✅ **Feature-Rich**: Comprehensive annotation tools and settings  
✅ **Reliable**: Built with modern web technologies and Chrome APIs  
✅ **Secure**: Minimal permissions, no data collection

## 📱 System Requirements

- **Chrome**: 88 or higher
- **Operating System**: Windows, macOS, or Linux
- **Display**: Minimum 1024x768 resolution
- **Storage**: 50MB available space

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [docs](docs/) folder
- **Issues**: Report bugs on [GitHub Issues](https://github.com/yourusername/screen-capture-extension/issues)
- **Discussions**: Join the conversation on [GitHub Discussions](https://github.com/yourusername/screen-capture-extension/discussions)

## 🙏 Acknowledgments

- **Chrome Extension Team** - For the excellent documentation and APIs
- **Fabric.js** - For the powerful canvas library
- **Tailwind CSS** - For the beautiful utility-first CSS framework
- **React Team** - For the amazing UI library
- **Vite Team** - For the fast build tool

---

**Made with ❤️ for the developer community**

**Version**: 1.0.0  
**Last Updated**: 2025-07-02
