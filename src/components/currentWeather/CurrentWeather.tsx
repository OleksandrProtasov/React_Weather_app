import type { CurrentWeatherView } from '../../types/weather';
import { weatherIconUrl } from '../../config/api';
import styles from './CurrentWeather.module.css';

interface Props {
  data: CurrentWeatherView;
}

export default function CurrentWeather({ data }: Props) {
  const w = data.weather[0];

  return (
    <article className={`${styles.card} glass-panel`} aria-label="Current weather">
      <div className={styles.top}>
        <div>
          <h2 className={styles.city}>{data.city}</h2>
          <p className={styles.description}>{w.description}</p>
        </div>
        <img
          alt=""
          className={styles.icon}
          src={weatherIconUrl(w.icon)}
          width={112}
          height={112}
        />
      </div>

      <div className={styles.bottom}>
        <p className={styles.temp}>
          {Math.round(data.main.temp)}
          <span className={styles.tempUnit}>°C</span>
        </p>

        <div className={styles.details}>
          <p className={styles.detailsTitle}>Details</p>
          <ul className={styles.grid}>
            <li>
              <span className={styles.muted}>Feels like</span>
              <span>{Math.round(data.main.feels_like)}°C</span>
            </li>
            <li>
              <span className={styles.muted}>Wind</span>
              <span>{data.wind.speed} m/s</span>
            </li>
            <li>
              <span className={styles.muted}>Humidity</span>
              <span>{data.main.humidity}%</span>
            </li>
            <li>
              <span className={styles.muted}>Pressure</span>
              <span>{data.main.pressure} hPa</span>
            </li>
          </ul>
        </div>
      </div>
    </article>
  );
}
