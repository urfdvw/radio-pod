import { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_COLOR } from '../constants/colors';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [brightness, setBrightness] = useLocalStorage('radiopod-brightness', 80);
  const [bodyColor, setBodyColor] = useLocalStorage('radiopod-body-color', DEFAULT_COLOR.name);

  return (
    <SettingsContext.Provider value={{ brightness, setBrightness, bodyColor, setBodyColor }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
