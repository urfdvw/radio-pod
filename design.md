# RadioMini — UX Design Specification

## Concept

RadioMini is a pixel-faithful recreation of the iPod Mini, reimagined as an internet radio player. Every design decision traces back to the real hardware: the 51×91mm body, the 138×110px screen aspect ratio, the four-zone click wheel, the Chicago-style typeface. The physical constraints of a 2004 device are treated as creative direction, not limitations.

---

## Visual Design

### iPod Body

- Dimensions: aspect ratio 51:91 (portrait), fills full viewport height using `100dvh`
- No rounded corners — faithful to the original rectangular body profile
- Body color controlled by CSS custom properties, switchable from Settings
- Subtle metallic shadow and gradient overlay for depth
- Two regions separated by physical proportions:
  - **Top ~48%:** LCD screen with bezels
  - **Bottom ~52%:** Click wheel centered in remaining space

### iPod Mini Body Colors

| Name   | Generation |
|--------|-----------|
| Silver | 1st & 2nd gen (default) |
| Gold   | 1st gen only |
| Pink   | 1st & 2nd gen |
| Blue   | 1st & 2nd gen |
| Green  | 1st & 2nd gen |

Each color includes three values: the main body color, the wheel ring color, and the wheel center color.

### LCD Screen

- Aspect ratio: 138:110 — matches the real iPod Mini screen
- Width: 82% of body, centered with small bezels
- Background: light gray, dynamically adjusted by brightness setting
  - Brightness range 0–100 maps to RGB `110–235` (never pure black or white)
  - Above 80% brightness: a subtle white glow filter activates
- Text: `Silkscreen` pixel font (Google Fonts), falling back to `Chicago`, then monospace
- Border: 2px solid `#555`
- Layout: flex column, top-to-bottom

### Click Wheel

- SVG-based, 78% of body width
- Ring diameter matches real iPod Mini (~40mm proportional)
- Wheel and center colors from selected body color theme
- Zone icons (MENU, ▶◀, ▶❚❚) rendered as SVG `<polygon>`/`<text>` with `pointer-events: none`
- `touch-action: none` prevents browser interference with pointer events
- `user-select: none; -webkit-user-select: none` prevents iOS long-press text selection
- `onContextMenu` prevented on the SVG to block the iOS callout popup

---

## Typography

| Use | Font | Size | Style |
|-----|------|------|-------|
| All UI text | Silkscreen → Chicago → monospace | varies | normal |
| Title bar | — | 0.75em | normal |
| Station name | — | 0.85em | **bold** |
| Metadata / position | — | 0.7em | 0.7 opacity |
| Volume bar | — | 0.65em | — |
| Click wheel label (MENU) | — | 12px | — |

Long station names scroll via `MarqueeText`: 5s pause → scroll at 40px/s → 1s reset pause → repeat.

---

## Screens (10 total)

Navigation is a stack. Selecting an item pushes a screen; pressing MENU pops (minimum 1 item on stack). The initial stack is `[MAIN_MENU, NOW_PLAYING]` so the first back from MAIN_MENU goes to NOW_PLAYING.

---

### Main Menu

```
┌──────────────────────┐
│  RadioMini          🔋│
│──────────────────────│
│  Now Playing       > │  ← hidden if no station loaded
│  Station List      > │
│  Country           > │
│  Language          > │
│  Tags              > │
│  Search            > │
│  QR Scanner        > │
│  Settings          > │
└──────────────────────┘
```

- "Now Playing" is the first item but only rendered when a station is active
- All items use `ScrollableList`; keyboard typing filters in real time (type-to-filter)

---

### Now Playing

```
┌──────────────────────┐
│▶ Now Playing       🔋│
│──────────────────────│
│  1 of 23             │
│                      │
│  [Station Name~~~~]  │  ← MarqueeText
│  US · English · Pop  │  ← MarqueeText
│                      │
│  🔈 ████████░░░░ 🔊  │
└──────────────────────┘
```

**Title bar states:**
| Condition | Icon | Title |
|-----------|------|-------|
| Playing | ▶ (triangle) | Now Playing |
| Paused | ❚❚ (bars) | Paused |
| Seeking | ⟳ (spinning magnifier SVG) | Seeking |
| Error | ■ (stop square) | No Signal |

**Volume bar:**
- Speaker icons left (quiet) and right (loud)
- Fill track reflects current volume percentage
- Scroll wheel adjusts volume on this screen only (not on iOS)
- iOS: bar is display-only (system volume not accessible via JS)

**Center button:** toggles QR code overlay

**Long-press center button:** opens QR Scanner

---

### QR Code Overlay (on Now Playing)

```
┌──────────────────────┐
│  Station Name      🔋│  ← plain title bar
│──────────────────────│
│                      │
│    ┌────────────┐    │
│    │  ▀▄▀  ▄▀  │    │
│    │  ▄ ▀▄▀▄▀  │    │
│    │  ▀▄ ▀▄▄▀  │    │
│    └────────────┘    │
│                      │
└──────────────────────┘
```

QR code encodes JSON:
```json
{
  "name": "Station Name",
  "description": "US · English · Pop",
  "url": "https://stream.example.com/"
}
```

Center press again dismisses. Title bar switches to plain mode (station name, no icons).

---

### Station List

```
┌──────────────────────┐
│  Station List      🔋│
│──────────────────────│
│  Radio Gotanno     > │
│▶ WNYC 93.9         > │  ← selected
│  BBC World Service > │
│  NHK World Radio   > │
└──────────────────────┘
```

- **Short center press:** Play the highlighted station → navigate to Now Playing
- **Long center press (500ms):** Open delete confirmation dialog

**Delete confirmation:**
```
┌──────────────────────┐
│  Delete station?     │
│                      │
│     [ Cancel ]       │
│     [ Delete ]       │  ← scroll to pick
└──────────────────────┘
```

Scroll wheel picks Cancel / Delete. Center button confirms.

---

### Category List (Country / Language / Tags)

```
┌──────────────────────┐
│  Country           🔋│
│──────────────────────│
│  [Type here...]      │  ← search input in title bar
│──────────────────────│
│  United States (4k)  │
│  United Kingdom (2k) │
│▶ Japan (1.2k)        │
│  Germany (980)       │
└──────────────────────┘
```

- Title bar becomes a search input on load
- Typing filters the list in real time (case-insensitive substring)
- Auto-focuses on desktop/Android; placeholder guides iOS users
- Item label: `Name (stationcount)` — counts fetched from Radio Browser API
- Items sorted by station count descending; tags limited to top 500

---

### Station Results

```
┌──────────────────────┐
│  Japan             🔋│
│──────────────────────│
│  NHK World Radio     │
│▶ J-Wave 81.3         │
│  Tokyo FM            │
│  Bay FM              │
└──────────────────────┘
```

- Fetched from Radio Browser API filtered by country/language/tag
- Only shows stations with `lastcheckok=1` and a valid `url_resolved`
- Results capped at 100, ordered by click count descending
- Selecting plays the station, adds to Station List (deduplication by URL), navigates to Now Playing

---

### Search

```
┌──────────────────────┐
│▶ Now Playing       🔋│
│──────────────────────│
│  [Type here...]      │  ← search input in title bar
│──────────────────────│
│  (results appear     │
│   after 2 chars,     │
│   500ms debounce)    │
└──────────────────────┘
```

- Status bar shows play/pause state while searching (search doesn't interrupt playback)
- Minimum 2 characters to trigger API call
- 500ms debounce to avoid hammering the API
- Empty or short input: "Type to search" placeholder in list area
- Selecting a result: play, save, navigate to Now Playing

---

### Settings

```
┌──────────────────────┐
│  Settings          🔋│
│──────────────────────│
│  Brightness        > │
│  Body Color        > │
│  UI Sound        Off │
└──────────────────────┘
```

- **Brightness:** pushes to BrightnessControl screen
- **Body Color:** pushes to BodyColorPicker screen
- **UI Sound:** toggle in-place; shows "On" / "Off" in place of `>`; pressing center flips state

---

### Brightness Control

```
┌──────────────────────┐
│  Brightness        🔋│
│──────────────────────│
│                      │
│         80%          │
│                      │
│  ████████░░░░░░░░░░  │
│                      │
└──────────────────────┘
```

- Scroll wheel adjusts 0–100 in steps of 5
- LCD background updates live as brightness changes
- Read-only display (no direct interaction with the bar itself)

---

### Body Color Picker

```
┌──────────────────────┐
│  Body Color        🔋│
│──────────────────────│
│  ● Silver          ✓ │  ← checkmark = current
│  ○ Gold              │
│  ○ Pink              │
│  ○ Blue              │
│  ○ Green             │
└──────────────────────┘
```

- Color applied immediately on select
- Color swatch rendered as a small filled circle in the item's accent color
- Checkmark on currently active color

---

### QR Scanner

```
┌──────────────────────┐
│  QR Scanner        🔋│  ← plain title
│──────────────────────│
│  ┌────────────────┐  │
│  │                │  │
│  │  [camera feed] │  │
│  │                │  │
│  └────────────────┘  │
│  Scanning...         │
└──────────────────────┘
```

- Requests environment-facing (rear) camera
- Captures frames to canvas, decodes with `jsQR` every animation frame
- Expects QR containing JSON: `{ url, name?, description? }`
- On success: creates a temporary station object and plays it
- 8-second timeout: if QR not found, attempts to play partial URL if any
- Status text: "Starting camera…" → "Scanning…" → "Camera unavailable" on failure

---

## Interaction Model

### Click Wheel Gestures

The wheel ring is a single SVG `<circle>` with pointer event handlers. All geometry is computed from the pointer's angle relative to the wheel center.

**Zones (by angle from right, clockwise):**

| Angle range | Zone | Action |
|-------------|------|--------|
| −135° to −45° | Top | Menu |
| −45° to +45° | Right | Next station |
| +45° to +135° | Bottom | Play/Pause |
| +135° to ±180° or −180° to −135° | Left | Previous station |

**Click vs. Scroll distinction:**
- Total angular movement < 8°: treated as a zone click
- Total angular movement ≥ 8°: treated as a scroll (zone clicks suppressed)

**Scroll resolution:** 10° per tick. Each tick fires `onScroll(±1)`.

**Haptic feedback (Android):**
- Ring pointer-down: 10ms vibration
- Each scroll tick: 8ms vibration
- Center pointer-down: 10ms vibration
- `vibrateReady` flag prevents vibration before the browser has received a committed pointer-up gesture (Chrome requirement)

**UI click sound (all platforms, if enabled):**
- 12ms white noise burst through a 3 kHz band-pass filter, gain 0.25
- Envelope: 4th-order exponential decay (instantaneous attack)
- Fired on: ring down, each scroll tick, center down
- `AudioContext` created lazily on first interaction (browser auto-play policy)

**Mouse scroll wheel:** mapped to `onScroll(±1)` via `wheel` event with `passive: false`

### Center Button

- `pointerdown` → `onSelectStart` (starts long-press timer, vibrates)
- `pointerup` → `onSelectEnd` (stops timer; fires short or long callback)
- Long-press threshold: **500ms**

**Short press actions by screen:**
| Screen | Action |
|--------|--------|
| Now Playing | Toggle QR overlay |
| Most list screens | Select highlighted item |
| Station List | Play station |
| ConfirmDialog | Confirm selected option |

**Long-press actions by screen:**
| Screen | Action |
|--------|--------|
| Now Playing | Open QR Scanner |
| Station List | Open delete confirmation |

### Keyboard Mapping (Desktop)

| Key | Action |
|-----|--------|
| `Escape` / `ArrowUp` | Menu (back) |
| `ArrowDown` | Play/Pause |
| `ArrowLeft` | Previous station |
| `ArrowRight` | Next station |
| `Enter` | Select (center button) |
| `=` / `+` | Scroll down |
| `-` / `_` | Scroll up |
| Any printable key | Type-to-filter (in list views) |

Keyboard is ignored while focus is inside a text `<input>` (except `Enter` = select and `Escape` = menu).

---

## State Transitions

### Audio Seeking

When switching to a new station:

```
Current audio playing
     │
     ▼
White noise fades in (0 → 30% of current volume, 200ms ramp)
Current audio src changed + load()
Title bar: "Seeking"
     │
     ├─ canplay fires ──────────────────────┐
     │                                      ▼
     └─ 8s timeout (readyState ≥ 3?) ─▶ Crossfade out white noise (300ms)
                                          New audio plays at full volume
                                          Title bar: "Now Playing"
```

If neither `canplay` nor timeout resolves: "No Signal" error.

White noise is generated via Web Audio API (buffered random samples, loop-enabled). No audio files required.

### Navigation Stack

```
Initial: [MAIN_MENU, NOW_PLAYING]

push(SCREEN)   → [..., SCREEN]
pop()          → [...] (minimum 1)
reset()        → [MAIN_MENU]
```

`current` always refers to `stack[stack.length - 1]`. Each screen can carry typed `props` (e.g. `{ type: 'country', endpoint: '...', value: 'Japan' }`).

---

## Scrollable List Behavior

- Measures container height and single item height via `ResizeObserver`
- Computes `visibleCount = floor(containerHeight / itemHeight)`
- Viewport window centered on selected item:
  - `startIndex = clamp(selectedIndex − floor(visibleCount/2), 0, total − visibleCount)`
- Scrollbar: proportional thumb height `= (visibleCount / total) * 100%`; only shown when list overflows
- Scrollbar is decorative only — not interactive

---

## Platform-Specific Behavior

| Feature | Desktop | Android | iOS |
|---------|---------|---------|-----|
| Volume via scroll wheel | Yes | Yes | No (read-only display) |
| Haptic vibration | No | Yes | No (API absent) |
| UI click sound (default) | Off | Off | On |
| Search auto-focus | Yes | Yes | No (browser blocks; placeholder guides user) |
| Long-press text selection | N/A | Suppressed by vibration timing | Suppressed by `user-select: none` + `onContextMenu` |

iOS detection: `iPad|iPhone|iPod` in UA, or `MacIntel` platform with `maxTouchPoints > 1` (covers iPad on iOS 13+).

---

## Persistence (localStorage)

| Key | Type | Default |
|-----|------|---------|
| `RadioMini-stations` | JSON array | `[Radio Gotanno]` |
| `RadioMini-brightness` | number | `80` |
| `RadioMini-body-color` | string | `"Silver"` |
| `RadioMini-ui-sound` | boolean | `true` on iOS, `false` elsewhere |

---

## Battery Display

- Uses Battery Status API (`navigator.getBattery()`)
- Shown as a CSS-only icon (no SVG) in the top-right of the title bar
- `--battery-level` CSS variable drives fill width
- Charging state: pulsing animation on the battery icon
- Graceful degradation: icon shown at 100% if API unavailable

---

## Error States

| Condition | Display |
|-----------|---------|
| Stream fails to load | "No Signal" in title bar, ■ stop icon |
| Radio Browser API failure | "No Connection" in list view |
| No search results | "No Results" in list view |
| Search input < 2 chars | "Type to search" in list view |
| Camera unavailable (QR Scanner) | "Camera unavailable" status text |

---

## Build Output

- Single-file HTML build via `vite-plugin-singlefile` — the entire app (JS + CSS) is inlined into one `index.html`
- Output directory: `docs/` (for GitHub Pages deployment)
- No service worker — `main.jsx` unregisters any existing ones on load
