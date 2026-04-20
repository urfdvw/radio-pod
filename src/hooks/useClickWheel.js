import { useRef, useCallback, useEffect } from 'react';

const ROTATION_THRESHOLD_DEG = 8;
const DEGREES_PER_TICK = 10;

// Chrome blocks navigator.vibrate until the frame has received a committed
// pointer-up gesture. Track readiness with a module-level flag so we never
// call vibrate before the browser allows it (avoids the [Intervention] log).
let vibrateReady = false;

function vibrate(ms) {
  if (!navigator.vibrate || !vibrateReady) return;
  navigator.vibrate(ms);
}

function getAngleDeg(cx, cy, x, y) {
  return Math.atan2(y - cy, x - cx) * (180 / Math.PI);
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

// 0=right, 90=down, ±180=left, -90=up
function getZoneFromAngle(angle) {
  if (angle > -135 && angle <= -45) return 'menu';
  if (angle > -45 && angle <= 45) return 'next';
  if (angle > 45 && angle <= 135) return 'playpause';
  return 'prev';
}

export function useClickWheel({ onMenu, onPlayPause, onPrev, onNext, onScroll, onSelectStart, onSelectEnd, onSound }) {
  const ringState = useRef(null);
  const wheelRef = useRef(null);

  useEffect(() => {
    const el = wheelRef.current;
    if (!el) return;
    const handler = (e) => {
      e.preventDefault();
      onScroll?.(Math.sign(e.deltaY));
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [onScroll]);

  const onRingPointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const svgRect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
    const cx = svgRect.left + svgRect.width / 2;
    const cy = svgRect.top + svgRect.height / 2;
    const angle = getAngleDeg(cx, cy, e.clientX, e.clientY);
    ringState.current = { cx, cy, startAngle: angle, lastAngle: angle, totalDelta: 0, accum: 0 };
    vibrate(10);
    onSound?.();
  }, [onSound]);

  const onRingPointerMove = useCallback((e) => {
    const state = ringState.current;
    if (!state) return;
    const angle = getAngleDeg(state.cx, state.cy, e.clientX, e.clientY);
    const delta = angleDiff(angle, state.lastAngle);
    state.lastAngle = angle;
    state.totalDelta += Math.abs(delta);
    state.accum += delta;

    while (state.accum >= DEGREES_PER_TICK) {
      onScroll?.(1);
      state.accum -= DEGREES_PER_TICK;
      vibrate(8);
      onSound?.();
    }
    while (state.accum <= -DEGREES_PER_TICK) {
      onScroll?.(-1);
      state.accum += DEGREES_PER_TICK;
      vibrate(8);
      onSound?.();
    }
  }, [onScroll, onSound]);

  const onRingPointerUp = useCallback(() => {
    vibrateReady = true;
    const state = ringState.current;
    ringState.current = null;
    if (!state) return;

    if (state.totalDelta < ROTATION_THRESHOLD_DEG) {
      switch (getZoneFromAngle(state.startAngle)) {
        case 'menu':      onMenu?.();      break;
        case 'next':      onNext?.();      break;
        case 'playpause': onPlayPause?.(); break;
        case 'prev':      onPrev?.();      break;
      }
    }
  }, [onMenu, onNext, onPlayPause, onPrev]);

  const onRingPointerCancel = useCallback(() => {
    ringState.current = null;
  }, []);

  const onCenterPointerDown = useCallback((e) => {
    e.stopPropagation();
    vibrate(10);
    onSound?.();
    onSelectStart?.();
  }, [onSelectStart, onSound]);

  const onCenterPointerUp = useCallback((e) => {
    e.stopPropagation();
    vibrateReady = true;
    onSelectEnd?.();
  }, [onSelectEnd]);

  return {
    wheelRef,
    onRingPointerDown,
    onRingPointerMove,
    onRingPointerUp,
    onRingPointerCancel,
    onCenterPointerDown,
    onCenterPointerUp,
  };
}
