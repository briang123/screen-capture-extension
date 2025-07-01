// tests/test-constants.js
export const TEST_URL: string = process.env.TEST_URL || 'https://cleanshot.com';
export const TEST_TIMEOUT: number = 20000;
export const EXTENSION_ID_PATTERN: RegExp = /chrome-extension:\/\/([a-z]{32})/;
export const DEV_MODE: boolean =
  process.env.DEV_MODE !== undefined ? process.env.DEV_MODE === 'true' : true;
export const COLLECT_SCREENSHOTS: boolean = process.env.COLLECT_SCREENSHOTS === 'true';
export const COLLECT_VIDEO: boolean = process.env.COLLECT_VIDEO === 'true';
export const COLLECT_FULLPAGE_SCREENSHOTS: boolean =
  process.env.COLLECT_FULLPAGE_SCREENSHOTS === 'true';
