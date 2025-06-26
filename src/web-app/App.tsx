import React, { useState } from 'react';
import { ExtensionConfig } from '../shared/types';
import { generateExtension } from '../shared/config-generator';
import ConfigForm from './components/ConfigForm';
import ResultsView from './components/ResultsView';
import './App.css';

function App() {
  const [config, setConfig] = useState<ExtensionConfig | null>(null);
  const [generationResult, setGenerationResult] = useState<
    import('../shared/types').GenerationResult | null
  >(null);
  const [currentStep, setCurrentStep] = useState<'form' | 'results'>('form');

  const handleConfigSubmit = (submittedConfig: ExtensionConfig) => {
    setConfig(submittedConfig);

    // Generate the AI prompt and files
    const result = generateExtension(submittedConfig);
    setGenerationResult(result);

    if (result.success) {
      setCurrentStep('results');
    } else {
      // Handle error - could show error modal
      console.error('Generation failed:', result.errors);
    }
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
  };

  const handleDownloadPrompt = () => {
    if (generationResult?.aiPrompt) {
      const blob = new Blob([generationResult.aiPrompt], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai-project-prompt.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadConfig = () => {
    if (config) {
      const scaffoldConfig = {
        ...config,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
      };

      const blob = new Blob([JSON.stringify(scaffoldConfig, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'scaffold.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1>🚀 Chrome Extension Boilerplate Generator</h1>
          <p>
            Create a complete Chrome Extension with React, TypeScript, and AI-powered scaffolding
          </p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {currentStep === 'form' ? (
            <ConfigForm onSubmit={handleConfigSubmit} />
          ) : (
            <ResultsView
              config={config!}
              onBack={handleBackToForm}
              onDownloadPrompt={handleDownloadPrompt}
              onDownloadConfig={handleDownloadConfig}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>Built with ❤️ for Chrome Extension developers</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
