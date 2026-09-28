import { useState, useEffect, useCallback } from 'react';

// Preset test regions in Delhi NCR for one-click simulation
export const LOCATION_PRESETS = [
  { id: 'delhi', name: 'Delhi (Connaught Place)', lat: 28.6315, lng: 77.2167 },
  { id: 'noida', name: 'Noida (Sector 18)', lat: 28.5700, lng: 77.3200 },
  { id: 'faridabad', name: 'Faridabad (NIT Zone)', lat: 28.3980, lng: 77.3050 },
  { id: 'ghaziabad', name: 'Ghaziabad (Indirapuram)', lat: 28.6440, lng: 77.3750 },
];

export const useGeolocation = () => {
  const [coords, setCoords] = useState(null); // { lat, lng, label, accuracy }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLiveGps, setIsLiveGps] = useState(false);

  // Request browser live GPS position
  const requestLiveLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCoords({
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy),
          label: 'Your GPS',
        });
        setIsLiveGps(true);
        setLoading(false);
      },
      (err) => {
        let msg = 'Unable to retrieve location';
        if (err.code === 1) msg = 'Location access denied. You can select a preset city or allow location in browser.';
        else if (err.code === 2) msg = 'Location position unavailable.';
        else if (err.code === 3) msg = 'Location request timed out.';
        setError(msg);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  // Set coordinates directly from preset
  const setPresetLocation = useCallback((preset) => {
    setCoords({
      lat: preset.lat,
      lng: preset.lng,
      label: preset.name,
      accuracy: 10,
    });
    setIsLiveGps(false);
    setError(null);
  }, []);

  // Clear GPS location
  const clearLocation = useCallback(() => {
    setCoords(null);
    setIsLiveGps(false);
    setError(null);
  }, []);

  return {
    coords,
    loading,
    error,
    isLiveGps,
    requestLiveLocation,
    setPresetLocation,
    clearLocation,
    presets: LOCATION_PRESETS,
  };
};

export default useGeolocation;
