import { describe, it, expect } from 'vitest';
import { validateConfig } from './validation';
import type {
  AuthMethod,
  AiProvider,
  Database,
  PricingModel,
  HostingProvider,
  StorageType,
  WebsiteFramework,
} from './types';

describe('validateConfig', () => {
  it('should validate a complete config', () => {
    const config = {
      extensionName: 'Test Extension',
      extensionDescription: 'A test extension',
      uiType: 'popup' as const,
      tailwind: true,
      i18n: false,
      optionsPage: true,
      accessibility: true,
      authMethods: ['google', 'github'] as AuthMethod[],
      aiProviders: ['none'] as AiProvider[],
      database: 'firebase' as Database,
      pricingModel: 'subscription' as PricingModel,
      hostingProviders: ['vercel'] as HostingProvider[],
      storageType: 'sync' as StorageType,
      includeWebsite: true,
      websiteFramework: 'nextjs' as WebsiteFramework,
      includePricing: true,
      includeTestimonials: true,
      includeAuth: true,
      includeCookieBanner: true,
      includeNewsletter: false,
      includeBlog: false,
      includeSearch: false,
      includePWA: false,
      includeStatusPage: false,
      includeAPIDocs: false,
      includeUserDashboard: false,
    };

    const result = validateConfig(config);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should require database when authentication is enabled', () => {
    const config = {
      extensionName: 'Test Extension',
      extensionDescription: 'A test extension',
      uiType: 'popup' as const,
      tailwind: true,
      i18n: false,
      optionsPage: true,
      accessibility: false,
      authMethods: ['google'] as AuthMethod[],
      aiProviders: ['none'] as AiProvider[],
      database: 'none' as Database,
      pricingModel: 'none' as PricingModel,
      hostingProviders: [] as HostingProvider[],
      storageType: 'local' as StorageType,
      includeWebsite: false,
      websiteFramework: 'vite' as WebsiteFramework,
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

    const result = validateConfig(config);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Database is required when authentication is enabled');
  });

  it('should require database when pricing is enabled', () => {
    const config = {
      extensionName: 'Test Extension',
      extensionDescription: 'A test extension',
      uiType: 'popup' as const,
      tailwind: true,
      i18n: false,
      optionsPage: true,
      accessibility: false,
      authMethods: ['none'] as AuthMethod[],
      aiProviders: ['none'] as AiProvider[],
      database: 'none' as Database,
      pricingModel: 'subscription' as PricingModel,
      hostingProviders: [] as HostingProvider[],
      storageType: 'local' as StorageType,
      includeWebsite: false,
      websiteFramework: 'vite' as WebsiteFramework,
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

    const result = validateConfig(config);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Database is required when pricing model is enabled');
  });
});
