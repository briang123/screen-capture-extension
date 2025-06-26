import { ExtensionConfig } from './types.js';

export interface NextStepsInfo {
  immediateSteps: string[];
  aiAgentInstructions: string[];
  incrementalUpdates: string[];
  deploymentSteps: string[];
  troubleshooting: string[];
}

export function generateNextSteps(config: ExtensionConfig): NextStepsInfo {
  const immediateSteps = [
    '📄 **Review the generated AI prompt** in `docs/ai-project-prompt.md`',
    '🤖 **Copy the prompt content** and paste it to your AI agent (Cursor AI, Replit AI, Claude, etc.)',
    '📁 **Create a new directory** for your Chrome extension project',
    '📋 **Paste the AI prompt** and let the AI agent generate all your project files',
    '⚡ **Run the generated project** with `npm install` and `npm run dev`',
  ];

  const aiAgentInstructions = [
    '**For Cursor AI:** Open Cursor, create a new project, and paste the prompt in the chat',
    '**For Replit AI:** Create a new Repl and paste the prompt in the AI chat',
    '**For Claude/GPT:** Create a new conversation and paste the prompt',
    '**For GitHub Copilot:** Use the prompt in a new repository with Copilot enabled',
    '**Tip:** The AI agent will create all necessary files, dependencies, and documentation',
  ];

  const incrementalUpdates = [
    '🔄 **To add new features later:** Run `npm run init` in your project directory',
    '📝 **The CLI will detect existing features** and only prompt for new ones',
    '⚙️ **Configuration is saved** in `scaffold.json` for future updates',
    '🆕 **New features will be added** without overwriting your existing code',
    '📚 **Documentation will be updated** automatically with new features',
  ];

  const deploymentSteps = [
    '🏗️ **Build your extension:** Run `npm run build` to create the production version',
    '📦 **Create a ZIP file:** Run `npm run zip` to package for Chrome Web Store',
    '🏪 **Submit to Chrome Web Store:** Follow the guide in `docs/chrome-store-listing.md`',
    '🌐 **Deploy your website:** If you included a website, deploy it to your chosen hosting provider',
    '🔗 **Update store listing:** Add your website URL to the Chrome Web Store listing',
  ];

  const troubleshooting = [
    '❓ **Need help?** Check `docs/ai-troubleshooting.md` for common issues',
    '🐛 **Found a bug?** The troubleshooting guide includes solutions for most problems',
    '📖 **Want to learn more?** Read `docs/recipes.md` for common extension patterns',
    '🔄 **Want to start over?** Delete the project and run the CLI again',
    "💬 **Still stuck?** Check the project's GitHub issues or create a new one",
  ];

  // Add specific steps based on selected features
  if (config.authMethods && config.authMethods.some((method) => method !== 'none')) {
    immediateSteps.push(
      '🔐 **Set up authentication:** Configure your chosen auth providers (Google, GitHub, etc.)'
    );
    deploymentSteps.push(
      '🔑 **Configure auth secrets:** Add your OAuth credentials to environment variables'
    );
  }

  if (config.database && config.database !== 'none') {
    immediateSteps.push(
      '🗄️ **Set up database:** If your AI agent supports it (e.g., Replit), let it create the database and schema automatically. Otherwise, have the AI agent generate the necessary scripts and SQL statements to create the schema/tables, and run them manually.'
    );
    deploymentSteps.push(
      '🔧 **Configure database:** Add database connection strings to environment variables'
    );
  }

  if (config.includeWebsite) {
    immediateSteps.push(
      '🌐 **Customize website:** Edit the generated website files to match your brand'
    );
    deploymentSteps.push(
      '🚀 **Deploy website:** Upload website files to your chosen hosting provider'
    );
  }

  if (config.includeCookieBanner) {
    immediateSteps.push(
      '🍪 **Configure cookie banner:** Update cookie policy and consent settings'
    );
    deploymentSteps.push(
      '📋 **Update privacy policy:** Ensure cookie policy is included in privacy policy'
    );
  }

  if (config.pricingModel && config.pricingModel !== 'none') {
    immediateSteps.push(
      '💳 **Set up payments:** Configure your payment processor (Stripe, PayPal, etc.)'
    );
    deploymentSteps.push('💰 **Test payments:** Verify your payment flow works correctly');
  }

  return {
    immediateSteps,
    aiAgentInstructions,
    incrementalUpdates,
    deploymentSteps,
    troubleshooting,
  };
}

export function generateIncrementalUpdateGuide(): string {
  return `# Incremental Feature Updates

## How to Add New Features

### 1. Run the CLI Again
\`\`\`bash
npm run init
\`\`\`

### 2. The CLI Will:
- ✅ **Detect existing features** from your current configuration
- 📝 **Only prompt for new features** you haven't selected yet
- 🔄 **Preserve your existing code** and configuration
- 📚 **Update documentation** with new feature information

### 3. Common Update Scenarios

#### Adding Authentication Later
\`\`\`bash
npm run init
# Select authentication methods when prompted
# CLI will automatically require a database
\`\`\`

#### Adding a Website Later
\`\`\`bash
npm run init
# Select "Include Website" when prompted
# Choose website features (pricing, testimonials, auth)
\`\`\`

#### Adding AI Features Later
\`\`\`bash
npm run init
# Select AI providers when prompted
# CLI will suggest adding a database for conversation history
\`\`\`

#### Adding Pricing Later
\`\`\`bash
npm run init
# Select pricing model when prompted
# CLI will automatically require a database
\`\`\`

### 4. What Gets Updated

#### Files That Are Modified:
- \`docs/ai-project-prompt.md\` - Updated with new features
- \`scaffold.json\` - Configuration tracking file
- \`docs/ai-changelogs.md\` - Log of changes made

#### Files That Are Preserved:
- Your existing source code
- Custom modifications you've made
- Environment variables you've configured
- Database schemas you've set up

### 5. Configuration File

The CLI creates a \`scaffold.json\` file that tracks your configuration:

\`\`\`json
{
  "extensionName": "My Extension",
  "uiType": "popup",
  "tailwind": true,
  "authMethods": ["google"],
  "database": "firebase",
  "includeWebsite": true,
  "lastUpdated": "2024-01-15T10:30:00Z"
}
\`\`\`

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
1. **Check the changelog:** \`docs/ai-changelogs.md\` shows what changed
2. **Restore from backup:** Use your version control or backup
3. **Run CLI again:** The CLI is idempotent and safe to run multiple times
4. **Check configuration:** Verify \`scaffold.json\` has the correct settings

#### Common Issues:
- **Feature conflicts:** The CLI will warn you about incompatible combinations
- **Missing dependencies:** The AI prompt will include all necessary dependencies
- **Configuration drift:** The CLI will detect and suggest fixes for inconsistencies

### 8. Advanced Usage

#### Command Line Flags:
\`\`\`bash
# Force interactive mode
npm run init -- --interactive

# Preview changes without applying
npm run init -- --dry-run

# Update specific features only
npm run init -- --uiType=window --tailwind=false
\`\`\`

#### Configuration File:
You can also edit \`scaffold.json\` directly and run the CLI to apply changes:

\`\`\`bash
# Edit scaffold.json to add new features
# Then run CLI to apply changes
npm run init
\`\`\`

## Need Help?

- 📖 **Read the docs:** Check \`docs/ai-troubleshooting.md\` for solutions
- 🔍 **Check changelog:** See what changed in \`docs/ai-changelogs.md\`
- 💬 **Get support:** Create an issue on the project's GitHub repository
- 🎯 **Start fresh:** Delete the project and run the CLI again if needed

Remember: The CLI is designed to be safe and non-destructive. It will never overwrite your custom code without warning you first!`;
}

export function generateQuickStartGuide(config: ExtensionConfig): string {
  const { immediateSteps, aiAgentInstructions } = generateNextSteps(config);

  return `# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Generate Your Project
1. Copy the AI prompt from \`docs/ai-project-prompt.md\`
2. Paste it to your AI agent (Cursor AI, Replit AI, Claude, etc.)
3. Let the AI create all your project files

### Step 2: Set Up Your Project
\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Load extension in Chrome
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select your project's \`dist\` folder
\`\`\`

### Step 3: Customize Your Extension
- Edit \`src/popup/Popup.tsx\` for your main UI
- Modify \`manifest.json\` for extension settings
- Update \`src/background/background.ts\` for background logic

### Step 4: Test Your Extension
- Click the extension icon in Chrome toolbar
- Test all features you selected
- Check the browser console for any errors

### Step 5: Build for Production
\`\`\`bash
# Create production build
npm run build

# Create ZIP for Chrome Web Store
npm run zip
\`\`\`

## 📋 Immediate Next Steps

${immediateSteps.map((step) => `- ${step}`).join('\n')}

## 🤖 AI Agent Instructions

${aiAgentInstructions.map((instruction) => `- ${instruction}`).join('\n')}

## 🔧 Configuration Summary

**Extension:** ${config.extensionName}
**UI Type:** ${config.uiType}
**Features:** ${getFeatureSummary(config)}
**Authentication:** ${config.authMethods?.filter((m) => m !== 'none').join(', ') || 'None'}
**Database:** ${config.database !== 'none' ? config.database : 'None'}
${config.includeWebsite ? `**Website:** Yes (${getWebsiteFeatures(config)})` : '**Website:** No'}

## 📚 Documentation

- \`docs/prd.md\` - Product requirements and feature list
- \`docs/design-system.md\` - Design guidelines and components
- \`docs/recipes.md\` - Common extension patterns
- \`docs/chrome-store-listing.md\` - Chrome Web Store submission guide

## 🆘 Need Help?

- Check \`docs/ai-troubleshooting.md\` for common issues
- Read \`docs/recipes.md\` for implementation patterns
- Create an issue on GitHub if you're stuck

Happy coding! 🎉`;
}

function getFeatureSummary(config: ExtensionConfig): string {
  const features = [];
  if (config.tailwind) features.push('Tailwind CSS');
  if (config.i18n) features.push('i18n');
  if (config.optionsPage) features.push('Options Page');
  if (config.accessibility) features.push('Accessibility');
  if (config.aiProviders?.some((p) => p !== 'none')) features.push('AI Integration');
  if (config.pricingModel !== 'none') features.push('Pricing');
  return features.join(', ') || 'Basic features only';
}

function getWebsiteFeatures(config: ExtensionConfig): string {
  const features = [];
  if (config.includePricing) features.push('Pricing');
  if (config.includeTestimonials) features.push('Testimonials');
  if (config.includeAuth) features.push('Auth');
  return features.join(', ') || 'Basic website';
}
