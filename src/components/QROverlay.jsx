import { useRef, useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './QROverlay.css';

export default function QROverlay({ station }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState(120);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const availW = container.clientWidth - 24;
      const availH = container.clientHeight - 24;
      setSize(Math.max(60, Math.min(availW, availH)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  if (!station) return null;

  const description = [station.country, station.language, station.tags]
    .filter(Boolean)
    .join(' \u00B7 ');

  const data = JSON.stringify({
    name: station.name,
    description,
    url: station.url_resolved || station.url,
  });

  return (
    <div className="qr-overlay" ref={containerRef}>
      <QRCodeSVG value={data} size={size} bgColor="transparent" fgColor="var(--lcd-text, #000)" />
    </div>
  );
}
