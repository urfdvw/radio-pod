import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchCountries, fetchLanguages, fetchTags, searchStations } from '../services/radioBrowser';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('radioBrowser service', () => {
  it('fetchCountries calls the correct endpoint', async () => {
    const mockData = [{ name: 'USA', stationcount: 100 }];
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchCountries();
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/json/countries'),
      expect.any(Object)
    );
  });

  it('fetchLanguages calls the correct endpoint', async () => {
    const mockData = [{ name: 'English', stationcount: 50 }];
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchLanguages();
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/json/languages'),
      expect.any(Object)
    );
  });

  it('fetchTags calls the correct endpoint', async () => {
    const mockData = [{ name: 'rock', stationcount: 30 }];
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchTags();
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/json/tags'),
      expect.any(Object)
    );
  });

  it('searchStations passes the query', async () => {
    const mockData = [{ stationuuid: '1', name: 'Jazz FM', lastcheckok: 1, url_resolved: 'http://example.com/stream' }];
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await searchStations('jazz');
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('name=jazz'),
      expect.any(Object)
    );
  });

  it('throws on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(fetchCountries()).rejects.toThrow('API error: 500');
  });
});
