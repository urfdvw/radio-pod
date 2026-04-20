import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { DEFAULT_STATION } from '../constants/defaultStation';

const AudioCtx = createContext(null);

export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  const noiseCtxRef = useRef(null);
  const noiseGainRef = useRef(null);
  const noiseSourceRef = useRef(null);
  const seekAbortRef = useRef(null);
  const onPlayingCbRef = useRef(null);
  const currentStationRef = useRef(DEFAULT_STATION);
  const volumeRef = useRef(0.7);

  const [currentStation, setCurrentStation] = useState(DEFAULT_STATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [error, setError] = useState(null);

  useEffect(() => { currentStationRef.current = currentStation; }, [currentStation]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  useEffect(() => {
    return () => { noiseCtxRef.current?.close(); };
  }, []);

  const stopWhiteNoise = useCallback(() => {
    const source = noiseSourceRef.current;
    const gain = noiseGainRef.current;
    const ctx = noiseCtxRef.current;
    noiseSourceRef.current = null;
    noiseGainRef.current = null;
    if (source && gain && ctx) {
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      setTimeout(() => { try { source.stop(); } catch { /* already stopped */ } }, 350);
    }
  }, []);

  const createWhiteNoise = useCallback(() => {
    if (!noiseCtxRef.current) {
      noiseCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = noiseCtxRef.current;
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
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
    return { gain, ctx };
  }, []);

  const preload = useCallback((station) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = station.url_resolved || station.url;
    audio.volume = volumeRef.current;
    audio.load();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlaying = () => {
      setIsPlaying(true);
      setError(null);
      if (onPlayingCbRef.current) {
        onPlayingCbRef.current();
        onPlayingCbRef.current = null;
      }
    };

    const handlePause = () => setIsPlaying(false);

    const handleError = () => {
      if (seekAbortRef.current) {
        seekAbortRef.current();
        seekAbortRef.current = null;
      } else {
        stopWhiteNoise();
      }
      onPlayingCbRef.current = null;
      setError('No Signal');
      setIsPlaying(false);
      setIsSeeking(false);
    };

    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    return () => {
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [stopWhiteNoise]);

  const setVolume = useCallback((v) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
  }, []);

  const play = useCallback((station, onSuccess) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (seekAbortRef.current) {
      seekAbortRef.current();
      seekAbortRef.current = null;
    } else {
      stopWhiteNoise();
    }

    // readyState > 0 means audio has been loaded at least once; skip seek only then.
    const isSameStation = currentStationRef.current?.stationuuid === station.stationuuid
      && audio.readyState > 0;
    setCurrentStation(station);
    setError(null);
    onPlayingCbRef.current = onSuccess ?? null;

    if (isSameStation) {
      audio.volume = volumeRef.current;
      audio.play().catch((err) => { if (err.name !== 'NotAllowedError') setError('No Signal'); });
      return;
    }

    setIsPlaying(false);
    setIsSeeking(true);
    audio.volume = 0;

    const { gain, ctx } = createWhiteNoise();
    gain.gain.linearRampToValueAtTime(volumeRef.current * 0.3, ctx.currentTime + 0.2);

    audio.src = station.url_resolved || station.url;
    audio.load();

    let aborted = false;

    const endSeek = (canPlay) => {
      if (aborted) return;
      aborted = true;
      seekAbortRef.current = null;
      audio.removeEventListener('canplay', onCanPlay);
      clearTimeout(timeoutId);
      stopWhiteNoise();
      setIsSeeking(false);
      if (canPlay) {
        audio.volume = volumeRef.current;
        audio.play().catch((err) => { if (err.name !== 'NotAllowedError') setError('No Signal'); });
      } else {
        setError('No Signal');
      }
    };

    const onCanPlay = () => endSeek(true);
    audio.addEventListener('canplay', onCanPlay);
    const timeoutId = setTimeout(() => endSeek(audio.readyState >= 3), 8000);

    seekAbortRef.current = () => {
      aborted = true;
      audio.removeEventListener('canplay', onCanPlay);
      clearTimeout(timeoutId);
      stopWhiteNoise();
      setIsSeeking(false);
    };
  }, [createWhiteNoise, stopWhiteNoise]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentStationRef.current) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  return (
    <AudioCtx.Provider value={{
      currentStation, isPlaying, isSeeking, volume, error,
      play, preload, togglePlayPause, setVolume,
    }}>
      <audio ref={audioRef} />
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}
