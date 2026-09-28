import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, UserPlus, AlertCircle, Building2, User } from 'lucide-react';
import { LOCATIONS } from '../constants/locations';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'renter', // 'renter' or 'owner'
    location: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.phone ||
      !formData.location
    ) {
      setError('Please fill in all required fields (Full Name, Email, Password, Phone, Location)');
      return;
    }

    if (formData.password.length < 8 || formData.password.length > 16) {
      setError('Password must be between 8 and 16 characters long');
      return;
    }

    if (!/^(?=.*[a-zA-Z])(?=.*\d)\S+$/.test(formData.password)) {
      setError('Password must contain at least one letter and one number without spaces');
      return;
    }

    try {
      setLoading(true);
      await register(formData);
      // Redirect to OTP verification page
      navigate('/verify-email', {
        state: { email: formData.email.toLowerCase().trim() },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center mx-auto shadow-md shadow-orange-200">
            <Wrench className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create an EquipLocal Account
          </h2>
          <p className="text-xs text-slate-500">
            Join India's local rental marketplace as a Renter or Equipment Owner
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selector Tabs (Only 2 Roles: Renter or Owner) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'renter' })}
                className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  formData.role === 'renter'
                    ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <div
                  className={`p-2 rounded-xl ${
                    formData.role === 'renter' ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Renter</p>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    I want to rent equipment for jobs
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'owner' })}
                className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  formData.role === 'owner'
                    ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <div
                  className={`p-2 rounded-xl ${
                    formData.role === 'owner' ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Equipment Owner</p>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    I want to list tools & earn rent
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
              required
              className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. rahul@gmail.com"
                required
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                required
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Location & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                City / Location *
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition cursor-pointer appearance-none"
              >
                <option value="">Select City / Location</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="8-16 characters (letters & numbers)"
                required
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md shadow-orange-300/40 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create EquipLocal Account</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-600">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-orange-600 hover:text-orange-700">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
