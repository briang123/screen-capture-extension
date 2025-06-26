import React from 'react';
import { ExtensionConfig } from '../../shared/types';
import { generateNextSteps } from '../../shared/next-steps';

interface ResultsViewProps {
  config: ExtensionConfig;
  onBack: () => void;
  onDownloadPrompt: () => void;
  onDownloadConfig: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({
  config,
  onBack,
  onDownloadPrompt,
  onDownloadConfig,
}) => {
  const nextSteps = generateNextSteps(config);

  const getFeatureSummary = () => {
    const features = [];
    if (config.tailwind) features.push('Tailwind CSS');
    if (config.i18n) features.push('i18n');
    if (config.optionsPage) features.push('Options Page');
    if (config.accessibility) features.push('Accessibility');
    if (config.aiProviders?.some((p) => p !== 'none')) features.push('AI Integration');
    if (config.pricingModel !== 'none') features.push('Pricing');
    if (config.analytics?.enabled) features.push('Google Analytics');
    return features.join(', ') || 'Basic features only';
  };

  const getWebsiteFeatures = () => {
    const features = [];
    if (config.includePricing) features.push('Pricing');
    if (config.includeTestimonials) features.push('Testimonials');
    if (config.includeAuth) features.push('Auth');
    if (config.includeCookieBanner) features.push('Cookie Banner');
    return features.join(', ') || 'Basic website';
  };

  return (
    <div className="results-view">
      <div className="results-header">
        <h2>🎉 Your Chrome Extension is Ready!</h2>
        <p>
          We&apos;ve generated everything you need to create your Chrome extension with AI
          assistance.
        </p>
      </div>

      <div className="success-message">
        <strong>✅ Generation Successful!</strong> Your AI prompt and configuration have been
        created successfully.
      </div>

      <div className="download-section">
        <button className="download-button" onClick={onDownloadPrompt}>
          📄 Download AI Prompt
          <span>ai-project-prompt.md</span>
        </button>
        <button className="download-button" onClick={onDownloadConfig}>
          ⚙️ Download Config
          <span>scaffold.json</span>
        </button>
      </div>

      <div className="config-summary">
        <h3>📋 Your Configuration Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <strong>Extension Name</strong>
            <span>{config.extensionName}</span>
          </div>
          <div className="summary-item">
            <strong>UI Type</strong>
            <span>{config.uiType}</span>
          </div>
          <div className="summary-item">
            <strong>Features</strong>
            <span>{getFeatureSummary()}</span>
          </div>
          <div className="summary-item">
            <strong>Authentication</strong>
            <span>{config.authMethods?.filter((m) => m !== 'none').join(', ') || 'None'}</span>
          </div>
          <div className="summary-item">
            <strong>Database</strong>
            <span>{config.database !== 'none' ? config.database : 'None'}</span>
          </div>
          <div className="summary-item">
            <strong>Website</strong>
            <span>
              {config.includeWebsite
                ? `${config.websiteFramework?.toUpperCase() || 'Next.js'} (${getWebsiteFeatures()})`
                : 'No'}
            </span>
          </div>
        </div>
      </div>

      <div className="next-steps-section">
        <h3>🚀 Next Steps</h3>
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: '#333', marginBottom: '1rem' }}>Immediate Actions Required:</h4>
          <ul className="steps-list">
            {nextSteps.immediateSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: '#333', marginBottom: '1rem' }}>AI Agent Instructions:</h4>
          <ul className="steps-list">
            {nextSteps.aiAgentInstructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ul>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: '#333', marginBottom: '1rem' }}>Incremental Updates:</h4>
          <ul className="steps-list">
            {nextSteps.incrementalUpdates.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: '#333', marginBottom: '1rem' }}>Deployment Steps:</h4>
          <ul className="steps-list">
            {nextSteps.deploymentSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#333', marginBottom: '1rem' }}>Troubleshooting:</h4>
          <ul className="steps-list">
            {nextSteps.troubleshooting.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button className="back-button" onClick={onBack}>
          ← Back to Configuration
        </button>
      </div>

      <div
        style={{
          background: '#e8f5e8',
          border: '1px solid #c3e6c3',
          borderRadius: '8px',
          padding: '1.5rem',
          marginTop: '2rem',
          textAlign: 'center',
        }}
      >
        <h4 style={{ color: '#2d5a2d', marginBottom: '0.5rem' }}>💡 Pro Tip</h4>
        <p style={{ color: '#4a7c4a', margin: 0 }}>
          Save your <code>scaffold.json</code> file in your project directory. This allows you to
          run
          <code>npm run init</code> later to add new features without starting over!
        </p>
      </div>
    </div>
  );
};

export default ResultsView;
