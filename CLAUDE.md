# RadioMini — Code Architecture

## Build Setup

- **Framework:** React 19 + Vite 8
- **Output:** Single-file HTML via `vite-plugin-singlefile` → `docs/` (GitHub Pages)
- **Tests:** Vitest 4 + React Testing Library, jsdom environment
- **Linting:** ESLint flat config with `eslint-plugin-react-hooks`
- **No TypeScript** — plain JS/JSX throughout

```
npm run dev      # dev server
npm run build    # production build → docs/index.html
npm run test     # vitest
npm run lint     # eslint
```

---

## Directory Structure

```
src/
├── main.jsx                  # React root, unregisters service workers
├── App.jsx                   # Top-level orchestrator: input routing + screen dispatch
├── App.css                   # Global reset, font import, root centering
│
├── components/               # Reusable presentational + interactive components
│   ├── IPod.jsx / .css       # Outer shell — aspect ratio, body color CSS vars
│   ├── Screen.jsx / .css     # LCD display — brightness, border, layout
│   ├── ClickWheel.jsx / .css # SVG click wheel — gesture handling, sound, colors
│   ├── ScrollableList.jsx / .css  # Virtualized menu list with scrollbar
│   ├── TitleBar.jsx / .css   # Header: status icon, title/search input, battery
│   ├── MarqueeText.jsx       # Scrolling text for long names
│   ├── VolumeBar.jsx / .css  # Volume slider display
│   ├── ConfirmDialog.jsx / .css   # Modal yes/no overlay
│   └── QROverlay.jsx / .css  # QR code display (qrcode.react)
│
├── screens/                  # One file per navigation destination
│   ├── MainMenu.jsx
│   ├── NowPlaying.jsx
│   ├── StationList.jsx
│   ├── CategoryList.jsx      # Country / Language / Tags browser
│   ├── StationResults.jsx    # Results for a selected category
│   ├── Search.jsx
│   ├── Settings.jsx
│   ├── BrightnessControl.jsx
│   ├── BodyColorPicker.jsx
│   └── QRScanner.jsx / .css  # Camera + jsQR scanning
│
├── contexts/                 # React Context providers
│   ├── NavigationContext.jsx
│   ├── AudioContext.jsx
│   ├── SettingsContext.jsx
│   ├── StationListContext.jsx
│   └── RadioBrowserContext.jsx
│
├── hooks/                    # Custom hooks
│   ├── useClickWheel.js      # Pointer gesture math
│   ├── useKeyboard.js        # Desktop keyboard shortcuts
│   ├── useLongPress.js       # 500ms threshold, short vs. long callback
│   ├── useLocalStorage.js    # JSON persistence with functional-update support
│   ├── useTypeToFilter.js    # Thin wrapper: filterText + setFilterText + clearFilter
│   ├── useBattery.js         # Battery Status API with event listeners
│   └── useUiSound.js         # Web Audio click sound synthesis
│
├── services/
│   └── radioBrowser.js       # Radio Browser API wrapper (fetch + filtering)
│
├── constants/
│   ├── screens.js            # Screen name constants
│   ├── colors.js             # iPod color configs (body, wheel, center)
│   └── defaultStation.js     # Bundled default station object
│
├── utils/
│   └── platform.js           # isIOS() / isAndroid() detection
│
└── __tests__/
    ├── setup.js
    ├── radioBrowser.test.js
    ├── navigation.test.jsx
    └── stationList.test.jsx
```

---

## State Architecture

Five React Contexts, nested in `App.jsx`:

```
SettingsProvider
  NavigationProvider
    AudioProvider
      StationListProvider
        RadioBrowserProvider
          AppInner
```

### NavigationContext

Stack-based navigation. `current` is always `stack[stack.length - 1]`.

```js
{ screen: 'NOW_PLAYING', props: {} }   // ← current
```

Initial stack: `[MAIN_MENU, NOW_PLAYING]`. Going "back" from MAIN_MENU lands on NOW_PLAYING, not an empty app.

Actions: `push(screen, props?)`, `pop()` (min 1), `reset()` → `[MAIN_MENU]`.

### AudioContext

Owns the single `<audio>` element (via ref). Exposes:

| Export | Description |
|--------|-------------|
| `play(station, onSuccess?)` | Switch to new station with white noise seek |
| `preload(station)` | Set src + load() without playing |
| `togglePlayPause()` | Pause / resume current station |
| `setVolume(0–1)` | Clamped, synced to audio element |
| `currentStation`, `isPlaying`, `isSeeking`, `volume`, `error` | Reactive state |

**Seeking sequence:**
1. Create white noise (buffered Web Audio API, looped)
2. Ramp gain to 30% of current volume over 200ms
3. Set new `audio.src`, call `audio.load()`
4. Wait for `canplay` event OR 8-second timeout (`readyState >= 3`)
5. Stop white noise (300ms fade), play new stream
6. On failure: set `error = 'No Signal'`

`seekAbortRef` holds a cleanup function so switching stations mid-seek cancels cleanly.

### SettingsContext

Thin wrapper around `useLocalStorage` for three keys:

| Key | Default |
|-----|---------|
| `RadioMini-brightness` | `80` |
| `RadioMini-body-color` | `"Silver"` |
| `RadioMini-ui-sound` | `isIOS()` (true on iOS, false elsewhere) |

### StationListContext

Persisted JSON array in `RadioMini-stations`. Deduplicates by `url_resolved`. Exposes `add`, `remove`, `getIndex`.

### RadioBrowserContext

Fetches countries, languages, and tags on mount (filtered to `stationcount > 0`). Cached in memory for the session lifetime. Three independent fetch errors are tracked separately.

---

## Input Architecture

All input converges on a small set of callbacks in `App.jsx` (`handleScroll`, `handleSelect`, `handleLongPress`, `handleMenu`, `handlePrev`, `handleNext`). Three sources feed these:

```
ClickWheel (touch/pointer) ─┐
useKeyboard (keyboard)       ├─▶  App.jsx handlers ─▶ Context updates / navigation
useLongPress (center btn)   ─┘
```

### Click Wheel (`useClickWheel.js`)

Geometry computed on every `pointermove`:

```
angle = atan2(y − cy, x − cx)   // −180° to +180°
delta = angleDiff(angle, lastAngle)  // handles wraparound
accum += delta
while accum >= 10°: emit onScroll(+1), accum -= 10°
while accum <= -10°: emit onScroll(-1), accum += 10°
```

Click detection: if `totalDelta < 8°` on pointer-up, it was a zone tap, not a scroll.

Zone map (angle from right, clockwise): right = Next, bottom = Play/Pause, left = Prev, top = Menu.

`vibrateReady` is a module-level flag (not React state) because it must persist across renders without causing re-renders. Chrome blocks `navigator.vibrate()` until a committed pointer-up gesture is received.

### Long Press (`useLongPress.js`)

```
onPressStart → setTimeout(500ms, markLong + call onLongPress)
onPressEnd   → clearTimeout; if not long → call onShortPress
```

### Screen Action Registration

Screens that own their own select/longPress behavior call:

```js
onRegisterActions({ select: fn, longPress: fn, itemCount: n })
```

This writes to `screenActionsRef.current` in `App.jsx` — a ref (not state) so updates don't trigger re-renders. `App.jsx` reads from it in `handleSelect` and `handleLongPress`.

---

## Component Patterns

### ScrollableList

Does not scroll the DOM — it slices the `items` array to only render visible items:

```js
startIndex = clamp(selectedIndex - floor(visibleCount / 2), 0, total - visibleCount)
visibleItems = items.slice(startIndex, startIndex + visibleCount)
```

`visibleCount` is measured via `ResizeObserver` on the container + first item height. Accepts an optional `renderItem(item, isSelected)` for custom row rendering (used by Settings for the toggle row).

### MarqueeText

Three-phase animation using CSS transitions driven by React state:

```
'idle' (5s) → 'scrolling' (duration = offset/40px·s) → 'reset' (1s) → back to 'idle'
```

Uses `ResizeObserver` on both the container and inner span to know when text overflows. No animation runs if the text fits.

### TitleBar

Dual-mode: normal (with status icon + battery) or `plain` (text only, for QR overlay). When `searchProps` is passed, the title text is replaced with a controlled `<input>`. `.focus()` is called synchronously on mount — works on desktop/Android; silently ignored by iOS (user taps the input directly; "Type here..." placeholder guides them).

---

## CSS Conventions

- One `.css` file per component, imported directly in the component file
- BEM-style class names: `.component-name__element--modifier`
- No CSS framework, no CSS modules (plain global classes, scoped by BEM naming)
- CSS custom properties (`--battery-level`, `--body-color`, etc.) for dynamic theming
- Pixel-art aesthetic: no `border-radius` on structural elements, monospace font
- `100dvh` (dynamic viewport height) for the root to handle mobile browser chrome

---

## Radio Browser API (`services/radioBrowser.js`)

Base URL: `https://de1.api.radio-browser.info`

All requests include:
```
hidebroken=true, lastcheckok=1, order=clickcount, reverse=true, limit=100
User-Agent: RadioMini/1.0
```

| Function | Endpoint |
|----------|----------|
| `fetchCountries()` | `/json/countries` |
| `fetchLanguages()` | `/json/languages` |
| `fetchTags()` | `/json/tags` (limit 500) |
| `fetchStationsByCountry(v)` | `/json/stations/bycountry/{v}` |
| `fetchStationsByLanguage(v)` | `/json/stations/bylanguage/{v}` |
| `fetchStationsByTag(v)` | `/json/stations/bytag/{v}` |
| `searchStations(q)` | `/json/stations/search?name={q}` |

All station results are post-filtered: `lastcheckok === 1` AND `url_resolved` is non-empty.

---

## Platform Detection (`utils/platform.js`)

```js
isIOS()     // /iPad|iPhone|iPod/.test(UA) || (MacIntel + maxTouchPoints > 1)
isAndroid() // /Android/i.test(UA)
```

The `MacIntel + maxTouchPoints` check covers iPads on iOS 13+ which report as desktop Safari.

**iOS restrictions handled in code:**
| Restriction | Where handled |
|-------------|--------------|
| `audio.volume` read-only | `App.jsx handleScroll` — skips `setVolume` on iOS |
| No Vibration API | `useClickWheel.js` — `navigator.vibrate` guard already present |
| No programmatic focus | `TitleBar.jsx` — synchronous focus (silently ignored); placeholder instead |
| Long-press text selection | `ClickWheel.css` — `-webkit-user-select: none`; `ClickWheel.jsx` — `onContextMenu` prevented |

---

## Testing

Tests live in `src/__tests__/`. Run with `npm test`.

| File | Coverage |
|------|----------|
| `radioBrowser.test.js` | API endpoint construction, error handling |
| `navigation.test.jsx` | push/pop/reset, initial stack, lower bound |
| `stationList.test.jsx` | add/remove/getIndex, deduplication, localStorage persistence |

Tests use `globalThis.fetch` mocking (Vitest) and `localStorage` mock resets between tests. No component render tests yet — the test suite covers pure logic.

---

## Key Design Decisions

**Why a single `<audio>` element?**
Simpler lifecycle. The element lives in `AudioContext`, never unmounts, and src-swaps handle station changes. Avoids race conditions from mounting/unmounting audio elements.

**Why module-level `vibrateReady` instead of React state?**
It must survive renders without causing them. A ref would work too, but module scope is simpler and the flag is shared across all wheel instances (there is only ever one).

**Why `screenActionsRef` instead of state?**
Screens register their callbacks on every render via `useEffect`. Making this state would cause a re-render cascade. A ref is written to freely and read only inside event handlers (not during render), so no consistency issue.

**Why inline all JS/CSS into one HTML file?**
The app is deployed to GitHub Pages as `docs/index.html`. A single file means zero relative-path issues, zero CORS preflight for assets, and trivially shareable.

**Why no router?**
The navigation stack is app-specific (back from MAIN_MENU goes to NOW_PLAYING, not "browser back"). A standard router would require fighting its history model. The custom stack is 30 lines and does exactly what's needed.
