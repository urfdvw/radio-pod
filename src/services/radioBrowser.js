const BASE_URL = 'https://de1.api.radio-browser.info';

async function apiFetch(path, params = {}) {
  const url = new URL(path, BASE_URL);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'RadioPod/1.0' },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function fetchCountries() {
  return apiFetch('/json/countries', { order: 'stationcount', reverse: 'true', hidebroken: 'true' });
}

export function fetchLanguages() {
  return apiFetch('/json/languages', { order: 'stationcount', reverse: 'true', hidebroken: 'true' });
}

export function fetchTags() {
  return apiFetch('/json/tags', { order: 'stationcount', reverse: 'true', hidebroken: 'true', limit: 500 });
}

export function fetchStationsByCountry(country) {
  return apiFetch(`/json/stations/bycountryexact/${encodeURIComponent(country)}`, {
    hidebroken: 'true', order: 'clickcount', reverse: 'true', limit: 100,
  });
}

export function fetchStationsByLanguage(language) {
  return apiFetch(`/json/stations/bylanguageexact/${encodeURIComponent(language)}`, {
    hidebroken: 'true', order: 'clickcount', reverse: 'true', limit: 100,
  });
}

export function fetchStationsByTag(tag) {
  return apiFetch(`/json/stations/bytagexact/${encodeURIComponent(tag)}`, {
    hidebroken: 'true', order: 'clickcount', reverse: 'true', limit: 100,
  });
}

export function searchStations(query) {
  return apiFetch('/json/stations/search', {
    name: query, hidebroken: 'true', order: 'clickcount', reverse: 'true', limit: 100,
  });
}
