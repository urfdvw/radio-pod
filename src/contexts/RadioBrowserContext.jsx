import { createContext, useContext, useEffect, useState } from 'react';
import { fetchCountries, fetchLanguages, fetchTags } from '../services/radioBrowser';

const RadioBrowserContext = createContext(null);

export function RadioBrowserProvider({ children }) {
  const [countries, setCountries] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [c, l, t] = await Promise.all([
          fetchCountries(),
          fetchLanguages(),
          fetchTags(),
        ]);
        if (cancelled) return;
        setCountries(c.filter((x) => x.stationcount > 0));
        setLanguages(l.filter((x) => x.stationcount > 0));
        setTags(t.filter((x) => x.stationcount > 0));
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <RadioBrowserContext.Provider value={{ countries, languages, tags, isLoading, error }}>
      {children}
    </RadioBrowserContext.Provider>
  );
}

export function useRadioBrowser() {
  const ctx = useContext(RadioBrowserContext);
  if (!ctx) throw new Error('useRadioBrowser must be used within RadioBrowserProvider');
  return ctx;
}
