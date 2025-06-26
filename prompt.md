# Chrome Extension Boilerplate Generator Prompt

## Overview

This generator scaffolds a Chrome Extension project with a customizable stack. It supports React + Vite and React + Next.js for the website, and includes a CLI and web app for configuration. All features are available in both interfaces.

## Website Framework Options

- **React + Next.js**: Full-featured, SEO-optimized, supports blogs, dashboards, server-side rendering, and more.
- **React + Vite**: Lightweight, fast, best for simple landing pages or single-page apps.

## Why This Choice?

- **React** is always used for the UI.
- **Next.js** and **Vite** are build tools/frameworks for React. Next.js is best for SEO and complex sites; Vite is best for simple, fast SPAs.

## Website Features

- Pricing Information
- Testimonials Section
- Authentication Features
- Cookie Consent Banner (GDPR)
- Newsletter Subscription
- Blog Section
- Search Functionality
- Progressive Web App (PWA)
- Status Page
- API Documentation
- User Dashboard

## Other Features

- UI type selection (popup, window, sidewindow)
- Tailwind CSS
- i18n
- Options page
- Accessibility
- Authentication (email, Google, GitHub)
- AI integrations (OpenAI, Claude, Gemini)
- Google Analytics integration (page views, button clicks, user actions, extension usage)
- Database (Firebase, Supabase, MongoDB, PostgreSQL)
- Pricing model (freemium, subscription, one-time, usage-based)
- Hosting provider (Vercel, Netlify, Firebase, AWS, GitHub Pages)
- Chrome storage type (sync, local, session)

## How It Works

- The CLI and web app share core logic and types.
- The generator produces a detailed AI prompt for project scaffolding.
- Smart defaults are applied based on feature selection.

## FAQ

### What is React?

A UI library for building user interfaces.

### What is Vite?

A build tool and dev server for React (and other frameworks). Used for fast development and bundling.

### What is Next.js?

A full-featured React framework for SEO, SSR, and complex sites.

### Why choose between React + Next.js and React + Vite?

- React + Next.js: Best for SEO, blogs, multi-page, and server-side rendered sites.
- React + Vite: Best for simple, fast, single-page apps.

## See the web app or run the CLI for all options and explanations.

---

Create a complete Chrome Extension boilerplate using **React**, **TypeScript** (with strict mode), and **Fastify** with a built-in **Node CLI** for **dynamically customizable scaffolding** and **automated documentation**.

This boilerplate will be published as a **GitHub repository template** for easy reuse in new projects.

---

### 📌 Dynamic Scaffolding Requirement

> ⚠️ **Important:** No boilerplate or scaffolding should be hardcoded. All project structure, files, and configurations must be dynamically generated based on the user's CLI responses.

- The CLI (`scripts/init.ts`) must prompt the user for all configurable options.
- The CLI should support both interactive (prompt-based) and non-interactive (flags/config file) modes for automation and CI/CD use cases.
- The CLI should validate user input and provide helpful error messages or suggestions.
- The CLI should support a "dry run" mode to preview what will be scaffolded before making changes.
- The CLI should be idempotent (re-running it should not break the project or duplicate files).
- Based on responses, dynamically scaffold only the relevant:
  - Files & folders
  - Environment variables
  - Components, configuration, routes, and assets
  - Documentation under `docs/`
  - `.gitignore` with appropriate exclusions for the selected features
- After collecting user input, generate a comprehensive prompt for AI agents (like Cursor AI, Replit AI, etc.) to create all scaffolding files dynamically based on user choices.
- Save the generated prompt to `docs/ai-project-prompt.md` with clear instructions on how to use it with AI agents.
- The CLI should open the generated file for user review and provide step-by-step guidance on proceeding with AI agent scaffolding.
- Update the manifest, `.env.example`, documentation, and other core files with dynamic values.
- Scaffolded files must include inline `// TODO`, `// CONFIGURE`, or `// REMOVE IF UNUSED` comments.
- Log all scaffolding actions in a file like `docs/scaffold-report.md`.
- The CLI should provide guidance for upgrading the boilerplate in existing projects (e.g., via migration scripts or changelogs).

### 🔄 Incremental Feature Addition

- The CLI must support adding new features or integrations to an existing project at any time, not just during initial setup.
- When re-run, the CLI should:
  - Detect which features are already present.
  - Prompt the user for additional features to add (or remove).
  - Scaffold only the new/changed files, configurations, and documentation as needed.
  - Avoid overwriting user-modified files unless explicitly confirmed.
- The project should maintain a config or metadata file (e.g., `scaffold.json`) to track enabled features and integrations.

---

### 📆 Core Features:

#### 1. ⚙️ Bundler & Environment

- Vite for build and HMR
- Manifest V3 support
- TypeScript strict mode enabled by default
- Accessibility linting and code linting (ESLint, Prettier)
- Multiple entry points:
  - `popup.html`
  - `window.html`
  - `options.html`
  - `background.ts`

#### 2. 🪪 Interactive CLI Scaffold

The CLI collects essential information first, then provides clear, user-friendly explanations for each feature:

**Essential Information:**

- **Extension Name**: The name of your Chrome extension
- **Extension Description**: What your extension does (used for AI prompt generation, website content, and Chrome Web Store listing)

**UI Type Selection:**

- **Popup** (opens when clicking extension icon) - Most common choice for simple extensions
- **Window** (opens in a new browser tab) - Better for complex interfaces
- **Side Window** (detached pop-out, ChatGPT-style) - Opens in a dedicated side window, not injected into the page

**Core Features:**

- **Tailwind CSS** - Provides pre-built design components for faster development and a modern look
- **i18n** - Allows your extension to be used in different languages like English, Spanish, etc.
- **Options Page** - Lets users customize extension behavior in Chrome's settings menu

**Authentication Methods** (multi-select):

- **Google** - Sign in with Google account (convenient for most users)
- **GitHub** - Sign in with GitHub account (great for developer tools)
- **Email/Password** - Traditional login system
- **None** - No authentication required

**AI Integrations** (multi-select):

- **OpenAI** - ChatGPT, GPT-4, etc.
- **Claude** - Anthropic AI
- **Gemini** - Google AI
- **None** - No AI features

**Database Integration:**

- **Firebase** - Google cloud database (recommended for easy setup)
- **Postgres** - Relational database
- **MongoDB** - NoSQL database
- **None** - No cloud database

**Pricing Model:**

- **Subscription** - Recurring payments (best for ongoing services)
- **Freemium** - Free + paid upgrades
- **One-time Purchase** - Single payment
- **None** - Free extension

**Hosting Provider(s)** (multi-select):

- **Vercel** - Great for serverless and static sites
- **Netlify** - Easy static hosting
- **Firebase** - Google cloud hosting
- **None** - No backend hosting

**Chrome Storage Type:**

- **Sync** - Syncs data across devices (best for users on multiple devices)
- **Local** - Only on this device

**Google Analytics Integration:**

- **Enable Analytics** - Track user behavior and extension usage to improve your product
- **Google Analytics ID** - Your GA4 measurement ID (G-XXXXXXXXXX format)
- **Tracking Options:**
  - **Page Views** - Track page views on website
  - **Button Clicks** - Track button clicks and interactions
  - **User Actions** - Track user actions and feature usage
  - **Extension Usage** - Track extension usage and performance

**Accessibility Features** - Helps users with disabilities and improves usability for everyone (highly recommended for inclusivity)

**Standalone Website:**

- **Include Website** - A dedicated website helps with SEO, brand visibility, trust building, and provides support/documentation
- **Website Features** (if website is selected):
  - **Pricing Section** - Defaults to true if pricing model selected (recommended for monetized extensions)
  - **Testimonials Section** - Defaults to true (great for building trust and social proof)
  - **Authentication Features** - Defaults to true if authentication selected (recommended for user accounts)

**Smart Validation:**

- Database is automatically required when authentication or pricing features are selected
- Clear warnings and error messages guide users to valid configurations
- Firebase is suggested as default database for easy setup
- Website features default intelligently based on previous selections
- Google Analytics ID validation ensures proper GA4 measurement ID format (G-XXXXXXXXXX)

#### 3. 🔐 Comprehensive Authentication System

When authentication is enabled, the system includes:

**User Account Management:**

- Complete signup flow with email verification
- Secure login with remember me functionality
- Password change and reset password flows
- Account settings and profile management

**Security Measures:**

- Password requirements: Minimum 8 characters, uppercase, lowercase, number, and special character
- Rate limiting: Max 5 login attempts per 15 minutes
- Session management: Secure JWT tokens with refresh token rotation
- CSRF protection, input validation, SQL injection prevention
- XSS prevention, HTTPS only, secure headers (HSTS, CSP, etc.)

**Validation & Error Handling:**

- Real-time client-side validation with immediate feedback
- Comprehensive server-side validation on all endpoints
- User-friendly error messages without exposing system details
- Loading states and clear success feedback

**Authentication Methods:**

- **Email/Password**: Email verification, password reset via email, account lockout after failed attempts
- **Google OAuth**: Sign-in integration, profile syncing, account linking/unlinking
- **GitHub OAuth**: Sign-in integration, profile syncing, account linking/unlinking

**Database Schema & API Endpoints:**

- Complete database tables: Users, Sessions, Password_Resets, Email_Verifications
- Full REST API endpoints for all authentication operations
- OAuth callback endpoints for Google and GitHub

**Frontend Components:**

- Authentication context, forms, guards, and utilities
- Proper error handling and loading states
- Accessible forms with screen reader support

**Security Best Practices:**

- Store sensitive data in Chrome's secure storage
- Implement proper CORS policies
- Use environment variables for all secrets
- Log authentication events for security monitoring
- GDPR compliance for user data handling

#### 4. 🌐 Standalone Website Features

When a standalone website is selected, the system includes:

**Website Structure:**

- One-page landing site with multiple sections
- Privacy Policy page (required for Chrome Web Store)
- Terms of Service page
- Support/Contact page
- Responsive design for all devices

**Landing Page Sections:**

- Hero Section: Value proposition + CTA to install extension
- Features Section: Benefits, screenshots, GIFs
- Testimonials Section: User quotes and reviews (if enabled)
- Install Instructions: Demo video or step-by-step guide
- FAQ Section: Common questions and answers
- Footer: Links to privacy, support, GitHub, etc.

**Smart Feature Integration:**

- **Pricing Section**: Automatically included if pricing model selected, displays pricing tiers and features
- **Authentication Integration**: Automatically included if authentication selected, provides user account management on website
- **Content Generation**: Uses extension description to generate appropriate website content

**Technical Requirements:**

- SEO Optimized: Meta tags, structured data, sitemap
- Fast Loading: Optimized images, minified CSS/JS
- Analytics Ready: Google Analytics or similar
- Contact Form: Support request form
- Social Media: Open Graph tags for sharing

#### 5. 🏪 Chrome Web Store Listing Documentation

The system generates comprehensive Chrome Web Store listing documentation:

**Required Information for Store Listing:**

- Extension Name: The name that appears in the store
- Short Description: Brief description (max 132 characters)
- Long Description: Detailed description of features and benefits
- Category: Choose appropriate category (Productivity, Developer Tools, etc.)
- Tags: Keywords for discoverability

**Visual Assets:**

- Icons: 128x128 PNG icon (required)
- Screenshots: PNG or JPG, 640x400 or higher (at least 1 required)
- Promotional Video: Optional, via YouTube URL
- Promotional Images: Additional promotional graphics

**Content:**

- Languages Supported: List all supported languages
- Pricing: Free or paid (configured based on pricing model)
- Permissions: List of required permissions with explanations

**Legal & Support:**

- Privacy Policy URL: Required (points to your website)
- Support Website URL: Optional but recommended
- Terms of Service URL: Optional but recommended

**Submission Process:**

- Create developer account at Chrome Web Store Developer Dashboard
- Upload extension package (ZIP file)
- Fill in all required listing information
- Submit for review (typically 1-3 business days)
- Address any review feedback
- Publish to store

**Best Practices:**

- Write compelling descriptions that highlight value
- Use high-quality screenshots and videos
- Respond to user reviews and feedback
- Keep listing information up to date
- Monitor analytics and user feedback

#### 6. 💳 Monetization & Pricing

- Prompt for model and payment provider
- Scaffold integration files and pricing docs:
  - `docs/pricing-models.md`
  - `docs/payment-integration.md`
- **Note:** Pricing models automatically require a database for user management and payment tracking

#### 7. 📅 Database

- Prompt for database choice
- **Smart Requirements:** Database is automatically required when authentication or pricing features are selected
- Scaffold:
  - `infra/db/{provider}/`
  - `.env.example`
  - SDK, auth, sample query
  - GitHub secrets
  - `docs/database-{provider}.md`

#### 8. 🏠 Hosting

- Prompt for provider(s)
- Scaffold:
  - `infra/hosting/{provider}/`
  - CLI deploy script
  - `.env.example`
  - `docs/hosting-{provider}.md`
  - GitHub Actions deploy workflow (if applicable)

#### 9. 📑 Documentation

Scaffold based on features:

- `docs/ai-changelogs.md`
- `docs/ai-troubleshooting.md`
- `docs/prd.md`
- `docs/design-system.md`
- `docs/analytics-setup.md` (if analytics is enabled)

**Documentation Requirements**

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

- `docs/analytics-setup.md` (if analytics is enabled)
  Google Analytics setup and configuration guide, including:
  - How to obtain and configure GA4 measurement ID
  - Event tracking implementation
  - Privacy and consent management
  - Chrome Web Store compliance guidelines
