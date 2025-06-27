import './popup.css';
import React, { useState, useEffect } from 'react';
import { captureScreen, openWindow } from '@background/background';
import { getStorageData, setStorageData } from '@utils/storage';
import { createRoot } from 'react-dom/client';
import Popup from './Popup';

interface PopupProps {}

const Popup: React.FC<PopupProps> = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [settings, setSettings] = useState({
    autoSave: false,
    backgroundType: 'gradient',
    theme: 'light',
  });

  useEffect(() => {
    // Load settings from storage
    getStorageData(['settings']).then((result) => {
      if (result.settings) {
        setSettings(result.settings);
      }
    });
  }, []);

  const handleCaptureClick = async () => {
    setIsCapturing(true);
    try {
      // Send message to background script to capture screen
      const response = await chrome.runtime.sendMessage({
        action: 'captureScreen',
      });

      if (response.success) {
        // Open the window with the captured image
        await chrome.runtime.sendMessage({
          action: 'openWindow',
          data: { imageData: response.imageData },
        });
      }
    } catch (error) {
      console.error('Capture failed:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleOpenWindow = async () => {
    try {
      await chrome.runtime.sendMessage({
        action: 'openWindow',
      });
    } catch (error) {
      console.error('Failed to open window:', error);
    }
  };

  const handleSettingsChange = async (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await setStorageData({ settings: newSettings });
  };

  const handleOpenSidebar = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'openSidebar' });
      } catch (err) {
        // Fallback: force-inject content script, then try again
        if (chrome.scripting) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js'],
          });
          // Try again after injection
          await chrome.tabs.sendMessage(tab.id, { action: 'openSidebar' });
        } else {
          alert('Unable to inject sidebar: scripting API not available.');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Screen Capture</h1>
          <p className="text-blue-100 text-sm">Capture and annotate web pages</p>
        </div>

        {/* Main Actions */}
        <div className="space-y-4">
          <button
            onClick={handleCaptureClick}
            disabled={isCapturing}
            className="w-full bg-white text-blue-600 font-semibold py-3 px-4 rounded-xl shadow-soft hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCapturing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                Capturing...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Capture Screen
              </div>
            )}
          </button>

          <button
            onClick={handleOpenWindow}
            className="w-full bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl shadow-soft hover:bg-blue-600 transition-all duration-200"
          >
            Open Editor
          </button>

          <button
            onClick={handleOpenSidebar}
            className="w-full bg-green-500 text-white font-semibold py-3 px-4 rounded-xl shadow-soft hover:bg-green-600 transition-all duration-200 mt-2"
          >
            Open Sidebar
          </button>
        </div>

        {/* Settings */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-4">
          <h3 className="text-white font-semibold text-sm">Settings</h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-blue-100 text-sm">Auto-save captures</span>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => handleSettingsChange('autoSave', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>

            <div>
              <label className="text-blue-100 text-sm block mb-2">Background Type</label>
              <select
                value={settings.backgroundType}
                onChange={(e) => handleSettingsChange('backgroundType', e.target.value)}
                className="w-full bg-white/20 text-white rounded-lg px-3 py-2 text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="gradient">Gradient</option>
                <option value="solid">Solid Color</option>
                <option value="image">Image</option>
                <option value="none">None</option>
              </select>
            </div>

            <div>
              <label className="text-blue-100 text-sm block mb-2">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingsChange('theme', e.target.value)}
                className="w-full bg-white/20 text-white rounded-lg px-3 py-2 text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <button
            onClick={() => chrome.runtime.openOptionsPage()}
            className="text-blue-100 text-sm hover:text-white transition-colors"
          >
            Advanced Settings
          </button>
        </div>
      </div>
    </div>
  );
};

// TODO: Add error boundary for better error handling
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>
  );
}
