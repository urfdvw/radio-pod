import { useRef, useEffect } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { useBattery } from '../hooks/useBattery';
import './TitleBar.css';

function SeekIcon() {
  return (
    <svg className="title-bar__status title-bar__seek-icon" viewBox="0 0 10 10" aria-label="Seeking">
      <circle cx="3.8" cy="3.8" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="6" y1="6" x2="9.5" y2="9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function TitleBar({ title, searchProps, plain }) {
  const { isPlaying, isSeeking, error } = useAudio();
  const batteryInfo = useBattery();
  const inputRef = useRef(null);

  useEffect(() => {
    if (!searchProps) return;
    const id = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (plain) {
    return (
      <div className="title-bar">
        <div className="title-bar__content">
          <span className="title-bar__title">{title}</span>
        </div>
        <div className="title-bar__divider" />
      </div>
    );
  }

  let statusIcon;
  if (isSeeking) {
    statusIcon = <SeekIcon />;
  } else if (error) {
    statusIcon = <span className="title-bar__status title-bar__stop-icon" aria-label="No Signal" />;
  } else if (isPlaying) {
    statusIcon = <span className="title-bar__status title-bar__play-icon" aria-label="Playing" />;
  } else {
    statusIcon = <span className="title-bar__status title-bar__pause-icon" aria-label="Paused" />;
  }

  const titleContent = searchProps ? (
    <input
      ref={inputRef}
      className="title-bar__search-input"
      value={searchProps.value}
      onChange={(e) => searchProps.onChange(e.target.value)}
      placeholder={title}
      autoCapitalize="none"
      autoCorrect="off"
      autoComplete="off"
      spellCheck="false"
      inputMode="search"
      aria-label={title}
    />
  ) : (
    <span className="title-bar__title">{title}</span>
  );

  return (
    <div className="title-bar">
      <div className="title-bar__content">
        {statusIcon}
        {titleContent}
        <span
          className={`title-bar__battery${batteryInfo?.charging ? ' title-bar__battery--charging' : ''}`}
          style={{ '--battery-level': batteryInfo ? batteryInfo.level : 1 }}
          aria-label={batteryInfo ? `Battery ${Math.round(batteryInfo.level * 100)}%${batteryInfo.charging ? ' charging' : ''}` : 'Battery'}
        />
      </div>
      <div className="title-bar__divider" />
    </div>
  );
}
