import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ForecastListItem, ForecastView } from '../../types/weather';
import { weatherIconUrl } from '../../config/api';
import styles from './Forecast.module.css';

interface Props {
  data: ForecastView;
}

function slotTemp(item: ForecastListItem): number {
  if (item.main.temp != null) return item.main.temp;
  return (item.main.temp_min + item.main.temp_max) / 2;
}

function formatSlotTime(dt?: number): string {
  if (dt == null) return '—';
  return new Date(dt * 1000).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

interface DayAggregate {
  key: string;
  dt: number;
  icon: string;
  description: string;
  min: number;
  max: number;
  items: ForecastListItem[];
}

function aggregateByDay(list: ForecastListItem[]): DayAggregate[] {
  const map = new Map<
    string,
    { items: ForecastListItem[]; firstDt: number }
  >();

  for (const item of list) {
    const dt = item.dt;
    if (dt == null) continue;
    const d = new Date(dt * 1000);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!map.has(key)) {
      map.set(key, { items: [], firstDt: dt });
    }
    map.get(key)!.items.push(item);
  }

  const rows: DayAggregate[] = [];
  for (const [key, { items, firstDt }] of map) {
    items.sort((a, b) => (a.dt ?? 0) - (b.dt ?? 0));
    const min = Math.min(...items.map((i) => i.main.temp_min));
    const max = Math.max(...items.map((i) => i.main.temp_max));
    const mid = items[Math.floor(items.length / 2)];
    const w = mid.weather[0];
    rows.push({
      key,
      dt: firstDt,
      icon: w.icon,
      description: w.description,
      min,
      max,
      items,
    });
  }

  rows.sort((a, b) => a.dt - b.dt);
  return rows.slice(0, 7);
}

function dayHeadingLabel(dt: number): string {
  return new Date(dt * 1000).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export default function Forecast({ data }: Props) {
  const hourlySlots = data.list.slice(0, 24);
  const week = aggregateByDay(data.list);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const updateScrollHints = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  useLayoutEffect(() => {
    updateScrollHints();
  }, [hourlySlots.length, updateScrollHints]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScrollHints);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScrollHints]);

  const scrollHourly = (direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const delta = Math.min(280, el.clientWidth * 0.85) * direction;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const toggleDay = (key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  const expanded = expandedKey
    ? week.find((d) => d.key === expandedKey)
    : null;

  return (
    <div className={styles.stack}>
      <section
        className={`${styles.card} glass-panel`}
        aria-label="Hourly forecast"
      >
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>Hourly Forecast</h2>
          <div className={styles.cardActions}>
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Scroll hourly forecast left"
              disabled={!canScrollLeft}
              onClick={() => scrollHourly(-1)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M15 6l-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Scroll hourly forecast right"
              disabled={!canScrollRight}
              onClick={() => scrollHourly(1)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className={styles.hourlyScroll}
          onScroll={updateScrollHints}
        >
          {hourlySlots.map((item, idx) => {
            const w = item.weather[0];
            return (
              <div
                key={`${item.dt ?? idx}-${idx}`}
                className={styles.hourlyCell}
              >
                <span className={styles.hourlyTime}>
                  {formatSlotTime(item.dt)}
                </span>
                <img
                  className={styles.hourlyIcon}
                  src={weatherIconUrl(w.icon)}
                  alt=""
                  width={36}
                  height={36}
                />
                <span className={styles.hourlyTemp}>
                  {Math.round(slotTemp(item))}°
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section
        className={`${styles.card} glass-panel`}
        aria-label="7-day forecast"
      >
        <h2 className={styles.cardTitle}>7 Day Forecast</h2>
        <p className={styles.weekHint}>Tap a day for details</p>

        <div className={styles.weekGrid}>
          {week.map((day) => {
            const isOpen = expandedKey === day.key;
            return (
              <button
                key={day.key}
                type="button"
                className={`${styles.dayCol} ${isOpen ? styles.dayColOpen : ''}`}
                onClick={() => toggleDay(day.key)}
                aria-expanded={isOpen}
                aria-controls={`day-detail-${day.key}`}
                id={`day-trigger-${day.key}`}
              >
                <span className={styles.dayName}>
                  {new Date(day.dt * 1000).toLocaleDateString(undefined, {
                    weekday: 'short',
                  })}
                </span>
                <img
                  className={styles.dayIcon}
                  src={weatherIconUrl(day.icon)}
                  alt=""
                  width={40}
                  height={40}
                />
                <span className={styles.dayHi}>{Math.round(day.max)}°</span>
                <span className={styles.dayLo}>{Math.round(day.min)}°</span>
              </button>
            );
          })}
        </div>

        {expanded && (
          <div
            className={styles.dayDetail}
            id={`day-detail-${expanded.key}`}
            role="region"
            aria-labelledby={`day-trigger-${expanded.key}`}
          >
            <h3 className={styles.dayDetailTitle}>
              {dayHeadingLabel(expanded.dt)}
            </h3>
            <p className={styles.dayDetailDesc}>
              {expanded.description}
            </p>

            <ul className={styles.slotList}>
              {expanded.items.map((item, idx) => {
                const w = item.weather[0];
                return (
                  <li key={`${item.dt}-${idx}`} className={styles.slotRow}>
                    <span className={styles.slotTime}>
                      {formatSlotTime(item.dt)}
                    </span>
                    <img
                      src={weatherIconUrl(w.icon)}
                      alt=""
                      width={32}
                      height={32}
                      className={styles.slotIcon}
                    />
                    <span className={styles.slotTemp}>
                      {Math.round(slotTemp(item))}°
                    </span>
                    <span className={styles.slotDesc}>{w.description}</span>
                  </li>
                );
              })}
            </ul>

            <dl className={styles.summaryGrid}>
              <div className={styles.summaryCell}>
                <dt>Humidity (avg)</dt>
                <dd>
                  {Math.round(
                    expanded.items.reduce((s, i) => s + i.main.humidity, 0) /
                      expanded.items.length
                  )}
                  %
                </dd>
              </div>
              <div className={styles.summaryCell}>
                <dt>Wind (max)</dt>
                <dd>
                  {Math.max(
                    ...expanded.items.map((i) => i.wind.speed)
                  ).toFixed(1)}{' '}
                  m/s
                </dd>
              </div>
              <div className={styles.summaryCell}>
                <dt>Pressure (avg)</dt>
                <dd>
                  {Math.round(
                    expanded.items.reduce((s, i) => s + i.main.pressure, 0) /
                      expanded.items.length
                  )}{' '}
                  hPa
                </dd>
              </div>
              <div className={styles.summaryCell}>
                <dt>Clouds (avg)</dt>
                <dd>
                  {Math.round(
                    expanded.items.reduce((s, i) => s + i.clouds.all, 0) /
                      expanded.items.length
                  )}
                  %
                </dd>
              </div>
            </dl>
          </div>
        )}
      </section>
    </div>
  );
}
