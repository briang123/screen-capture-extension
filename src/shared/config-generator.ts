import { ExtensionConfig, GenerationResult } from './types.js';
import {
  generateNextSteps,
  generateIncrementalUpdateGuide,
  generateQuickStartGuide,
} from './next-steps.js';

export function generateAIPrompt(config: ExtensionConfig): string {
  const features = [];

  // Basic info
  features.push(`- Extension Name: ${config.extensionName}`);
  features.push(`- Extension Description: ${config.extensionDescription}`);

  // UI Type
  if (config.uiType === 'sidewindow') {
    features.push(
      '- Side Window (detached pop-out, ChatGPT-style): Opens in a dedicated side window, not injected into the page.'
    );
    features.push(
      '  - Use a background script to call chrome.windows.create({ url: "window.html", type: "popup", width: 400, height: 800 })'
    );
    features.push('  - The main extension action should only be a launcher, not the full UI.');
    features.push('  - Do NOT inject a UI overlay into the current page.');
  } else {
    features.push(`- UI Type: ${config.uiType}`);
  }

  // Features
  if (config.tailwind) features.push('- Tailwind CSS: Yes');
  if (config.i18n) features.push('- i18n (react-i18next): Yes');
  if (config.optionsPage) features.push('- Options Page: Yes');
  if (config.accessibility) features.push('- Accessibility Features: Yes');

  // Authentication
  if (config.authMethods && config.authMethods.length && !config.authMethods.includes('none'))
    features.push(`- Authentication: ${config.authMethods.join(', ')}`);

  // AI Integrations
  if (config.aiProviders && config.aiProviders.length && !config.aiProviders.includes('none'))
    features.push(`- AI Integrations: ${config.aiProviders.join(', ')}`);

  // Analytics
  if (config.analytics?.enabled) {
    features.push(`- Google Analytics: ${config.analytics.googleAnalyticsId}`);
    const trackingFeatures = [];
    if (config.analytics.trackPageViews) trackingFeatures.push('page views');
    if (config.analytics.trackButtonClicks) trackingFeatures.push('button clicks');
    if (config.analytics.trackUserActions) trackingFeatures.push('user actions');
    if (config.analytics.trackExtensionUsage) trackingFeatures.push('extension usage');
    if (trackingFeatures.length > 0) {
      features.push(`  - Tracking: ${trackingFeatures.join(', ')}`);
    }
  }

  // Backend
  if (config.database && config.database !== 'none') {
    features.push(`- Database: ${config.database}`);
    features.push(
      '  - If your AI agent supports it (e.g., Replit), create the database and schema automatically. Otherwise, generate the scripts and SQL statements to create the schema/tables, and instruct the user to run them manually.'
    );
  }
  if (config.pricingModel && config.pricingModel !== 'none')
    features.push(`- Pricing Model: ${config.pricingModel}`);
  if (
    config.hostingProviders &&
    config.hostingProviders.length &&
    !config.hostingProviders.includes('none')
  )
    features.push(`- Hosting: ${config.hostingProviders.join(', ')}`);
  if (config.storageType) features.push(`- Chrome Storage: ${config.storageType}`);

  // Website
  if (config.includeWebsite) {
    features.push('- Standalone Website: Yes');
    if (config.includePricing) features.push('  - Website includes pricing information');
    if (config.includeTestimonials) features.push('  - Website includes testimonials section');
    if (config.includeAuth) features.push('  - Website includes authentication features');
  }

  // Generate authentication-specific requirements
  let authRequirements = '';
  if (config.authMethods && config.authMethods.length && !config.authMethods.includes('none')) {
    authRequirements = generateAuthRequirements(config);
  }

  // Generate website-specific requirements
  let websiteRequirements = '';
  if (config.includeWebsite) {
    websiteRequirements = generateWebsiteRequirements(config);
  }

  // Generate analytics-specific requirements
  const analyticsRequirements = generateAnalyticsRequirements(config);

  // Generate Chrome Web Store documentation
  const chromeStoreDocs = generateChromeStoreDocs();

  // Generate next steps and guidance
  const nextSteps = generateNextSteps(config);
  const incrementalGuide = generateIncrementalUpdateGuide();
  const quickStartGuide = generateQuickStartGuide(config);

  return `# Chrome Extension Project Specification

## Project Overview
Create a complete Chrome Extension using React, TypeScript (strict mode), and Vite with the following specifications:

## Extension Details
**Extension Name:** ${config.extensionName}
**Description:** ${config.extensionDescription}

## Selected Features
${features.join('\n')}${authRequirements}${websiteRequirements}${analyticsRequirements}${chromeStoreDocs}

## Required Files and Structure

### Core Configuration
- \`manifest.json\` (Manifest V3)
- \`package.json\` with all necessary dependencies
- \`tsconfig.json\` (TypeScript strict mode)
- \`vite.config.ts\` (Vite configuration for Chrome Extension)
- \`.env.example\` (environment variables template)
- \`.gitignore\` (appropriate exclusions)

### Icon Requirements
**CRITICAL:** You must create placeholder PNG icon files for the Chrome extension to load properly.

**Required Icon Files:**
- \`icons/icon16.png\` (16x16 pixels)
- \`icons/icon32.png\` (32x32 pixels)
- \`icons/icon48.png\` (48x48 pixels)
- \`icons/icon128.png\` (128x128 pixels)

**Icon Creation Instructions for AI Agent:**
- **Create placeholder PNG files** for all required icon sizes if they don't exist
- Use simple, solid-color designs with basic shapes or letters (e.g., "SC" for Screen Capture)
- Ensure the icons are visually consistent across all sizes
- The icons should be lightweight and load quickly
- If the AI cannot generate actual PNG files, provide clear instructions for the user to create them manually

**Icon File Structure:**
\`\`\`
icons/
├── icon16.png
├── icon32.png
├── icon48.png
└── icon128.png
\`\`\`

**Important Notes:**
- Chrome **will not load the extension** if any of these icon files are missing
- The manifest.json references these exact filenames
- Icons must be copied to the \`dist/icons/\` directory during build
- Placeholder icons are acceptable for initial development and testing

### Build Output Requirements
- After building, the \`dist\` folder **must contain**:
  - All compiled JS/CSS/HTML assets
  - \`manifest.json\` (copied from project root)
  - \`icons/\` directory with all required PNG files:
    - \`icon16.png\`
    - \`icon32.png\`
    - \`icon48.png\`
    - \`icon128.png\`
- If using Vite, configure the build to copy these files using a plugin or post-build script
- If the plugin fails, add a fallback shell command:
  \`\`\`bash
  cp manifest.json dist/
  cp -r icons dist/
  \`\`\`
- **The extension will not load in Chrome** if \`manifest.json\` or any required icon files are missing from \`dist\`

### Source Code Structure
- \`src/popup/Popup.tsx\` (React popup component)
- \`src/popup/popup.html\` (popup HTML entry)
- \`src/background/background.ts\` (service worker)
- \`src/content/content.ts\` (content script)
- \`src/utils/\` (utility functions)${
    config.authMethods && config.authMethods.length && !config.authMethods.includes('none')
      ? `
- \`src/auth/\` (authentication components and utilities)
- \`src/components/auth/\` (authentication UI components)
- \`src/hooks/useAuth.ts\` (authentication hook)
- \`src/contexts/AuthContext.tsx\` (authentication context)`
      : ''
  }${
    config.includeWebsite
      ? `
- \`website/\` (standalone website files)
- \`website/index.html\` (landing page)
- \`website/privacy.html\` (privacy policy)
- \`website/terms.html\` (terms of service)
- \`website/support.html\` (support page)
- \`website/assets/\` (website assets)
- \`website/components/\` (reusable website components)
- \`website/design-system/\` (shared design tokens and themes)`
      : ''
  }

### Styling
${config.tailwind ? '- Tailwind CSS configuration and imports (see design-system.md)' : '- Basic CSS styling (See design-system.md'}

### Internationalization
${config.i18n ? '- react-i18next setup with sample translations' : '- No i18n required'}

### Development Tools
- ESLint configuration
- Prettier configuration
- Testing setup (Vitest)
- Build scripts (\`npm run dev\`, \`npm run build\`, \`npm run zip\`)

## Extension Modes

- Popup UI (in \`src/popup/\`) with example state persisted via \`chrome.storage.sync\`
- Detached Window UI (in \`src/window/\`) launched from popup, with message passing
- Optional Options page with settings persisted to chosen storage

## Dev Tooling

- Vite-powered HMR
- Scripts: \`clean\`, \`dev\`, \`build\`, \`zip\`
- Module path aliases like \`@components\`, \`@utils\`, \`@popup\`
- Auto-copy static assets to \`dist/\`

## Permissions & Security

- Scaffold only necessary permissions in \`manifest.json\`
- Dynamic permission utilities
- Baseline Content Security Policy configured${
    config.authMethods && config.authMethods.length && !config.authMethods.includes('none')
      ? `
- Authentication-related permissions (identity, storage)
- Secure storage for authentication tokens
- Background script for token refresh management`
      : ''
  }

## Testing

- Vitest or Jest setup
- Mock Chrome APIs for UI testing
- Unit and integration test examples for UI, background, auth flows, messaging${
    config.authMethods && config.authMethods.length && !config.authMethods.includes('none')
      ? `
- Authentication flow testing (login, register, password reset)
- Security testing (rate limiting, validation, token management)
- Mock authentication providers for testing`
      : ''
  }

## Documentation Requirements

Include these files:

- \`docs/ai-changelogs.md\`  
  Log of AI-generated feature changes, grouped by date and issue/feature.

- \`docs/ai-troubleshooting.md\`  
  Troubleshooting history (grouped by issue type + date). Additive only, newest at top.

- \`docs/prd.md\`  
  Product requirements doc. AI will mark items ✅ when completed, and update notes.

- \`docs/design-system.md\`  
  A modern, themeable design system tailored for **Chrome Extensions**, including:
  - Color tokens with light/dark mode (toggle capability)
  - Suggested emotion-based palettes
  - CSS variables for typography, spacing, radius, shadows, etc
  - Button, modal, card, form style
  - Create base components that can be inherited or extended
  - CSS folder structure (\`/styles/\`)
  - Popup/window layout support
  - **Shared design system for both extension and website**
  - **Mobile-first responsive design patterns**
  - **Theme switching implementation**
  - **Component library for cross-platform consistency**
  - Prompts you can use with an AI to scaffold design components

- \`docs/recipes.md\`
  Cookbook of common extension patterns, such as:
  - Messaging between popup and background
  - Dynamic content script injection
  - Debugging extension UI locally
  - Handling permissions dynamically
  - How to reset or inspect \`chrome.storage\`${
    config.authMethods && config.authMethods.length && !config.authMethods.includes('none')
      ? `
  - Authentication flow implementation
  - Token management and refresh strategies
  - Secure storage practices
  - OAuth integration patterns`
      : ''
  }
  - **Theme switching and persistence**
  - **Responsive design implementation**
  - **Design system integration**

- \`docs/chrome-store-listing.md\`
  Complete guide for Chrome Web Store submission, including:
  - Required information and assets
  - Submission process and best practices
  - Store listing optimization tips
  - Review process guidelines

- \`docs/quick-start.md\`
  ${quickStartGuide}

- \`docs/incremental-updates.md\`
  ${incrementalGuide}

## Accessibility & UX
- Keyboard navigable components
- Focus traps in modals
- Custom alert/notification system with ARIA support
- Optional theme toggler (light/dark/high-contrast)${
    config.authMethods && config.authMethods.length && !config.authMethods.includes('none')
      ? `
- Accessible authentication forms with proper labels and error announcements
- Screen reader friendly error messages
- Keyboard navigation for all authentication flows`
      : ''
  }
- **Mobile-first responsive design**
- **Touch-friendly interface elements**
- **WCAG 2.1 AA compliance**

## README.md Requirements
- Project intro
- CLI usage
- Dev/build instructions
- Chrome loading instructions
- File structure explanation${
    config.authMethods && config.authMethods.length && !config.authMethods.includes('none')
      ? `
- Authentication setup instructions
- Environment variable configuration
- Database setup guide
- Security considerations`
      : ''
  }${
    config.includeWebsite
      ? `
- Website deployment instructions
- Chrome Web Store submission guide
- **Design system documentation**
- **Theme switching guide**
- **Responsive design guidelines**`
      : ''
  }

## Next Steps for User

### Immediate Actions Required:
${nextSteps.immediateSteps.map((step) => `- ${step}`).join('\n')}

### AI Agent Instructions:
${nextSteps.aiAgentInstructions.map((instruction) => `- ${instruction}`).join('\n')}

### Incremental Updates:
${nextSteps.incrementalUpdates.map((step) => `- ${step}`).join('\n')}

### Deployment Steps:
${nextSteps.deploymentSteps.map((step) => `- ${step}`).join('\n')}

### Troubleshooting:
${nextSteps.troubleshooting.map((step) => `- ${step}`).join('\n')}

## Bonus Features
- Zip uploader CLI command
- AI-aware design guidelines for future extensions${
    config.authMethods && config.authMethods.includes('email')
      ? `
- Email templates for verification and password reset
- Account activity logging
- Two-factor authentication support`
      : ''
  }${
    config.includeWebsite
      ? `
- Website analytics integration
- Newsletter signup functionality
- Social media sharing optimization
- **Progressive Web App (PWA) features**
- **Search functionality**
- **Blog/News section**
- **User dashboard (if auth enabled)**
- **API documentation page**
- **Status page for service monitoring**`
      : ''
  }

## Requirements
- All files must include inline \`// TODO\`, \`// CONFIGURE\`, or \`// REMOVE IF UNUSED\` comments
- Use React 18+ with TypeScript strict mode
- Follow Chrome Extension Manifest V3 best practices
- Include proper error handling and accessibility features
- Add comprehensive documentation in \`docs/\` directory${
    config.authMethods && config.authMethods.length && !config.authMethods.includes('none')
      ? `
- Implement all security measures listed in authentication requirements
- Use secure coding practices for all authentication-related code
- Include comprehensive error handling for all authentication flows
- Implement proper logging for security monitoring`
      : ''
  }${
    config.includeWebsite
      ? `
- Create SEO-optimized website with proper meta tags
- Implement responsive design for all devices
- Include contact form and support functionality
- Optimize for fast loading and performance
- **Ensure design system consistency between extension and website**
- **Implement theme switching with persistent preferences**
- **Use mobile-first responsive design approach**
- **Create reusable component library**`
      : ''
  }

## Instructions for AI Agent
1. Create all files according to the specification above
2. Ensure all dependencies are properly listed in \`package.json\`
3. Include appropriate TypeScript types and interfaces
4. Add sample usage and configuration comments
5. Create a working Chrome Extension that can be loaded in developer mode
6. Include all documentation files with proper structure and content
7. Implement accessibility features and UX best practices
8. Add bonus features where appropriate
9. **CRITICAL: Create placeholder PNG icon files** for all required icon sizes (16x16, 32x32, 48x48, 128x128)
10. **Ensure the build process copies icons to \`dist/icons/\`** directory
11. **Verify manifest.json references correct icon paths** and that Chrome can load the extension without icon errors${
    config.authMethods && config.authMethods.length && !config.authMethods.includes('none')
      ? `
12. Implement comprehensive authentication system with all security measures
13. Create secure API endpoints and database schema
14. Implement proper token management and session handling
15. Add comprehensive testing for all authentication flows`
      : ''
  }${
    config.includeWebsite
      ? `
16. Create standalone website with all required pages
17. Implement responsive design and SEO optimization
18. Include contact forms and support functionality
19. Optimize for performance and user experience
20. **Create unified design system for extension and website**
21. **Implement theme switching with light/dark mode support**
22. **Use mobile-first responsive design approach**
23. **Create reusable component library for consistency**`
      : ''
  }

Please generate all the necessary files for this Chrome Extension project.

---

## Additional Instructions for AI Agent

After generating all project files, create:

- A comprehensive \`README.md\` in the project root, including:
  - Project overview (from user config)
  - Getting started instructions (install, run, build, test, deploy)
  - List of included features (extension, website, tech stack, options)
  - CLI usage for incremental updates
  - Where to find documentation
  - Directory structure
  - Any smart defaults or important notes
  - Support/contact info
- A \`docs/README.md\` in the docs folder, summarizing all documentation folder contents, explain how to use the documentation, link to key docs, provide ToC for docs/ directory.
- Ensure all files are valid, linted, and error-free.
- The content of these files should be based on the user's configuration and selected features.
`;
}

function generateAuthRequirements(config: ExtensionConfig): string {
  return `

## Authentication Requirements

### User Account Management
- **Account Creation**: Complete signup flow with email verification
- **Login System**: Secure login with remember me functionality
- **Password Management**: Change password and reset password flows
- **Account Settings**: Profile management and account preferences

### Security Measures
- **Password Requirements**: Minimum 8 characters, require uppercase, lowercase, number, and special character
- **Rate Limiting**: Implement rate limiting on login attempts (max 5 attempts per 15 minutes)
- **Session Management**: Secure JWT tokens with refresh token rotation
- **CSRF Protection**: Implement CSRF tokens for all form submissions
- **Input Validation**: Server-side validation for all user inputs
- **SQL Injection Prevention**: Use parameterized queries or ORM
- **XSS Prevention**: Sanitize all user inputs and outputs
- **HTTPS Only**: All API calls must use HTTPS
- **Secure Headers**: Implement security headers (HSTS, CSP, etc.)

### Validation & Error Handling
- **Real-time Validation**: Client-side validation with immediate feedback
- **Server-side Validation**: Comprehensive validation on all endpoints
- **Error Messages**: User-friendly error messages without exposing system details
- **Loading States**: Proper loading indicators during authentication operations
- **Success Feedback**: Clear success messages and redirects

### Authentication Methods
${
  config.authMethods.includes('email')
    ? `
**Email/Password Authentication:**
- Email verification required for new accounts
- Password reset via email with secure tokens
- Account lockout after failed attempts
- Email change verification process`
    : ''
}
${
  config.authMethods.includes('google')
    ? `
**Google OAuth:**
- Google Sign-In integration
- Handle Google account linking/unlinking
- Sync Google profile data (name, email, avatar)
- Handle Google account deletion scenarios`
    : ''
}
${
  config.authMethods.includes('github')
    ? `
**GitHub OAuth:**
- GitHub Sign-In integration
- Handle GitHub account linking/unlinking
- Sync GitHub profile data (username, email, avatar)
- Handle GitHub account deletion scenarios`
    : ''
}

### Database Schema Requirements
- **Users Table**: id, email, password_hash, name, avatar_url, created_at, updated_at, email_verified, last_login
- **Sessions Table**: id, user_id, token, refresh_token, expires_at, created_at
- **Password_Resets Table**: id, user_id, token, expires_at, created_at
- **Email_Verifications Table**: id, user_id, token, expires_at, created_at

### API Endpoints Required
- POST /auth/register - User registration
- POST /auth/login - User login
- POST /auth/logout - User logout
- POST /auth/refresh - Refresh access token
- POST /auth/verify-email - Email verification
- POST /auth/reset-password - Request password reset
- POST /auth/reset-password/confirm - Confirm password reset
- PUT /auth/change-password - Change password
- PUT /auth/profile - Update profile
- GET /auth/profile - Get user profile
- DELETE /auth/account - Delete account
${
  config.authMethods.includes('google')
    ? `
- GET /auth/google - Google OAuth initiation
- GET /auth/google/callback - Google OAuth callback`
    : ''
}
${
  config.authMethods.includes('github')
    ? `
- GET /auth/github - GitHub OAuth initiation
- GET /auth/github/callback - GitHub OAuth callback`
    : ''
}

### Frontend Components Required
- **AuthProvider**: React context for authentication state
- **LoginForm**: Login form with validation
- **RegisterForm**: Registration form with validation
- **PasswordResetForm**: Password reset request form
- **PasswordChangeForm**: Password change form
- **ProfileForm**: User profile management form
- **AuthGuard**: Route protection component
- **LoadingSpinner**: Loading state component
- **ErrorMessage**: Error display component

### Security Best Practices
- Store sensitive data in Chrome's secure storage
- Implement proper CORS policies
- Use environment variables for all secrets
- Log authentication events for security monitoring
- Implement account recovery options
- Regular security audits and updates
- GDPR compliance for user data handling`;
}

function generateWebsiteRequirements(config: ExtensionConfig): string {
  const framework = config.websiteFramework || 'vite';
  const isNextJS = framework === 'nextjs';

  return `

## Standalone Website Requirements

### Website Framework: React + ${framework.toUpperCase()}
${
  isNextJS
    ? `
**Next.js (Recommended for SEO):**
- Server-side rendering for optimal SEO
- Static site generation for fast loading
- Dynamic meta tags for social sharing
- Built-in image optimization
- API routes for backend functionality
- Automatic code splitting
- TypeScript support out of the box`
    : `
**Vite (Lightweight & Fast):**
- Fast development with hot reload
- Optimized production builds
- Smaller bundle sizes
- Simple configuration
- Perfect for simple landing pages`
}

### Design System & Consistency
- **Unified Design System**: Use the same design tokens, colors, typography, and components as the Chrome extension
- **Shared Theme System**: Light and dark mode themes that match the extension's theme system
- **Theme Switcher**: Toggle between light/dark modes with persistent user preference
- **Consistent Branding**: Same logo, colors, fonts, and visual language across extension and website
- **Component Library**: Reusable components that work in both extension and website contexts

### Responsive Design
- **Mobile-First Approach**: Design for mobile devices first, then enhance for larger screens
- **Responsive Breakpoints**: Support for mobile (320px+), tablet (768px+), desktop (1024px+), and large screens (1440px+)
- **Touch-Friendly**: Large touch targets, proper spacing for mobile interaction
- **Performance Optimized**: Fast loading on mobile networks with optimized images and assets
- **Progressive Enhancement**: Core functionality works on all devices, enhanced features on capable devices

### Website Structure
- **One-page landing site** with multiple sections
- **Privacy Policy page** (required for Chrome Web Store)
- **Terms of Service page**
- **Support/Contact page**
- **Responsive design** for all devices

### Landing Page Sections
- **Hero Section**: Value proposition + CTA to install extension
- **Features Section**: Benefits, screenshots, GIFs
${config.includeTestimonials ? '- **Testimonials Section**: User quotes and reviews' : ''}
- **Install Instructions**: Demo video or step-by-step guide
- **FAQ Section**: Common questions and answers
- **Footer**: Links to privacy, support, GitHub, etc.

### Website Features
${
  config.includePricing
    ? `
**Pricing Section:**
- Display pricing tiers and features
- Integration with selected pricing model (${config.pricingModel})
- Clear value proposition for each tier
- Call-to-action buttons for each plan`
    : ''
}
${
  config.includeAuth
    ? `
**Authentication Integration:**
- User account management on website
- Login/register functionality
- Profile management
- Integration with extension authentication`
    : ''
}
${
  config.includeCookieBanner
    ? `
**Cookie Consent Banner:**
- GDPR-compliant cookie consent banner
- Cookie preferences management
- Analytics and tracking consent
- Privacy-first design
- Cookie policy integration`
    : ''
}
${
  config.includeNewsletter
    ? `
**Newsletter Integration:**
- Email signup form
- Integration with email service (Mailchimp, ConvertKit, etc.)
- Subscription management
- GDPR-compliant opt-in`
    : ''
}
${
  config.includeBlog
    ? `
**Blog/News Section:**
- Content management system
- SEO-optimized blog posts
- Categories and tags
- Search functionality
- RSS feed`
    : ''
}
${
  config.includeSearch
    ? `
**Search Functionality:**
- Site-wide search
- Search filters and sorting
- Search result highlighting
- Search analytics`
    : ''
}
${
  config.includePWA
    ? `
**Progressive Web App:**
- Service worker for offline support
- App manifest for installation
- Push notifications
- Background sync`
    : ''
}
${
  config.includeStatusPage
    ? `
**Status Page:**
- Service uptime monitoring
- Incident reporting
- Status history
- Email notifications`
    : ''
}
${
  config.includeAPIDocs
    ? `
**API Documentation:**
- Interactive API documentation
- Code examples
- Authentication guides
- Rate limiting information`
    : ''
}
${
  config.includeUserDashboard
    ? `
**User Dashboard:**
- Personal account overview
- Usage statistics
- Settings management
- Activity history`
    : ''
}

### Technical Requirements
- **SEO Optimized**: Meta tags, structured data, sitemap
- **Fast Loading**: Optimized images, minified CSS/JS
- **Analytics Ready**: Google Analytics or similar
- **Contact Form**: Support request form
- **Social Media**: Open Graph tags for sharing
- **Accessibility**: WCAG 2.1 AA compliance
- **Cross-Browser**: Support for Chrome, Firefox, Safari, Edge
- **Performance**: Lighthouse score 90+ for all metrics

### File Structure
${
  isNextJS
    ? `
**Next.js Structure:**
- \`website/pages/\` - Page components and routing
- \`website/components/\` - Reusable components
- \`website/styles/\` - CSS and styling
- \`website/public/\` - Static assets
- \`website/lib/\` - Utility functions
- \`website/api/\` - API routes
- \`website/next.config.js\` - Next.js configuration
- \`website/tailwind.config.js\` - Tailwind configuration`
    : `
**Vite Structure:**
- \`website/index.html\` - Landing page
- \`website/privacy.html\` - Privacy policy
- \`website/terms.html\` - Terms of service
- \`website/support.html\` - Support page
- \`website/assets/\` - Images, CSS, JS
- \`website/css/\` - Stylesheets
- \`website/js/\` - JavaScript files
- \`website/components/\` - Reusable components
- \`website/design-system/\` - Design tokens and theme system`
}${
    config.includeCookieBanner
      ? `
- \`website/components/cookie-banner.js\` - Cookie consent component
- \`website/components/cookie-preferences.js\` - Cookie preferences modal`
      : ''
  }

### Theme System
- **CSS Custom Properties**: Use CSS variables for consistent theming
- **Theme Switcher Component**: Toggle between light/dark modes
- **Persistent Preference**: Remember user's theme choice
- **System Preference**: Respect user's OS theme preference
- **Smooth Transitions**: Animated theme switching
- **Extension Sync**: Theme preference syncs with extension (if auth enabled)

### Design System Integration
- **Shared Color Palette**: Same colors used in extension and website
- **Typography Scale**: Consistent font sizes and line heights
- **Spacing System**: Unified spacing scale (4px, 8px, 16px, 24px, 32px, etc.)
- **Component Patterns**: Buttons, cards, forms, modals follow same patterns
- **Icon System**: Consistent iconography across platforms
- **Animation Library**: Shared micro-interactions and transitions

### SEO Optimization
${
  isNextJS
    ? `
**Next.js SEO Features:**
- Server-side rendering for instant content
- Dynamic meta tags with \`next/head\`
- Static site generation for fast loading
- Image optimization with \`next/image\`
- Automatic sitemap generation
- Structured data (JSON-LD)
- Open Graph and Twitter cards
- Canonical URLs
- Robots.txt configuration`
    : `
**Vite SEO Features:**
- Pre-rendering with \`vite-plugin-ssr\` or similar
- Dynamic meta tag management
- Static site generation options
- Image optimization
- Manual sitemap generation
- Structured data implementation
- Open Graph and Twitter cards
- Canonical URLs setup`
}`;
}

function generateAnalyticsRequirements(config: ExtensionConfig): string {
  if (!config.analytics?.enabled) return '';

  return `

## Google Analytics Integration

**Google Analytics ID:** ${config.analytics.googleAnalyticsId}

**Tracking Configuration:**
${config.analytics.trackPageViews ? '- Page views tracking enabled' : ''}
${config.analytics.trackButtonClicks ? '- Button clicks and interactions tracking enabled' : ''}
${config.analytics.trackUserActions ? '- User actions and feature usage tracking enabled' : ''}
${config.analytics.trackExtensionUsage ? '- Extension usage and performance tracking enabled' : ''}

**Implementation Requirements:**

### Website Analytics (if website is included)
- Install and configure Google Analytics 4 (GA4) with the provided measurement ID
- Track page views automatically on all website pages
- Track button clicks and form submissions as custom events
- Track user engagement metrics (time on page, scroll depth, etc.)
- Implement proper consent management for GDPR compliance
- Add analytics to the privacy policy and cookie banner

### Extension Analytics
- Track extension installation and uninstallation events
- Track feature usage within the extension (popup opens, options page visits, etc.)
- Track user interactions with extension UI elements
- Monitor extension performance metrics
- Track authentication events (login, logout, signup) if authentication is enabled
- Track AI feature usage if AI providers are enabled

### Security & Privacy
- Ensure analytics data is anonymized and doesn't contain PII
- Implement proper consent flows for analytics tracking
- Store analytics configuration securely in environment variables
- Follow Chrome Web Store policies for analytics usage
- Provide users with opt-out options for analytics tracking

### Environment Configuration
- Add \`VITE_GOOGLE_ANALYTICS_ID\` or \`NEXT_PUBLIC_GOOGLE_ANALYTICS_ID\` to environment variables
- Configure analytics in both development and production environments
- Set up proper event tracking for all user interactions
- Implement error tracking and performance monitoring

### Documentation
- Document analytics setup and configuration
- Provide instructions for viewing analytics data
- Include privacy policy updates for analytics usage
- Document how to disable analytics for privacy-conscious users`;
}

function generateChromeStoreDocs(): string {
  return `

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
\`https://chromewebstore.google.com/detail/your-extension-id\`

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
- Monitor analytics and user feedback`;
}

export function generateExtension(config: ExtensionConfig): GenerationResult {
  try {
    const aiPrompt = generateAIPrompt(config);
    return {
      success: true,
      aiPrompt,
      config,
      filesGenerated: ['docs/ai-project-prompt.md'],
      // Optionally, you can return the content for writing by the CLI
      // e.g. readmeContent: readme, docsReadmeContent: docsReadme
    };
  } catch (error) {
    return {
      success: false,
      aiPrompt: '',
      config,
      filesGenerated: [],
      errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
    };
  }
}
