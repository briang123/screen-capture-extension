// e2e/test-constants.js
import { parseEnvBool } from '../../src/shared/utils/env';

export const TEST_URL: string = process.env.TEST_URL || 'https://cleanshot.com';
export const TEST_TIMEOUT: number = 20000;
export const EXTENSION_ID_PATTERN: RegExp = /chrome-extension:\/\/([a-z]{32})/;

export const COLLECT_SCREENSHOTS: boolean = parseEnvBool(process.env.COLLECT_SCREENSHOTS);
export const COLLECT_VIDEO: boolean = parseEnvBool(process.env.COLLECT_VIDEO);
export const COLLECT_FULLPAGE_SCREENSHOTS: boolean = parseEnvBool(
  process.env.COLLECT_FULLPAGE_SCREENSHOTS
);
export const LOG_TEST_RESULTS: boolean = parseEnvBool(process.env.LOG_TEST_RESULTS, true);
