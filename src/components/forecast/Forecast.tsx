import {
  Accordion,
  AccordionItem,
  AccordionItemButton,
  AccordionItemHeading,
  AccordionItemPanel,
} from 'react-accessible-accordion';
import type { ForecastView } from '../../types/weather';
import { weatherIconUrl } from '../../config/api';
import styles from './Forecast.module.css';

const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

interface Props {
  data: ForecastView;
}

export default function Forecast({ data }: Props) {
  const dayInWeek = new Date().getDay();
  const mondayBased = dayInWeek === 0 ? 6 : dayInWeek - 1;
  const forecastDays = [
    ...WEEK_DAYS.slice(mondayBased),
    ...WEEK_DAYS.slice(0, mondayBased),
  ];

  const items = data.list.slice(0, 7);

  return (
    <section className={styles.section} aria-label="7-day forecast">
      <h2 className={styles.title}>Next days</h2>
      <Accordion allowZeroExpanded className={styles.accordion}>
        {items.map((item, idx) => {
          const w = item.weather[0];
          return (
            <AccordionItem
              key={`${item.main.temp_max}-${item.main.temp_min}-${idx}`}
              uuid={`day-${idx}`}
              className={styles.item}
            >
              <AccordionItemHeading>
                <AccordionItemButton className={styles.button}>
                  <div className={styles.row}>
                    <img
                      className={styles.icon}
                      src={weatherIconUrl(w.icon)}
                      alt=""
                      width={44}
                      height={44}
                    />
                    <span className={styles.day}>{forecastDays[idx]}</span>
                    <span className={styles.desc}>{w.description}</span>
                    <span className={styles.range}>
                      {Math.round(item.main.temp_min)}° /{' '}
                      {Math.round(item.main.temp_max)}°
                    </span>
                  </div>
                </AccordionItemButton>
              </AccordionItemHeading>
              <AccordionItemPanel className={styles.panel}>
                <dl className={styles.grid}>
                  <div className={styles.cell}>
                    <dt>Pressure</dt>
                    <dd>{item.main.pressure} hPa</dd>
                  </div>
                  <div className={styles.cell}>
                    <dt>Humidity</dt>
                    <dd>{item.main.humidity}%</dd>
                  </div>
                  <div className={styles.cell}>
                    <dt>Clouds</dt>
                    <dd>{item.clouds.all}%</dd>
                  </div>
                  <div className={styles.cell}>
                    <dt>Wind</dt>
                    <dd>{item.wind.speed} m/s</dd>
                  </div>
                  {item.main.sea_level != null && (
                    <div className={styles.cell}>
                      <dt>Sea level</dt>
                      <dd>{item.main.sea_level} m</dd>
                    </div>
                  )}
                  <div className={styles.cell}>
                    <dt>Feels like</dt>
                    <dd>{Math.round(item.main.feels_like)}°C</dd>
                  </div>
                </dl>
              </AccordionItemPanel>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}
