import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { equipmentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  HardHat,
  Upload,
  Trash2,
  Navigation,
} from 'lucide-react';
import { LOCATIONS } from '../../constants/locations';

const categories = [
  'Construction',
  'Agriculture',
  'Event',
  'Cleaning',
  'Power Tools',
  'Transportation',
  'Other',
];

const sampleImages = [
  { label: 'JCB / Loader', url: '/images/jcb-backhoe-loader.jpg' },
  { label: 'Concrete Mixer', url: '/images/concrete-mixer.jpg' },
  { label: 'Mini Excavator', url: '/images/mini-excavator.jpg' },
  { label: 'Tractor', url: '/images/tractor.jpg' },
  { label: 'Power Drill', url: '/images/electric-drill.jpg' },
  { label: 'Generator', url: '/images/portable-generator.jpg' },
  { label: 'Pressure Washer', url: '/images/pressure-washer.jpg' },
];

const AddEquipment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Construction',
    description: '',
    pricePerDay: '',
    securityDeposit: '',
    location: user?.location || '',
    latitude: '',
    longitude: '',
    image: '',
    availability: true,
  });

  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsDetected, setGpsDetected] = useState(false);

  // Auto-detect browser GPS coordinates for machinery listing
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setGpsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }));
        setGpsDetecting(false);
        setGpsDetected(true);
      },
      (err) => {
        setGpsDetecting(false);
        setError('Could not detect device location. Please allow GPS permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle text and checkbox input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle photo file attachment
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, JPEG, WEBP)');
      return;
    }

    // Limit image size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo file size should be less than 5MB');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image: reader.result }));
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  // Remove attached photo
  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }));
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Select sample preset photo
  const handleSelectSampleImage = (url, label) => {
    setFormData((prev) => ({ ...prev, image: url }));
    setFileName(label);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit equipment listing
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !formData.name ||
      !formData.category ||
      !formData.description ||
      !formData.pricePerDay ||
      !formData.location
    ) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await equipmentService.create({
        ...formData,
        pricePerDay: Number(formData.pricePerDay),
        securityDeposit: formData.securityDeposit
          ? Number(formData.securityDeposit)
          : 0,
        latitude: formData.latitude !== '' ? Number(formData.latitude) : undefined,
        longitude: formData.longitude !== '' ? Number(formData.longitude) : undefined,
      });

      navigate('/owner/equipment');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to add equipment. Please check input.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <Link
        to="/owner/equipment"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Equipment</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <HardHat className="w-6 h-6 text-orange-600" />
            Add New Equipment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            List your tools or heavy machinery on the marketplace for local contractors to rent
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Equipment Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Equipment Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Concrete Mixer (10/7 Diesel)"
              required
              className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            />
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Location *
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition cursor-pointer"
              >
                <option value="">Select Location</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* GPS Coordinates Section */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-orange-600" />
                  Machinery GPS Coordinates (Optional)
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Auto-detect to allow renters to find your machinery with real-time GPS distance.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDetectGps}
                disabled={gpsDetecting}
                className="self-start sm:self-auto px-3 py-1.5 bg-white hover:bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Navigation className={`w-3.5 h-3.5 ${gpsDetecting ? 'animate-spin text-orange-600' : ''}`} />
                <span>{gpsDetecting ? 'Detecting...' : 'Auto-Detect My GPS'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="e.g. 28.6139"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="e.g. 77.2090"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {gpsDetected && (
              <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                ✓ GPS Coordinates successfully detected from your device.
              </p>
            )}
          </div>

          {/* Price & Deposit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Daily Rental Price (₹) *
              </label>
              <input
                type="number"
                name="pricePerDay"
                min="1"
                value={formData.pricePerDay}
                onChange={handleChange}
                placeholder="e.g. 1500"
                required
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Security Deposit (₹)
              </label>
              <input
                type="number"
                name="securityDeposit"
                min="0"
                value={formData.securityDeposit}
                onChange={handleChange}
                placeholder="e.g. 5000 (Refundable)"
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description & Specifications *
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Mention machinery condition, power rating, fuel requirements, attachments included..."
              required
              className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            />
          </div>

          {/* Photo attachment uploader */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Equipment Photo Attachment
            </label>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {formData.image ? (
              /* Attached image preview card */
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {fileName || 'Equipment Photo'}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Photo attached</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition cursor-pointer"
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Remove photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Drag & Click file attachment dropzone */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50/50 hover:bg-orange-50/30 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Click to attach equipment photo from your device
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports PNG, JPG, JPEG, or WEBP (Max 5MB)
                </p>
              </div>
            )}

            {/* Preset sample machinery library */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium">
                Or pick from library:
              </span>
              {sampleImages.map((s) => (
                <button
                  type="button"
                  key={s.label}
                  onClick={() => handleSelectSampleImage(s.url, s.label)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-orange-100 hover:text-orange-700 text-[11px] text-slate-600 transition cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="availability"
                checked={formData.availability}
                onChange={handleChange}
                className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-800">
                  Make available for booking immediately
                </span>
                <p className="text-[11px] text-slate-500">
                  Uncheck if this machine is currently in maintenance or personal use
                </p>
              </div>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              to="/owner/equipment"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-200 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Adding Equipment...' : 'Create Equipment Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEquipment;
