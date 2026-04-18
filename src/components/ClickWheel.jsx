import { useState } from 'react';
import { useClickWheel } from '../hooks/useClickWheel';
import { useSettings } from '../contexts/SettingsContext';
import { IPOD_COLORS } from '../constants/colors';
import './ClickWheel.css';

function PrevIcon({ cx, cy }) {
  const x = cx - 10;
  const y = cy;
  return (
    <g pointerEvents="none">
      <polygon points={`${x + 2},${y} ${x + 10},${y - 6} ${x + 10},${y + 6}`} fill="#666" />
      <polygon points={`${x - 6},${y} ${x + 2},${y - 6} ${x + 2},${y + 6}`} fill="#666" />
    </g>
  );
}

function NextIcon({ cx, cy }) {
  const x = cx - 2;
  const y = cy;
  return (
    <g pointerEvents="none">
      <polygon points={`${x},${y - 6} ${x + 8},${y} ${x},${y + 6}`} fill="#666" />
      <polygon points={`${x + 8},${y - 6} ${x + 16},${y} ${x + 8},${y + 6}`} fill="#666" />
    </g>
  );
}

function PlayPauseIcon({ cx, cy }) {
  const x = cx - 10;
  const y = cy;
  return (
    <g pointerEvents="none">
      <polygon points={`${x},${y - 6} ${x + 8},${y} ${x},${y + 6}`} fill="#666" />
      <rect x={x + 11} y={y - 6} width="3" height="12" fill="#666" />
      <rect x={x + 17} y={y - 6} width="3" height="12" fill="#666" />
    </g>
  );
}

const zones = [
  { id: 'menu', cx: 150, cy: 40, ariaLabel: 'Menu' },
  { id: 'prev', cx: 40, cy: 150, ariaLabel: 'Previous' },
  { id: 'next', cx: 260, cy: 150, ariaLabel: 'Next' },
  { id: 'playpause', cx: 150, cy: 260, ariaLabel: 'Play Pause' },
];

export default function ClickWheel({ onMenu, onSelect, onPlayPause, onPrev, onNext, onScroll, onSelectStart, onSelectEnd }) {
  const { bodyColor } = useSettings();
  const colorConfig = IPOD_COLORS.find((c) => c.name === bodyColor) || IPOD_COLORS[0];
  const [pressedZone, setPressedZone] = useState(null);

  const { activeZone, setActiveZone, handleZoneClick, wheelRef } = useClickWheel({
    onMenu, onSelect, onPlayPause, onPrev, onNext, onScroll,
  });

  return (
    <div className="click-wheel" ref={wheelRef} aria-label="Click wheel">
      <svg viewBox="0 0 300 300" className="click-wheel__svg">
        <circle cx="150" cy="150" r="140" fill={colorConfig.wheelColor} stroke={colorConfig.value} strokeWidth="2" />

        {zones.map((zone) => (
          <g key={zone.id}>
            <circle
              cx={zone.cx}
              cy={zone.cy}
              r="45"
              fill="transparent"
              className={`click-wheel__zone ${activeZone === zone.id ? 'click-wheel__zone--active' : ''} ${pressedZone === zone.id ? 'click-wheel__zone--pressed' : ''}`}
              onMouseEnter={() => setActiveZone(zone.id)}
              onMouseLeave={() => setActiveZone(null)}
              onMouseDown={() => setPressedZone(zone.id)}
              onMouseUp={() => { setPressedZone(null); handleZoneClick(zone.id); }}
              role="button"
              aria-label={zone.ariaLabel}
            />
            {zone.id === 'menu' && (
              <text
                x={zone.cx}
                y={zone.cy}
                textAnchor="middle"
                dominantBaseline="central"
                className="click-wheel__label"
                pointerEvents="none"
                fill="#666"
                fontSize="12"
              >
                MENU
              </text>
            )}
            {zone.id === 'prev' && <PrevIcon cx={zone.cx} cy={zone.cy} />}
            {zone.id === 'next' && <NextIcon cx={zone.cx} cy={zone.cy} />}
            {zone.id === 'playpause' && <PlayPauseIcon cx={zone.cx} cy={zone.cy} />}
          </g>
        ))}

        <circle
          cx="150"
          cy="150"
          r="50"
          fill={colorConfig.wheelCenter}
          stroke={colorConfig.value}
          strokeWidth="1"
          className={`click-wheel__center ${activeZone === 'select' ? 'click-wheel__center--active' : ''} ${pressedZone === 'select' ? 'click-wheel__center--pressed' : ''}`}
          onMouseEnter={() => setActiveZone('select')}
          onMouseLeave={() => setActiveZone(null)}
          onMouseDown={() => {
            setPressedZone('select');
            onSelectStart?.();
          }}
          onMouseUp={() => {
            setPressedZone(null);
            onSelectEnd?.();
          }}
          role="button"
          aria-label="Select"
        />
      </svg>
    </div>
  );
}
