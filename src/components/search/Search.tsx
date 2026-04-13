import { useCallback, useState } from 'react';
import AsyncSelect from 'react-select/async';
import type { CSSObjectWithLabel, StylesConfig } from 'react-select';
import { geocodeDirectUrl } from '../../config/api';
import type { CityOption } from '../../types/search';
import styles from './Search.module.css';

interface GeocodeHit {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

const selectStyles = {
  container: (base: CSSObjectWithLabel) =>
    ({ ...base, width: '100%' }) as CSSObjectWithLabel,
  control: (base: CSSObjectWithLabel, state: { isFocused: boolean }) =>
    ({
      ...base,
      minHeight: 48,
      borderRadius: 14,
      background: 'rgba(15, 23, 42, 0.65)',
      borderColor: state.isFocused
        ? 'rgba(167, 139, 250, 0.65)'
        : 'rgba(148, 163, 184, 0.25)',
      boxShadow: state.isFocused
        ? '0 0 0 1px rgba(167, 139, 250, 0.35)'
        : 'none',
      '&:hover': {
        borderColor: 'rgba(167, 139, 250, 0.45)',
      },
    }) as CSSObjectWithLabel,
  menuPortal: (base: CSSObjectWithLabel) =>
    ({ ...base, zIndex: 10000 }) as CSSObjectWithLabel,
  menu: (base: CSSObjectWithLabel) =>
    ({
      ...base,
      borderRadius: 14,
      overflow: 'hidden',
      background: 'rgba(15, 23, 42, 0.95)',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      backdropFilter: 'blur(16px)',
      zIndex: 10000,
    }) as CSSObjectWithLabel,
  menuList: (base: CSSObjectWithLabel) =>
    ({ ...base, padding: 6 }) as CSSObjectWithLabel,
  option: (
    base: CSSObjectWithLabel,
    state: { isSelected: boolean; isFocused: boolean }
  ) =>
    ({
      ...base,
      borderRadius: 10,
      cursor: 'pointer',
      backgroundColor: state.isSelected
        ? 'rgba(167, 139, 250, 0.25)'
        : state.isFocused
          ? 'rgba(34, 211, 238, 0.12)'
          : 'transparent',
      color: '#f1f5f9',
    }) as CSSObjectWithLabel,
  singleValue: (base: CSSObjectWithLabel) =>
    ({ ...base, color: '#f1f5f9' }) as CSSObjectWithLabel,
  input: (base: CSSObjectWithLabel) =>
    ({ ...base, color: '#f1f5f9' }) as CSSObjectWithLabel,
  placeholder: (base: CSSObjectWithLabel) =>
    ({ ...base, color: '#64748b' }) as CSSObjectWithLabel,
  indicatorSeparator: () => ({ display: 'none' }) as CSSObjectWithLabel,
  dropdownIndicator: (base: CSSObjectWithLabel, state: { isFocused: boolean }) =>
    ({
      ...base,
      color: state.isFocused ? '#a78bfa' : '#64748b',
      '&:hover': { color: '#a78bfa' },
    }) as CSSObjectWithLabel,
  clearIndicator: (base: CSSObjectWithLabel) =>
    ({
      ...base,
      color: '#64748b',
      '&:hover': { color: '#fb7185' },
    }) as CSSObjectWithLabel,
} satisfies StylesConfig<CityOption, false>;

function hitToOption(hit: GeocodeHit): CityOption {
  const label = hit.state
    ? `${hit.name}, ${hit.state}, ${hit.country}`
    : `${hit.name}, ${hit.country}`;
  return {
    value: `${hit.lat} ${hit.lon}`,
    label,
  };
}

interface SearchProps {
  onSearchChange: (data: CityOption) => void;
}

export default function Search({ onSearchChange }: SearchProps) {
  const [search, setSearch] = useState<CityOption | null>(null);

  const loadOptions = useCallback((inputValue: string) => {
    const q = inputValue.trim();
    if (q.length < 2) {
      return Promise.resolve([] as CityOption[]);
    }
    return fetch(geocodeDirectUrl(q))
      .then(async (res) => {
        if (!res.ok) return [] as CityOption[];
        const data = (await res.json()) as unknown;
        if (!Array.isArray(data)) return [] as CityOption[];
        return data
          .filter(
            (row): row is GeocodeHit =>
              typeof row === 'object' &&
              row !== null &&
              'name' in row &&
              'lat' in row &&
              'lon' in row &&
              'country' in row
          )
          .map(hitToOption);
      })
      .catch(() => [] as CityOption[]);
  }, []);

  const handleChange = (searchData: CityOption | null) => {
    setSearch(searchData);
    if (searchData) onSearchChange(searchData);
  };

  return (
    <div className={styles.wrap}>
      <label className={styles.label} htmlFor="city-search">
        Search city
      </label>
      <AsyncSelect<CityOption, false>
        inputId="city-search"
        instanceId="city-search"
        placeholder="Type at least 2 letters…"
        cacheOptions
        defaultOptions={false}
        loadOptions={loadOptions}
        value={search}
        onChange={handleChange}
        styles={selectStyles}
        classNamePrefix="weather-select"
        menuPortalTarget={document.body}
        menuPosition="fixed"
        isClearable
        noOptionsMessage={({ inputValue }) =>
          inputValue.trim().length < 2
            ? 'Enter 2+ characters'
            : 'No cities found'
        }
        loadingMessage={() => 'Searching…'}
      />
    </div>
  );
}
