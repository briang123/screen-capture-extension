# Example Project Structure and CLI Session

This document provides a sample output of what a generated Chrome Extension project might look like, including the directory structure and a sample CLI session.

---

## 📦 Sample Directory Structure

```
my-chrome-extension/
├── docs/
│   ├── ai-project-prompt.md
│   ├── chrome-store-listing.md
│   ├── feature-summary.md
│   └── ...
├── scaffold.json
├── src/
│   ├── background/
│   ├── content/
│   ├── popup/
│   ├── options/
│   └── ...
├── website/
│   ├── components/
│   ├── pages/
│   ├── public/
│   └── ...
├── package.json
├── vite.config.ts
└── ...
```

---

## 🖥️ Sample CLI Session

```
$ npm run init

🚀 Chrome Extension Boilerplate Generator

What is your extension name? My Awesome Extension
Describe your extension: Adds superpowers to your browser!
Choose UI type: Popup (Default)
Include Tailwind CSS for styling? (Y/n): Y
Include internationalization (i18n) support? (y/N): N
Include options page for settings? (y/N): Y
Include accessibility features? (Y/n): Y
Choose authentication methods: [ ] Google [ ] GitHub [x] None
Choose AI providers: [x] OpenAI [ ] Claude [ ] Gemini [ ] None
Choose database: Firebase
Choose pricing model: Freemium
Choose hosting provider: Vercel
Choose Chrome storage type: Sync
Include standalone website? (Y/n): Y
Choose website framework: React + Next.js (Recommended)
Include pricing information on website? (Y/n): Y
Include testimonials section on website? (Y/n): Y
Include authentication features on website? (Y/n): Y
Include GDPR-compliant cookie consent banner? (Y/n): Y
Include newsletter subscription feature? (Y/n): N
Include blog/news section? (Y/n): N
Include search functionality? (Y/n): N
Include Progressive Web App (PWA) features? (Y/n): N
Include status page for service monitoring? (Y/n): N
Include API documentation section? (Y/n): N
Include user dashboard for account management? (Y/n): N

✅ Files generated successfully!
📄 docs/ai-project-prompt.md
⚙️  scaffold.json

🚀 Next Steps:
  - Review the generated AI prompt in docs/ai-project-prompt.md
  - Copy the prompt content and paste it to your AI agent (Cursor AI, Replit AI, Claude, etc.)
  - ...
```

---

This example is for illustration. Your actual project structure and CLI session will reflect your selected features and configuration.
