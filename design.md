# RadioPod — iPod Mini Web Radio Player

## Overview

A single-page React web app that renders a virtual iPod Mini as a web radio player. The iPod fills the viewport height, with a simulated LCD screen and interactive click wheel. Radio stations are fetched from the Radio Browser API.

## UI Layout

### iPod Body

- Rounded silver (or colored) rectangle, height = viewport height
- Top ~40%: LCD screen
- Bottom ~40%: Click wheel
- Body color is configurable in Settings (all iPod Mini 1st & 2nd gen colors)

### iPod Mini Body Colors

**1st gen (2004):** Silver, Gold, Pink, Blue, Green
**2nd gen (2005):** Silver, Pink, Blue, Green

All colors available as options in Settings.

### LCD Screen

- Background: light gray (adjustable via brightness setting)
- Text: black, pixel/Chicago-style font
- Title bar at top with divider line below
- Battery icon (cosmetic, always full) top-right
- Thin scrollbar on right edge for lists

### Click Wheel

- Circular wheel with 5 zones:
  - **Top:** Menu (go back)
  - **Left:** Previous station (in Station List)
  - **Right:** Next station (in Station List)
  - **Bottom:** Play/Pause
  - **Center button:** Select / context action
- Visual feedback: segments highlight on hover, center button depresses on click, subtle rotation feedback on scroll
- **Scroll ring:** controls list scrolling (in menus) and volume (on Now Playing)

### Input Mapping

- **Mouse scroll** → click wheel scroll (list navigation / volume)
- **Arrow Up/Down** → click wheel scroll
- **Arrow Left** → previous station
- **Arrow Right** → next station
- **Enter** → center button (select)
- **Escape** → menu (back)
- **Physical keyboard typing** → type-to-filter in list views

## Screens

### Main Menu

```
┌──────────────────────┐
│    RadioPod        🔋│
│──────────────────────│
│                      │
│  Now Playing       > │
│  Station List      > │
│  Country           > │
│  Language          > │
│  Tags              > │
│  Search            > │
│  Settings          > │
│                      │
└──────────────────────┘
```

- "Now Playing" only visible when a station is loaded
- Navigation is stack-based: selecting pushes a screen, Menu pops back

### Sub-menus (Country / Language / Tags)

- Title bar shows the category name
- Typing on keyboard filters the list; typed text appears in the title bar (replaces title)
- List shows matching entries
- Select an entry → shows station results for that filter

### Search

- Title bar shows typed search text
- Free-text search against Radio Browser API
- Results shown as station list

### Station Results List

- Shows station names from API query
- Select a station → plays it, auto-adds to Station List, navigates to Now Playing

### Station List

- Shows all saved stations
- **Short center press:** Play the station
- **Long center press:** Delete with confirmation alert on screen

### Now Playing

```
┌──────────────────────┐
│▶ Now Playing      🔋│
│──────────────────────│
│   1 of 23            │
│                      │
│   Station Name       │
│   US · English · Pop │
│                      │
│                      │
│  ─────●────────────  │
│  🔈               🔊 │
└──────────────────────┘
```

- **Top-left:** ▶ (playing) or ❚❚ (paused) — no track switching icons
- **"1 of 23":** Position in Station List
- **Description:** Country · Language · Tags from Radio Browser API
- **Volume bar** at bottom, controlled by scroll wheel
- **Center press:** Toggle QR code overlay

### QR Code Overlay (on Now Playing)

```
┌──────────────────────┐
│▶ Now Playing      🔋│
│──────────────────────│
│                      │
│      ┌────────┐      │
│      │ QR QR  │      │
│      │ QR QR  │      │
│      │ QR QR  │      │
│      └────────┘      │
│   Station Name       │
└──────────────────────┘
```

QR encodes:
```json
{
  "name": "Station Name",
  "description": "US · English · Pop",
  "url": "https://stream.example.com/radio"
}
```

Center press again to dismiss.

### Settings

```
┌──────────────────────┐
│    Settings        🔋│
│──────────────────────│
│                      │
│  Brightness        > │
│  Body Color        > │
│                      │
└──────────────────────┘
```

- **Brightness:** Scroll wheel adjusts LCD background gray level
- **Body Color:** List of iPod Mini colors, selected one marked with checkmark

### Seeking State

When switching stations:

1. Current audio fades out → crossfade into white noise static
2. Title bar shows "Seeking..." in place of play/pause icon
3. New stream loads/buffers
4. Audio crossfades from white noise → new station
5. Title bar returns to ▶

```
┌──────────────────────┐
│⟳ Seeking...       🔋│
│──────────────────────│
│   1 of 23            │
│                      │
│   New Station Name   │
│   US · English · Pop │
│                      │
│                      │
│  ─────●────────────  │
│  🔈               🔊 │
└──────────────────────┘
```

White noise generated via Web Audio API (no audio file).

## Data Flow

### Radio Browser API

- On app load, prefetch: countries, languages, tags
- Filter out entries with 0 stations
- Cache in memory (re-fetch on reload)
- API failure: show "No Connection" on LCD screen

### Audio Playback

- HTML5 `<audio>` element for stream playback
- Web Audio API for white noise generation during seeking
- Volume controlled by scroll wheel on Now Playing screen

### Persistence (localStorage)

- **Station List:** JSON array of saved stations (deduplicated by stream URL)
- **Settings:** brightness level + body color

### Error Handling

- Dead stream: show "No Signal" on Now Playing, auto-skip to next after a few seconds
- No search results: show "No Results" in list view
- API failure: show "No Connection"

## Tech Stack

- **React 19** (already in project)
- **Vite 8** (already in project)
- **ESLint** (already configured)
- **Vitest** (to add)
- **QR code library** (e.g. `qrcode.react`)
- **No external state management** — React Context + hooks
- **No CSS framework** — custom CSS for pixel-perfect iPod Mini look
- **Web Audio API** — white noise generation
- **ES Modules** throughout
