import { useEffect, useCallback } from 'react';
import TitleBar from '../components/TitleBar';
import ScrollableList from '../components/ScrollableList';
import { useNavigation } from '../contexts/NavigationContext';
import { SCREENS } from '../constants/screens';

const SETTINGS_ITEMS = [
  { key: 'brightness', label: 'Brightness', screen: SCREENS.BRIGHTNESS_CONTROL, hasSubmenu: true },
  { key: 'body-color', label: 'Body Color', screen: SCREENS.BODY_COLOR_PICKER, hasSubmenu: true },
];

export default function Settings({ selectedIndex = 0, onRegisterActions }) {
  const { push } = useNavigation();

  const clampedIndex = Math.min(selectedIndex, SETTINGS_ITEMS.length - 1);

  const handleSelect = useCallback(() => {
    const item = SETTINGS_ITEMS[clampedIndex];
    if (item) {
      push(item.screen);
    }
  }, [clampedIndex, push]);

  useEffect(() => {
    onRegisterActions?.({ select: handleSelect, longPress: null, itemCount: SETTINGS_ITEMS.length });
  }, [onRegisterActions, handleSelect]);

  return (
    <>
      <TitleBar title="Settings" />
      <ScrollableList
        items={SETTINGS_ITEMS}
        selectedIndex={clampedIndex}
      />
    </>
  );
}
