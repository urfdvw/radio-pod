import { useRef, useState, useEffect } from 'react';
import jsQR from 'jsqr';
import TitleBar from '../components/TitleBar';
import { useNavigation } from '../contexts/NavigationContext';
import { useAudio } from '../contexts/AudioContext';
import { useStationList } from '../contexts/StationListContext';
import { SCREENS } from '../constants/screens';
import './QRScanner.css';

export default function QRScanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('Starting camera...');

  const { push } = useNavigation();
  const { play } = useAudio();
  const { add } = useStationList();

  useEffect(() => {
    let cancelled = false;

    function stopCamera() {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    }

    function scan() {
      if (cancelled) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(scan);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        try {
          const parsed = JSON.parse(code.data);
          if (parsed.url) {
            stopCamera();
            const station = {
              stationuuid: `qr-${Date.now()}`,
              name: parsed.name || parsed.url,
              url: parsed.url,
              url_resolved: parsed.url,
              country: '',
              language: '',
              tags: parsed.description || '',
            };
            play(station, () => add(station));
            push(SCREENS.NOW_PLAYING);
            return;
          }
        } catch {
          // not a valid RadioMini QR — keep scanning
        }
      }

      rafRef.current = requestAnimationFrame(scan);
    }

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        if (!cancelled) {
          setStatus('Scanning...');
          scan();
        }
      } catch {
        if (!cancelled) setStatus('Camera unavailable');
      }
    }

    startCamera();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [play, add, push]);

  return (
    <>
      <TitleBar title="QR Scanner" plain />
      <div className="qr-scanner">
        <video ref={videoRef} className="qr-scanner__video" playsInline muted />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <div className="qr-scanner__status">{status}</div>
      </div>
    </>
  );
}
