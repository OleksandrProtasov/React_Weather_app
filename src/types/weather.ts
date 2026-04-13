export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeatherResponse {
  weather: WeatherCondition[];
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    temp_min?: number;
    temp_max?: number;
    sea_level?: number;
  };
  wind: { speed: number };
  name?: string;
}

export interface ForecastListItem {
  weather: WeatherCondition[];
  main: {
    temp_min: number;
    temp_max: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    sea_level?: number;
  };
  wind: { speed: number };
  clouds: { all: number };
}

export interface ForecastResponse {
  list: ForecastListItem[];
}

export interface CurrentWeatherView extends CurrentWeatherResponse {
  city: string;
}

export interface ForecastView extends ForecastResponse {
  city: string;
}
