import { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_STATION } from '../constants/defaultStation';

const StationListContext = createContext(null);

export function StationListProvider({ children }) {
  const [stations, setStations] = useLocalStorage('RadioMini-stations', [DEFAULT_STATION]);

  const add = useCallback((station) => {
    setStations((prev) => {
      const url = station.url_resolved || station.url;
      if (prev.some((s) => (s.url_resolved || s.url) === url)) return prev;
      return [...prev, station];
    });
  }, [setStations]);

  const remove = useCallback((stationuuid) => {
    setStations((prev) => prev.filter((s) => s.stationuuid !== stationuuid));
  }, [setStations]);

  const getIndex = useCallback((stationuuid) => {
    return stations.findIndex((s) => s.stationuuid === stationuuid);
  }, [stations]);

  return (
    <StationListContext.Provider value={{ stations, add, remove, getIndex }}>
      {children}
    </StationListContext.Provider>
  );
}

export function useStationList() {
  const ctx = useContext(StationListContext);
  if (!ctx) throw new Error('useStationList must be used within StationListProvider');
  return ctx;
}
