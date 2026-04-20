import { useClickWheel } from '../hooks/useClickWheel';
import { useSettings } from '../contexts/SettingsContext';
import { useUiSound } from '../hooks/useUiSound';
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

export default function ClickWheel({ onMenu, onPlayPause, onPrev, onNext, onScroll, onSelectStart, onSelectEnd }) {
  const { bodyColor, uiSound } = useSettings();
  const colorConfig = IPOD_COLORS.find((c) => c.name === bodyColor) || IPOD_COLORS[0];
  const playSound = useUiSound(uiSound);

  const {
    wheelRef,
    onRingPointerDown,
    onRingPointerMove,
    onRingPointerUp,
    onRingPointerCancel,
    onCenterPointerDown,
    onCenterPointerUp,
  } = useClickWheel({ onMenu, onPlayPause, onPrev, onNext, onScroll, onSelectStart, onSelectEnd, onSound: playSound });

  return (
    <div className="click-wheel" ref={wheelRef} aria-label="Click wheel">
      <svg viewBox="0 0 300 300" className="click-wheel__svg" focusable="false" onContextMenu={(e) => e.preventDefault()}>
        {/* Outer ring — rotation + zone clicks */}
        <circle
          cx="150" cy="150" r="140"
          fill={colorConfig.wheelColor}
          stroke={colorConfig.value}
          strokeWidth="2"
          className="click-wheel__ring"
          onPointerDown={onRingPointerDown}
          onPointerMove={onRingPointerMove}
          onPointerUp={onRingPointerUp}
          onPointerCancel={onRingPointerCancel}
        />

        {/* Decorative labels — no pointer events */}
        <text
          x="150" y="40"
          textAnchor="middle"
          dominantBaseline="central"
          className="click-wheel__label"
          pointerEvents="none"
          fill="#666"
          fontSize="12"
        >
          MENU
        </text>
        <PrevIcon cx={40} cy={150} />
        <NextIcon cx={260} cy={150} />
        <PlayPauseIcon cx={150} cy={260} />

        {/* Center button — select / long-press */}
        <circle
          cx="150" cy="150" r="50"
          fill={colorConfig.wheelCenter}
          stroke={colorConfig.value}
          strokeWidth="1"
          className="click-wheel__center"
          onPointerDown={onCenterPointerDown}
          onPointerUp={onCenterPointerUp}
        />
      </svg>
    </div>
  );
}
