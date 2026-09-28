import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/api';
import BookingCard from '../../components/BookingCard';
import { CalendarCheck2, RefreshCw, AlertCircle, PackageCheck } from 'lucide-react';

const BookingRequests = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getOwnerBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load owner bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAccept = async (id) => {
    try {
      await bookingService.accept(id);
      setFeedback({
        type: 'success',
        text: 'Booking approved successfully! The renter has been confirmed.',
      });
      fetchBookings();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to accept booking request',
      });
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to decline this booking request?')) {
      return;
    }
    try {
      await bookingService.reject(id);
      setFeedback({
        type: 'success',
        text: 'Booking request rejected.',
      });
      fetchBookings();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to reject booking request',
      });
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Incoming Booking Requests
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and respond to rental requests from local builders, contractors, and farmers
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {feedback.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {['all', 'pending', 'accepted', 'completed', 'rejected', 'cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition whitespace-nowrap cursor-pointer ${
              statusFilter === st
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            {st} ({st === 'all' ? bookings.length : bookings.filter((b) => b.status === st).length})
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-32 border border-slate-200 animate-pulse p-4" />
          ))}
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              isOwnerView={true}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <PackageCheck className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No requests in this category</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            There are currently no booking inquiries matching "{statusFilter}".
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingRequests;
