import { useRef, useState, useEffect } from 'react';

const SPEED_PX_PER_S = 40;   // scroll speed
const PAUSE_START_MS = 5000;  // pause at beginning before scrolling
const PAUSE_END_MS = 1000;    // pause at end before snapping back

export default function MarqueeText({ children, style }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [scrollDist, setScrollDist] = useState(0);
  const [phase, setPhase] = useState('pause'); // 'pause' | 'scrolling' | 'reset'

  // Measure how many px the text overflows its container.
  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const measure = () => {
      setScrollDist(Math.max(0, text.scrollWidth - container.offsetWidth));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [children]);

  // Restart animation whenever measured overflow changes (e.g. new station).
  useEffect(() => {
    setPhase('pause');
  }, [scrollDist]);

  // State machine: pause → scrolling → reset → pause → …
  useEffect(() => {
    if (scrollDist === 0) return; // text fits — no animation needed

    let timer;
    let raf;

    if (phase === 'pause') {
      timer = setTimeout(() => setPhase('scrolling'), PAUSE_START_MS);

    } else if (phase === 'scrolling') {
      // Wait for the CSS transition to finish, then hold at end for PAUSE_END_MS.
      const scrollMs = (scrollDist / SPEED_PX_PER_S) * 1000;
      timer = setTimeout(() => setPhase('reset'), scrollMs + PAUSE_END_MS);

    } else if (phase === 'reset') {
      // Double RAF ensures the browser has painted the snapped-back frame
      // before we restart the pause, preventing a visible transition flash.
      raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setPhase('pause'));
      });
    }

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [phase, scrollDist]);

  // Derive transform and transition from phase.
  let translateX = 0;
  let transition = 'none';
  if (phase === 'scrolling') {
    translateX = -scrollDist;
    transition = `transform ${scrollDist / SPEED_PX_PER_S}s linear`;
  }
  // 'pause' and 'reset' both sit at translateX 0 with no transition (instant snap).

  return (
    <div
      ref={containerRef}
      style={{ overflow: 'hidden', whiteSpace: 'nowrap', ...style }}
    >
      <span
        ref={textRef}
        style={{
          display: 'inline-block',
          transform: `translateX(${translateX}px)`,
          transition,
        }}
      >
        {children}
      </span>
    </div>
  );
}
