const weatherKey = import.meta.env.VITE_WEATHER_API_KEY;

export const hasRequiredEnv = Boolean(weatherKey?.trim());

/** OpenWeather Geocoding 1.0 — same key as weather, no RapidAPI. */
export const GEO_API_URL = 'https://api.openweathermap.org/geo/1.0';

export const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

export const WEATHER_API_KEY = weatherKey ?? '';

export function geocodeDirectUrl(query: string, limit = 8): string {
  const q = encodeURIComponent(query.trim());
  return `${GEO_API_URL}/direct?q=${q}&limit=${limit}&appid=${WEATHER_API_KEY}`;
}

export function weatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}
