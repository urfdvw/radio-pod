import { useState, useEffect, useCallback } from 'react';
import TitleBar from '../components/TitleBar';
import ScrollableList from '../components/ScrollableList';
import ConfirmDialog from '../components/ConfirmDialog';
import { useStationList } from '../contexts/StationListContext';
import { useAudio } from '../contexts/AudioContext';
import { useNavigation } from '../contexts/NavigationContext';
import { SCREENS } from '../constants/screens';

export default function StationList({ selectedIndex = 0, onRegisterActions }) {
  const { stations, remove } = useStationList();
  const { play } = useAudio();
  const { push } = useNavigation();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmOption, setConfirmOption] = useState(0); // 0 = Cancel, 1 = Delete

  const items = stations.map((s) => ({
    key: s.stationuuid,
    label: s.name,
    hasSubmenu: false,
  }));

  const clampedIndex = Math.min(selectedIndex, Math.max(0, items.length - 1));

  const handleSelect = useCallback(() => {
    if (confirmDelete) {
      if (confirmOption === 1) remove(confirmDelete.stationuuid);
      setConfirmDelete(null);
      setConfirmOption(0);
      return;
    }
    const station = stations[clampedIndex];
    if (station) {
      play(station);
      push(SCREENS.NOW_PLAYING);
    }
  }, [confirmDelete, confirmOption, remove, stations, clampedIndex, play, push]);

  const handleLongPress = useCallback(() => {
    if (confirmDelete) return;
    const station = stations[clampedIndex];
    if (station) {
      setConfirmOption(0); // always start on Cancel
      setConfirmDelete(station);
    }
  }, [confirmDelete, stations, clampedIndex]);

  useEffect(() => {
    if (confirmDelete) {
      onRegisterActions?.({
        select: handleSelect,
        longPress: null,
        itemCount: 2,
        onScroll: (d) => setConfirmOption((prev) => Math.max(0, Math.min(1, prev + d))),
      });
    } else {
      onRegisterActions?.({ select: handleSelect, longPress: handleLongPress, itemCount: items.length });
    }
  }, [onRegisterActions, handleSelect, handleLongPress, items.length, confirmDelete]);

  if (confirmDelete) {
    return (
      <>
        <TitleBar title="Station List" />
        <ConfirmDialog
          message={`Delete "${confirmDelete.name}"?`}
          selectedOption={confirmOption}
          onConfirm={() => { remove(confirmDelete.stationuuid); setConfirmDelete(null); setConfirmOption(0); }}
          onCancel={() => { setConfirmDelete(null); setConfirmOption(0); }}
        />
      </>
    );
  }

  return (
    <>
      <TitleBar title="Station List" />
      {items.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.8em' }}>No Stations</div>
      ) : (
        <ScrollableList
          items={items}
          selectedIndex={clampedIndex}
        />
      )}
    </>
  );
}
