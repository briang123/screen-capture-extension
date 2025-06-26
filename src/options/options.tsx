import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings, StorageSettings } from '@utils/storage';

const Options: React.FC = () => {
  const [settings, setSettings] = useState<StorageSettings>({
    autoSave: false,
    backgroundType: 'gradient',
    theme: 'light',
    quality: 'high',
    format: 'png',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setMessage('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: keyof StorageSettings, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      await saveSettings(settings);
      setMessage('Settings saved successfully!');

      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    const defaultSettings: StorageSettings = {
      autoSave: false,
      backgroundType: 'gradient',
      theme: 'light',
      quality: 'high',
      format: 'png',
    };

    setSettings(defaultSettings);
    await saveSettings(defaultSettings);
    setMessage('Settings reset to defaults');

    setTimeout(() => setMessage(''), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Screen Capture Extension Settings
          </h1>
          <p className="text-gray-600">
            Configure your screen capture preferences and editor options
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes('success')
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Settings */}
          <div className="card">
            <div className="section">
              <h2 className="section-title">General Settings</h2>
              <p className="section-description">Configure basic capture and editor behavior</p>

              <div className="form-group">
                <label className="form-label">
                  <input
                    type="checkbox"
                    className="form-checkbox mr-2"
                    checked={settings.autoSave}
                    onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                  />
                  Auto-save captures
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Automatically save captures to storage when created
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Default Theme</label>
                <select
                  className="form-select"
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Choose the default theme for the editor
                </p>
              </div>
            </div>
          </div>

          {/* Capture Settings */}
          <div className="card">
            <div className="section">
              <h2 className="section-title">Capture Settings</h2>
              <p className="section-description">Configure image quality and format preferences</p>

              <div className="form-group">
                <label className="form-label">Image Quality</label>
                <select
                  className="form-select"
                  value={settings.quality}
                  onChange={(e) => handleSettingChange('quality', e.target.value)}
                >
                  <option value="low">Low (Smaller file size)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Best quality)</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">Higher quality means larger file sizes</p>
              </div>

              <div className="form-group">
                <label className="form-label">Image Format</label>
                <select
                  className="form-select"
                  value={settings.format}
                  onChange={(e) => handleSettingChange('format', e.target.value)}
                >
                  <option value="png">PNG (Lossless)</option>
                  <option value="jpg">JPEG (Compressed)</option>
                  <option value="webp">WebP (Modern)</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  PNG is best for screenshots, JPEG for photos
                </p>
              </div>
            </div>
          </div>

          {/* Background Settings */}
          <div className="card">
            <div className="section">
              <h2 className="section-title">Background Settings</h2>
              <p className="section-description">
                Configure default background for captured images
              </p>

              <div className="form-group">
                <label className="form-label">Background Type</label>
                <select
                  className="form-select"
                  value={settings.backgroundType}
                  onChange={(e) => handleSettingChange('backgroundType', e.target.value)}
                >
                  <option value="gradient">Gradient</option>
                  <option value="solid">Solid Color</option>
                  <option value="image">Image</option>
                  <option value="none">None (Transparent)</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Choose the default background for your captures
                </p>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="card">
            <div className="section">
              <h2 className="section-title">Keyboard Shortcuts</h2>
              <p className="section-description">Quick reference for keyboard shortcuts</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Capture screen:</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Shift+S</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Open editor:</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Shift+E</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Copy to clipboard:</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+C</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Save image:</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+S</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-4">
          <button onClick={handleReset} className="btn-secondary" disabled={isSaving}>
            Reset to Defaults
          </button>
          <button onClick={handleSave} className="btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Screen Capture Extension v1.0.0</p>
          <p className="mt-1">Settings are automatically saved to your Chrome profile</p>
        </div>
      </div>
    </div>
  );
};

export default Options;
