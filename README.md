# React Weather App

Weather dashboard with city search, current conditions, hourly timeline, and 7-day overview.

Live demo: [https://johnyfours.github.io/React_Weather_app/](https://johnyfours.github.io/React_Weather_app/)

## What is inside

- City search via OpenWeather Geocoding API.
- Current weather card with key metrics (feels like, wind, humidity, pressure).
- Scrollable hourly forecast with navigation buttons.
- Expandable day details for the weekly forecast.
- Responsive glassmorphism-style UI.

## Stack

- React 18 + TypeScript
- Vite
- OpenWeather API
- react-select

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` in project root:

   ```env
   VITE_WEATHER_API_KEY=your_openweather_api_key
   ```

3. Start development server:

   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - run local dev server
- `npm run build` - type-check and create production build
- `npm run preview` - preview local production build
- `npm run deploy` - build and publish to GitHub Pages

## Notes

- The project uses `base: /React_Weather_app/` in Vite config for GitHub Pages.
- Forecast data comes in 3-hour intervals from OpenWeather.
