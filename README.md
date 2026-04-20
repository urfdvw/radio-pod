# RadioMini

**Listen to web radio as if it was 2004.**

RadioMini runs entirely in your browser — no install, no account, no ads. Spin the click wheel to tune through 30,000+ live radio stations from around the world.

---

## Features

**It looks and feels like the real thing**
Every proportion is traced from the original hardware: the 51×91mm body, the four-zone click wheel, the small LCD screen with its Chicago-style pixel font. Five body colors to choose from.

**Endless radio, zero friction**
Powered by the [Radio Browser](https://www.radio-browser.info/) community database. Browse by country, language, or genre tag. Search by name. Your saved stations persist across sessions.

**Works the way you expect**
- Click wheel rotates to scroll lists and adjust volume
- Center button selects; hold it to long-press
- Physical keyboard: arrow keys navigate, typing filters lists instantly
- Mouse scroll wheel works too

**Share stations with a QR code**
Press the center button on Now Playing to show a QR code for the current station. Point another device at it to tune in instantly. Or use the built-in QR scanner to receive a station.

**Sounds like the real thing**
Switching stations plays authentic white-noise static as the signal "tunes in". Each click wheel interaction produces a crisp mechanical tick sound (enabled by default on iOS where haptic feedback isn't available).

**Polished details**
- Live battery indicator with charging animation
- Marquee scrolling for long station names
- Smooth cross-fade between stations
- Brightness and body color adjustable from Settings

---

## Usage

Open the app and use the click wheel:

| Action | Input |
|--------|-------|
| Scroll list / adjust volume | Rotate the wheel ring |
| Navigate back | Press top of ring (MENU) |
| Play / Pause | Press bottom of ring |
| Previous / Next station | Press left / right of ring |
| Select | Press center button |
| Long-press | Hold center button (500ms) |

**Keyboard shortcuts (desktop):**

| Key | Action |
|-----|--------|
| Arrow keys | Navigate |
| `Enter` | Select |
| `Escape` | Back |
| Any letter/number | Filter current list |

---

## Running Locally

```bash
git clone https://github.com/your-username/radio-pod.git
cd radio-pod
npm install
npm run dev
```

Open `http://localhost:5173`.

**Build for production:**

```bash
npm run build
```

Outputs a single self-contained `docs/index.html` — ready to deploy anywhere, including GitHub Pages.

---

## Tech Stack

- **React 19** — UI and state management via Context + hooks
- **Vite 8** — build tooling with single-file output
- **Web Audio API** — white noise generation and UI click sounds (no audio files)
- **Radio Browser API** — open, community-maintained station database
- **jsQR** — QR code scanning from camera feed
- **qrcode.react** — QR code generation
- **Battery Status API** — live battery indicator
- **Vibration API** — haptic feedback on Android
- **Zero dependencies** on UI frameworks, state managers, or CSS libraries

---

## Browser Support

| Browser | Status |
|---------|--------|
| Chrome (desktop / Android) | Full support |
| Safari (iOS) | Full support (volume control display-only) |
| Firefox | Full support |
| Edge | Full support |

iOS note: Apple does not allow JavaScript to control audio volume. The volume bar is visible but reflects the app's internal state only — use your device's volume buttons.

---

## License

MIT
