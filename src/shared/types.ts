// Shared types for both CLI and web interface
export type UiType = 'popup' | 'window' | 'sidewindow';

export type AuthMethod = 'google' | 'github' | 'email' | 'none';

export type AiProvider = 'openai' | 'claude' | 'gemini' | 'none';

export type Database = 'firebase' | 'postgres' | 'mongo' | 'none';

export type PricingModel = 'subscription' | 'freemium' | 'onetime' | 'none';

export type HostingProvider = 'vercel' | 'netlify' | 'firebase' | 'none';

export type StorageType = 'sync' | 'local';

export type WebsiteFramework = 'vite' | 'nextjs';

export interface AnalyticsConfig {
  enabled: boolean;
  googleAnalyticsId?: string;
  trackPageViews: boolean;
  trackButtonClicks: boolean;
  trackUserActions: boolean;
  trackExtensionUsage: boolean;
}

export interface ExtensionConfig {
  // Basic Information
  extensionName: string;
  extensionDescription: string;

  // UI Configuration
  uiType: UiType;

  // Features
  tailwind: boolean;
  i18n: boolean;
  optionsPage: boolean;
  accessibility: boolean;

  // Authentication
  authMethods: AuthMethod[];

  // AI Integration
  aiProviders: AiProvider[];

  // Backend
  database: Database;
  pricingModel: PricingModel;
  hostingProviders: HostingProvider[];
  storageType: StorageType;

  // Analytics
  analytics: AnalyticsConfig;

  // Website
  includeWebsite: boolean;
  websiteFramework: WebsiteFramework;
  includePricing: boolean;
  includeTestimonials: boolean;
  includeAuth: boolean;
  includeCookieBanner: boolean;
  includeNewsletter: boolean;
  includeBlog: boolean;
  includeSearch: boolean;
  includePWA: boolean;
  includeStatusPage: boolean;
  includeAPIDocs: boolean;
  includeUserDashboard: boolean;

  // CLI Options
  dryRun?: boolean;
  interactive?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SmartDefaults {
  database: Database;
  includePricing: boolean;
  includeAuth: boolean;
  includeTestimonials: boolean;
  websiteFramework: WebsiteFramework;
}

export interface GenerationResult {
  success: boolean;
  aiPrompt: string;
  config: ExtensionConfig;
  filesGenerated: string[];
  errors?: string[];
}
