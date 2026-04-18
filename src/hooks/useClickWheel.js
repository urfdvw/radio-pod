import { useState, useCallback, useRef, useEffect } from 'react';

export function useClickWheel({ onMenu, onSelect, onPlayPause, onPrev, onNext, onScroll }) {
  const [activeZone, setActiveZone] = useState(null);
  const wheelRef = useRef(null);

  const handleZoneClick = useCallback((zone) => {
    switch (zone) {
      case 'menu': onMenu?.(); break;
      case 'select': onSelect?.(); break;
      case 'playpause': onPlayPause?.(); break;
      case 'prev': onPrev?.(); break;
      case 'next': onNext?.(); break;
    }
  }, [onMenu, onSelect, onPlayPause, onPrev, onNext]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = Math.sign(e.deltaY);
    onScroll?.(delta);
  }, [onScroll]);

  useEffect(() => {
    const el = wheelRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  return { activeZone, setActiveZone, handleZoneClick, wheelRef };
}
