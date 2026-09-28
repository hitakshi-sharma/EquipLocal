import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Navigation, MapPin, X } from 'lucide-react';

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];

// Fix Leaflet's default marker asset lookup
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// User GPS marker with clear "Your GPS" label
const createUserIcon = (label = 'Your GPS') => {
  return L.divIcon({
    className: 'custom-user-gps-container',
    html: `
      <div class="relative flex flex-col items-center">
        <div class="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white gps-user-ping">
          <div class="w-2 h-2 rounded-full bg-white"></div>
        </div>
        <span class="mt-1 whitespace-nowrap bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md border border-white">
          📍 ${label}
        </span>
      </div>
    `,
    iconSize: [80, 48],
    iconAnchor: [40, 12],
    popupAnchor: [0, -15],
  });
};

// Useful Equipment Marker with name, price, and distance
const createEquipmentIcon = (item) => {
  const name = item.name || 'Equipment';
  const price = item.pricePerDay ? `₹${item.pricePerDay.toLocaleString()}` : '';
  const distanceStr =
    item.distance !== undefined && item.distance !== null
      ? `${item.distance} km away`
      : item.location || '';

  return L.divIcon({
    className: 'custom-equipment-pin-container',
    html: `
      <div class="cursor-pointer group transform hover:scale-105 transition-all duration-150">
        <div class="bg-white/95 backdrop-blur-md rounded-xl border-2 border-orange-500 shadow-md px-2.5 py-1.5 min-w-[130px] max-w-[190px] leading-tight text-left">
          <div class="font-bold text-[11px] text-slate-900 truncate flex items-center gap-1">
            <span>🚜</span>
            <span class="truncate">${name}</span>
          </div>
          <div class="flex items-center justify-between text-[10px] mt-1 pt-1 border-t border-slate-100">
            <span class="font-extrabold text-orange-600">${price}/day</span>
            <span class="text-slate-500 font-semibold truncate ml-1">${distanceStr}</span>
          </div>
        </div>
        <div class="w-2.5 h-2.5 bg-orange-500 transform rotate-45 mx-auto -mt-1.5 shadow-xs"></div>
      </div>
    `,
    iconSize: [160, 52],
    iconAnchor: [80, 52],
    popupAnchor: [0, -52],
  });
};

const EquipmentMap = ({
  equipments = [],
  userCoords = null,
  radiusKm = 25,
  onRadiusChange = null,
  onRequestLocation = null,
  onClearLocation = null,
  locating = false,
  height = '500px',
  singleMode = false,
  showControls = true,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const circleLayerRef = useRef(null);

  // Initialize Leaflet Map with standard OpenStreetMap tiles (100% free, no API key required)
  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = userCoords?.lat || equipments[0]?.latitude || 28.6139;
      const initialLng = userCoords?.lng || equipments[0]?.longitude || 77.209;

      const map = L.map(mapRef.current, {
        center: [initialLat, initialLng],
        zoom: 11,
        scrollWheelZoom: true,
      });

      // Standard Leaflet + OpenStreetMap tiles without CARTO / API key watermark
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      circleLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Radius Circle when equipments, userCoords, or radius change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current || !circleLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    circleLayerRef.current.clearLayers();

    const bounds = [];

    // 1. Draw User Location & Radius Circle if active
    if (userCoords?.lat && userCoords?.lng) {
      const userPoint = [userCoords.lat, userCoords.lng];
      bounds.push(userPoint);

      const userMarker = L.marker(userPoint, {
        icon: createUserIcon(userCoords.label || 'Your GPS'),
        zIndexOffset: 1000,
      }).addTo(markersLayerRef.current);

      userMarker.bindPopup(`
        <div class="p-3 text-center min-w-[140px] font-sans">
          <p class="font-bold text-slate-900 text-xs">📍 ${userCoords.label || 'Your GPS'}</p>
          <p class="text-[11px] text-slate-500 mt-0.5">
            Coordinates: ${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}
          </p>
          ${
            radiusKm
              ? `<p class="text-[10px] font-semibold text-orange-600 mt-1">Search Radius: ${radiusKm} km</p>`
              : ''
          }
        </div>
      `);

      if (radiusKm && !singleMode) {
        L.circle(userPoint, {
          radius: radiusKm * 1000, // convert km to meters
          color: '#ea580c',
          weight: 2,
          opacity: 0.7,
          fillColor: '#ea580c',
          fillOpacity: 0.08,
          dashArray: '6, 8',
        }).addTo(circleLayerRef.current);
      }
    }

    // 2. Draw Equipment Markers
    equipments.forEach((item) => {
      const lat = item.latitude;
      const lng = item.longitude;

      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        const point = [lat, lng];
        bounds.push(point);

        const marker = L.marker(point, {
          icon: createEquipmentIcon(item),
        }).addTo(markersLayerRef.current);

        const distanceBadge =
          item.distance !== undefined && item.distance !== null
            ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">
                ⚡ ${item.distance} km away
              </span>`
            : '';

        const popupContent = `
          <div class="p-3 w-60 font-sans">
            ${
              item.image
                ? `<div class="relative h-24 w-full mb-2 rounded-lg overflow-hidden bg-slate-100">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover" />
                  </div>`
                : ''
            }
            <h4 class="font-bold text-slate-900 text-xs leading-snug line-clamp-1 mb-1">${item.name}</h4>
            <div class="text-[11px] text-slate-500 space-y-0.5 mb-2.5">
              <p class="flex items-center gap-1">
                <span>📍</span>
                <span>${item.location || 'Local'}</span>
              </p>
              ${distanceBadge}
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <span class="text-sm font-extrabold text-slate-900">₹${
                  item.pricePerDay ? item.pricePerDay.toLocaleString() : 0
                }</span>
                <span class="text-[10px] text-slate-400">/day</span>
              </div>
              <a href="/user/equipment/${item._id}" class="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg transition duration-150 shadow-xs">
                View Details →
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 280 });
      }
    });

    // 3. Auto-fit bounds
    if (bounds.length > 0) {
      if (bounds.length === 1) {
        map.setView(bounds[0], singleMode ? 14 : 12);
      } else {
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: singleMode ? 14 : 13,
        });
      }
    }
  }, [equipments, userCoords, radiusKm, singleMode]);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      {/* Interactive Map Header Controls */}
      {showControls && (
        <div className="p-3 sm:p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 z-10 relative">
          {/* User Location Action */}
          <div className="flex items-center gap-2">
            {userCoords ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-xs font-bold text-orange-800">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                <span>📍 {userCoords.label || 'Your GPS'} active</span>
                {onClearLocation && (
                  <button
                    type="button"
                    onClick={onClearLocation}
                    className="ml-1 p-0.5 hover:bg-orange-200 rounded text-orange-600 cursor-pointer"
                    title="Clear location filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onRequestLocation}
                disabled={locating}
                className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
                <span>{locating ? 'Detecting Location...' : '📍 Use My Location'}</span>
              </button>
            )}

            <span className="text-xs text-slate-500 font-medium hidden md:inline">
              • {equipments.length} nearby machines mapped
            </span>
          </div>

          {/* Radius Selector: 5 km, 10 km, 25 km, 50 km, 100 km */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600 mr-1">Radius:</span>
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onRadiusChange && onRadiusChange(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  radiusKm === r
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapRef} style={{ height, width: '100%' }} className="z-0" />
    </div>
  );
};

export default EquipmentMap;
