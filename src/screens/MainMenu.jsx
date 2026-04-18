import { useEffect, useCallback } from 'react';
import TitleBar from '../components/TitleBar';
import ScrollableList from '../components/ScrollableList';
import { useNavigation } from '../contexts/NavigationContext';
import { useAudio } from '../contexts/AudioContext';
import { SCREENS } from '../constants/screens';

const MENU_ITEMS = [
  { key: 'now-playing', label: 'Now Playing', screen: SCREENS.NOW_PLAYING, hasSubmenu: true, requiresStation: true },
  { key: 'station-list', label: 'Station List', screen: SCREENS.STATION_LIST, hasSubmenu: true },
  { key: 'country', label: 'Country', screen: SCREENS.CATEGORY_LIST, props: { type: 'countries' }, hasSubmenu: true },
  { key: 'language', label: 'Language', screen: SCREENS.CATEGORY_LIST, props: { type: 'languages' }, hasSubmenu: true },
  { key: 'tags', label: 'Tags', screen: SCREENS.CATEGORY_LIST, props: { type: 'tags' }, hasSubmenu: true },
  { key: 'search', label: 'Search', screen: SCREENS.SEARCH, hasSubmenu: true },
  { key: 'settings', label: 'Settings', screen: SCREENS.SETTINGS, hasSubmenu: true },
];

export default function MainMenu({ selectedIndex = 0, onRegisterActions }) {
  const { push } = useNavigation();
  const { currentStation } = useAudio();

  const visibleItems = MENU_ITEMS.filter(
    (item) => !item.requiresStation || currentStation
  );

  const clampedIndex = Math.min(selectedIndex, visibleItems.length - 1);

  const handleSelect = useCallback(() => {
    const item = visibleItems[clampedIndex];
    if (item) {
      push(item.screen, item.props || {});
    }
  }, [visibleItems, clampedIndex, push]);

  useEffect(() => {
    onRegisterActions?.({ select: handleSelect, longPress: null, itemCount: visibleItems.length });
  }, [onRegisterActions, handleSelect, visibleItems.length]);

  return (
    <>
      <TitleBar title="RadioPod" />
      <ScrollableList
        items={visibleItems}
        selectedIndex={clampedIndex}
      />
    </>
  );
}
