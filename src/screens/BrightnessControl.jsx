import TitleBar from '../components/TitleBar';
import { useSettings } from '../contexts/SettingsContext';

export default function BrightnessControl() {
  const { brightness } = useSettings();

  return (
    <>
      <TitleBar title="Brightness" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ fontSize: '2em', marginBottom: '12px' }}>{brightness}%</div>
        <div style={{ width: '80%', height: '6px', background: 'rgba(0,0,0,0.2)', borderRadius: '3px', position: 'relative' }}>
          <div style={{ width: `${brightness}%`, height: '100%', background: '#000', borderRadius: '3px', opacity: 0.6 }} />
        </div>
      </div>
    </>
  );
}
