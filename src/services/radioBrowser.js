const BASE_URL = 'https://de1.api.radio-browser.info';

const STATION_DEFAULTS = { hidebroken: 'true', lastcheckok: '1', order: 'clickcount', reverse: 'true', limit: '100' };

async function apiFetch(path, params = {}) {
  const url = new URL(path, BASE_URL);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'RadioMini/1.0' },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

function filterLive(stations) {
  return stations.filter((s) => s.lastcheckok === 1 && s.url_resolved);
}

export function fetchCountries() {
  return apiFetch('/json/countries', { order: 'stationcount', reverse: 'true', hidebroken: 'true' });
}

export function fetchLanguages() {
  return apiFetch('/json/languages', { order: 'stationcount', reverse: 'true', hidebroken: 'true' });
}

export function fetchTags() {
  return apiFetch('/json/tags', { order: 'stationcount', reverse: 'true', hidebroken: 'true', limit: '500' });
}

export async function fetchStationsByCountry(country) {
  const data = await apiFetch(`/json/stations/bycountryexact/${encodeURIComponent(country)}`, STATION_DEFAULTS);
  return filterLive(data);
}

export async function fetchStationsByLanguage(language) {
  const data = await apiFetch(`/json/stations/bylanguageexact/${encodeURIComponent(language)}`, STATION_DEFAULTS);
  return filterLive(data);
}

export async function fetchStationsByTag(tag) {
  const data = await apiFetch(`/json/stations/bytagexact/${encodeURIComponent(tag)}`, STATION_DEFAULTS);
  return filterLive(data);
}

export async function searchStations(query) {
  const data = await apiFetch('/json/stations/search', { ...STATION_DEFAULTS, name: query });
  return filterLive(data);
}
