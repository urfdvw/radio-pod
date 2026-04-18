import { useRef, useEffect } from 'react';
import { useAudio } from '../contexts/AudioContext';
import './TitleBar.css';

function SeekIcon() {
  return (
    <svg className="title-bar__status title-bar__seek-icon" viewBox="0 0 10 10" aria-label="Seeking">
      <circle cx="3.8" cy="3.8" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="6" y1="6" x2="9.5" y2="9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// searchProps: { value: string, onChange: (text) => void }
// When provided, the title area becomes a real <input> for mobile keyboard support.
export default function TitleBar({ title, searchProps }) {
  const { isPlaying, isSeeking, error } = useAudio();
  const inputRef = useRef(null);

  // autoFocus loses the race against the pointer-up from the tap that triggered
  // navigation. A short delay lets pointer events settle first.
  useEffect(() => {
    if (!searchProps) return;
    const id = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        <span className="title-bar__battery" aria-label="Battery full" />
      </div>
      <div className="title-bar__divider" />
    </div>
  );
}
