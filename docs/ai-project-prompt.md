# Chrome Extension Project Specification

## Project Overview

Create a complete Chrome Extension using React, TypeScript (strict mode), and Vite with the following specifications:

## Extension Details

**Extension Name:** screen-capture-extension
**Description:** An extension that will allow user to capture an image of an area of a web page or specific page level elements by snapping to selectors (like when user may be in chrome dev tools and inspecting elements). Once the capture is made, will provide the image capture a beautiful configurable background that can be configured from the extension window. The extension will provide fast and easy way to quickly capture images from the webpage with one-click capture. The user will be able to annotate the image with text, arrows, and shapes that can be moved/dragged around to help the user convey their diagrams better. The extension will allow the user to save the image to clipboard after capturing via the one-click tap of a button. They will also be able to copy to clipboard after annotating and additional be able to save as a file. I would like for the features to be influenced by ScreenShotX and be super useful for the user.

## Selected Features

- Extension Name: screen-capture-extension
- Extension Description: An extension that will allow user to capture an image of an area of a web page or specific page level elements by snapping to selectors (like when user may be in chrome dev tools and inspecting elements). Once the capture is made, will provide the image capture a beautiful configurable background that can be configured from the extension window. The extension will provide fast and easy way to quickly capture images from the webpage with one-click capture. The user will be able to annotate the image with text, arrows, and shapes that can be moved/dragged around to help the user convey their diagrams better. The extension will allow the user to save the image to clipboard after capturing via the one-click tap of a button. They will also be able to copy to clipboard after annotating and additional be able to save as a file. I would like for the features to be influenced by ScreenShotX and be super useful for the user.
- Side Window (detached pop-out, ChatGPT-style): Opens in a dedicated side window, not injected into the page.
  - Use a background script to call chrome.windows.create({ url: "window.html", type: "popup", width: 400, height: 800 })
  - The main extension action should only be a launcher, not the full UI.
  - Do NOT inject a UI overlay into the current page.
- Tailwind CSS: Yes
- Options Page: Yes
- Chrome Storage: sync

## Chrome Web Store Listing Requirements

### Required Information for Store Listing

The following information must be configured in the Chrome Developer Dashboard when submitting your extension:

**Basic Information:**

- **Extension Name**: The name that appears in the store
- **Short Description**: Brief description (max 132 characters)
- **Long Description**: Detailed description of features and benefits
- **Category**: Choose appropriate category (Productivity, Developer Tools, etc.)
- **Tags**: Keywords for discoverability

**Visual Assets:**

- **Icons**: 128x128 PNG icon (required)
- **Screenshots**: PNG or JPG, 640x400 or higher (at least 1 required)
- **Promotional Video**: Optional, via YouTube URL
- **Promotional Images**: Additional promotional graphics

**Content:**

- **Languages Supported**: List all supported languages
- **Pricing**: Free or paid (configured based on pricing model)
- **Permissions**: List of required permissions with explanations

**Legal & Support:**

- **Privacy Policy URL**: Required (points to your website)
- **Support Website URL**: Optional but recommended
- **Terms of Service URL**: Optional but recommended

### Store Listing URL

Your extension will be available at:
`https://chromewebstore.google.com/detail/your-extension-id`

### Submission Process

1. Create developer account at Chrome Web Store Developer Dashboard
2. Upload extension package (ZIP file)
3. Fill in all required listing information
4. Submit for review (typically 1-3 business days)
5. Address any review feedback
6. Publish to store

### Best Practices

- Write compelling descriptions that highlight value
- Use high-quality screenshots and videos
- Respond to user reviews and feedback
- Keep listing information up to date
- Monitor analytics and user feedback

## Required Files and Structure

### Core Configuration

- `manifest.json` (Manifest V3)
- `package.json` with all necessary dependencies
- `tsconfig.json` (TypeScript strict mode)
- `vite.config.ts` (Vite configuration for Chrome Extension)
- `.env.example` (environment variables template)
- `.gitignore` (appropriate exclusions)

### Source Code Structure

- `src/popup/Popup.tsx` (React popup component)
- `src/popup/popup.html` (popup HTML entry)
- `src/background/background.ts` (service worker)
- `src/content/content.ts` (content script)
- `src/utils/` (utility functions)

### Styling

- Tailwind CSS configuration and imports (see design-system.md)

### Internationalization

- No i18n required

### Development Tools

- ESLint configuration
- Prettier configuration
- Testing setup (Vitest)
- Build scripts (`npm run dev`, `npm run build`, `npm run zip`)

## Extension Modes

- Popup UI (in `src/popup/`) with example state persisted via `chrome.storage.sync`
- Detached Window UI (in `src/window/`) launched from popup, with message passing
- Optional Options page with settings persisted to chosen storage

## Dev Tooling

- Vite-powered HMR
- Scripts: `clean`, `dev`, `build`, `zip`
- Module path aliases like `@components`, `@utils`, `@popup`
- Auto-copy static assets to `dist/`

## Permissions & Security

- Scaffold only necessary permissions in `manifest.json`
- Dynamic permission utilities
- Baseline Content Security Policy configured

## Testing

- Vitest or Jest setup
- Mock Chrome APIs for UI testing
- Unit and integration test examples for UI, background, auth flows, messaging

## Documentation Requirements

Include these files:

- `docs/ai-changelogs.md`  
  Log of AI-generated feature changes, grouped by date and issue/feature.

- `docs/ai-troubleshooting.md`  
  Troubleshooting history (grouped by issue type + date). Additive only, newest at top.

- `docs/prd.md`  
  Product requirements doc. AI will mark items ✅ when completed, and update notes.

- `docs/design-system.md`  
  A modern, themeable design system tailored for **Chrome Extensions**, including:
  - Color tokens with light/dark mode (toggle capability)
  - Suggested emotion-based palettes
  - CSS variables for typography, spacing, radius, shadows, etc
  - Button, modal, card, form style
  - Create base components that can be inherited or extended
  - CSS folder structure (`/styles/`)
  - Popup/window layout support
  - **Shared design system for both extension and website**
  - **Mobile-first responsive design patterns**
  - **Theme switching implementation**
  - **Component library for cross-platform consistency**
  - Prompts you can use with an AI to scaffold design components

- `docs/recipes.md`
  Cookbook of common extension patterns, such as:
  - Messaging between popup and background
  - Dynamic content script injection
  - Debugging extension UI locally
  - Handling permissions dynamically
  - How to reset or inspect `chrome.storage`
  - **Theme switching and persistence**
  - **Responsive design implementation**
  - **Design system integration**

- `docs/chrome-store-listing.md`
  Complete guide for Chrome Web Store submission, including:
  - Required information and assets
  - Submission process and best practices
  - Store listing optimization tips
  - Review process guidelines

- `docs/quick-start.md`
  # Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Generate Your Project

1. Copy the AI prompt from `docs/ai-project-prompt.md`
2. Paste it to your AI agent (Cursor AI, Replit AI, Claude, etc.)
3. Let the AI create all your project files

### Step 2: Set Up Your Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Load extension in Chrome
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select your project's `dist` folder
```

### Step 3: Customize Your Extension

- Edit `src/popup/Popup.tsx` for your main UI
- Modify `manifest.json` for extension settings
- Update `src/background/background.ts` for background logic

### Step 4: Test Your Extension

- Click the extension icon in Chrome toolbar
- Test all features you selected
- Check the browser console for any errors

### Step 5: Build for Production

```bash
# Create production build
npm run build

# Create ZIP for Chrome Web Store
npm run zip
```

## 📋 Immediate Next Steps

- 📄 **Review the generated AI prompt** in `docs/ai-project-prompt.md`
- 🤖 **Copy the prompt content** and paste it to your AI agent (Cursor AI, Replit AI, Claude, etc.)
- 📁 **Create a new directory** for your Chrome extension project
- 📋 **Paste the AI prompt** and let the AI agent generate all your project files
- ⚡ **Run the generated project** with `npm install` and `npm run dev`

## 🤖 AI Agent Instructions

- **For Cursor AI:** Open Cursor, create a new project, and paste the prompt in the chat
- **For Replit AI:** Create a new Repl and paste the prompt in the AI chat
- **For Claude/GPT:** Create a new conversation and paste the prompt
- **For GitHub Copilot:** Use the prompt in a new repository with Copilot enabled
- **Tip:** The AI agent will create all necessary files, dependencies, and documentation

## 🔧 Configuration Summary

**Extension:** screen-capture-extension
**UI Type:** sidewindow
**Features:** Tailwind CSS, Options Page
**Authentication:** None
**Database:** None
**Website:** No

## 📚 Documentation

- `docs/prd.md` - Product requirements and feature list
- `docs/design-system.md` - Design guidelines and components
- `docs/recipes.md` - Common extension patterns
- `docs/chrome-store-listing.md` - Chrome Web Store submission guide

## 🆘 Need Help?

- Check `docs/ai-troubleshooting.md` for common issues
- Read `docs/recipes.md` for implementation patterns
- Create an issue on GitHub if you're stuck

Happy coding! 🎉

- `docs/incremental-updates.md`
  # Incremental Feature Updates

## How to Add New Features

### 1. Run the CLI Again

```bash
npm run init
```

### 2. The CLI Will:

- ✅ **Detect existing features** from your current configuration
- 📝 **Only prompt for new features** you haven't selected yet
- 🔄 **Preserve your existing code** and configuration
- 📚 **Update documentation** with new feature information

### 3. Common Update Scenarios

#### Adding Authentication Later

```bash
npm run init
# Select authentication methods when prompted
# CLI will automatically require a database
```

#### Adding a Website Later

```bash
npm run init
# Select "Include Website" when prompted
# Choose website features (pricing, testimonials, auth)
```

#### Adding AI Features Later

```bash
npm run init
# Select AI providers when prompted
# CLI will suggest adding a database for conversation history
```

#### Adding Pricing Later

```bash
npm run init
# Select pricing model when prompted
# CLI will automatically require a database
```

### 4. What Gets Updated

#### Files That Are Modified:

- `docs/ai-project-prompt.md` - Updated with new features
- `scaffold.json` - Configuration tracking file
- `docs/ai-changelogs.md` - Log of changes made

#### Files That Are Preserved:

- Your existing source code
- Custom modifications you've made
- Environment variables you've configured
- Database schemas you've set up

### 5. Configuration File

The CLI creates a `scaffold.json` file that tracks your configuration:

```json
{
  "extensionName": "My Extension",
  "uiType": "popup",
  "tailwind": true,
  "authMethods": ["google"],
  "database": "firebase",
  "includeWebsite": true,
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

### 6. Best Practices

#### Before Running Updates:

- ✅ **Commit your changes** to version control
- ✅ **Backup your project** if you're concerned
- ✅ **Test your current setup** to ensure it works

#### After Running Updates:

- ✅ **Review the new AI prompt** for accuracy
- ✅ **Test the new features** in development
- ✅ **Update your documentation** if needed
- ✅ **Deploy changes** when ready

### 7. Troubleshooting Updates

#### If Something Goes Wrong:

1. **Check the changelog:** `docs/ai-changelogs.md` shows what changed
2. **Restore from backup:** Use your version control or backup
3. **Run CLI again:** The CLI is idempotent and safe to run multiple times
4. **Check configuration:** Verify `scaffold.json` has the correct settings

#### Common Issues:

- **Feature conflicts:** The CLI will warn you about incompatible combinations
- **Missing dependencies:** The AI prompt will include all necessary dependencies
- **Configuration drift:** The CLI will detect and suggest fixes for inconsistencies

### 8. Advanced Usage

#### Command Line Flags:

```bash
# Force interactive mode
npm run init -- --interactive

# Preview changes without applying
npm run init -- --dry-run

# Update specific features only
npm run init -- --uiType=window --tailwind=false
```

#### Configuration File:

You can also edit `scaffold.json` directly and run the CLI to apply changes:

```bash
# Edit scaffold.json to add new features
# Then run CLI to apply changes
npm run init
```

## Need Help?

- 📖 **Read the docs:** Check `docs/ai-troubleshooting.md` for solutions
- 🔍 **Check changelog:** See what changed in `docs/ai-changelogs.md`
- 💬 **Get support:** Create an issue on the project's GitHub repository
- 🎯 **Start fresh:** Delete the project and run the CLI again if needed

Remember: The CLI is designed to be safe and non-destructive. It will never overwrite your custom code without warning you first!

## Accessibility & UX

- Keyboard navigable components
- Focus traps in modals
- Custom alert/notification system with ARIA support
- Optional theme toggler (light/dark/high-contrast)
- **Mobile-first responsive design**
- **Touch-friendly interface elements**
- **WCAG 2.1 AA compliance**

## README.md Requirements

- Project intro
- CLI usage
- Dev/build instructions
- Chrome loading instructions
- File structure explanation

## Next Steps for User

### Immediate Actions Required:

- 📄 **Review the generated AI prompt** in `docs/ai-project-prompt.md`
- 🤖 **Copy the prompt content** and paste it to your AI agent (Cursor AI, Replit AI, Claude, etc.)
- 📁 **Create a new directory** for your Chrome extension project
- 📋 **Paste the AI prompt** and let the AI agent generate all your project files
- ⚡ **Run the generated project** with `npm install` and `npm run dev`

### AI Agent Instructions:

- **For Cursor AI:** Open Cursor, create a new project, and paste the prompt in the chat
- **For Replit AI:** Create a new Repl and paste the prompt in the AI chat
- **For Claude/GPT:** Create a new conversation and paste the prompt
- **For GitHub Copilot:** Use the prompt in a new repository with Copilot enabled
- **Tip:** The AI agent will create all necessary files, dependencies, and documentation

### Incremental Updates:

- 🔄 **To add new features later:** Run `npm run init` in your project directory
- 📝 **The CLI will detect existing features** and only prompt for new ones
- ⚙️ **Configuration is saved** in `scaffold.json` for future updates
- 🆕 **New features will be added** without overwriting your existing code
- 📚 **Documentation will be updated** automatically with new features

### Deployment Steps:

- 🏗️ **Build your extension:** Run `npm run build` to create the production version
- 📦 **Create a ZIP file:** Run `npm run zip` to package for Chrome Web Store
- 🏪 **Submit to Chrome Web Store:** Follow the guide in `docs/chrome-store-listing.md`
- 🌐 **Deploy your website:** If you included a website, deploy it to your chosen hosting provider
- 🔗 **Update store listing:** Add your website URL to the Chrome Web Store listing

### Troubleshooting:

- ❓ **Need help?** Check `docs/ai-troubleshooting.md` for common issues
- 🐛 **Found a bug?** The troubleshooting guide includes solutions for most problems
- 📖 **Want to learn more?** Read `docs/recipes.md` for common extension patterns
- 🔄 **Want to start over?** Delete the project and run the CLI again
- 💬 **Still stuck?** Check the project's GitHub issues or create a new one

## Bonus Features

- Zip uploader CLI command
- AI-aware design guidelines for future extensions

## Requirements

- All files must include inline `// TODO`, `// CONFIGURE`, or `// REMOVE IF UNUSED` comments
- Use React 18+ with TypeScript strict mode
- Follow Chrome Extension Manifest V3 best practices
- Include proper error handling and accessibility features
- Add comprehensive documentation in `docs/` directory

## Instructions for AI Agent

1. Create all files according to the specification above
2. Ensure all dependencies are properly listed in `package.json`
3. Include appropriate TypeScript types and interfaces
4. Add sample usage and configuration comments
5. Create a working Chrome Extension that can be loaded in developer mode
6. Include all documentation files with proper structure and content
7. Implement accessibility features and UX best practices
8. Add bonus features where appropriate

Please generate all the necessary files for this Chrome Extension project.

---

## Additional Instructions for AI Agent

After generating all project files, create:

- A comprehensive `README.md` in the project root, including:
  - Project overview (from user config)
  - Getting started instructions (install, run, build, test, deploy)
  - List of included features (extension, website, tech stack, options)
  - CLI usage for incremental updates
  - Where to find documentation
  - Directory structure
  - Any smart defaults or important notes
  - Support/contact info
- A `docs/README.md` in the docs folder, summarizing all documentation folder contents, explain how to use the documentation, link to key docs, provide ToC for docs/ directory.
- Ensure all files are valid, linted, and error-free.
- The content of these files should be based on the user's configuration and selected features.
