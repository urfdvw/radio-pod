import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { StationListProvider, useStationList } from '../contexts/StationListContext';

function wrapper({ children }) {
  return <StationListProvider>{children}</StationListProvider>;
}

const station1 = { stationuuid: '1', name: 'Station A', url: 'http://a.com/stream', url_resolved: 'http://a.com/stream' };
const station2 = { stationuuid: '2', name: 'Station B', url: 'http://b.com/stream', url_resolved: 'http://b.com/stream' };

beforeEach(() => {
  localStorage.clear();
});

describe('StationListContext', () => {
  it('starts with default station', () => {
    const { result } = renderHook(() => useStationList(), { wrapper });
    expect(result.current.stations).toHaveLength(1);
    expect(result.current.stations[0].name).toBe('Radio Gotanno');
  });

  it('adds a station', () => {
    const { result } = renderHook(() => useStationList(), { wrapper });
    act(() => {
      result.current.add(station1);
    });
    expect(result.current.stations).toHaveLength(2);
    expect(result.current.stations[1].name).toBe('Station A');
  });

  it('deduplicates by URL', () => {
    const { result } = renderHook(() => useStationList(), { wrapper });
    act(() => {
      result.current.add(station1);
      result.current.add({ ...station1, stationuuid: '1b', name: 'Station A Copy' });
    });
    expect(result.current.stations).toHaveLength(2);
  });

  it('removes a station', () => {
    const { result } = renderHook(() => useStationList(), { wrapper });
    act(() => {
      result.current.add(station1);
      result.current.add(station2);
    });
    act(() => {
      result.current.remove('1');
    });
    expect(result.current.stations).toHaveLength(2);
    expect(result.current.stations[1].name).toBe('Station B');
  });

  it('getIndex returns correct index', () => {
    const { result } = renderHook(() => useStationList(), { wrapper });
    act(() => {
      result.current.add(station1);
      result.current.add(station2);
    });
    expect(result.current.getIndex('2')).toBe(2);
    expect(result.current.getIndex('unknown')).toBe(-1);
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useStationList(), { wrapper });
    act(() => {
      result.current.add(station1);
    });
    const stored = JSON.parse(localStorage.getItem('RadioMini-stations'));
    expect(stored).toHaveLength(2);
    expect(stored[1].stationuuid).toBe('1');
  });
});
