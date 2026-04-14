import type { CurrentWeatherView } from '../../types/weather';
import { weatherIconUrl } from '../../config/api';
import styles from './CurrentWeather.module.css';

interface Props {
  data: CurrentWeatherView;
}

export default function CurrentWeather({ data }: Props) {
  const w = data.weather[0];

  return (
    <article className={styles.hero} aria-label="Current weather">
      <p className={styles.city}>{data.city}</p>

      <div className={styles.scene}>
        <div className={styles.sun} aria-hidden />
        <div className={styles.cloud} aria-hidden />
        <div className={`${styles.cloud} ${styles.cloud2}`} aria-hidden />

        <div className={styles.orbitSystem}>
          <div className={`${styles.ring} ${styles.ring1}`}>
            <span className={`${styles.dot} ${styles.dot1}`} />
            <span className={`${styles.dot} ${styles.dot2}`} />
          </div>
          <div className={`${styles.ring} ${styles.ring2}`}>
            <span className={`${styles.dot} ${styles.dot3}`} />
          </div>
          <div className={`${styles.ring} ${styles.ring3}`}>
            <span className={`${styles.dot} ${styles.dot4}`} />
            <span className={`${styles.dot} ${styles.dot5}`} />
          </div>

          <div className={styles.core}>
            <p className={styles.temp}>
              {Math.round(data.main.temp)}
              <span className={styles.tempUnit}>°C</span>
            </p>
            <p className={styles.condition}>{w.description}</p>
            <img
              alt=""
              className={styles.icon}
              src={weatherIconUrl(w.icon)}
              width={72}
              height={72}
            />
          </div>
        </div>
      </div>

      <ul className={styles.metrics}>
        <li>
          <span className={styles.metricsLabel}>Feels like</span>
          <span className={styles.metricsVal}>
            {Math.round(data.main.feels_like)}°
          </span>
        </li>
        <li>
          <span className={styles.metricsLabel}>Wind</span>
          <span className={styles.metricsVal}>{data.wind.speed} m/s</span>
        </li>
        <li>
          <span className={styles.metricsLabel}>Humidity</span>
          <span className={styles.metricsVal}>{data.main.humidity}%</span>
        </li>
        <li>
          <span className={styles.metricsLabel}>Pressure</span>
          <span className={styles.metricsVal}>{data.main.pressure}</span>
        </li>
      </ul>
    </article>
  );
}
