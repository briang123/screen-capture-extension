// tests/test-constants.js
import { parseEnvBool } from '@shared/utils/env';

export const TEST_URL: string = process.env.TEST_URL || 'https://cleanshot.com';
export const TEST_TIMEOUT: number = 20000;
export const EXTENSION_ID_PATTERN: RegExp = /chrome-extension:\/\/([a-z]{32})/;
export const DEV_MODE: boolean = parseEnvBool(process.env.DEV_MODE, true);
export const COLLECT_SCREENSHOTS: boolean = parseEnvBool(process.env.COLLECT_SCREENSHOTS);
export const COLLECT_VIDEO: boolean = parseEnvBool(process.env.COLLECT_VIDEO);
export const COLLECT_FULLPAGE_SCREENSHOTS: boolean = parseEnvBool(
  process.env.COLLECT_FULLPAGE_SCREENSHOTS
);
export const LOG_TEST_RESULTS: boolean = parseEnvBool(process.env.LOG_TEST_RESULTS, true);

// UI Mode Configuration
export const TEST_MODE: 'headed' | 'headless' | 'ui' = (process.env.TEST_MODE as any) || 'headless';
export const HEADLESS_MODE: boolean =
  TEST_MODE === 'headless' || parseEnvBool(process.env.HEADLESS, true);
export const UI_MODE: boolean = TEST_MODE === 'ui';
export const HEADED_MODE: boolean = TEST_MODE === 'headed';

// UI Mode specific settings
export const SHOW_BROWSER: boolean = parseEnvBool(process.env.SHOW_BROWSER, HEADED_MODE || UI_MODE);
export const WATCH_MODE: boolean = parseEnvBool(process.env.WATCH_MODE, UI_MODE);
export const TRACE_MODE: 'off' | 'on' | 'retain-on-failure' | 'on-first-retry' = UI_MODE
  ? 'on'
  : (process.env.TRACE_MODE as any) || 'on-first-retry';
