// eslint-disable no-undef
/* eslint-disable no-undef */
const { execSync } = require('child_process');

module.exports = async () => {
  console.log('[Playwright global setup] Building extension for testing...');

  // Build the main extension files (background.js, popup.js, etc.)
  console.log('[Playwright global setup] Building main extension files...');
  execSync('npm run build:main', { stdio: 'inherit' });

  // Build the content script in dev mode for testing
  console.log('[Playwright global setup] Building content script in dev mode...');
  execSync('npm run build:content:dev', { stdio: 'inherit' });

  // Run postbuild to copy files
  console.log('[Playwright global setup] Running postbuild...');
  execSync('npm run postbuild', { stdio: 'inherit' });
};
