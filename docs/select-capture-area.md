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

## (Add your own tasks below)

- [ ]
