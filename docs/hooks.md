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
| Persistent state    | `usePersistentState`   | Sync any state with localStorage/sessionStorage        | Idea            |
| Accessibility/focus | `useFocusTrap`         | Manage focus, keyboard nav, ARIA for accessibility     | Idea            |
| Animation state     | `useSidebarAnimation`  | Manage animation state, timing, coordination           | Idea            |
| Visibility/close    | `useSidebarVisibility` | Manage open/close, escape key, outside click           | Idea            |

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

### Editor Hook Ideas

#### 1. `useFabricCanvas`

- Manages the creation, initialization, and disposal of the fabric.js canvas.
- Returns the fabric canvas instance and helpers for interacting with it.
- Can encapsulate image loading and scaling logic.

#### 2. `useImageData`

- Handles loading image data from storage, updating the canvas, and managing the image state.
- Can also handle clipboard and save logic.

#### 3. `useEditorSettings`

- Loads, saves, and manages editor settings (background, theme, quality, format).
- Can use a persistent state hook for localStorage or Chrome storage.

#### 4. `useColorPicker`

- Manages color state and picker open/close state.
- Can be reused for other color pickers in the app.

#### 5. `useAnnotations`

- Manages annotation state, adding/removing/updating annotations, and possibly syncing with the canvas.

#### 6. `useCapture` (editor-specific)

- Manages capture state and provides handlers for area/element capture.
- Handles async messaging with the content script and updates image data.

#### 7. `useClipboard` and `useImageSave`

- Encapsulate logic for copying images to clipboard and saving images.

#### 8. `useToolSelection`

- Manages the current tool and provides a handler for changing tools.

#### 9. `useDebug`

- Logs state changes for debugging in a grouped format.

---

Feel free to implement any of these hooks to further modularize your sidebar and editor logic!
