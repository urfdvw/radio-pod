import { useSettings } from '../contexts/SettingsContext';
import './Screen.css';

export default function Screen({ children }) {
  const { brightness } = useSettings();

  // Extended range: min ≈ 110 (dim gray), max ≈ 235 (bright near-white)
  const gray = Math.round(110 + (brightness / 100) * 125);
  const blue = Math.round(gray + (brightness / 100) * 14);
  const r = gray - 4;
  const bgColor = `rgb(${r}, ${gray}, ${blue})`;

  // Glow: fades in above 80%, full intensity at 100%
  const glowIntensity = brightness > 80 ? (brightness - 80) / 20 : 0;
  const boxShadow = glowIntensity > 0
    ? [
        `0 0 ${8 * glowIntensity}px ${3 * glowIntensity}px rgba(${r}, ${gray}, ${blue}, ${0.75 * glowIntensity})`,
        `0 0 ${24 * glowIntensity}px ${8 * glowIntensity}px rgba(${r}, ${gray}, ${blue}, ${0.4 * glowIntensity})`,
      ].join(', ')
    : undefined;

  return (
    <div
      className="screen"
      style={{
        '--lcd-bg': bgColor,
        '--lcd-bg-raw': `${r}, ${gray}, ${blue}`,
        '--lcd-text': '#000',
        background: bgColor,
        color: '#000',
        boxShadow,
      }}
    >
      {children}
    </div>
  );
}
