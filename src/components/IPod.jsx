import { useSettings } from '../contexts/SettingsContext';
import { IPOD_COLORS } from '../constants/colors';
import './IPod.css';

export default function IPod({ children }) {
  const { bodyColor } = useSettings();
  const colorConfig = IPOD_COLORS.find((c) => c.name === bodyColor) || IPOD_COLORS[0];

  return (
    <div
      className="ipod"
      style={{ '--body-color': colorConfig.value }}
    >
      {children}
    </div>
  );
}
