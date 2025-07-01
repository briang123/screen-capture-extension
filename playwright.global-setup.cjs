// eslint-disable no-undef
/* eslint-disable no-undef */
const { execSync } = require('child_process');

module.exports = async () => {
  console.log('[Playwright global setup] Building content script in dev mode...');
  execSync('npm run build:content:dev', { stdio: 'inherit' });
};
