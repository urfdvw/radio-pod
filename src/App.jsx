import { useState, useEffect, useRef, useCallback } from 'react';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { AudioProvider, useAudio } from './contexts/AudioContext';
import { StationListProvider, useStationList } from './contexts/StationListContext';
import { RadioBrowserProvider } from './contexts/RadioBrowserContext';
import IPod from './components/IPod';
import Screen from './components/Screen';
import ClickWheel from './components/ClickWheel';
import MainMenu from './screens/MainMenu';
import CategoryList from './screens/CategoryList';
import StationResults from './screens/StationResults';
import Search from './screens/Search';
import NowPlaying from './screens/NowPlaying';
import StationList from './screens/StationList';
import Settings from './screens/Settings';
import BrightnessControl from './screens/BrightnessControl';
import BodyColorPicker from './screens/BodyColorPicker';
import { useKeyboard } from './hooks/useKeyboard';
import { useTypeToFilter } from './hooks/useTypeToFilter';
import { useLongPress } from './hooks/useLongPress';
import { SCREENS } from './constants/screens';
import './App.css';

function AppInner() {
  const { current, push, pop } = useNavigation();
  const { play, togglePlayPause, setVolume, volume, currentStation } = useAudio();
  const { stations } = useStationList();
  const { setBrightness } = useSettings();

  const [selectedIndices, setSelectedIndices] = useState({});
  const [showQR, setShowQR] = useState(false);
  const { filterText, handleChar, clearFilter } = useTypeToFilter();

  // Ref to hold current screen's select/longPress actions and item count
  const screenActionsRef = useRef({ select: null, longPress: null, itemCount: 0 });

  // Autoplay on start
  const autoPlayedRef = useRef(false);

  useEffect(() => {
    if (autoPlayedRef.current || !currentStation) return;
    autoPlayedRef.current = true;

    const tryAutoPlay = () => {
      play(currentStation);
    };

    tryAutoPlay();
    window.addEventListener('click', tryAutoPlay, { once: true });
    window.addEventListener('keydown', tryAutoPlay, { once: true });

    return () => {
      window.removeEventListener('click', tryAutoPlay);
      window.removeEventListener('keydown', tryAutoPlay);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSelectedIndex = (screen) => selectedIndices[screen] || 0;
  const setSelectedIndex = (screen, index) => {
    setSelectedIndices((prev) => ({ ...prev, [screen]: index }));
  };

  const handleScroll = (delta) => {
    const screen = current.screen;
    if (screen === SCREENS.NOW_PLAYING) {
      setVolume(volume + delta * 0.05);
    } else if (screen === SCREENS.BRIGHTNESS_CONTROL) {
      setBrightness((prev) => Math.max(0, Math.min(100, prev + delta * 5)));
    } else {
      const maxIndex = Math.max(0, (screenActionsRef.current.itemCount || 1) - 1);
      setSelectedIndex(screen, Math.max(0, Math.min(maxIndex, getSelectedIndex(screen) + delta)));
    }
  };

  const handleSelect = useCallback(() => {
    if (current.screen === SCREENS.NOW_PLAYING) {
      setShowQR((prev) => !prev);
    } else if (screenActionsRef.current.select) {
      screenActionsRef.current.select();
    }
  }, [current.screen]);

  const handleLongPress = useCallback(() => {
    if (screenActionsRef.current.longPress) {
      screenActionsRef.current.longPress();
    }
  }, []);

  const { onPressStart, onPressEnd } = useLongPress(handleSelect, handleLongPress);

  const handlePrev = useCallback(() => {
    if (!currentStation || stations.length === 0) return;
    const idx = stations.findIndex((s) => s.stationuuid === currentStation.stationuuid);
    const prevIdx = idx <= 0 ? stations.length - 1 : idx - 1;
    play(stations[prevIdx]);
    if (current.screen !== SCREENS.NOW_PLAYING) {
      push(SCREENS.NOW_PLAYING);
    }
  }, [currentStation, stations, play, current.screen, push]);

  const handleNext = useCallback(() => {
    if (!currentStation || stations.length === 0) return;
    const idx = stations.findIndex((s) => s.stationuuid === currentStation.stationuuid);
    const nextIdx = idx >= stations.length - 1 ? 0 : idx + 1;
    play(stations[nextIdx]);
    if (current.screen !== SCREENS.NOW_PLAYING) {
      push(SCREENS.NOW_PLAYING);
    }
  }, [currentStation, stations, play, current.screen, push]);

  const handleMenu = useCallback(() => {
    clearFilter();
    setShowQR(false);
    pop();
  }, [pop, clearFilter]);

  const handleChar_ = useCallback((char) => {
    const screen = current.screen;
    if (screen === SCREENS.CATEGORY_LIST || screen === SCREENS.SEARCH) {
      handleChar(char);
      setSelectedIndex(screen, 0);
    }
  }, [current.screen, handleChar]);

  useKeyboard({
    onUp: handleMenu,
    onDown: togglePlayPause,
    onLeft: handlePrev,
    onRight: handleNext,
    onEnter: handleSelect,
    onScrollUp: () => handleScroll(-1),
    onScrollDown: () => handleScroll(1),
    onChar: handleChar_,
  });

  // Callback for screens to register their actions
  const registerActions = useCallback((actions) => {
    screenActionsRef.current = actions;
  }, []);

  const si = (screen) => getSelectedIndex(screen);

  const renderScreen = () => {
    switch (current.screen) {
      case SCREENS.MAIN_MENU:
        return <MainMenu selectedIndex={si(SCREENS.MAIN_MENU)} onRegisterActions={registerActions} />;
      case SCREENS.CATEGORY_LIST:
        return <CategoryList type={current.props.type} filterText={filterText} selectedIndex={si(SCREENS.CATEGORY_LIST)} onRegisterActions={registerActions} />;
      case SCREENS.STATION_RESULTS:
        return <StationResults endpoint={current.props.endpoint} value={current.props.value} title={current.props.title} selectedIndex={si(SCREENS.STATION_RESULTS)} onRegisterActions={registerActions} />;
      case SCREENS.SEARCH:
        return <Search filterText={filterText} selectedIndex={si(SCREENS.SEARCH)} onRegisterActions={registerActions} />;
      case SCREENS.NOW_PLAYING:
        return <NowPlaying showQR={showQR} />;
      case SCREENS.STATION_LIST:
        return <StationList selectedIndex={si(SCREENS.STATION_LIST)} onRegisterActions={registerActions} />;
      case SCREENS.SETTINGS:
        return <Settings selectedIndex={si(SCREENS.SETTINGS)} onRegisterActions={registerActions} />;
      case SCREENS.BRIGHTNESS_CONTROL:
        return <BrightnessControl />;
      case SCREENS.BODY_COLOR_PICKER:
        return <BodyColorPicker selectedIndex={si(SCREENS.BODY_COLOR_PICKER)} onRegisterActions={registerActions} />;
      default:
        return <MainMenu selectedIndex={0} onRegisterActions={registerActions} />;
    }
  };

  return (
    <IPod>
      <Screen>
        {renderScreen()}
      </Screen>
      <ClickWheel
        onMenu={handleMenu}
        onSelect={handleSelect}
        onPlayPause={togglePlayPause}
        onPrev={handlePrev}
        onNext={handleNext}
        onScroll={handleScroll}
        onSelectStart={onPressStart}
        onSelectEnd={onPressEnd}
      />
    </IPod>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <NavigationProvider>
        <AudioProvider>
          <StationListProvider>
            <RadioBrowserProvider>
              <AppInner />
            </RadioBrowserProvider>
          </StationListProvider>
        </AudioProvider>
      </NavigationProvider>
    </SettingsProvider>
  );
}
