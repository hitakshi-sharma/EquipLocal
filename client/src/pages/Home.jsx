import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { equipmentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EquipmentCard from '../components/EquipmentCard';
import SearchBar from '../components/SearchBar';
import useGeolocation from '../hooks/useGeolocation';
import {
  Search,
  MapPin,
  ShieldCheck,
  Clock,
  Truck,
  Wrench,
  CheckCircle2,
  ArrowRight,
  HardHat,
  Tractor,
  Zap,
  Sparkles,
  SlidersHorizontal,
  PackageSearch,
  X,
  BadgePercent,
  Check,
  ChevronRight,
  Filter,
  Navigation,
} from 'lucide-react';
import { LOCATIONS } from '../constants/locations';

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

const categoryHighlights = [
  {
    name: 'Construction',
    icon: HardHat,
    description: 'JCB Backhoe Loaders, Concrete Mixers, Mini Excavators & Forklifts',
    color: 'border-amber-200 hover:border-amber-400',
    iconBg: 'bg-amber-100 text-amber-700',
    accent: 'bg-amber-500',
  },
  {
    name: 'Agriculture',
    icon: Tractor,
    description: 'Tractors, Rotavators & High-Flow Irrigation Water Pumps',
    color: 'border-emerald-200 hover:border-emerald-400',
    iconBg: 'bg-emerald-100 text-emerald-700',
    accent: 'bg-emerald-500',
  },
  {
    name: 'Power Tools',
    icon: Zap,
    description: 'Electric Drills, Angle Grinders, Welding Machines & Generators',
    color: 'border-blue-200 hover:border-blue-400',
    iconBg: 'bg-blue-100 text-blue-700',
    accent: 'bg-blue-500',
  },
  {
    name: 'Cleaning',
    icon: Sparkles,
    description: 'High Pressure Jet Washers & Industrial Wet/Dry Vacuum Cleaners',
    color: 'border-cyan-200 hover:border-cyan-400',
    iconBg: 'bg-cyan-100 text-cyan-700',
    accent: 'bg-cyan-500',
  },
  {
    name: 'Transportation',
    icon: Truck,
    description: 'Mini Trucks (Tata Ace) for Cargo & Equipment Haulage',
    color: 'border-orange-200 hover:border-orange-400',
    iconBg: 'bg-orange-100 text-orange-700',
    accent: 'bg-orange-500',
  },
  {
    name: 'Event',
    icon: SlidersHorizontal,
    description: 'Sound Systems, HD Projectors, Event Tents & Portable Stages',
    color: 'border-purple-200 hover:border-purple-400',
    iconBg: 'bg-purple-100 text-purple-700',
    accent: 'bg-purple-500',
  },
];

const Home = () => {
  const { user, isOwner } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const locationObj = useLocation();
  const catalogRef = useRef(null);

  // URL Query Params state extraction
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || 'All';
  const urlLocation = searchParams.get('location') || '';
  const urlSort = searchParams.get('sort') || 'newest';

  // Input states (for form typing)
  const [search, setSearch] = useState(urlSearch);
  const [category, setCategory] = useState(urlCategory);
  const [location, setLocation] = useState(urlLocation);

  // Real-Time GPS Matching State
  const {
    coords: gpsCoords,
    loading: gpsLoading,
    error: gpsError,
    requestLiveLocation,
    setPresetLocation,
    clearLocation,
    presets,
  } = useGeolocation();

  const [radius, setRadius] = useState(25); // Search radius in km (5, 10, 25, 50, 100)

  // Data & loading state
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync inputs whenever URL searchParams change
  useEffect(() => {
    setSearch(urlSearch);
    setCategory(urlCategory);
    setLocation(urlLocation);
  }, [urlSearch, urlCategory, urlLocation]);

  // Handle incoming hash anchor #catalog
  useEffect(() => {
    if (locationObj.hash === '#catalog') {
      setTimeout(() => {
        catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [locationObj.hash]);

  // Fetch equipments based on URL query parameters & real-time GPS
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        const params = {};
        if (urlSearch.trim()) params.search = urlSearch.trim();
        if (urlCategory && urlCategory !== 'All') params.category = urlCategory;
        if (urlLocation.trim() && !gpsCoords) params.location = urlLocation.trim();

        // Real-Time GPS Matching Query Params
        if (gpsCoords?.lat && gpsCoords?.lng) {
          params.lat = gpsCoords.lat;
          params.lng = gpsCoords.lng;
          params.radius = radius;
          if (urlSort === 'nearest' || !urlSort || urlSort === 'newest') {
            params.sortByDistance = true;
          }
        }

        const data = await equipmentService.getAll(params);
        let sorted = Array.isArray(data) ? [...data] : [];

        if (urlSort === 'nearest' || (gpsCoords && urlSort === 'newest')) {
          sorted.sort((a, b) => (a.distance ?? 99999) - (b.distance ?? 99999));
        } else if (urlSort === 'rating-desc') {
          sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        } else if (urlSort === 'price-asc') {
          sorted.sort((a, b) => a.pricePerDay - b.pricePerDay);
        } else if (urlSort === 'price-desc') {
          sorted.sort((a, b) => b.pricePerDay - a.pricePerDay);
        } else {
          // newest default
          sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }

        setEquipments(sorted);
      } catch (err) {
        console.error('Failed to load equipments:', err);
        setEquipments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [urlSearch, urlCategory, urlLocation, urlSort, gpsCoords, radius]);

  // Helper to update URL params and optionally scroll to catalog
  const updateFilters = (updates, shouldScroll = false) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, val]) => {
      if (
        val === undefined ||
        val === null ||
        val === '' ||
        (key === 'category' && val === 'All') ||
        (key === 'sort' && val === 'newest')
      ) {
        newParams.delete(key);
      } else {
        newParams.set(key, String(val));
      }
    });

    setSearchParams(newParams);

    if (shouldScroll && catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = () => {
    updateFilters(
      {
        search: search.trim(),
        category,
        location: location.trim(),
      },
      true
    );
  };

  const handleReset = () => {
    setSearch('');
    setCategory('All');
    setLocation('');
    clearLocation();
    setSearchParams({});
  };

  const removeFilter = (key) => {
    if (key === 'search') setSearch('');
    if (key === 'location') setLocation('');
    if (key === 'category') setCategory('All');
    updateFilters({ [key]: '' }, false);
  };

  const hasActiveFilters =
    urlSearch ||
    (urlCategory && urlCategory !== 'All') ||
    urlLocation ||
    gpsCoords ||
    urlSort !== 'newest';

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION & INTEGRATED SEARCH BAR */}
      <section className="relative overflow-hidden bg-linear-to-b from-orange-50/70 via-white to-slate-50 py-12 lg:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Rent Machinery, Tools & Equipment <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-600 to-amber-500">
                Directly from Local Owners
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              From JCB backhoes, concrete mixers, and tractors to electric drills, pressure washers,
              mini trucks, and event sound systems—book verified equipment directly from owners nearby.
            </p>

            {/* Trust highlights */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-1 text-xs sm:text-sm font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified Local Owners</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Hidden Fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Transparent Security Deposits</span>
              </div>
            </div>

            {/* Main Interactive Search Bar */}
            <div className="pt-4 max-w-4xl mx-auto">
              <SearchBar
                search={search}
                setSearch={setSearch}
                category={category}
                setCategory={setCategory}
                location={location}
                setLocation={setLocation}
                gpsCoords={gpsCoords}
                onToggleGps={requestLiveLocation}
                gpsLoading={gpsLoading}
                gpsError={gpsError}
                radius={radius}
                setRadius={setRadius}
                presets={presets}
                onSelectPreset={setPresetLocation}
                onClearGps={clearLocation}
                onSearch={handleSearchSubmit}
                onReset={handleReset}
                className="shadow-xl shadow-slate-200/80 border-slate-300/80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. EXPLORE BY CATEGORY (VISUAL CARDS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Explore by Category
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Click any category to filter tools and instruments instantly
            </p>
          </div>

          {urlCategory !== 'All' && (
            <button
              onClick={() => updateFilters({ category: 'All' }, true)}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categoryHighlights.map((cat) => {
            const Icon = cat.icon;
            const isSelected = urlCategory.toLowerCase() === cat.name.toLowerCase();

            return (
              <div
                key={cat.name}
                onClick={() => {
                  const nextCategory = isSelected ? 'All' : cat.name;
                  setCategory(nextCategory);
                  updateFilters({ category: nextCategory }, true);
                }}
                className={`p-6 rounded-2xl bg-white border transition duration-200 cursor-pointer group flex flex-col justify-between shadow-2xs hover:shadow-md relative overflow-hidden ${
                  isSelected
                    ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/20'
                    : 'border-slate-200 hover:border-orange-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg">
                    Selected
                  </div>
                )}

                <div className="space-y-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.iconBg} group-hover:scale-105 transition`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{cat.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <span
                    className={
                      isSelected ? 'text-orange-600 font-bold' : 'text-slate-600 group-hover:text-orange-600'
                    }
                  >
                    {isSelected ? 'Active Filter • Click to clear' : 'Browse Category'}
                  </span>
                  <ArrowRight
                    className={`w-3.5 h-3.5 transition group-hover:translate-x-1 ${
                      isSelected ? 'text-orange-600' : 'text-slate-400 group-hover:text-orange-600'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. MAIN BROWSE EQUIPMENT CATALOG SECTION */}
      <section
        id="catalog"
        ref={catalogRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 scroll-mt-20"
      >
        {/* Catalog Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Explore Machinery, Tools & Event Gear
              </h2>
              {gpsCoords && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200 shadow-2xs">
                  <Navigation className="w-3 h-3 animate-pulse" />
                  GPS Matched
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Inspect equipment specifications, compare daily rates, and book directly from local owners
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-semibold text-slate-700 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-2xs">
              <strong className="text-orange-600 font-bold">{equipments.length}</strong> Equipment Listings Available
            </span>
          </div>
        </div>

        {/* Catalog Filter Controls Bar */}
        <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const active = urlCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    updateFilters({ category: cat }, false);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat === 'All' ? 'All Equipment' : cat}
                </button>
              );
            })}
          </div>

          {/* Secondary Controls (Location & Sort) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Location Filter Dropdown */}
            <select
              value={urlLocation}
              onChange={(e) => updateFilters({ location: e.target.value }, false)}
              disabled={Boolean(gpsCoords)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-2xs transition ${
                gpsCoords
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <option value="">{gpsCoords ? 'GPS Filter Active' : 'All Locations'}</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={urlSort}
              onChange={(e) => updateFilters({ sort: e.target.value }, false)}
              className="px-3.5 py-2 bg-white text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-2xs hover:bg-slate-50 transition"
            >
              {gpsCoords && <option value="nearest">Sort: Nearest First (GPS)</option>}
              <option value="newest">Sort: Newest First</option>
              <option value="rating-desc">Sort: Highest Rated ⭐</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Active Filters Ribbon */}
        {hasActiveFilters && (
          <div className="mt-3 py-2 px-3.5 bg-slate-100/80 rounded-2xl flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              Active Filters:
            </span>

            {gpsCoords && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold bg-orange-100 text-orange-800 border border-orange-300 shadow-2xs">
                <Navigation className="w-3 h-3 text-orange-600 animate-pulse" />
                <span>Near: {gpsCoords.label || 'Device GPS'} (Within {radius} km)</span>
                <button
                  onClick={clearLocation}
                  className="hover:text-orange-950 cursor-pointer ml-1"
                  title="Remove GPS filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {urlSearch && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium bg-orange-50 text-orange-700 border border-orange-200 shadow-2xs">
                Keyword: "{urlSearch}"
                <button
                  onClick={() => removeFilter('search')}
                  className="hover:text-orange-900 cursor-pointer ml-0.5"
                  title="Remove search filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {urlCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium bg-orange-50 text-orange-700 border border-orange-200 shadow-2xs">
                Category: {urlCategory}
                <button
                  onClick={() => removeFilter('category')}
                  className="hover:text-orange-900 cursor-pointer ml-0.5"
                  title="Remove category filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {urlLocation && !gpsCoords && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium bg-orange-50 text-orange-700 border border-orange-200 shadow-2xs">
                Location: {urlLocation}
                <button
                  onClick={() => removeFilter('location')}
                  className="hover:text-orange-900 cursor-pointer ml-0.5"
                  title="Remove location filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {urlSort !== 'newest' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium bg-slate-200 text-slate-700 shadow-2xs">
                Sort: {urlSort === 'nearest' ? 'Nearest GPS' : urlSort === 'price-asc' ? 'Low to High' : 'High to Low'}
                <button
                  onClick={() => updateFilters({ sort: 'newest' }, false)}
                  className="hover:text-slate-900 cursor-pointer ml-0.5"
                  title="Reset sort"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleReset}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 underline ml-auto cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}


        {/* Equipment Cards Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl h-84 border border-slate-200 animate-pulse p-4 space-y-4"
                >
                  <div className="w-full h-44 bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-8 bg-slate-200 rounded mt-4" />
                </div>
              ))}
            </div>
          ) : equipments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {equipments.map((equipment) => (
                <EquipmentCard key={equipment._id} equipment={equipment} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                <PackageSearch className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No equipment found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {gpsCoords
                  ? `No equipment found within ${radius} km of your GPS location. Try increasing the radius or resetting filters.`
                  : "We couldn't find any equipment matching your current filters or location query."}
              </p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4. HOW IT WORKS (STEP-BY-STEP PROCESS) */}
      <section className="bg-slate-900 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-orange-400 text-xs font-bold uppercase tracking-wider">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2">How EquipLocal Works</h2>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Rent heavy machinery, power tools, or event setups in minutes without middlemen margins or complex paperwork.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 relative flex flex-col justify-between">
              <div>
                <span className="text-4xl font-black text-orange-500/20 absolute top-4 right-4">
                  01
                </span>
                <div className="w-11 h-11 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold mb-4 shadow-md shadow-orange-500/30">
                  <Search className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base mb-2">1. Find Equipment</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Search by equipment name, daily rental budget, or city to find what you need
                  right in your area.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 relative flex flex-col justify-between">
              <div>
                <span className="text-4xl font-black text-orange-500/20 absolute top-4 right-4">
                  02
                </span>
                <div className="w-11 h-11 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold mb-4 shadow-md shadow-orange-500/30">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base mb-2">2. Select Dates</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pick your start and end rental dates. The platform automatically calculates the
                  transparent cost and deposit.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 relative flex flex-col justify-between">
              <div>
                <span className="text-4xl font-black text-orange-500/20 absolute top-4 right-4">
                  03
                </span>
                <div className="w-11 h-11 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold mb-4 shadow-md shadow-orange-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base mb-2">3. Owner Confirms</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The verified equipment owner receives instant notification and approves your
                  rental request quickly.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 relative flex flex-col justify-between">
              <div>
                <span className="text-4xl font-black text-orange-500/20 absolute top-4 right-4">
                  04
                </span>
                <div className="w-11 h-11 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold mb-4 shadow-md shadow-orange-500/30">
                  <Truck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base mb-2">4. Work & Return</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pick up the equipment or receive site delivery, complete your project, and return
                  safely to release deposit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY EQUIPLOCAL (BENEFITS & TRUST) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-orange-600 text-xs font-bold uppercase tracking-wider">
            Why Contractors, Farmers & Planners Choose Us
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Built for Construction, Farming, Repairs & Events
          </h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Eliminating idle machinery downtime and high equipment purchase costs across India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Verified Equipment & Owners</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every listing includes authentic specifications, verified working conditions, and
              owner contact profiles for complete peace of mind.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <BadgePercent className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Direct Pricing, No Middlemen</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Deal directly with the equipment owner. Save up to 40% compared to commercial rental
              brokerages with zero hidden booking surcharges.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Fast Local Turnaround</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Book equipment, tools, and event setups situated in your own city for rapid same-day or
              next-day mobilization.
            </p>
          </div>
        </div>
      </section>

      {/* 6. OWNER CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-linear-to-r from-orange-600 via-orange-500 to-amber-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Have Machinery, Tools, or Event Gear?
            </h2>
            <p className="text-sm text-orange-100 leading-relaxed">
              Don't let your JCBs, tractors, power tools, sound systems, or tents sit idle.
              List them on EquipLocal and earn dependable daily rental income from verified local
              renters.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            {isOwner ? (
              <>
                <Link
                  to="/owner/dashboard"
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition text-center shadow-lg"
                >
                  Owner Dashboard
                </Link>
                <Link
                  to="/owner/add-equipment"
                  className="px-6 py-3.5 bg-white/20 hover:bg-white/30 text-white font-bold text-sm rounded-xl transition text-center border border-white/40"
                >
                  + Add Equipment
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition text-center shadow-lg"
                >
                  Register as Owner
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl transition text-center border border-white/30"
                >
                  Owner Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
