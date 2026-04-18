import './VolumeBar.css';

function SpeakerQuiet() {
  return (
    <svg className="volume-bar__icon" viewBox="0 0 12 12" aria-hidden="true">
      <rect x="0" y="4" width="3" height="4" fill="currentColor" />
      <polygon points="3,4 7,1 7,11 3,8" fill="currentColor" />
    </svg>
  );
}

function SpeakerLoud() {
  return (
    <svg className="volume-bar__icon volume-bar__icon--loud" viewBox="0 0 18 12" aria-hidden="true">
      <rect x="0" y="4" width="3" height="4" fill="currentColor" />
      <polygon points="3,4 7,1 7,11 3,8" fill="currentColor" />
      <path d="M9,3 Q12,6 9,9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11,1 Q16,6 11,11" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function VolumeBar({ volume }) {
  const percent = Math.round(volume * 100);

  return (
    <div className="volume-bar" role="slider" aria-label="Volume" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <SpeakerQuiet />
      <div className="volume-bar__track">
        <div className="volume-bar__fill" style={{ width: `${percent}%` }} />
      </div>
      <SpeakerLoud />
    </div>
  );
}
