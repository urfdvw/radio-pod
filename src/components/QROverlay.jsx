import { QRCodeSVG } from 'qrcode.react';
import './QROverlay.css';

export default function QROverlay({ station }) {
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
    <div className="qr-overlay">
      <div className="qr-overlay__code">
        <QRCodeSVG value={data} size={120} bgColor="transparent" fgColor="var(--lcd-text, #000)" />
      </div>
      <div className="qr-overlay__name">{station.name}</div>
    </div>
  );
}
