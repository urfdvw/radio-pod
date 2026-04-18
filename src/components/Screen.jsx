import { useSettings } from '../contexts/SettingsContext';
import './Screen.css';

export default function Screen({ children }) {
  const { brightness } = useSettings();
  const gray = Math.round(128 + (brightness / 100) * 56);
  const blue = Math.round(gray + (brightness / 100) * 12);
  const bgColor = `rgb(${gray - 4}, ${gray}, ${blue})`;

  return (
    <div
      className="screen"
      style={{
        '--lcd-bg': bgColor,
        '--lcd-text': '#000',
        background: bgColor,
        color: '#000',
      }}
    >
      {children}
    </div>
  );
}
