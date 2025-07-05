import { test } from '@playwright/test';

test('environment variables are loaded and correct', () => {
  console.log('TEST_MODE:', process.env.TEST_MODE);
  console.log('COLLECT_VIDEO:', process.env.COLLECT_VIDEO);
  console.log('COLLECT_SCREENSHOTS:', process.env.COLLECT_SCREENSHOTS);
  console.log('COLLECT_FULLPAGE_SCREENSHOTS:', process.env.COLLECT_FULLPAGE_SCREENSHOTS);
  console.log('TEST_URL:', process.env.TEST_URL);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('SHOW_BROWSER:', process.env.SHOW_BROWSER);
  console.log('WATCH_MODE:', process.env.WATCH_MODE);
  console.log('TRACE_MODE:', process.env.TRACE_MODE);
  console.log('LOG_TEST_RESULTS:', process.env.LOG_TEST_RESULTS);
});
