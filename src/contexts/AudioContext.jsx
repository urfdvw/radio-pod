import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';

const AudioCtx = createContext(null);

const DEFAULT_STATION = {
  stationuuid: 'default-gotanno',
  name: 'Radio Gotanno',
  url: 'https://radio.gotanno.love/;?type=http&nocache=2997',
  url_resolved: 'https://radio.gotanno.love/;?type=http&nocache=2997',
  country: '',
  language: '',
  tags: '',
};

export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  const noiseCtxRef = useRef(null);
  const noiseGainRef = useRef(null);
  const noiseSourceRef = useRef(null);

  const [currentStation, setCurrentStation] = useState(DEFAULT_STATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [error, setError] = useState(null);

  const createWhiteNoise = useCallback(() => {
    if (!noiseCtxRef.current) {
      noiseCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = noiseCtxRef.current;
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    noiseGainRef.current = gain;
    noiseSourceRef.current = source;
    return { gain, source, ctx };
  }, []);

  const stopWhiteNoise = useCallback(() => {
    if (noiseGainRef.current && noiseCtxRef.current) {
      const gain = noiseGainRef.current;
      const ctx = noiseCtxRef.current;
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      setTimeout(() => {
        try { noiseSourceRef.current?.stop(); } catch { /* ignore */ }
        noiseSourceRef.current = null;
        noiseGainRef.current = null;
      }, 350);
    }
  }, []);

  const setVolume = useCallback((v) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  const play = useCallback((station) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentStation && currentStation.stationuuid !== station.stationuuid) {
      setIsSeeking(true);

      audio.volume = 0;
      const { gain, ctx } = createWhiteNoise();
      gain.gain.linearRampToValueAtTime(volume * 0.3, ctx.currentTime + 0.2);

      audio.src = station.url_resolved || station.url;
      audio.load();

      const onCanPlay = () => {
        audio.removeEventListener('canplay', onCanPlay);
        stopWhiteNoise();
        audio.volume = volume;
        audio.play().catch(() => {});
        setIsSeeking(false);
      };
      audio.addEventListener('canplay', onCanPlay);

      setTimeout(() => {
        audio.removeEventListener('canplay', onCanPlay);
        if (audio.readyState >= 3) {
          stopWhiteNoise();
          audio.volume = volume;
          audio.play().catch(() => {});
        }
        setIsSeeking(false);
      }, 8000);
    } else {
      audio.src = station.url_resolved || station.url;
      audio.volume = volume;
      audio.load();
      audio.play().catch(() => {});
    }

    setCurrentStation(station);
    setIsPlaying(true);
    setError(null);
  }, [currentStation, volume, createWhiteNoise, stopWhiteNoise]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !currentStation) return;
    if (isPlaying) {
      pause();
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying, currentStation, pause]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleError = () => {
      setError('No Signal');
      setIsPlaying(false);
    };
    audio.addEventListener('error', handleError);
    return () => audio.removeEventListener('error', handleError);
  }, []);

  return (
    <AudioCtx.Provider value={{
      currentStation, isPlaying, isSeeking, volume, error,
      play, pause, togglePlayPause, setVolume, setError,
    }}>
      <audio ref={audioRef} crossOrigin="anonymous" />
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}
