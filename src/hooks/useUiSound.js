import { useRef, useCallback } from 'react';

// 12ms white noise burst through a 3 kHz bandpass — approximates an iPod click.
function playClick(ctx) {
  const bufferSize = Math.ceil(ctx.sampleRate * 0.012);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize;
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 4);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 3000;
  filter.Q.value = 0.8;

  const gain = ctx.createGain();
  gain.gain.value = 0.25;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

export function useUiSound(enabled) {
  const ctxRef = useRef(null);

  const play = useCallback(() => {
    if (!enabled) return;
    try {
      if (!ctxRef.current) {
        ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => playClick(ctx));
      } else {
        playClick(ctx);
      }
    } catch {
      // AudioContext not supported
    }
  }, [enabled]);

  return play;
}
