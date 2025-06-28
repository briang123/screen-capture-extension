import React, { useState } from 'react';
import { ExtensionConfig } from '@/shared/types';
import { validateConfig } from '@/shared/validation';

interface ConfigFormProps {
  onSubmit: (config: ExtensionConfig) => void;
}

const ConfigForm: React.FC<ConfigFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<Partial<ExtensionConfig>>({
    extensionName: '',
    extensionDescription: '',
    uiType: 'popup',
    tailwind: true,
    i18n: false,
    optionsPage: false,
    accessibility: false,
    authMethods: ['none'],
    aiProviders: ['none'],
    database: 'none',
    pricingModel: 'none',
    hostingProviders: ['none'],
    storageType: 'sync',
    analytics: {
      enabled: false,
      googleAnalyticsId: '',
      trackPageViews: true,
      trackButtonClicks: true,
      trackUserActions: true,
      trackExtensionUsage: true,
    },
    includeWebsite: false,
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
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (field: keyof ExtensionConfig, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: keyof ExtensionConfig, value: string, checked: boolean) => {
    const currentValues = (formData[field] as string[]) || [];
    let newValues: string[];

    if (checked) {
      newValues = [...currentValues.filter((v) => v !== 'none'), value];
    } else {
      newValues = currentValues.filter((v) => v !== value);
      if (newValues.length === 0) {
        newValues = ['none'];
      }
    }

    setFormData((prev) => ({ ...prev, [field]: newValues }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationResult = validateConfig(formData as ExtensionConfig);
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }

    setErrors([]);
    onSubmit(formData as ExtensionConfig);
  };

  const getFeatureSummary = () => {
    const features = [];
    if (formData.tailwind) features.push('Tailwind CSS');
    if (formData.i18n) features.push('i18n');
    if (formData.optionsPage) features.push('Options Page');
    if (formData.accessibility) features.push('Accessibility');
    if (formData.aiProviders?.some((p) => p !== 'none')) features.push('AI Integration');
    if (formData.pricingModel !== 'none') features.push('Pricing');
    return features.join(', ') || 'Basic features only';
  };

  return (
    <form className="config-form" onSubmit={handleSubmit}>
      {errors.length > 0 && (
        <div
          style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid #f5c6cb',
          }}
        >
          <strong>Please fix the following errors:</strong>
          <ul style={{ margin: '0.5rem 0 0 1.5rem' }}>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Basic Information */}
      <div className="form-section">
        <h2>📝 Basic Information</h2>
        <p>Start by providing the basic details about your Chrome extension.</p>

        <div className="form-group">
          <label htmlFor="extensionName">Extension Name *</label>
          <input
            type="text"
            id="extensionName"
            value={formData.extensionName || ''}
            onChange={(e) => handleInputChange('extensionName', e.target.value)}
            placeholder="My Awesome Extension"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="extensionDescription">Extension Description *</label>
          <textarea
            id="extensionDescription"
            value={formData.extensionDescription || ''}
            onChange={(e) => handleInputChange('extensionDescription', e.target.value)}
            placeholder="A brief description of what your extension does..."
            rows={3}
            required
          />
        </div>
      </div>

      {/* UI Configuration */}
      <div className="form-section">
        <h2>🎨 UI Configuration</h2>
        <p>Choose how your extension will be displayed to users.</p>

        <div className="form-group">
          <label htmlFor="uiType">UI Type</label>
          <select
            id="uiType"
            value={formData.uiType || 'popup'}
            onChange={(e) => handleInputChange('uiType', e.target.value)}
          >
            <option value="popup">Popup (Default) - Opens when clicking extension icon</option>
            <option value="sidewindow">
              Side Window - Detached pop-out window (ChatGPT-style)
            </option>
            <option value="window">New Window - Opens in a new browser window</option>
          </select>
        </div>

        <div className="form-group">
          <label>Styling Framework</label>
          <div className="checkbox-group">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="tailwind"
                checked={formData.tailwind || false}
                onChange={(e) => handleInputChange('tailwind', e.target.checked)}
              />
              <label htmlFor="tailwind">Tailwind CSS (Recommended)</label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Additional Features</label>
          <div className="checkbox-group">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="i18n"
                checked={formData.i18n || false}
                onChange={(e) => handleInputChange('i18n', e.target.checked)}
              />
              <label htmlFor="i18n">Internationalization (i18n)</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="optionsPage"
                checked={formData.optionsPage || false}
                onChange={(e) => handleInputChange('optionsPage', e.target.checked)}
              />
              <label htmlFor="optionsPage">Options Page</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="accessibility"
                checked={formData.accessibility || false}
                onChange={(e) => handleInputChange('accessibility', e.target.checked)}
              />
              <label htmlFor="accessibility">Accessibility Features</label>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication */}
      <div className="form-section">
        <h2>🔐 Authentication</h2>
        <p>
          Choose authentication methods for user accounts. Selecting any method will require a
          database.
        </p>

        <div className="form-group">
          <label>Authentication Methods</label>
          <div className="checkbox-group">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="auth-none"
                checked={formData.authMethods?.includes('none') || false}
                onChange={(e) => handleCheckboxChange('authMethods', 'none', e.target.checked)}
              />
              <label htmlFor="auth-none">No Authentication</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="auth-email"
                checked={formData.authMethods?.includes('email') || false}
                onChange={(e) => handleCheckboxChange('authMethods', 'email', e.target.checked)}
              />
              <label htmlFor="auth-email">Email/Password</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="auth-google"
                checked={formData.authMethods?.includes('google') || false}
                onChange={(e) => handleCheckboxChange('authMethods', 'google', e.target.checked)}
              />
              <label htmlFor="auth-google">Google OAuth</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="auth-github"
                checked={formData.authMethods?.includes('github') || false}
                onChange={(e) => handleCheckboxChange('authMethods', 'github', e.target.checked)}
              />
              <label htmlFor="auth-github">GitHub OAuth</label>
            </div>
          </div>
        </div>
      </div>

      {/* AI Integrations */}
      <div className="form-section">
        <h2>🤖 AI Integrations</h2>
        <p>
          Add AI capabilities to your extension. These can enhance user experience with smart
          features.
        </p>

        <div className="form-group">
          <label>AI Providers</label>
          <div className="checkbox-group">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="ai-none"
                checked={formData.aiProviders?.includes('none') || false}
                onChange={(e) => handleCheckboxChange('aiProviders', 'none', e.target.checked)}
              />
              <label htmlFor="ai-none">No AI Integration</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="ai-openai"
                checked={formData.aiProviders?.includes('openai') || false}
                onChange={(e) => handleCheckboxChange('aiProviders', 'openai', e.target.checked)}
              />
              <label htmlFor="ai-openai">OpenAI (GPT-4, GPT-3.5)</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="ai-anthropic"
                checked={formData.aiProviders?.includes('claude') || false}
                onChange={(e) => handleCheckboxChange('aiProviders', 'claude', e.target.checked)}
              />
              <label htmlFor="ai-anthropic">Anthropic (Claude)</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="ai-google"
                checked={formData.aiProviders?.includes('gemini') || false}
                onChange={(e) => handleCheckboxChange('aiProviders', 'gemini', e.target.checked)}
              />
              <label htmlFor="ai-google">Google (Gemini)</label>
            </div>
          </div>
        </div>
      </div>

      {/* Backend & Database */}
      <div className="form-section">
        <h2>🗄️ Backend & Database</h2>
        <p>
          Choose your backend infrastructure. Required if you selected authentication or pricing
          features.
        </p>

        <div className="form-group">
          <label htmlFor="database">Database</label>
          <select
            id="database"
            value={formData.database || 'none'}
            onChange={(e) => handleInputChange('database', e.target.value)}
          >
            <option value="none">No Database (Local storage only)</option>
            <option value="firebase">Firebase (Recommended for auth/pricing)</option>
            <option value="supabase">Supabase (PostgreSQL with auth)</option>
            <option value="mongodb">MongoDB (Document database)</option>
            <option value="postgresql">PostgreSQL (Relational database)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="pricingModel">Pricing Model</label>
          <select
            id="pricingModel"
            value={formData.pricingModel || 'none'}
            onChange={(e) => handleInputChange('pricingModel', e.target.value)}
          >
            <option value="none">Free (No pricing)</option>
            <option value="freemium">Freemium (Free + Premium tiers)</option>
            <option value="subscription">Subscription (Monthly/Yearly)</option>
            <option value="one-time">One-time Purchase</option>
            <option value="usage-based">Usage-based Pricing</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="hostingProviders">Hosting Providers</label>
          <select
            id="hostingProviders"
            value={formData.hostingProviders?.[0] || 'none'}
            onChange={(e) => handleInputChange('hostingProviders', [e.target.value])}
          >
            <option value="none">No hosting needed</option>
            <option value="vercel">Vercel (Recommended)</option>
            <option value="netlify">Netlify</option>
            <option value="firebase">Firebase Hosting</option>
            <option value="aws">AWS (S3 + CloudFront)</option>
            <option value="github-pages">GitHub Pages</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="storageType">Chrome Storage Type</label>
          <select
            id="storageType"
            value={formData.storageType || 'sync'}
            onChange={(e) => handleInputChange('storageType', e.target.value)}
          >
            <option value="sync">Sync (Across devices)</option>
            <option value="local">Local (This device only)</option>
            <option value="session">Session (Temporary)</option>
          </select>
        </div>
      </div>

      {/* Google Analytics */}
      <div className="form-section">
        <h2>📊 Google Analytics</h2>
        <p>
          Track user behavior and extension usage to improve your product. You&apos;ll need to
          create a Google Analytics account and get your measurement ID.
        </p>

        <div className="form-group">
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="analytics-enabled"
              checked={formData.analytics?.enabled || false}
              onChange={(e) =>
                handleInputChange('analytics', {
                  ...formData.analytics,
                  enabled: e.target.checked,
                })
              }
            />
            <label htmlFor="analytics-enabled">Enable Google Analytics</label>
          </div>
        </div>

        {formData.analytics?.enabled && (
          <>
            <div className="form-group">
              <label htmlFor="googleAnalyticsId">Google Analytics ID *</label>
              <input
                type="text"
                id="googleAnalyticsId"
                value={formData.analytics?.googleAnalyticsId || ''}
                onChange={(e) =>
                  handleInputChange('analytics', {
                    ...formData.analytics,
                    googleAnalyticsId: e.target.value,
                  })
                }
                placeholder="G-XXXXXXXXXX"
                required
              />
              <small>
                Format: G-XXXXXXXXXX. Get this from your Google Analytics account under Admin → Data
                Streams → Web Stream → Measurement ID.
              </small>
            </div>

            <div className="form-group">
              <label>Tracking Options</label>
              <div className="checkbox-group">
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="trackPageViews"
                    checked={formData.analytics?.trackPageViews !== false}
                    onChange={(e) =>
                      handleInputChange('analytics', {
                        ...formData.analytics,
                        trackPageViews: e.target.checked,
                      })
                    }
                  />
                  <label htmlFor="trackPageViews">Track page views on website</label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="trackButtonClicks"
                    checked={formData.analytics?.trackButtonClicks !== false}
                    onChange={(e) =>
                      handleInputChange('analytics', {
                        ...formData.analytics,
                        trackButtonClicks: e.target.checked,
                      })
                    }
                  />
                  <label htmlFor="trackButtonClicks">Track button clicks and interactions</label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="trackUserActions"
                    checked={formData.analytics?.trackUserActions !== false}
                    onChange={(e) =>
                      handleInputChange('analytics', {
                        ...formData.analytics,
                        trackUserActions: e.target.checked,
                      })
                    }
                  />
                  <label htmlFor="trackUserActions">Track user actions and feature usage</label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="trackExtensionUsage"
                    checked={formData.analytics?.trackExtensionUsage !== false}
                    onChange={(e) =>
                      handleInputChange('analytics', {
                        ...formData.analytics,
                        trackExtensionUsage: e.target.checked,
                      })
                    }
                  />
                  <label htmlFor="trackExtensionUsage">Track extension usage and performance</label>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Website */}
      <div className="form-section">
        <h2>🌐 Standalone Website</h2>
        <p>
          Create a standalone website for your extension. Great for marketing and user onboarding.
        </p>

        <div className="form-group">
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="includeWebsite"
              checked={formData.includeWebsite || false}
              onChange={(e) => handleInputChange('includeWebsite', e.target.checked)}
            />
            <label htmlFor="includeWebsite">Include Standalone Website</label>
          </div>
        </div>

        {formData.includeWebsite && (
          <>
            <div className="form-group">
              <label htmlFor="websiteFramework">Website Framework</label>
              <select
                id="websiteFramework"
                value={formData.websiteFramework || 'nextjs'}
                onChange={(e) => handleInputChange('websiteFramework', e.target.value)}
              >
                <option value="nextjs">
                  React + Next.js (Recommended) - SEO-optimized with server-side rendering
                </option>
                <option value="vite">
                  React + Vite - Lightweight and fast for simple landing pages
                </option>
              </select>
              <div
                style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  background: '#f8f9fa',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  color: '#666',
                }}
              >
                <strong>React + Next.js:</strong> Perfect for SEO, blogs, content-heavy sites.
                Includes server-side rendering, dynamic meta tags, and built-in optimizations.
                <br />
                <strong>React + Vite:</strong> Great for simple landing pages. Faster development,
                smaller bundles, but limited SEO capabilities.
              </div>
            </div>

            <div className="form-group">
              <label>Website Features</label>
              <div className="checkbox-group">
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="includePricing"
                    checked={formData.includePricing || false}
                    onChange={(e) => handleInputChange('includePricing', e.target.checked)}
                  />
                  <label htmlFor="includePricing">Pricing Information</label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="includeTestimonials"
                    checked={formData.includeTestimonials || false}
                    onChange={(e) => handleInputChange('includeTestimonials', e.target.checked)}
                  />
                  <label htmlFor="includeTestimonials">Testimonials Section</label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="includeAuth"
                    checked={formData.includeAuth || false}
                    onChange={(e) => handleInputChange('includeAuth', e.target.checked)}
                  />
                  <label htmlFor="includeAuth">Authentication Features</label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="includeCookieBanner"
                    checked={formData.includeCookieBanner || false}
                    onChange={(e) => handleInputChange('includeCookieBanner', e.target.checked)}
                  />
                  <label htmlFor="includeCookieBanner">Cookie Consent Banner (GDPR)</label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="includeNewsletter"
                    checked={formData.includeNewsletter || false}
                    onChange={(e) => handleInputChange('includeNewsletter', e.target.checked)}
                  />
                  <label htmlFor="includeNewsletter">Newsletter Subscription</label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="includeBlog"
                    checked={formData.includeBlog || false}
                    onChange={(e) => handleInputChange('includeBlog', e.target.checked)}
                  />
                  <label htmlFor="includeBlog">Blog Section</label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="includeSearch"
                    checked={formData.includeSearch || false}
                    onChange={(e) => handleInputChange('includeSearch', e.target.checked)}
                  />
                  <label htmlFor="includeSearch">Search Functionality</label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="includePWA"
                    checked={formData.includePWA || false}
                    onChange={(e) => handleInputChange('includePWA', e.target.checked)}
                  />
                  <label htmlFor="includePWA">Progressive Web App (PWA)</label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="includeStatusPage"
                    checked={formData.includeStatusPage || false}
                    onChange={(e) => handleInputChange('includeStatusPage', e.target.checked)}
                  />
                  <label htmlFor="includeStatusPage">Status Page</label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="includeAPIDocs"
                    checked={formData.includeAPIDocs || false}
                    onChange={(e) => handleInputChange('includeAPIDocs', e.target.checked)}
                  />
                  <label htmlFor="includeAPIDocs">API Documentation</label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="includeUserDashboard"
                    checked={formData.includeUserDashboard || false}
                    onChange={(e) => handleInputChange('includeUserDashboard', e.target.checked)}
                  />
                  <label htmlFor="includeUserDashboard">User Dashboard</label>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Configuration Summary */}
      <div className="config-summary">
        <h3>📋 Configuration Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <strong>Extension</strong>
            <span>{formData.extensionName || 'Not set'}</span>
          </div>
          <div className="summary-item">
            <strong>UI Type</strong>
            <span>{formData.uiType}</span>
          </div>
          <div className="summary-item">
            <strong>Features</strong>
            <span>{getFeatureSummary()}</span>
          </div>
          <div className="summary-item">
            <strong>Authentication</strong>
            <span>{formData.authMethods?.filter((m) => m !== 'none').join(', ') || 'None'}</span>
          </div>
          <div className="summary-item">
            <strong>Database</strong>
            <span>{formData.database !== 'none' ? formData.database : 'None'}</span>
          </div>
          <div className="summary-item">
            <strong>Website</strong>
            <span>
              {formData.includeWebsite
                ? `${formData.websiteFramework?.toUpperCase() || 'Next.js'}`
                : 'No'}
            </span>
          </div>
        </div>
      </div>

      <button type="submit" className="submit-button">
        🚀 Generate Chrome Extension Boilerplate
      </button>
    </form>
  );
};

export default ConfigForm;
