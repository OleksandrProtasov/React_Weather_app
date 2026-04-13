import type { CurrentWeatherResponse, ForecastResponse } from '../types/weather';

export function isCurrentWeatherResponse(
  value: unknown
): value is CurrentWeatherResponse {
  if (typeof value !== 'object' || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    Array.isArray(o.weather) &&
    typeof o.main === 'object' &&
    o.main !== null &&
    typeof o.wind === 'object' &&
    o.wind !== null
  );
}

export function isForecastResponse(value: unknown): value is ForecastResponse {
  if (typeof value !== 'object' || value === null) return false;
  const o = value as Record<string, unknown>;
  return Array.isArray(o.list);
}
