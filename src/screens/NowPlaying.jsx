import TitleBar from '../components/TitleBar';
import VolumeBar from '../components/VolumeBar';
import QROverlay from '../components/QROverlay';
import { useAudio } from '../contexts/AudioContext';
import { useStationList } from '../contexts/StationListContext';

export default function NowPlaying({ showQR }) {
  const { currentStation, volume, error } = useAudio();
  const { stations, getIndex } = useStationList();

  if (!currentStation) {
    return (
      <>
        <TitleBar title="Now Playing" />
        <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.8em' }}>
          No station selected
        </div>
      </>
    );
  }

  const index = getIndex(currentStation.stationuuid);
  const position = index >= 0 ? `${index + 1} of ${stations.length}` : '';

  const description = [currentStation.country, currentStation.language, currentStation.tags]
    .filter(Boolean)
    .join(' \u00B7 ');

  return (
    <>
      <TitleBar title="Now Playing" />
      {showQR ? (
        <QROverlay station={currentStation} />
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '8px 0' }}>
          <div style={{ padding: '4px 12px' }}>
            {error && <div style={{ fontSize: '0.7em', color: '#900', fontWeight: 'bold' }}>{error}</div>}
            {position && !error && <div style={{ fontSize: '0.7em', opacity: 0.7 }}>{position}</div>}
            <div style={{ fontSize: '0.85em', fontWeight: 'bold', marginTop: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentStation.name}
            </div>
            <div style={{ fontSize: '0.7em', marginTop: '4px', opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {description}
            </div>
          </div>
          <VolumeBar volume={volume} />
        </div>
      )}
    </>
  );
}

