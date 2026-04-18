import { useAudio } from '../contexts/AudioContext';
import './TitleBar.css';

export default function TitleBar({ title }) {
  const { isPlaying, isSeeking } = useAudio();

  let statusIcon = null;
  if (isSeeking) {
    statusIcon = <span className="title-bar__status">Seeking...</span>;
  } else if (isPlaying) {
    statusIcon = <span className="title-bar__status title-bar__play-icon" aria-label="Playing" />;
  }

  return (
    <div className="title-bar">
      <div className="title-bar__content">
        {statusIcon}
        <span className="title-bar__title">{title}</span>
        <span className="title-bar__battery" aria-label="Battery full" />
      </div>
      <div className="title-bar__divider" />
    </div>
  );
}
