# Sidebar & Editor Custom Hook Ideas

This document lists ideas for custom React hooks to further modularize and clarify sidebar and editor logic.

## Sidebar Hooks

| Functionality       | Custom Hook Name       | What It Would Do                                       | Status          |
| ------------------- | ---------------------- | ------------------------------------------------------ | --------------- |
| Theme management    | `useTheme`             | Manage theme state and toggling between light/dark     | **Implemented** |
| Side switching      | `useSidebarSide`       | Manage left/right side state and switching logic       | **Implemented** |
| Browser resize      | `useSidebarResize`     | Handle window resize and sidebar position update       | **Implemented** |
| Collapse/expand     | `useSidebarCollapse`   | Manage collapsed state and toggle logic                | **Implemented** |
| Debug logging       | `useDebug`             | Log state changes for debugging                        | **Implemented** |
| Capture state       | `useCapture`           | Manage isCapturing, handleCapture, async logic, errors | **Implemented** |
| Position management | `useSidebarPosition`   | Manage position, snapping, restore from storage        | **Implemented** |
| Persistent state    | `usePersistentState`   | Sync any state with localStorage/sessionStorage        | **Implemented** |
| Accessibility/focus | `useFocusTrap`         | Manage focus, keyboard nav, ARIA for accessibility     | **Implemented** |
| Animation state     | `useAnimation`         | Comprehensive animation management for Framer Motion   | **Implemented** |
| Animation state     | `useSidebarAnimation`  | Sidebar-specific animations using useAnimation         | **Implemented** |
| Animation state     | `useEditorAnimation`   | Editor-specific animations using useAnimation          | **Implemented** |
| Visibility/close    | `useSidebarVisibility` | Manage open/close, escape key, outside click           | **Implemented** |

---

## Editor Hooks

| Functionality   | Custom Hook Name               | What It Would Do                                 |
| --------------- | ------------------------------ | ------------------------------------------------ |
| Fabric canvas   | `useFabricCanvas`              | Manage fabric.js canvas lifecycle and helpers    |
| Image data      | `useImageData`                 | Load, update, and manage image data              |
| Editor settings | `useEditorSettings`            | Load/save editor settings, persistent state      |
| Color picker    | `useColorPicker`               | Manage color and picker open/close state         |
| Annotations     | `useAnnotations`               | Manage annotation state and sync with canvas     |
| Capture actions | `useCapture`                   | Manage capture state and handlers (area/element) |
| Clipboard/save  | `useClipboard`, `useImageSave` | Copy/save image logic                            |
| Tool selection  | `useToolSelection`             | Manage current tool and tool change handler      |
| Debug logging   | `useDebug`                     | Log state changes for debugging                  |

---

## Hook Descriptions

### Sidebar Hooks

### 1. `useTheme` (**Implemented**)

- Manages theme state and toggling between 'light' and 'dark'.
- Example:
  ```js
  const [theme, toggleTheme] = useTheme();
  ```

### 2. `useSidebarSide` (**Implemented**)

- Manages the sidebar's side (left/right), switching logic, and transition state.
- Example:
  ```js
  const [side, handleMoveSide, isSwitchingSide] = useSidebarSide('right', 500);
  ```

### 3. `useSidebarResize` (**Implemented**)

- Handles window resize events and updates sidebar position accordingly.
- Returns `isResizing` state.
- Example:
  ```js
  const isResizing = useSidebarResize(side, getRightEdge, setPosition);
  ```

### 4. `useSidebarCollapse` (**Implemented**)

- Manages collapsed/expanded state and provides a toggle handler.
- Example:
  ```js
  const [collapsed, handleToggleCollapse] = useSidebarCollapse();
  ```

### 5. `useDebug` (**Implemented**)

- Logs state changes for debugging in a grouped format.
- Example:
  ```js
  useDebug('Sidebar Render', { x: position.x, y: position.y, side, collapsed });
  ```

### 6. `useSidebarPosition` (**Implemented**)

- Manages sidebar position state, initial calculation, and provides helpers for snapping to edges or restoring from storage.
- Example:
  ```js
  const [position, setPosition, snapToEdge] = useSidebarPosition(side, sidebarWidth, getInitialY);
  ```

### 7. `usePersistentState` (**Implemented**)

A comprehensive hook for managing persistent state across different storage backends with a unified interface.

**Features:**

- Multiple storage backends: localStorage, sessionStorage, Chrome local/sync storage
- Cross-tab synchronization support
- Custom serialization/deserialization
- Error handling and fallbacks
- TypeScript support with full type safety

**Storage Backends:**

- `localStorage` - Browser's localStorage API
- `sessionStorage` - Browser's sessionStorage API
- `chrome.local` - Chrome extension local storage
- `chrome.sync` - Chrome extension sync storage (cross-device)

**Basic Usage:**

```tsx
// Simple localStorage usage
const [count, setCount, clearCount] = useLocalStorage('counter', 0);

// Complex object with Chrome sync storage
const [settings, setSettings] = useChromeSyncStorage('user-settings', {
  theme: 'light',
  fontSize: 14,
  notifications: true,
});

// Advanced usage with custom options
const [data, setData, clearData] = usePersistentState({
  key: 'advanced-data',
  backend: 'chrome.local',
  defaultValue: { items: [] },
  onError: (error) => console.error('Storage error:', error),
  sync: true, // Enable cross-tab synchronization
  serialize: (value) => JSON.stringify(value),
  deserialize: (str) => JSON.parse(str),
});
```

**Convenience Hooks:**

- `useLocalStorage<T>(key, defaultValue, options?)` - localStorage wrapper
- `useSessionStorage<T>(key, defaultValue, options?)` - sessionStorage wrapper
- `useChromeLocalStorage<T>(key, defaultValue, options?)` - Chrome local storage wrapper
- `useChromeSyncStorage<T>(key, defaultValue, options?)` - Chrome sync storage wrapper

**Key Features:**

- **Automatic synchronization** across browser tabs/windows
- **Error handling** with optional error callbacks
- **Custom serialization** for special data types (Dates, custom objects)
- **Type safety** with full TypeScript support
- **Fallback mechanisms** when storage is unavailable
- **Performance optimized** with debounced updates and change detection

### 8. `useFocusTrap` (**Implemented**)

A comprehensive accessibility hook for managing focus trapping, keyboard navigation, and ARIA attributes in React components.

**Why Use This Hook:**

- Ensures keyboard users can navigate your UI without getting trapped or lost
- Implements WCAG 2.1 guidelines for focus management
- Provides automatic ARIA attribute management
- Handles focus restoration when components unmount
- Supports custom focus selectors and escape key handling
- Prevents focus from escaping the component boundaries

**Common Use Cases:**

- Modal dialogs and popups
- Sidebar panels and navigation menus
- Form overlays and wizards
- Tooltip and dropdown menus
- Any component that should contain focus

**Key Features:**

- **Tab key navigation** (forward/backward)
- **Arrow key navigation** (up/down/left/right)
- **Home/End key navigation** (first/last element)
- **Escape key handling** with callback
- **Automatic focus restoration**
- **ARIA role and modal attributes**
- **Custom focusable element selectors**
- **Focus enter/leave callbacks**

**Basic Usage:**

```tsx
const { containerRef, isActive } = useFocusTrap({
  enabled: isModalOpen,
  returnFocus: true,
  focusFirstElement: true,
  allowEscape: true,
  onEscape: () => setIsModalOpen(false),
});

return (
  <div ref={containerRef} className="modal">
    <h2>Modal Title</h2>
    <button>Action 1</button>
    <button>Action 2</button>
  </div>
);
```

**Advanced Usage:**

```tsx
const {
  containerRef,
  focusFirst,
  focusLast,
  focusNext,
  focusPrev,
  activate,
  deactivate,
  isActive,
} = useFocusTrap({
  enabled: isExpanded,
  returnFocus: true,
  focusFirstElement: false,
  allowEscape: false,
  focusableSelector: 'button, [role="button"], input, select, textarea',
  onFocusEnter: () => console.log('Focus entered'),
  onFocusLeave: () => console.log('Focus left'),
});
```

**Convenience Hooks:**

- `useSimpleFocusTrap(enabled)` - Simple focus trap with default settings
- `useFocusRestoration(enabled)` - Save and restore focus state
- `useAriaAttributes(role, attributes)` - Manage ARIA attributes

**Accessibility Benefits:**

- Screen reader compatibility
- Keyboard-only navigation support
- Proper focus management for assistive technologies
- WCAG 2.1 AA compliance for focus trapping
- Reduced cognitive load for users with disabilities

### 9. `useSidebarVisibility` (**Implemented**)

A comprehensive hook for managing sidebar visibility state, including open/close behavior, escape key handling, outside click detection, and focus management integration.

**Why Use This Hook:**

- Centralizes sidebar visibility logic in one place
- Handles common UX patterns (escape to close, outside click to close)
- Integrates with focus management for accessibility
- Provides consistent behavior across different sidebar implementations
- Supports both controlled and uncontrolled visibility states

**Common Use Cases:**

- Sidebar panels and navigation menus
- Slide-out panels and drawers
- Floating toolbars and palettes
- Any collapsible UI component

**Key Features:**

- **Escape key to close** sidebar with callback support
- **Outside click detection** to close (configurable)
- **Focus restoration** when closing
- **Integration with useFocusTrap** for accessibility
- **Controlled and uncontrolled modes**
- **Transition state management**
- **Callback support** for visibility changes

**Basic Usage:**

```tsx
const { visible, close, containerRef } = useSidebarVisibility({
  initialVisible: true,
  closeOnEscape: true,
  closeOnOutsideClick: false,
  enableFocusTrap: true,
  onClose: () => console.log('Sidebar closed'),
});

return (
  <div ref={containerRef} className="sidebar">
    <button onClick={close}>Close</button>
    {/* Sidebar content */}
  </div>
);
```

**Advanced Usage:**

```tsx
const { visible, open, close, toggle, containerRef, triggerRef, isTransitioning, setVisible } =
  useSidebarVisibility({
    initialVisible: false,
    controlled: false,
    closeOnEscape: true,
    closeOnOutsideClick: true,
    restoreFocus: true,
    enableFocusTrap: true,
    outsideClickSelector: 'body',
    onVisibilityChange: (visible) => console.log('Visibility changed:', visible),
    onOpen: () => console.log('Sidebar opened'),
    onClose: () => console.log('Sidebar closed'),
    onEscape: () => console.log('Escape pressed'),
    onOutsideClick: () => console.log('Outside click detected'),
  });
```

**Convenience Hooks:**

- `useSimpleSidebarVisibility(initialVisible, closeOnEscape, closeOnOutsideClick)` - Simple sidebar with basic options
- `useControlledSidebarVisibility(visible, onVisibilityChange, options)` - Controlled sidebar visibility

**Accessibility Features:**

- Proper focus management with useFocusTrap integration
- Keyboard navigation support
- Screen reader announcements
- ARIA attribute management
- Focus restoration when closing

### 10. `useAnimation` (**Implemented**)

A comprehensive animation management hook for Framer Motion that provides complete control over animation states, timing, coordination, and reusable animation variants.

**Why Use This Hook:**

- Centralizes animation logic and state management
- Provides consistent animation timing and easing across components
- Handles complex animation sequences and coordination
- Offers reusable animation variants for common patterns
- Manages animation performance and cleanup
- Supports conditional animations and dynamic variants

**Common Use Cases:**

- Sidebar animations (slide in/out, expand/collapse)
- Modal animations (fade in/out, scale, slide)
- Editor animations (toolbar transitions, panel animations)
- Page transitions and route changes
- Loading states and skeleton animations
- Micro-interactions and hover effects

**Key Features:**

- **Animation state management** (playing, paused, completed)
- **Timing control** (duration, delay, stagger)
- **Animation variants** for different states
- **Coordination** between multiple animated elements
- **Performance optimization** with cleanup
- **Conditional animations** based on props/state
- **Reusable animation presets**

**Basic Usage:**

```tsx
const { controls, state, start, stop, variants } = useAnimation({
  initial: 'hidden',
  variants: {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0 },
  },
  config: {
    duration: 0.3,
    ease: 'easeInOut',
  },
});

return (
  <motion.div ref={controls} variants={variants} initial="hidden" animate="visible">
    Content
  </motion.div>
);
```

**Advanced Usage:**

```tsx
const animation = useAnimation({
  initial: 'hidden',
  variants: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
  config: {
    duration: 0.5,
    delay: 0.1,
    stagger: 0.1,
    ease: 'easeInOut',
    animateOnMount: true,
  },
  onAnimationStart: (variant) => console.log('Started:', variant),
  onAnimationComplete: (variant) => console.log('Completed:', variant),
  onAnimationUpdate: (progress) => console.log('Progress:', progress),
});
```

**Animation Presets:**

```tsx
// Use predefined animation presets
const fadeAnimation = useAnimationPreset('fade');
const slideAnimation = useAnimationPreset('slideIn');
const scaleAnimation = useAnimationPreset('scale');

// Available presets: fade, slideIn, slideOut, scale, expand, collapse, bounce, rotate
```

**Animation Coordination:**

```tsx
// Coordinate multiple animations
const animations = [
  useAnimation({ variants: fadeVariants }),
  useAnimation({ variants: slideVariants }),
  useAnimation({ variants: scaleVariants }),
];

const { startAll, stopAll, resetAll } = useAnimationGroup(animations, {
  stagger: 0.1,
  onAllComplete: () => console.log('All animations completed'),
});
```

**Conditional Animations:**

```tsx
// Animate based on condition
const conditionalAnimation = useConditionalAnimation(isVisible, {
  variants: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
});
```

**Performance Benefits:**

- Automatic cleanup of animation listeners
- Optimized re-renders with useCallback
- Lazy loading of animation variants
- Memory leak prevention

### 11. `useSidebarAnimation` (**Implemented**)

A sidebar-specific animation hook that uses the base `useAnimation` hook to provide sidebar-specific animation patterns and variants.

**Why Use This Hook:**

- Provides sidebar-specific animation variants
- Handles common sidebar animation patterns
- Integrates with sidebar state (collapsed, side, theme)
- Optimized for sidebar performance
- Consistent animation timing across sidebar components

**Key Features:**

- **Slide animations** (left/right side support)
- **Collapse/expand animations** with width transitions
- **Theme transition animations** (light/dark)
- **Side switching animations** with smooth transitions
- **Customizable timing** for different animation types

**Basic Usage:**

```tsx
const sidebarAnimation = useSidebarAnimation({
  sidebarConfig: {
    side: 'right' as SidebarSide,
    collapsed: false,
    visible: true,
    isSwitchingSide: false,
  },
});

return (
  <motion.div
    ref={sidebarAnimation.controls}
    variants={sidebarAnimation.variants}
    initial="visible"
    animate="visible"
  >
    Sidebar content
  </motion.div>
);
```

**Convenience Hooks:**

```tsx
// Simple sidebar animation
const simpleAnimation = useSimpleSidebarAnimation('right' as SidebarSide, false, true);

// Theme-specific animation
const themeAnimation = useSidebarThemeAnimation('dark');

// Collapse animation
const collapseAnimation = useSidebarCollapseAnimation(false);

// Side switching animation
const sideAnimation = useSidebarSideAnimation('right' as SidebarSide, false);
```

**Animation Variants:**

- `hidden` - Sidebar hidden (off-screen)
- `visible` - Sidebar visible
- `collapsed` - Sidebar collapsed (narrow width)
- `expanded` - Sidebar expanded (full width)
- `switching` - Sidebar switching sides
- `themeLight` - Light theme transition
- `themeDark` - Dark theme transition

### 12. `useEditorAnimation` (**Implemented**)

An editor-specific animation hook that uses the base `useAnimation` hook to provide editor-specific animation patterns and variants.

**Why Use This Hook:**

- Provides editor-specific animation variants
- Handles common editor animation patterns
- Integrates with editor state (tools, panels, canvas)
- Optimized for editor performance
- Consistent animation timing across editor components

**Key Features:**

- **Toolbar animations** (show/hide, slide)
- **Panel animations** (expand/collapse)
- **Tool selection animations** (active/inactive states)
- **Canvas animations** (zoom, pan)
- **Fullscreen animations** (enter/exit)

**Basic Usage:**

```tsx
const editorAnimation = useEditorAnimation({
  editorConfig: {
    tool: 'select',
    toolbarVisible: true,
    panelsExpanded: true,
    fullscreen: false,
  },
});

return (
  <motion.div
    ref={editorAnimation.controls}
    variants={editorAnimation.variants}
    initial="visible"
    animate="visible"
  >
    Editor content
  </motion.div>
);
```

**Convenience Hooks:**

```tsx
// Simple editor animation
const simpleAnimation = useSimpleEditorAnimation(true, true, false);

// Toolbar animation
const toolbarAnimation = useToolbarAnimation(true);

// Panel animation
const panelAnimation = usePanelAnimation(true);

// Tool selection animation
const toolAnimation = useToolAnimation(true);

// Canvas animation
const canvasAnimation = useCanvasAnimation(false);

// Fullscreen animation
const fullscreenAnimation = useFullscreenAnimation(false);
```

**Animation Variants:**

- `hidden` - Component hidden
- `visible` - Component visible
- `toolbarHidden` - Toolbar hidden (slide up)
- `toolbarVisible` - Toolbar visible
- `panelCollapsed` - Panel collapsed (width 0)
- `panelExpanded` - Panel expanded
- `toolActive` - Tool active (scaled, colored)
- `toolInactive` - Tool inactive
- `fullscreenEnter` - Entering fullscreen
- `fullscreenActive` - Fullscreen active
- `canvasZoom` - Canvas zoomed
- `canvasNormal` - Canvas normal size

---

Feel free to implement any of these hooks to further modularize your sidebar and editor logic!
