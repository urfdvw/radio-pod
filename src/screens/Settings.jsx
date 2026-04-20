import { useEffect, useCallback } from 'react';
import TitleBar from '../components/TitleBar';
import ScrollableList from '../components/ScrollableList';
import { useNavigation } from '../contexts/NavigationContext';
import { useSettings } from '../contexts/SettingsContext';
import { SCREENS } from '../constants/screens';

const NAV_ITEMS = [
  { key: 'brightness', label: 'Brightness', type: 'nav', screen: SCREENS.BRIGHTNESS_CONTROL },
  { key: 'body-color', label: 'Body Color', type: 'nav', screen: SCREENS.BODY_COLOR_PICKER },
  { key: 'ui-sound', label: 'UI Sound', type: 'toggle' },
];

export default function Settings({ selectedIndex = 0, onRegisterActions }) {
  const { push } = useNavigation();
  const { uiSound, setUiSound } = useSettings();

  const clampedIndex = Math.min(selectedIndex, NAV_ITEMS.length - 1);

  const handleSelect = useCallback(() => {
    const item = NAV_ITEMS[clampedIndex];
    if (!item) return;
    if (item.type === 'nav') {
      push(item.screen);
    } else if (item.type === 'toggle' && item.key === 'ui-sound') {
      setUiSound((prev) => !prev);
    }
  }, [clampedIndex, push, setUiSound]);

  useEffect(() => {
    onRegisterActions?.({ select: handleSelect, longPress: null, itemCount: NAV_ITEMS.length });
  }, [onRegisterActions, handleSelect]);

  return (
    <>
      <TitleBar title="Settings" />
      <ScrollableList
        items={NAV_ITEMS}
        selectedIndex={clampedIndex}
        renderItem={(item) => (
          <>
            <span className="scrollable-list__label">{item.label}</span>
            <span className="scrollable-list__arrow">
              {item.type === 'nav' ? '>' : (uiSound ? 'On' : 'Off')}
            </span>
          </>
        )}
      />
    </>
  );
}
