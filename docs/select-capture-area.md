# Select Area to Capture: Implementation Plan

A checklist for building a robust, user-friendly area selection overlay for screen capture in a Chrome extension.

## Overlay & Selection Experience

- [x] Render a full-viewport overlay (covers the entire visible area of the tab content)
- [x] Overlay uses blur and/or semi-transparent dark background
- [x] Overlay is rendered as a React portal to `document.body` for stacking
- [x] Overlay is always visible when area selection is active
- [x] Overlay handles all mouse/touch events for selection
- [x] After rendering the full-viewport overlay, when I tap button to collapse window to side of screen, the overlay disappears and i want it to remain in place because I want the ability to capture more area which was behind the sidebar panel.
- [x] When collapsing the sidebar panel after tapping on the "select a capture area" button, I need the screen to function as if I hadn't collapsed the sidebar panel without errors and unexpected behaviors.

## Selection Rectangle

- [x] Draw a visible selection rectangle as the user drags
- [x] Rectangle is clearly visible (border, corner handles, etc.)
- [x] Area inside the rectangle is a clear cutout than the rest of the overlay
- [x] Rectangle updates in real time as the user drags
- [x] The drag handles should be thicker lines instead of circles
- [ ] The drag handles and selection border should be a color other than white so that we can have contrast and see the drag handles
- [x] Show size (width × height) indicator near the rectangle, should be in top left on the outside of the selected area.
- [x] Rectangle should not appear in same place as it was before when tapping the "select a capture area" button again. Should reset
- [x] On selection complete, show a capture image button
- [ ] Allow user to adjust selection by using any of the drag handles. It should not start the selection process over.
- [x] If the user taps on the screen, there is a 0 x 0 selection with the capture image button below it. If the selection is 0 x 0, that means nothing is selected and we should not see anything reflecting a selection, so we shouldn't see the capture image button either. Basically, if user taps on screen, it's thinking that something is selected, when nothing is really selected.

## User Interaction

- [x] Tapping close button on sidebar panel should reset the process and overlay so that when user opens extension again, they should see the sidebar panel again and be able to start a new process. Should also unmount the sidebar component so we leave no trace.
- [ ] Cancel selection with ESC key or Cancel button
- [ ] Prevent text selection and scrolling while overlay is active
- [ ] Support both mouse and touch input for selection
- [ ] Provide clear instructions to the user

## Capture Logic

- [ ] When tapping on capture image button, capture the selected area as an image (e.g., the drag and drop handles, selection borders/lines should not be part of the image capture)
- [ ] Add the captured image to the sidebar panel
- [ ] Handle errors gracefully (e.g., selection too small, capture failed)

## Visual Polish

- [ ] Animate overlay and rectangle appearance/disappearance
- [ ] Ensure overlay and rectangle work on all major websites (test for stacking context issues)
- [ ] Provide visual feedback for invalid selections (e.g., too small, out of bounds)

## WOW Factor & Delightful UX Ideas

- [ ] Animated overlay entrance/exit: Use Framer Motion to fade/blur in the overlay with a smooth, springy animation.
- [ ] Animated selection rectangle: As the user drags, animate the rectangle's border and corners with a subtle bounce or glow.
- [ ] Glassmorphism effect: Add a frosted glass look to the overlay with blur, transparency, and a soft border.
- [ ] Spotlight effect: Dim the overlay but add a soft, animated glow around the selection rectangle to focus attention.
- [ ] Hints & tooltips: Show animated tooltips (e.g., "Drag to select area", "Press ESC to cancel", "Double-click to confirm") that fade in/out contextually.
- [ ] Animated size indicator: The width × height label animates in and gently pulses as the selection changes.
- [ ] Snap-to-edge: If the selection rectangle is near the edge of the viewport, animate a "snap" to the edge for pixel-perfect captures.
- [ ] Keyboard accessibility: Allow users to nudge/resize the selection with arrow keys, with a subtle animation for each move.
- [ ] Success animation: After capture, show a quick confetti burst or a checkmark animation to confirm success.
- [ ] Clipboard feedback: When the image is copied, animate a floating clipboard icon or toast notification.
- [ ] Annotate prompt: After capture, animate the image thumbnail into the sidebar and gently pulse a "Tap to annotate" hint.
- [ ] Multi-capture mode: Allow users to capture multiple areas in sequence, with animated transitions between selections.
- [ ] Undo/redo: Let users undo/redo their last selection with a smooth animation (e.g., rectangle slides back to previous state).
- [ ] Edge detection: Animate a subtle highlight if the selection snaps to a detected element or image on the page.
- [ ] Themed overlays: Support light/dark mode and seasonal themes (e.g., snowflakes in winter, confetti for celebrations).
- [ ] Animated cancel: When canceling, animate the overlay and selection rectangle fading or sliding away, not just disappearing.
- [ ] Custom cursor: Show a custom animated cursor (e.g., crosshair or camera) during selection for extra polish.
- [ ] Mobile/touch support: Add animated touch handles and gestures for resizing/moving the selection on touch devices.
- [ ] Accessibility: Animate focus rings and provide ARIA live regions for screen reader feedback.

Feel free to add your own ideas below!

- [ ]

## Refactoring

### OverlayProvider.tsx

1. Component Decomposition

- [ ] The file is quite large and contains multiple responsibilities (context, overlay rendering, handle rendering, event logic, etc.). Breaking it into smaller components and utility functions will improve readability and testability.

Suggestions:

- [x] Move renderOverlayMask and renderHandles into their own components or utility files.
- [x] Extract the selection rectangle and handles into a SelectionRectangle component.
- [x] Extract the capture/cancel buttons into their own components.

2. Reduce Inline Styles

- [ ] There are many inline style objects, which can be hard to maintain and may cause unnecessary re-renders.

Consider:

- [ ] Moving repeated style objects to constants outside the component.
- [ ] Using CSS classes (possibly with Tailwind, as you already use it) for static styles.

3. Z-Index Management

- [x] There are many hardcoded z-index values.

Consider:

- [x] Defining a z-index scale in a constants file or in your CSS/Tailwind config.
- [x] Using named constants (e.g., Z_INDEX_SELECTION_RECT = 10100) for clarity.

4. Portal Button Logic

- [x] You have two different "capture" buttons: one rendered via a portal (captureButtonPortal) and one as part of the overlay. This could be confusing.

Consider:

- [x] Unifying the logic so only one "capture" button is rendered, and its placement is consistent.
      If both are needed, document why.

5. Event Handler Extraction

- [ ] Handlers like handleHandleMouseDown are large and could be moved outside the main component for clarity, or at least split into smaller functions.

6. Selection State Management

- [x] The logic for determining when a selection is "complete" is spread across multiple effects and conditions.

Consider:

- [x] Creating a utility function like isSelectionComplete(selection, isSelecting) to centralize this logic.

7. Type Safety and Defaults

- [ ] Ensure all optional values (like selection) are handled safely.
- [ ] Consider using default values or guards to avoid repeated nullish checks.

8. Comments and Documentation

- [ ] Add JSDoc comments to exported functions and complex logic blocks.
- [ ] Briefly document the overlay flow at the top of the file for future maintainers.

9. Performance: useMemo/useCallback

- [ ] Use useMemo for expensive calculations (like style objects or derived values) if they depend on props/state.
- [ ] Use useCallback for handlers passed to child components.

10. Testing

- [ ] If not already done, ensure that the extracted components and hooks are covered by unit tests.

11. Hooks

- [ ] useAreaCaptureWithDebug - Area capture and debug state
- [x] useCaptureButtonPortal - Portal button visibility, position, and rendering
- [ ] useSelectionRectanglePosition - Viewport coordinate calculation for rectangle
- [ ] useOverlayMaskVisibility - Overlay mask visibility logic
- [ ] useHandleResize - Handle-based resizing logic
- [ ] useKeyboardShortcuts - Keyboard event handling for overlay/selection
