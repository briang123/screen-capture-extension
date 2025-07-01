# Scroll Capture: Feature Specification & Ideas

> **Note:** We now have two distinct types of scroll capture:
>
> 1. **Content Flow Capture** - Captures content that flows through a selected area
> 2. **Page Scroll Capture** - Captures the entire page by scrolling and stitching

## ✅ Implemented Features

- [x] User selects a rectangular area on the page.
- [x] A **Scroll Capture** button appears below the selection.
- [x] When clicked, the extension captures content flowing through the selected area.
- [x] **Content Flow Capture:**
  - [x] Captures content that flows through the selected area as the page scrolls
  - [x] Works for any selection size (small or large)
  - [x] Smooth scroll animations between capture steps
  - [x] Stitches captured content into a continuous flow
- [x] **Page Scroll Capture:**
  - [x] Captures the entire page by scrolling and stitching
  - [x] Calculates required steps based on page dimensions
  - [x] Smooth scroll animations throughout the process
- [x] **Direction:**
  - [x] Vertical (default)
  - [ ] Horizontal (optional, user-selectable)
- [x] **Custom Scroll Speed:**
  - [x] Use a safe default (e.g., 1200ms per capture)
  - [ ] Allow user/config to override speed (e.g., via settings or advanced options)
- [x] **Rate Limiting:**
  - [x] Ensure Chrome's capture API quota is respected
- [x] **Fully automated:**
  - [x] User does not need to scroll manually
  - [x] Scroll and capture are managed by the extension
- [x] **Result:**
  - [x] Content flow: Continuous stream of content that flowed through the selection
  - [x] Page scroll: Complete page image stitched from multiple captures
- [x] **Framer Motion Scroll Animation:**
  - [x] Smooth scroll animations between capture steps
  - [x] Animated progress indicator with real-time feedback
  - [x] Smooth transitions and micro-interactions
- [x] **Progress Indicator:**
  - [x] Show progress (e.g., "Capturing content flow 2/8...")
  - [x] Animated progress bar with gradient
  - [x] Cancel option for ongoing scroll capture
  - [x] Different text for content flow vs page scroll
- [x] **Custom Hook Architecture:**
  - [x] `useSmoothScroll` hook for animated scrolling
  - [x] `useContentFlowCapture` hook for content flow capture
  - [x] `usePageScrollCapture` hook for full page capture
  - [x] Modular and reusable components

## 🚀 Cool Ideas & Enhancements

- [ ] **Enhanced Progress Feedback:**
  - [ ] Show estimated time remaining
  - [ ] Animated preview of captured slices
  - [ ] Sound effects for completion
- [ ] **Preview & Edit:**
  - [ ] Show a preview of the stitched result before saving/copying
  - [ ] Allow basic annotation or cropping after capture
- [ ] **Smart Area Detection:**
  - [ ] Snap selection to DOM elements (e.g., code blocks, chat windows)
  - [ ] Option to auto-detect scrollable containers
- [ ] **Keyboard Shortcuts:**
  - [ ] Start/pause/cancel scroll capture with keyboard
- [ ] **Clipboard & Export:**
  - [ ] Copy result to clipboard, save as PNG/JPG, or open in editor
- [ ] **Accessibility:**
  - [ ] Announce progress and completion for screen readers
- [ ] **Multi-Page/Infinite Scroll:**
  - [ ] Option to keep scrolling/capturing until end of content or user-defined limit
- [ ] **Custom Cursor:**
  - [ ] Show a special cursor during scroll capture mode
- [ ] **Error Handling:**
  - [ ] Graceful fallback if a capture fails (retry, skip, or alert user)
- [ ] **Advanced Animation Options:**
  - [ ] Different easing functions (bounce, elastic, etc.)
  - [ ] Customizable animation duration
  - [ ] Particle effects during capture

## Technical Implementation

### ✅ Custom Hooks

- [x] **`useSmoothScroll`:** Manages smooth scroll animations with easing functions
- [x] **`useContentFlowCapture`:** Handles content flow capture logic, progress tracking, and image stitching
- [x] **`usePageScrollCapture`:** Handles full page capture by scrolling and stitching
- [x] **`ScrollCaptureProgress`:** Framer Motion component for progress visualization

### ✅ Framer Motion Integration

- [x] Smooth scroll animations with cubic easing
- [x] Animated progress bar with gradient
- [x] Rotating loading spinner
- [x] Smooth entrance/exit animations
- [x] Progress text animations

### ✅ Configuration

- [x] Scroll duration configurable (default: 800ms)
- [x] Capture delay configurable (default: 1200ms)
- [x] Overlap between captures (50px for content flow, 100px for page scroll)

### ✅ Architecture

- [x] Modular hook-based design
- [x] Separation of concerns (content flow vs page scroll)
- [x] Reusable components
- [x] Progress tracking and cancellation support

## Hook Differences

### `useContentFlowCapture`

- **Purpose:** Capture content that flows through a selected area
- **Input:** Selection rectangle
- **Output:** Continuous stream of content that flowed through the selection
- **Use Case:** Capturing a chat conversation, social media feed, or any content that flows through a specific area

### `usePageScrollCapture`

- **Purpose:** Capture the entire page by scrolling and stitching
- **Input:** No selection needed (uses page dimensions)
- **Output:** Complete page image
- **Use Case:** Full page screenshots, documentation capture, etc.

## Open Questions / Future Ideas

- [ ] Should we support capturing inside scrollable containers (not just window)?
- [ ] Should we allow horizontal+vertical (grid) scroll capture?
- [ ] How should we handle sticky/fixed elements inside the selection?
- [ ] Should we offer a "smart stitch" to remove duplicate headers/footers?
- [ ] What other delightful microinteractions can we add?
- [ ] Should we add haptic feedback for mobile devices?
- [ ] Could we add a "capture preview" mode that shows what will be captured?

## Usage Instructions

### Content Flow Capture

1. **Select Area:** Click and drag to select the area where content flows
2. **Choose Mode:** Click "Scroll Capture" button that appears below the selection
3. **Watch Progress:** The extension will show "Content Flow Capture in Progress" with:
   - Animated progress bar
   - Current step (e.g., "Capturing content flow 2/5")
   - Percentage complete
   - Cancel option
4. **Smooth Animation:** The page will smoothly scroll to make content flow through your selection
5. **Automatic Stitching:** All captured content is stitched into a continuous stream
6. **Result:** The final image shows the content that flowed through your selection

### Page Scroll Capture

1. **No Selection Needed:** Use the "Capture Full Page" button in the sidebar
2. **Watch Progress:** The extension will show "Page Scroll Capture in Progress"
3. **Smooth Animation:** The page will smoothly scroll from top to bottom
4. **Automatic Stitching:** All page sections are stitched into one complete image
5. **Result:** The final image shows the entire page

## Manual Scroll Capture (Default Mode)

The default scroll capture mode is manual, designed for maximum user control and future extensibility. Here's how it works:

### How It Works

- After selecting an area, the user taps the "Scroll Capture" button to enter capture mode.
- The user scrolls the page manually. As they scroll, the extension captures the content inside the selection area.
- **Throttling:** To prevent excessive captures and ensure performance, the extension only captures a new slice if a minimum interval (default: 800ms) has passed since the last capture. This avoids flooding the preview if the user scrolls rapidly.
- A live preview panel appears next to the selection, showing the stitched result as new slices are added.
- The "Scroll Capture" button changes to "Done". When the user taps "Done", the session ends, all slices are stitched, and the result is added to the sidebar panel.

### Future-Proofing for Automation

- The architecture is designed so that an automated scroll/capture mode can be added later (e.g., a toggle or button to switch between manual and automated modes).
- In the future, users will be able to choose between manual and automated scroll capture, or even pause/resume automation during a session.

### Summary

- **Manual scroll** is the default for now, with throttling to ensure quality and performance.
- **Live preview** provides immediate feedback as the capture progresses.
- **"Done" button** finalizes the session and stitches the result.
- **Automation** is planned for future releases and will be integrated into the same flow.

## Technical Notes

- **Scroll Animation:** Uses `requestAnimationFrame` for smooth 60fps animations
- **Easing Functions:** Implements cubic easing for natural motion
- **Progress Tracking:** Real-time progress updates during scroll and capture
- **Error Handling:** Graceful fallback and cancellation support
- **Performance:** Optimized for large captures with overlap for better stitching
- **Hook Separation:** Clear separation between content flow and page scroll logic

---

**This doc is a living spec and idea board for the Scroll Capture feature. The core functionality is now implemented with beautiful Framer Motion animations and proper hook separation!**
