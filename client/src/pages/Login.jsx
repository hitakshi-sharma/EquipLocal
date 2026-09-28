import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, LogIn, AlertCircle, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;
  const successMessage = location.state?.message || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);

    if (!email || !password) {
      setError('Please fill in both email and password');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email.toLowerCase().trim(), password);

      // Smart redirect based on role
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'owner') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/user/equipment', { replace: true });
      }
    } catch (err) {
      if (err.response?.data?.requiresVerification) {
        setNeedsVerification(true);
      }
      setError(
        err.response?.data?.message || 'Login failed. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setNeedsVerification(false);
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center mx-auto shadow-md shadow-orange-200">
            <Wrench className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back to EquipLocal
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to manage equipment listings, view bookings, and rent machinery
          </p>
        </div>

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            {needsVerification && (
              <div className="pt-2 border-t border-rose-200">
                <Link
                  to="/verify-email"
                  state={{ email: email.toLowerCase().trim() }}
                  className="inline-flex items-center gap-1.5 font-bold text-rose-800 underline hover:text-rose-900"
                >
                  <span>Enter Verification Code Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Demo Quick Fills */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
            <span>Quick Demo Logins</span>
            <span className="text-orange-600 lowercase font-normal">Click to fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('rahul@gmail.com', 'password123')}
              className="px-2.5 py-2 text-left bg-white rounded-xl border border-slate-200 hover:border-orange-400 text-xs transition cursor-pointer"
            >
              <span className="font-bold text-slate-800 block">Owner Demo</span>
              <span className="text-[11px] text-slate-500">Rahul (Delhi)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('aakash@gmail.com', 'password123')}
              className="px-2.5 py-2 text-left bg-white rounded-xl border border-slate-200 hover:border-orange-400 text-xs transition cursor-pointer"
            >
              <span className="font-bold text-slate-800 block">Renter Demo</span>
              <span className="text-[11px] text-slate-500">Aakash (Faridabad)</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul@gmail.com"
              required
              className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-orange-600 hover:underline font-semibold"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md shadow-orange-300/40 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-600">
            Don't have an account yet?{' '}
            <Link to="/signup" className="font-bold text-orange-600 hover:text-orange-700">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
