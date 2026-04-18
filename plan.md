# RadioPod — Implementation Plan

## Phase 1: Project Setup

1. Add Vitest to the project (config + test script in package.json)
2. Add `qrcode.react` dependency for QR code generation
3. ~~Change Vite build output to `/docs`~~ DONE
4. ~~Add `vite-plugin-singlefile` to bundle everything into a single HTML file~~ DONE
5. Clean out the default Vite template code (App.jsx, App.css, index.css)

## Phase 2: Core Layout & Styling

5. Create iPod Mini body component (rounded rect, scaled to viewport height)
6. Implement body color system (CSS custom properties for each iPod Mini color)
7. Create LCD screen component (light gray bg, black text, pixel font)
8. Create click wheel component (circular, 5 zones, center button)
9. Add click wheel visual interactivity (hover highlights, press animations, scroll feedback)

## Phase 3: Navigation System

10. Implement stack-based navigation context (push/pop screens)
11. Create title bar component (title, divider, battery icon, play state icon)
12. Create scrollable list component (items, right arrows, scrollbar indicator)
13. Create main menu screen with all menu items
14. Wire Menu button (top of wheel / Escape key) to pop navigation stack

## Phase 4: Input Handling

15. Implement click wheel mouse interaction (click zones, scroll ring)
16. Implement keyboard mapping (arrows, enter, escape)
17. Implement type-to-filter for list views (keyboard input → title bar)
18. Implement long-press detection for center button

## Phase 5: Radio Browser API Integration

19. Create API service module for Radio Browser API
20. Prefetch countries, languages, tags on app load (filter empty entries)
21. Create Country sub-menu with type-to-filter
22. Create Language sub-menu with type-to-filter
23. Create Tags sub-menu with type-to-filter
24. Create Search screen (free-text search)
25. Create station results list view
26. Handle API errors ("No Connection" screen)

## Phase 6: Audio Playback

27. Create `useAudio` hook wrapping HTML5 `<audio>` element
28. Implement play/pause via click wheel bottom button
29. Implement volume control via scroll wheel on Now Playing
30. Create white noise generator using Web Audio API
31. Implement seeking transition (fade out → white noise → fade in new station)

## Phase 7: Now Playing Screen

32. Build Now Playing layout (play/pause icon, station info, volume bar)
33. Show station position in Station List ("1 of 23")
34. Display description as Country · Language · Tags
35. Show "Seeking..." state in title bar during station switch
36. Implement QR code overlay (center press toggle)

## Phase 8: Station List

37. Create Station List with localStorage persistence
38. Auto-add stations on first play (deduplicate by URL)
39. Implement short press to play in Station List
40. Implement long press to delete with confirmation alert
41. Implement prev/next station (left/right wheel buttons)
42. Add "Now Playing" menu item (visible only when station loaded)

## Phase 9: Settings

43. Create Settings menu screen
44. Implement brightness setting (LCD background gray level, persisted)
45. Implement body color setting (list of iPod Mini colors, persisted)

## Phase 10: Error Handling & Polish

46. Handle dead streams ("No Signal", auto-skip after a few seconds)
47. Handle empty search results ("No Results")
48. Responsive design (scale iPod proportionally on different viewports)
49. Accessibility (ARIA labels, keyboard-navigable, screen reader support)

## Phase 11: Testing

50. Unit tests for navigation stack logic
51. Unit tests for Station List (add, delete, deduplicate, persistence)
52. Unit tests for Radio Browser API service (mock responses, error handling)
53. Unit tests for audio state management
54. Component tests for key UI components

## Dependencies to Add

- `vitest` + `@testing-library/react` + `jsdom`
- `qrcode.react`
