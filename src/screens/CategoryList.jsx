import { useMemo, useEffect, useCallback } from 'react';
import TitleBar from '../components/TitleBar';
import ScrollableList from '../components/ScrollableList';
import { useNavigation } from '../contexts/NavigationContext';
import { useRadioBrowser } from '../contexts/RadioBrowserContext';
import { SCREENS } from '../constants/screens';

const TITLES = {
  countries: 'Country',
  languages: 'Language',
  tags: 'Tags',
};

const ENDPOINTS = {
  countries: 'country',
  languages: 'language',
  tags: 'tag',
};

export default function CategoryList({ type, filterText, onFilterChange, selectedIndex = 0, onRegisterActions }) {
  const { push } = useNavigation();
  const { countries, languages, tags, isLoading, error } = useRadioBrowser();

  const data = type === 'countries' ? countries : type === 'languages' ? languages : tags;
  const baseTitle = TITLES[type] || type;

  const filtered = useMemo(() => {
    if (!filterText) return data;
    const lower = filterText.toLowerCase();
    return data.filter((item) => item.name.toLowerCase().includes(lower));
  }, [data, filterText]);

  const items = filtered.map((item) => ({
    key: item.name,
    label: `${item.name} (${item.stationcount})`,
    hasSubmenu: true,
  }));

  const clampedIndex = Math.min(selectedIndex, Math.max(0, items.length - 1));

  const handleSelect = useCallback(() => {
    const item = filtered[clampedIndex];
    if (item) {
      push(SCREENS.STATION_RESULTS, {
        endpoint: ENDPOINTS[type],
        value: item.name,
        title: item.name,
      });
    }
  }, [filtered, clampedIndex, type, push]);

  useEffect(() => {
    onRegisterActions?.({ select: handleSelect, longPress: null, itemCount: items.length });
  }, [onRegisterActions, handleSelect, items.length]);

  const searchProps = { value: filterText, onChange: onFilterChange };

  if (isLoading) {
    return (
      <>
        <TitleBar title={baseTitle} searchProps={searchProps} />
        <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.8em' }}>Loading...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <TitleBar title={baseTitle} searchProps={searchProps} />
        <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.8em' }}>No Connection</div>
      </>
    );
  }

  return (
    <>
      <TitleBar title={baseTitle} searchProps={searchProps} />
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
