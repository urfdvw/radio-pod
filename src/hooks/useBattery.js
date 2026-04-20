import { useState, useEffect } from 'react';

export function useBattery() {
  const [battery, setBattery] = useState(null);

  useEffect(() => {
    if (!navigator.getBattery) return;

    let cancelled = false;
    let manager = null;

    const sync = () => {
      if (manager && !cancelled) {
        setBattery({ level: manager.level, charging: manager.charging });
      }
    };

    navigator.getBattery().then((b) => {
      if (cancelled) return;
      manager = b;
      sync();
      b.addEventListener('levelchange', sync);
      b.addEventListener('chargingchange', sync);
    });

    return () => {
      cancelled = true;
      if (manager) {
        manager.removeEventListener('levelchange', sync);
        manager.removeEventListener('chargingchange', sync);
      }
    };
  }, []);

  return battery; // null = API not available; { level: 0–1, charging: bool } otherwise
}
