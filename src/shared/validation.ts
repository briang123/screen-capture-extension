import { ExtensionConfig, ValidationResult, SmartDefaults } from './types.js';

export function validateConfig(config: Partial<ExtensionConfig>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation
  if (!config.extensionName?.trim()) {
    errors.push('Extension name is required');
  }

  if (!config.extensionDescription?.trim()) {
    errors.push('Extension description is required');
  }

  if (!config.uiType) {
    errors.push('UI type is required');
  }

  // Analytics validation
  if (config.analytics?.enabled) {
    if (!config.analytics.googleAnalyticsId?.trim()) {
      errors.push('Google Analytics ID is required when analytics is enabled');
    } else if (!config.analytics.googleAnalyticsId.match(/^G-[A-Z0-9]{10}$/)) {
      errors.push('Google Analytics ID must be in format G-XXXXXXXXXX');
    }
  }

  // Authentication validation
  if (config.authMethods && config.authMethods.length > 0 && !config.authMethods.includes('none')) {
    if (config.database === 'none') {
      errors.push('Database is required when authentication is enabled');
    }
  }

  // Pricing validation
  if (config.pricingModel && config.pricingModel !== 'none') {
    if (config.database === 'none') {
      errors.push('Database is required when pricing model is enabled');
    }
  }

  // Website validation
  if (config.includeWebsite) {
    if (!config.websiteFramework) {
      errors.push('Website framework is required when website is included');
    }

    if (config.includePricing && config.pricingModel === 'none') {
      warnings.push(
        'Website includes pricing information but no pricing model is selected. Consider adding a pricing model.',
      );
    }

    if (config.includeAuth && (!config.authMethods || config.authMethods.includes('none'))) {
      warnings.push(
        'Website includes authentication features but no authentication methods are selected. Consider adding authentication methods.',
      );
    }
  }

  // Cookie banner validation
  if (config.includeCookieBanner && !config.includeWebsite) {
    warnings.push(
      'Cookie banner is selected but website is not included. Cookie banners are typically used on websites.',
    );
  }

  // AI validation
  if (config.aiProviders && config.aiProviders.some((provider) => provider !== 'none')) {
    if (config.database === 'none') {
      warnings.push(
        'AI features are selected but no database is configured. Consider adding a database for conversation history and user preferences.',
      );
    }
  }

  // Smart defaults warnings
  if (config.authMethods && config.authMethods.includes('none') && config.authMethods.length > 1) {
    warnings.push(
      'You selected both "none" and other authentication methods. Consider removing "none" if you want authentication.',
    );
  }

  if (config.aiProviders && config.aiProviders.includes('none') && config.aiProviders.length > 1) {
    warnings.push(
      'You selected both "none" and other AI providers. Consider removing "none" if you want AI integration.',
    );
  }

  if (
    config.hostingProviders &&
    config.hostingProviders.includes('none') &&
    config.hostingProviders.length > 1
  ) {
    warnings.push(
      'You selected both "none" and other hosting providers. Consider removing "none" if you want hosting.',
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function getSmartDefaults(config: Partial<ExtensionConfig>): SmartDefaults {
  const defaults: SmartDefaults = {
    database: 'none',
    includePricing: false,
    includeAuth: false,
    includeTestimonials: false,
    websiteFramework: 'nextjs',
  };

  // Smart defaults based on selected features
  if (config.authMethods && config.authMethods.some((method) => method !== 'none')) {
    defaults.database = 'firebase';
    defaults.includeAuth = true;
  }

  if (config.pricingModel && config.pricingModel !== 'none') {
    defaults.database = 'firebase';
    defaults.includePricing = true;
  }

  if (config.includeWebsite) {
    if (config.pricingModel && config.pricingModel !== 'none') {
      defaults.includePricing = true;
    }

    if (config.authMethods && config.authMethods.some((method) => method !== 'none')) {
      defaults.includeAuth = true;
    }

    // Choose Vite for simple sites, Next.js for complex ones
    if (
      config.includeBlog ||
      config.includeSearch ||
      config.includeAPIDocs ||
      config.includeUserDashboard
    ) {
      defaults.websiteFramework = 'nextjs';
    } else if (!config.includePricing && !config.includeAuth && !config.includeTestimonials) {
      // Simple landing page - could use Vite
      defaults.websiteFramework = 'vite';
    }
  }

  return defaults;
}

export function applySmartDefaults(config: ExtensionConfig): ExtensionConfig {
  const defaults = getSmartDefaults(config);

  return {
    ...config,
    database:
      config.database === 'none' && defaults.database !== 'none'
        ? defaults.database
        : config.database,
    includePricing: config.includePricing || defaults.includePricing,
    includeAuth: config.includeAuth || defaults.includeAuth,
    includeTestimonials: config.includeTestimonials || defaults.includeTestimonials,
    websiteFramework: config.websiteFramework || defaults.websiteFramework,
  };
}
