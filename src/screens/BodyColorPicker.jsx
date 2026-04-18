import { useEffect, useCallback } from 'react';
import TitleBar from '../components/TitleBar';
import ScrollableList from '../components/ScrollableList';
import { useSettings } from '../contexts/SettingsContext';
import { IPOD_COLORS } from '../constants/colors';

export default function BodyColorPicker({ selectedIndex = 0, onRegisterActions }) {
  const { bodyColor, setBodyColor } = useSettings();

  const items = IPOD_COLORS.map((color) => ({
    key: color.name,
    label: color.name,
    value: color.value,
    hasSubmenu: false,
  }));

  const clampedIndex = Math.min(selectedIndex, items.length - 1);

  const handleSelect = useCallback(() => {
    const color = IPOD_COLORS[clampedIndex];
    if (color) {
      setBodyColor(color.name);
    }
  }, [clampedIndex, setBodyColor]);

  useEffect(() => {
    onRegisterActions?.({ select: handleSelect, longPress: null, itemCount: items.length });
  }, [onRegisterActions, handleSelect, items.length]);

  return (
    <>
      <TitleBar title="Body Color" />
      <ScrollableList
        items={items}
        selectedIndex={clampedIndex}
        renderItem={(item) => (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: item.value,
                border: '1px solid rgba(0,0,0,0.3)',
              }} />
              {item.label}
            </span>
            {item.key === bodyColor && <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              background: 'var(--lcd-text, #000)',
              clipPath: 'polygon(20% 50%, 40% 75%, 85% 15%, 95% 25%, 40% 95%, 10% 60%)',
            }} />}
          </>
        )}
      />
    </>
  );
}
