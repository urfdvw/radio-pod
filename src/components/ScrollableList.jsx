import { useRef, useState, useEffect } from 'react';
import './ScrollableList.css';

export default function ScrollableList({ items, selectedIndex, onSelect, renderItem }) {
  const containerRef = useRef(null);
  const itemRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(items.length);

  // Measure how many items fit in the container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const item = itemRef.current;
      if (!item) return;
      const containerHeight = container.clientHeight;
      const itemHeight = item.offsetHeight;
      if (itemHeight > 0) {
        setVisibleCount(Math.max(1, Math.floor(containerHeight / itemHeight)));
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const total = items.length;

  let startIndex = 0;
  if (total > visibleCount) {
    startIndex = Math.max(0, Math.min(selectedIndex - Math.floor(visibleCount / 2), total - visibleCount));
  }
  const visibleItems = items.slice(startIndex, startIndex + visibleCount);

  const scrollRatio = total > visibleCount ? selectedIndex / (total - 1) : 0;
  const showScrollbar = total > visibleCount;

  // Thumb height proportional to visible fraction; thumb top tracks scroll position.
  const thumbH = Math.max(8, (visibleCount / total) * 100);
  const thumbY = scrollRatio * (100 - thumbH);

  return (
    <div className="scrollable-list" ref={containerRef} role="listbox" aria-label="Menu items">
      <div className="scrollable-list__items">
        {visibleItems.map((item, i) => {
          const actualIndex = startIndex + i;
          const isSelected = actualIndex === selectedIndex;
          return (
            <div
              key={item.key || actualIndex}
              ref={i === 0 ? itemRef : null}
              className={`scrollable-list__item ${isSelected ? 'scrollable-list__item--selected' : ''}`}
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelect?.(actualIndex)}
            >
              {renderItem ? renderItem(item, isSelected) : (
                <>
                  <span className="scrollable-list__label">{item.label}</span>
                  {item.hasSubmenu && <span className="scrollable-list__arrow">&gt;</span>}
                </>
              )}
            </div>
          );
        })}
      </div>
      {showScrollbar && (
        <div className="scrollable-list__scrollbar" aria-hidden="true">
          <div
            className="scrollable-list__scrollbar-thumb"
            style={{ top: `${thumbY}%`, height: `${thumbH}%` }}
          />
        </div>
      )}
    </div>
  );
}
