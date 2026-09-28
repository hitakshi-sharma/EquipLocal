import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { equipmentService, bookingService } from "../../services/api";
import BookingCard from "../../components/BookingCard";
import {
  Layers,
  Clock,
  CheckCircle,
  IndianRupee,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
  Wrench,
  ChevronRight,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [equipments, setEquipments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [equipRes, bookRes] = await Promise.all([
        equipmentService.getMyEquipments(),
        bookingService.getOwnerBookings(),
      ]);
      setEquipments(equipRes);
      setBookings(bookRes);
    } catch (err) {
      console.error("Failed to load owner dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = async (id) => {
    try {
      await bookingService.accept(id);
      setFeedback({ type: 'success', text: 'Booking request approved successfully!' });
      fetchData();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Error accepting booking',
      });
    }
  };

  const handleReject = async (id) => {
    try {
      await bookingService.reject(id);
      setFeedback({ type: 'success', text: 'Booking request rejected.' });
      fetchData();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Error rejecting booking',
      });
    }
  };

  const pendingRequests = bookings.filter((b) => b.status === "pending");
  const activeBookings = bookings.filter((b) => b.status === "accepted");
  const totalRevenue = activeBookings.reduce(
    (sum, b) => sum + (b.totalAmount || 0),
    0,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || "Owner"} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Manage your equipment catalog, respond to incoming rental inquiries,
            and maximize machine utilization in {user?.location || "your area"}.
          </p>
        </div>

        <Link
          to="/owner/equipment"
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition border border-slate-700"
        >
          Manage Catalog
        </Link>
      </div>

      {feedback.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback({ type: '', text: '' })}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Equipment */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Equipment
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {equipments.length}
          </div>
          <p className="text-xs text-slate-500">
            {equipments.filter((e) => e.availability).length} active for rent
          </p>
        </div>

        {/* Pending Requests */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Requests
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600">
            {pendingRequests.length}
          </div>
          <p className="text-xs text-slate-500">Requires your acceptance</p>
        </div>

        {/* Active Bookings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Confirmed Rentals
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">
            {activeBookings.length}
          </div>
          <p className="text-xs text-slate-500">Approved contracts</p>
        </div>

        {/* Confirmed Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500">
            From {activeBookings.length} confirmed booking
            {activeBookings.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Pending Booking Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Pending Booking Requests</span>
              {pendingRequests.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold">
                  {pendingRequests.length}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and accept renter requests before rental periods begin
            </p>
          </div>
          <Link
            to="/owner/bookings"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>View All Requests</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="h-32 bg-white rounded-2xl animate-pulse border border-slate-200" />
        ) : pendingRequests.length > 0 ? (
          <div className="space-y-4">
            {pendingRequests.slice(0, 3).map((booking) => (
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
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            No pending booking requests right now. When a renter books your
            equipment, it will appear here.
          </div>
        )}
      </div>

      {/* Quick Catalog Overview */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              My Equipment Catalog
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Recently listed machinery in your inventory
            </p>
          </div>
          <Link
            to="/owner/equipment"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>Manage All ({equipments.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="h-32 bg-white rounded-2xl animate-pulse border border-slate-200" />
        ) : equipments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipments.slice(0, 3).map((eq) => (
              <div
                key={eq._id}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 hover:border-slate-300 transition"
              >
                <img
                  src={eq.image || "/images/default-equipment.jpg"}
                  alt={eq.name}
                  className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {eq.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    ₹{eq.pricePerDay} / day
                  </p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      eq.availability
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {eq.availability ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
            <p className="text-xs text-slate-500">
              You haven't listed any equipment yet.
            </p>
            <Link
              to="/owner/add-equipment"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition"
            >
              <PlusCircle className="w-4 h-4" /> Add Your First Machine
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
