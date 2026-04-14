import { useCallback, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { components as selectComponents } from 'react-select';
import type {
  ControlProps,
  CSSObjectWithLabel,
  StylesConfig,
} from 'react-select';
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
      minHeight: 44,
      borderRadius: 9999,
      background: 'rgba(255, 255, 255, 0.06)',
      borderColor: state.isFocused
        ? 'rgba(255, 255, 255, 0.28)'
        : 'rgba(255, 255, 255, 0.14)',
      boxShadow: state.isFocused
        ? '0 0 0 1px rgba(56, 189, 248, 0.35)'
        : 'none',
      '&:hover': {
        borderColor: 'rgba(255, 255, 255, 0.22)',
      },
    }) as CSSObjectWithLabel,
  menuPortal: (base: CSSObjectWithLabel) =>
    ({ ...base, zIndex: 10000 }) as CSSObjectWithLabel,
  menu: (base: CSSObjectWithLabel) =>
    ({
      ...base,
      borderRadius: 16,
      overflow: 'hidden',
      background: 'rgba(18, 18, 22, 0.94)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
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
        ? 'rgba(192, 132, 252, 0.22)'
        : state.isFocused
          ? 'rgba(56, 189, 248, 0.12)'
          : 'transparent',
      color: '#ffffff',
    }) as CSSObjectWithLabel,
  singleValue: (base: CSSObjectWithLabel) =>
    ({ ...base, color: '#ffffff' }) as CSSObjectWithLabel,
  input: (base: CSSObjectWithLabel) =>
    ({ ...base, color: '#ffffff' }) as CSSObjectWithLabel,
  placeholder: (base: CSSObjectWithLabel) =>
    ({ ...base, color: 'rgba(255, 255, 255, 0.45)' }) as CSSObjectWithLabel,
  indicatorSeparator: () => ({ display: 'none' }) as CSSObjectWithLabel,
  dropdownIndicator: (base: CSSObjectWithLabel, state: { isFocused: boolean }) =>
    ({
      ...base,
      color: state.isFocused ? '#c084fc' : 'rgba(255,255,255,0.4)',
      '&:hover': { color: '#c084fc' },
    }) as CSSObjectWithLabel,
  clearIndicator: (base: CSSObjectWithLabel) =>
    ({
      ...base,
      color: 'rgba(255,255,255,0.4)',
      '&:hover': { color: '#fb7185' },
    }) as CSSObjectWithLabel,
} satisfies StylesConfig<CityOption, false>;

function SearchGlyph() {
  return (
    <svg
      className={styles.glyphSvg}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm9 2-4.35-4.35"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ControlWithIcon(props: ControlProps<CityOption, false>) {
  return (
    <selectComponents.Control {...props}>
      <span className={styles.glyph}>
        <SearchGlyph />
      </span>
      {props.children}
    </selectComponents.Control>
  );
}

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
  /** Header layout: no label, pill search */
  compact?: boolean;
}

export default function Search({ onSearchChange, compact }: SearchProps) {
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
      {!compact && (
        <label className={styles.label} htmlFor="city-search">
          Search city
        </label>
      )}
      <AsyncSelect<CityOption, false>
        inputId="city-search"
        instanceId="city-search"
        placeholder={compact ? 'Search location' : 'Type at least 2 letters…'}
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
        components={{ Control: ControlWithIcon }}
      />
    </div>
  );
}
