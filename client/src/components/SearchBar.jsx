import React from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  Navigation,
} from 'lucide-react';

const categories = [
  'All',
  'Construction',
  'Agriculture',
  'Power Tools',
  'Cleaning',
  'Transportation',
  'Event',
  'Other',
];

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];

const SearchBar = ({
  search,
  setSearch,
  category,
  setCategory,
  location,
  setLocation,
  gpsCoords,
  onToggleGps,
  gpsLoading,
  gpsError,
  radius,
  setRadius,
  presets = [],
  onSelectPreset,
  onClearGps,
  onSearch,
  onReset,
  className = '',
}) => {

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  const hasFilters =
    search || (category && category !== 'All') || gpsCoords;

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200 p-3 sm:p-4 shadow-sm space-y-3 ${className}`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        {/* Search Keyword */}
        <div className="relative flex-1 min-w-0 md:min-w-[180px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search equipment (e.g. JCB, Concrete Mixer, Tractor)..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm text-slate-900 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
          />
        </div>

        {/* Category Dropdown */}
        <div className="relative w-full md:w-44 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full pl-10 pr-8 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm text-slate-900 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition appearance-none cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Live GPS Button */}
        <div className="w-full md:w-auto shrink-0 flex items-center">
          <button
            type="button"
            onClick={gpsCoords ? onClearGps : onToggleGps}
            disabled={gpsLoading}
            className={`w-full md:w-auto whitespace-nowrap px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs border shrink-0 ${
              gpsCoords
                ? 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100'
                : 'bg-white text-slate-700 border-slate-200 hover:border-orange-500 hover:text-orange-600'
            }`}
            title={gpsCoords ? 'Click to disable GPS matching' : 'Use live device GPS'}
          >
            <Navigation
              className={`w-4 h-4 shrink-0 ${
                gpsLoading
                  ? 'animate-spin text-orange-600'
                  : gpsCoords
                  ? 'text-orange-600 fill-orange-600'
                  : 'text-slate-400'
              }`}
            />
            <span className="whitespace-nowrap">
              {gpsLoading
                ? 'Acquiring GPS...'
                : gpsCoords
                ? '📍 GPS Active'
                : 'Use My Location'}
            </span>
            {gpsCoords && <X className="w-3.5 h-3.5 ml-1 text-orange-500 hover:text-orange-700 shrink-0" />}
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <button
            type="submit"
            className="flex-1 md:flex-none whitespace-nowrap px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-2xl shadow-md shadow-orange-300/40 transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span>Search</span>
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={onReset}
              title="Reset Filters"
              className="p-3 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-2xl border border-slate-200 transition cursor-pointer shrink-0"
            >
              <X className="w-4 h-4 shrink-0" />
            </button>
          )}
        </div>
      </form>

      {/* GPS Active Secondary Bar (Radius Selection & Status) */}
      {gpsCoords && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-700">
              Matched around:{' '}
              <strong className="text-slate-900">{gpsCoords.label || 'Your Device GPS'}</strong>
              <span className="text-slate-400 ml-1">
                ({gpsCoords.lat.toFixed(3)}, {gpsCoords.lng.toFixed(3)})
              </span>
            </span>
          </div>

          {/* Search Radius Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium mr-1">Radius:</span>
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadius && setRadius(r)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                  radius === r
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>
      )}

      {/* GPS Error Alert */}
      {gpsError && (
        <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 flex items-center justify-between">
          <span>⚠️ {gpsError}</span>
          <button
            type="button"
            onClick={onClearGps}
            className="text-rose-500 hover:text-rose-700 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
