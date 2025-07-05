/* eslint-disable no-undef */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Inline dotenv logic for compatibility
const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : process.env.NODE_ENV === 'development'
      ? '.env.development'
      : '.env';
dotenv.config({ path: envFile });

const testUrl = process.env.TEST_URL || 'https://cleanshot.com';
const { origin } = new URL(testUrl);

const state = {
  origins: [
    {
      origin,
      localStorage: [{ name: 'sc_sidebar_pinned', value: 'true' }],
    },
  ],
};

const outPath = path.join(__dirname, '../tests/helpers/sidebar-storage.json');
fs.writeFileSync(outPath, JSON.stringify(state, null, 2));
console.log(`Storage state written to ${outPath} for origin: ${origin}`);
