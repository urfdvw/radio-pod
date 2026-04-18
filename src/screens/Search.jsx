import { useState, useEffect, useRef, useCallback } from 'react';
import TitleBar from '../components/TitleBar';
import ScrollableList from '../components/ScrollableList';
import { useNavigation } from '../contexts/NavigationContext';
import { useAudio } from '../contexts/AudioContext';
import { useStationList } from '../contexts/StationListContext';
import { SCREENS } from '../constants/screens';
import { searchStations } from '../services/radioBrowser';

export default function Search({ filterText, onFilterChange, selectedIndex = 0, onRegisterActions }) {
  const { push } = useNavigation();
  const { play } = useAudio();
  const { add } = useStationList();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!filterText || filterText.length < 2) {
      setStations([]);
      return;
    }
    setLoading(true);
    clearTimeout(debounceRef.current);
    let cancelled = false;
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchStations(filterText);
        if (!cancelled) setStations(data);
      } catch {
        if (!cancelled) setStations([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 500);
    return () => { cancelled = true; clearTimeout(debounceRef.current); };
  }, [filterText]);

  const items = stations.map((s) => ({
    key: s.stationuuid,
    label: s.name,
    hasSubmenu: false,
  }));

  const clampedIndex = Math.min(selectedIndex, Math.max(0, items.length - 1));

  const handleSelect = useCallback(() => {
    const station = stations[clampedIndex];
    if (station) {
      play(station, () => add(station));
      push(SCREENS.NOW_PLAYING);
    }
  }, [stations, clampedIndex, add, play, push]);

  useEffect(() => {
    onRegisterActions?.({ select: handleSelect, longPress: null, itemCount: items.length });
  }, [onRegisterActions, handleSelect, items.length]);

  return (
    <>
      <TitleBar title="Search" searchProps={{ value: filterText, onChange: onFilterChange }} />
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.8em' }}>Searching...</div>
      ) : items.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.8em' }}>
          {filterText ? 'No Results' : 'Type to search'}
        </div>
      ) : (
        <ScrollableList
          items={items}
          selectedIndex={clampedIndex}
        />
      )}
    </>
  );
}
