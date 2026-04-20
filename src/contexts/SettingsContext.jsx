import { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_COLOR } from '../constants/colors';
import { isIOS } from '../utils/platform';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [brightness, setBrightness] = useLocalStorage('RadioMini-brightness', 80);
  const [bodyColor, setBodyColor] = useLocalStorage('RadioMini-body-color', DEFAULT_COLOR.name);
  // UI click sound: on by default for iOS (no vibration), off by default for Android
  const [uiSound, setUiSound] = useLocalStorage('RadioMini-ui-sound', isIOS());

  return (
    <SettingsContext.Provider value={{ brightness, setBrightness, bodyColor, setBodyColor, uiSound, setUiSound }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
