import { useCallback, useState } from 'react';
import type { CityOption } from './types/search';
import {
  WEATHER_API_KEY,
  WEATHER_API_URL,
  hasRequiredEnv,
} from './config/api';
import type { CurrentWeatherView, ForecastView } from './types/weather';
import {
  isCurrentWeatherResponse,
  isForecastResponse,
} from './utils/weatherGuards';
import './App.css';
import CurrentWeather from './components/currentWeather/CurrentWeather';
import Forecast from './components/forecast/Forecast';
import Search from './components/search/Search';

function App() {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherView | null>(
    null
  );
  const [forecast, setForecast] = useState<ForecastView | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOnSearchChange = useCallback((searchData: CityOption) => {
    const [lat, lon] = searchData.value.split(' ');
    setError(null);

    const currentUrl = `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    const forecastUrl = `${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;

    Promise.all([fetch(currentUrl), fetch(forecastUrl)])
      .then(async ([weatherRes, forecastRes]) => {
        const weatherUnknown = await weatherRes.json();
        const forecastUnknown = await forecastRes.json();

        if (!weatherRes.ok) {
          const msg =
            typeof weatherUnknown === 'object' &&
            weatherUnknown !== null &&
            'message' in weatherUnknown
              ? String(
                  (weatherUnknown as { message?: unknown }).message ?? ''
                )
              : '';
          throw new Error(msg || 'Failed to load current weather');
        }
        if (!isCurrentWeatherResponse(weatherUnknown)) {
          throw new Error('Invalid current weather response');
        }

        if (!forecastRes.ok) {
          throw new Error('Failed to load forecast');
        }
        if (!isForecastResponse(forecastUnknown)) {
          throw new Error('Invalid forecast response');
        }

        setCurrentWeather({ city: searchData.label, ...weatherUnknown });
        setForecast({ city: searchData.label, ...forecastUnknown });
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Something went wrong';
        setError(message);
        setCurrentWeather(null);
        setForecast(null);
      });
  }, []);

  if (!hasRequiredEnv) {
    return (
      <div className="app">
        <div className="env-warning">
          <h1 className="env-warning__title">Configure API keys</h1>
          <p className="env-warning__text">
            Create a <code>.env</code> file in the project root with{' '}
            <code>VITE_WEATHER_API_KEY</code> (OpenWeather — covers weather and
            city search). See <code>.env.example</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app__shell">
        <header className="app__header">
          <div className="app__brand">
            <span className="app__plus" aria-hidden>
              +
            </span>
            <h1 className="app__title">Weather</h1>
          </div>
          <div className="app__search-wrap">
            <Search compact onSearchChange={handleOnSearchChange} />
          </div>
        </header>

        <main className="app__main">
          {error && (
            <p className="app__error" role="alert">
              {error}
            </p>
          )}
          <div className="app__dashboard">
            {currentWeather && <CurrentWeather data={currentWeather} />}
            {forecast && <Forecast data={forecast} />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
