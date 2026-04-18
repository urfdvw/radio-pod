import { useState, useEffect, useCallback } from 'react';
import TitleBar from '../components/TitleBar';
import ScrollableList from '../components/ScrollableList';
import { useNavigation } from '../contexts/NavigationContext';
import { useAudio } from '../contexts/AudioContext';
import { useStationList } from '../contexts/StationListContext';
import { SCREENS } from '../constants/screens';
import { fetchStationsByCountry, fetchStationsByLanguage, fetchStationsByTag } from '../services/radioBrowser';

const FETCHERS = {
  country: fetchStationsByCountry,
  language: fetchStationsByLanguage,
  tag: fetchStationsByTag,
};

export default function StationResults({ endpoint, value, title, selectedIndex = 0, onRegisterActions }) {
  const { push } = useNavigation();
  const { play } = useAudio();
  const { add } = useStationList();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const fetcher = FETCHERS[endpoint];
        if (!fetcher) throw new Error(`Unknown endpoint: ${endpoint}`);
        const data = await fetcher(value);
        if (!cancelled) {
          setStations(data.filter((s) => s.lastcheckok === 1));
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [endpoint, value]);

  const items = stations.map((s) => ({
    key: s.stationuuid,
    label: s.name,
    hasSubmenu: false,
  }));

  const clampedIndex = Math.min(selectedIndex, Math.max(0, items.length - 1));

  const handleSelect = useCallback(() => {
    const station = stations[clampedIndex];
    if (station) {
      add(station);
      play(station);
      push(SCREENS.NOW_PLAYING);
    }
  }, [stations, clampedIndex, add, play, push]);

  useEffect(() => {
    onRegisterActions?.({ select: handleSelect, longPress: null, itemCount: items.length });
  }, [onRegisterActions, handleSelect, items.length]);

  if (loading) {
    return (
      <>
        <TitleBar title={title || 'Stations'} />
        <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.8em' }}>Loading...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <TitleBar title={title || 'Stations'} />
        <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.8em' }}>No Connection</div>
      </>
    );
  }

  return (
    <>
      <TitleBar title={title || 'Stations'} />
      {items.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.8em' }}>No Results</div>
      ) : (
        <ScrollableList
          items={items}
          selectedIndex={clampedIndex}
        />
      )}
    </>
  );
}
