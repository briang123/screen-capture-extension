#!/usr/bin/env ts-node --esm

import {
  ExtensionConfig,
  AuthMethod,
  AiProvider,
  Database,
  PricingModel,
  HostingProvider,
  StorageType,
  WebsiteFramework,
} from '../src/shared/types.js';
import { validateConfig } from '../src/shared/validation.js';
import { generateExtension } from '../src/shared/config-generator.js';
import { generateNextSteps } from '../src/shared/next-steps.js';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import enquirer from 'enquirer';

interface CLIArgs {
  interactive?: boolean;
  dryRun?: boolean;
  extensionName?: string;
  extensionDescription?: string;
  uiType?: string;
  tailwind?: boolean;
  i18n?: boolean;
  optionsPage?: boolean;
  accessibility?: boolean;
  authMethods?: string[];
  aiProviders?: string[];
  database?: string;
  pricingModel?: string;
  hostingProviders?: string[];
  storageType?: string;
  analyticsEnabled?: boolean;
  googleAnalyticsId?: string;
  trackPageViews?: boolean;
  trackButtonClicks?: boolean;
  trackUserActions?: boolean;
  trackExtensionUsage?: boolean;
  includeWebsite?: boolean;
  websiteFramework?: string;
  includePricing?: boolean;
  includeTestimonials?: boolean;
  includeAuth?: boolean;
  includeCookieBanner?: boolean;
  includeNewsletter?: boolean;
  includeBlog?: boolean;
  includeSearch?: boolean;
  includePWA?: boolean;
  includeStatusPage?: boolean;
  includeAPIDocs?: boolean;
  includeUserDashboard?: boolean;
}

async function main() {
  const argv = (await yargs(hideBin(process.argv))
    .option('interactive', {
      alias: 'i',
      type: 'boolean',
      description: 'Run in interactive mode',
      default: true,
    })
    .option('dryRun', {
      alias: 'd',
      type: 'boolean',
      description: 'Preview changes without applying them',
      default: false,
    })
    .option('extensionName', {
      type: 'string',
      description: 'Extension name',
    })
    .option('extensionDescription', {
      type: 'string',
      description: 'Extension description',
    })
    .option('uiType', {
      type: 'string',
      choices: ['popup', 'window', 'sidewindow'],
      description: 'UI type',
    })
    .option('tailwind', {
      type: 'boolean',
      description: 'Include Tailwind CSS',
    })
    .option('i18n', {
      type: 'boolean',
      description: 'Include internationalization',
    })
    .option('optionsPage', {
      type: 'boolean',
      description: 'Include options page',
    })
    .option('accessibility', {
      type: 'boolean',
      description: 'Include accessibility features',
    })
    .option('authMethods', {
      type: 'array',
      description: 'Authentication methods',
    })
    .option('aiProviders', {
      type: 'array',
      description: 'AI providers',
    })
    .option('database', {
      type: 'string',
      description: 'Database type',
    })
    .option('pricingModel', {
      type: 'string',
      description: 'Pricing model',
    })
    .option('hostingProviders', {
      type: 'array',
      description: 'Hosting providers',
    })
    .option('storageType', {
      type: 'string',
      description: 'Chrome storage type',
    })
    .option('analyticsEnabled', {
      type: 'boolean',
      description: 'Include Google Analytics',
    })
    .option('googleAnalyticsId', {
      type: 'string',
      description: 'Google Analytics ID',
    })
    .option('trackPageViews', {
      type: 'boolean',
      description: 'Track page views',
    })
    .option('trackButtonClicks', {
      type: 'boolean',
      description: 'Track button clicks',
    })
    .option('trackUserActions', {
      type: 'boolean',
      description: 'Track user actions',
    })
    .option('trackExtensionUsage', {
      type: 'boolean',
      description: 'Track extension usage',
    })
    .option('includeWebsite', {
      type: 'boolean',
      description: 'Include standalone website',
    })
    .option('websiteFramework', {
      type: 'string',
      choices: ['nextjs', 'vite'],
      description: 'Website framework (nextjs or vite)',
    })
    .option('includePricing', {
      type: 'boolean',
      description: 'Include pricing on website',
    })
    .option('includeTestimonials', {
      type: 'boolean',
      description: 'Include testimonials on website',
    })
    .option('includeAuth', {
      type: 'boolean',
      description: 'Include auth on website',
    })
    .option('includeCookieBanner', {
      type: 'boolean',
      description: 'Include GDPR-compliant cookie consent banner',
    })
    .option('includeNewsletter', {
      type: 'boolean',
      description: 'Include newsletter feature',
    })
    .option('includeBlog', {
      type: 'boolean',
      description: 'Include blog feature',
    })
    .option('includeSearch', {
      type: 'boolean',
      description: 'Include search feature',
    })
    .option('includePWA', {
      type: 'boolean',
      description: 'Include PWA feature',
    })
    .option('includeStatusPage', {
      type: 'boolean',
      description: 'Include status page feature',
    })
    .option('includeAPIDocs', {
      type: 'boolean',
      description: 'Include API docs feature',
    })
    .option('includeUserDashboard', {
      type: 'boolean',
      description: 'Include user dashboard feature',
    })
    .help().argv) as CLIArgs;

  let config: ExtensionConfig;

  if (argv.interactive) {
    config = await runInteractiveMode();
  } else {
    config = await runFlagMode(argv);
  }

  // Validate configuration
  const validation = validateConfig(config);
  if (!validation.isValid) {
    console.error('❌ Configuration validation failed:');
    validation.errors.forEach((error) => console.error(`  - ${error}`));
    process.exit(1);
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️  Configuration warnings:');
    validation.warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  // Generate the extension
  const result = generateExtension(config);

  if (!result.success) {
    console.error('❌ Generation failed:');
    result.errors?.forEach((error) => console.error(`  - ${error}`));
    process.exit(1);
  }

  // Write files
  if (!argv.dryRun) {
    writeFileSync('docs/ai-project-prompt.md', result.aiPrompt);
    writeFileSync(
      'scaffold.json',
      JSON.stringify(
        {
          ...config,
          lastUpdated: new Date().toISOString(),
          version: '1.0.0',
        },
        null,
        2
      )
    );
    // README files are now generated by the AI agent as instructed in the ai-project-prompt.md

    console.log('✅ Files generated successfully!');
    console.log('📄 docs/ai-project-prompt.md');
    console.log('⚙️  scaffold.json');
  } else {
    console.log('🔍 Dry run - no files written');
    console.log('📄 Would write docs/ai-project-prompt.md');
    console.log('⚙️  Would write scaffold.json');
  }

  // Show next steps
  const nextSteps = generateNextSteps(config);

  console.log('\n🚀 Next Steps:');
  console.log('==============');

  console.log('\n📋 Immediate Actions Required:');
  nextSteps.immediateSteps.forEach((step) => console.log(`  - ${step}`));

  console.log('\n🤖 AI Agent Instructions:');
  nextSteps.aiAgentInstructions.forEach((instruction) => console.log(`  - ${instruction}`));

  console.log('\n🔄 Incremental Updates:');
  nextSteps.incrementalUpdates.forEach((step) => console.log(`  - ${step}`));

  console.log('\n🏗️  Deployment Steps:');
  nextSteps.deploymentSteps.forEach((step) => console.log(`  - ${step}`));

  console.log('\n❓ Troubleshooting:');
  nextSteps.troubleshooting.forEach((step) => console.log(`  - ${step}`));
}

async function runInteractiveMode(): Promise<ExtensionConfig> {
  console.log('🚀 Chrome Extension Boilerplate Generator\n');

  // Load existing config if available
  let existingConfig: Partial<ExtensionConfig> = {};
  if (existsSync('scaffold.json')) {
    try {
      existingConfig = JSON.parse(readFileSync('scaffold.json', 'utf8'));
      console.log('📁 Found existing configuration. You can update or start fresh.\n');
    } catch {
      console.log("⚠️  Found scaffold.json but couldn't read it. Starting fresh.\n");
    }
  }

  const questions = [
    {
      type: 'input',
      name: 'extensionName',
      message: 'What is your extension name?',
      initial: existingConfig.extensionName || '',
      validate: (value: string) => (value.trim().length > 0 ? true : 'Extension name is required'),
    },
    {
      type: 'input',
      name: 'extensionDescription',
      message: 'Describe your extension:',
      initial: existingConfig.extensionDescription || '',
      validate: (value: string) =>
        value.trim().length > 0 ? true : 'Extension description is required',
    },
    {
      type: 'select',
      name: 'uiType',
      message: 'Choose UI type:',
      choices: [
        { name: 'popup', message: 'Popup (Default) - Opens when clicking extension icon' },
        { name: 'sidewindow', message: 'Side Window - Detached pop-out window (ChatGPT-style)' },
        { name: 'window', message: 'New Window - Opens in a new browser window' },
      ],
      initial: existingConfig.uiType || 'popup',
    },
    {
      type: 'confirm',
      name: 'tailwind',
      message: 'Include Tailwind CSS for styling? (Recommended)',
      initial: existingConfig.tailwind !== false,
    },
    {
      type: 'confirm',
      name: 'i18n',
      message: 'Include internationalization (i18n) support?',
      initial: existingConfig.i18n || false,
    },
    {
      type: 'confirm',
      name: 'optionsPage',
      message: 'Include options page for settings?',
      initial: existingConfig.optionsPage || false,
    },
    {
      type: 'confirm',
      name: 'accessibility',
      message: 'Include accessibility features?',
      initial: existingConfig.accessibility || false,
    },
    {
      type: 'multiselect',
      name: 'authMethods',
      message: 'Choose authentication methods:',
      choices: [
        { name: 'none', message: 'No Authentication' },
        { name: 'email', message: 'Email/Password' },
        { name: 'google', message: 'Google OAuth' },
        { name: 'github', message: 'GitHub OAuth' },
      ],
      initial: existingConfig.authMethods || ['none'],
    },
    {
      type: 'multiselect',
      name: 'aiProviders',
      message: 'Choose AI providers:',
      choices: [
        { name: 'none', message: 'No AI Integration' },
        { name: 'openai', message: 'OpenAI (GPT-4, GPT-3.5)' },
        { name: 'claude', message: 'Anthropic (Claude)' },
        { name: 'gemini', message: 'Google (Gemini)' },
      ],
      initial: existingConfig.aiProviders || ['none'],
    },
    {
      type: 'select',
      name: 'database',
      message: 'Choose database:',
      choices: [
        { name: 'none', message: 'No Database (Local storage only)' },
        { name: 'firebase', message: 'Firebase (Recommended for auth/pricing)' },
        { name: 'supabase', message: 'Supabase (PostgreSQL with auth)' },
        { name: 'mongodb', message: 'MongoDB (Document database)' },
        { name: 'postgresql', message: 'PostgreSQL (Relational database)' },
      ],
      initial: existingConfig.database || 'none',
    },
    {
      type: 'select',
      name: 'pricingModel',
      message: 'Choose pricing model:',
      choices: [
        { name: 'none', message: 'Free (No pricing)' },
        { name: 'freemium', message: 'Freemium (Free + Premium tiers)' },
        { name: 'subscription', message: 'Subscription (Monthly/Yearly)' },
        { name: 'onetime', message: 'One-time Purchase' },
        { name: 'usage-based', message: 'Usage-based Pricing' },
      ],
      initial: existingConfig.pricingModel || 'none',
    },
    {
      type: 'select',
      name: 'hostingProviders',
      message: 'Choose hosting provider:',
      choices: [
        { name: 'none', message: 'No hosting needed' },
        { name: 'vercel', message: 'Vercel (Recommended)' },
        { name: 'netlify', message: 'Netlify' },
        { name: 'firebase', message: 'Firebase Hosting' },
        { name: 'aws', message: 'AWS (S3 + CloudFront)' },
        { name: 'github-pages', message: 'GitHub Pages' },
      ],
      initial: existingConfig.hostingProviders?.[0] || 'none',
    },
    {
      type: 'select',
      name: 'storageType',
      message: 'Choose Chrome storage type:',
      choices: [
        { name: 'sync', message: 'Sync (Across devices)' },
        { name: 'local', message: 'Local (This device only)' },
      ],
      initial: existingConfig.storageType || 'sync',
    },
    {
      type: 'confirm',
      name: 'analyticsEnabled',
      message: 'Include Google Analytics for tracking user behavior?',
      initial: existingConfig.analytics?.enabled || false,
    },
  ];

  const answers = (await enquirer.prompt(questions)) as Record<string, unknown>;

  // Handle analytics-specific questions
  let analyticsConfig = {
    enabled: false,
    googleAnalyticsId: '',
    trackPageViews: true,
    trackButtonClicks: true,
    trackUserActions: true,
    trackExtensionUsage: true,
  };

  if (answers.analyticsEnabled) {
    const analyticsQuestions = [
      {
        type: 'input',
        name: 'googleAnalyticsId',
        message: 'Enter your Google Analytics ID (G-XXXXXXXXXX):',
        initial: existingConfig.analytics?.googleAnalyticsId || '',
        validate: (value: string) => {
          if (!value.trim()) return 'Google Analytics ID is required';
          if (!value.match(/^G-[A-Z0-9]{10}$/)) {
            return 'Google Analytics ID must be in format G-XXXXXXXXXX';
          }
          return true;
        },
      },
      {
        type: 'confirm',
        name: 'trackPageViews',
        message: 'Track page views on website?',
        initial: existingConfig.analytics?.trackPageViews !== false,
      },
      {
        type: 'confirm',
        name: 'trackButtonClicks',
        message: 'Track button clicks and interactions?',
        initial: existingConfig.analytics?.trackButtonClicks !== false,
      },
      {
        type: 'confirm',
        name: 'trackUserActions',
        message: 'Track user actions and feature usage?',
        initial: existingConfig.analytics?.trackUserActions !== false,
      },
      {
        type: 'confirm',
        name: 'trackExtensionUsage',
        message: 'Track extension usage and performance?',
        initial: existingConfig.analytics?.trackExtensionUsage !== false,
      },
    ];

    const analyticsAnswers = (await enquirer.prompt(analyticsQuestions)) as Record<string, unknown>;
    analyticsConfig = {
      enabled: true,
      googleAnalyticsId: analyticsAnswers.googleAnalyticsId as string,
      trackPageViews: analyticsAnswers.trackPageViews as boolean,
      trackButtonClicks: analyticsAnswers.trackButtonClicks as boolean,
      trackUserActions: analyticsAnswers.trackUserActions as boolean,
      trackExtensionUsage: analyticsAnswers.trackExtensionUsage as boolean,
    };
  }

  // Handle website-specific questions
  let websiteFeatures: Partial<
    Pick<
      ExtensionConfig,
      | 'websiteFramework'
      | 'includePricing'
      | 'includeTestimonials'
      | 'includeAuth'
      | 'includeCookieBanner'
      | 'includeNewsletter'
      | 'includeBlog'
      | 'includeSearch'
      | 'includePWA'
      | 'includeStatusPage'
      | 'includeAPIDocs'
      | 'includeUserDashboard'
    >
  > = {
    websiteFramework: 'nextjs',
    includePricing: false,
    includeTestimonials: false,
    includeAuth: false,
    includeCookieBanner: false,
    includeNewsletter: false,
    includeBlog: false,
    includeSearch: false,
    includePWA: false,
    includeStatusPage: false,
    includeAPIDocs: false,
    includeUserDashboard: false,
  };

  if (answers.includeWebsite) {
    const websiteQuestions = [
      {
        type: 'select',
        name: 'websiteFramework',
        message: 'Choose website framework:',
        choices: [
          {
            name: 'nextjs',
            message: 'React + Next.js (Recommended) - SEO-optimized with server-side rendering',
            hint: 'Perfect for SEO, blogs, content-heavy sites',
          },
          {
            name: 'vite',
            message: 'React + Vite - Lightweight and fast for simple landing pages',
            hint: 'Great for simple sites, faster development',
          },
        ],
        initial: existingConfig.websiteFramework || 'nextjs',
      },
      {
        type: 'confirm',
        name: 'includePricing',
        message: 'Include pricing information on website?',
        initial: existingConfig.includePricing || false,
      },
      {
        type: 'confirm',
        name: 'includeTestimonials',
        message: 'Include testimonials section on website?',
        initial: existingConfig.includeTestimonials || false,
      },
      {
        type: 'confirm',
        name: 'includeAuth',
        message: 'Include authentication features on website?',
        initial: existingConfig.includeAuth || false,
      },
      {
        type: 'confirm',
        name: 'includeCookieBanner',
        message: 'Include GDPR-compliant cookie consent banner?',
        initial: existingConfig.includeCookieBanner || false,
      },
      {
        type: 'confirm',
        name: 'includeNewsletter',
        message: 'Include newsletter subscription feature?',
        initial: existingConfig.includeNewsletter || false,
      },
      {
        type: 'confirm',
        name: 'includeBlog',
        message: 'Include blog/news section?',
        initial: existingConfig.includeBlog || false,
      },
      {
        type: 'confirm',
        name: 'includeSearch',
        message: 'Include search functionality?',
        initial: existingConfig.includeSearch || false,
      },
      {
        type: 'confirm',
        name: 'includePWA',
        message: 'Include Progressive Web App (PWA) features?',
        initial: existingConfig.includePWA || false,
      },
      {
        type: 'confirm',
        name: 'includeStatusPage',
        message: 'Include status page for service monitoring?',
        initial: existingConfig.includeStatusPage || false,
      },
      {
        type: 'confirm',
        name: 'includeAPIDocs',
        message: 'Include API documentation section?',
        initial: existingConfig.includeAPIDocs || false,
      },
      {
        type: 'confirm',
        name: 'includeUserDashboard',
        message: 'Include user dashboard for account management?',
        initial: existingConfig.includeUserDashboard || false,
      },
    ];

    const websiteAnswers = (await enquirer.prompt(websiteQuestions)) as Record<string, unknown>;
    websiteFeatures = {
      ...websiteFeatures,
      ...websiteAnswers,
      websiteFramework: (websiteAnswers.websiteFramework as 'nextjs' | 'vite') || 'nextjs',
    };
  }

  // Convert hostingProviders to array
  const hostingProviders =
    answers.hostingProviders === 'none' ? ['none'] : [answers.hostingProviders as string];

  // Remove websiteFramework from websiteFeatures before spreading
  const { websiteFramework: wf } = websiteFeatures;

  return {
    extensionName: answers.extensionName as string,
    extensionDescription: answers.extensionDescription as string,
    uiType: answers.uiType as 'popup' | 'window' | 'sidewindow',
    tailwind: answers.tailwind as boolean,
    i18n: answers.i18n as boolean,
    optionsPage: answers.optionsPage as boolean,
    accessibility: answers.accessibility as boolean,
    authMethods: (answers.authMethods as string[]).map((m) => m as AuthMethod),
    aiProviders: (answers.aiProviders as string[]).map((m) => m as AiProvider),
    database: answers.database as Database,
    pricingModel: answers.pricingModel as PricingModel,
    hostingProviders: (hostingProviders as string[]).map((m) => m as HostingProvider),
    storageType: answers.storageType as StorageType,
    analytics: analyticsConfig,
    includeWebsite: answers.includeWebsite as boolean,
    includePricing: websiteFeatures.includePricing ?? false,
    includeTestimonials: websiteFeatures.includeTestimonials ?? false,
    includeAuth: websiteFeatures.includeAuth ?? false,
    includeCookieBanner: websiteFeatures.includeCookieBanner ?? false,
    includeNewsletter: websiteFeatures.includeNewsletter ?? false,
    includeBlog: websiteFeatures.includeBlog ?? false,
    includeSearch: websiteFeatures.includeSearch ?? false,
    includePWA: websiteFeatures.includePWA ?? false,
    includeStatusPage: websiteFeatures.includeStatusPage ?? false,
    includeAPIDocs: websiteFeatures.includeAPIDocs ?? false,
    includeUserDashboard: websiteFeatures.includeUserDashboard ?? false,
    websiteFramework: wf === 'nextjs' || wf === 'vite' ? wf : 'nextjs',
  };
}

async function runFlagMode(argv: CLIArgs): Promise<ExtensionConfig> {
  // Convert single values to arrays where needed
  const hostingProviders = argv.hostingProviders || ['none'];

  // Build analytics config
  const analyticsConfig = {
    enabled: argv.analyticsEnabled || false,
    googleAnalyticsId: argv.googleAnalyticsId || '',
    trackPageViews: argv.trackPageViews !== false,
    trackButtonClicks: argv.trackButtonClicks !== false,
    trackUserActions: argv.trackUserActions !== false,
    trackExtensionUsage: argv.trackExtensionUsage !== false,
  };

  return {
    extensionName: argv.extensionName || 'My Extension',
    extensionDescription: argv.extensionDescription || 'A Chrome extension',
    uiType: (argv.uiType as 'popup' | 'window' | 'sidewindow') || 'popup',
    tailwind: argv.tailwind !== false,
    i18n: argv.i18n || false,
    optionsPage: argv.optionsPage || false,
    accessibility: argv.accessibility || false,
    authMethods: (argv.authMethods as string[]).map((m) => m as AuthMethod) || ['none'],
    aiProviders: (argv.aiProviders as string[]).map((m) => m as AiProvider) || ['none'],
    database: (argv.database as Database) || 'none',
    pricingModel: (argv.pricingModel as PricingModel) || 'none',
    hostingProviders: (hostingProviders as string[]).map((m) => m as HostingProvider),
    storageType: (argv.storageType as StorageType) || 'sync',
    analytics: analyticsConfig,
    includeWebsite: argv.includeWebsite || false,
    websiteFramework: (argv.websiteFramework as WebsiteFramework) || 'nextjs',
    includePricing: argv.includePricing || false,
    includeTestimonials: argv.includeTestimonials || false,
    includeAuth: argv.includeAuth || false,
    includeCookieBanner: argv.includeCookieBanner || false,
    includeNewsletter: argv.includeNewsletter || false,
    includeBlog: argv.includeBlog || false,
    includeSearch: argv.includeSearch || false,
    includePWA: argv.includePWA || false,
    includeStatusPage: argv.includeStatusPage || false,
    includeAPIDocs: argv.includeAPIDocs || false,
    includeUserDashboard: argv.includeUserDashboard || false,
  };
}

main().catch(console.error);
