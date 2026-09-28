import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MailCheck, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp } = useAuth();

  const initialEmail = location.state?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please provide your email address');
      return;
    }

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    try {
      setLoading(true);
      const user = await verifyOtp(email.toLowerCase().trim(), otp.trim());

      // Smart redirect based on verified user's role
      if (user.role === 'owner') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/user/equipment', { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Verification failed. Please check the code and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please specify your email address first');
      return;
    }

    try {
      setResending(true);
      setError('');
      const res = await resendOtp(email.toLowerCase().trim());
      setMessage(res.message || 'A fresh 6-digit code has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-md shadow-orange-200">
            <MailCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Verify Your Email
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            We sent a 6-digit verification code to
            <br />
            <strong className="text-slate-800 font-semibold">{email || 'your registered email'}</strong>
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-5">
          {!initialEmail && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Your Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. aakash@gmail.com"
                required
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 text-center">
              Enter 6-Digit Verification Code
            </label>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="••••••"
              autoFocus
              className="w-full text-center text-3xl font-extrabold tracking-[10px] py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            />
            <p className="text-[11px] text-slate-400 text-center mt-2">
              Code is valid for 10 minutes.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md shadow-orange-300/40 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Verifying Code...</span>
            ) : (
              <>
                <span>Verify Email & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Resend OTP & Help */}
        <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-slate-500">
            <span>Didn't receive code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-bold text-orange-600 hover:text-orange-700 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
              <span>{resending ? 'Sending...' : 'Resend Code'}</span>
            </button>
          </div>

          <Link
            to="/signup"
            className="text-slate-400 hover:text-slate-600 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Signup
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
