import { mountSidebar } from './sidebar';

// Mount immediately for demo
mountSidebar();

// Expose for manual triggering
// @ts-expect-error: Expose for test page
if (typeof window !== 'undefined') window.mountSidebar = mountSidebar; 