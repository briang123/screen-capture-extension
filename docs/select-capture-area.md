# Select Area to Capture: Implementation Plan

A checklist for building a robust, user-friendly area selection overlay for screen capture in a Chrome extension.

## Overlay & Selection Experience

- [x] Render a full-viewport overlay (covers the entire visible area of the tab content)
- [ ] Overlay uses blur and/or semi-transparent dark background
- [ ] Overlay is rendered as a React portal to `document.body` for stacking
- [ ] Overlay is always visible when area selection is active
- [ ] Overlay handles all mouse/touch events for selection

- [ ] After rendering the full-viewport overlay, when I tap button to collapse window to side of screen, the overlay disappears and i want it to remain in place because I want the ability to capture more area which was behind the sidebar panel.

## Selection Rectangle

- [ ] Draw a visible selection rectangle as the user drags
- [ ] Rectangle is clearly visible (border, corner handles, etc.)
- [ ] Area inside the rectangle is less dark/more see-through than the rest of the overlay
- [ ] Rectangle updates in real time as the user drags
- [ ] Show size (width × height) indicator near the rectangle

## User Interaction

- [ ] Cancel selection with ESC key or Cancel button
- [ ] Prevent text selection and scrolling while overlay is active
- [ ] Support both mouse and touch input for selection
- [ ] Provide clear instructions to the user

## Capture Logic

- [ ] On selection complete, capture the selected area as an image
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
