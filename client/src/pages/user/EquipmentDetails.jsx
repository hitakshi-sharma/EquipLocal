import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { equipmentService, bookingService, reviewService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import EquipmentMap from '../../components/EquipmentMap';
import useGeolocation from '../../hooks/useGeolocation';
import {
  MapPin,
  Shield,
  Calendar,
  User,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Info,
  ShoppingCart,
  Navigation,
  Star,
  MessageSquare,
} from 'lucide-react';

const EquipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reviews and ratings states
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Date selection states
  const getTodayString = () => new Date().toISOString().split('T')[0];
  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTomorrowString());
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');

  // Live GPS hook for proximity calculation
  const { coords: userCoords, requestLiveLocation, loading: locating } = useGeolocation();

  // Calculate live distance between user and equipment
  const userDistance =
    userCoords?.lat && equipment?.latitude
      ? (() => {
          const lat1 = userCoords.lat;
          const lon1 = userCoords.lng;
          const lat2 = equipment.latitude;
          const lon2 = equipment.longitude;
          const R = 6371;
          const dLat = (lat2 - lat1) * (Math.PI / 180);
          const dLon = (lon2 - lon1) * (Math.PI / 180);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
              Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return Math.round(R * c * 10) / 10;
        })()
      : null;

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await equipmentService.getById(id);
        setEquipment(data);
      } catch (err) {
        setError('Failed to load equipment details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  // Fetch reviews and rating breakdown for this equipment
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await reviewService.getEquipmentReviews(id);
      if (res) {
        setReviews(res.reviews || []);
        setReviewStats({
          averageRating: res.averageRating || 0,
          totalReviews: res.totalReviews || 0,
          breakdown: res.breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        });

        // Prefill existing review if user already wrote one
        if (user) {
          const currentUserId = user._id || user.userId || user.id;
          const existing = (res.reviews || []).find((r) => {
            const authorId = r.userId?._id || r.userId;
            return authorId?.toString() === currentUserId?.toString();
          });
          if (existing) {
            setReviewRating(existing.rating);
            setReviewComment(existing.comment);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id, user]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/user/equipment/${id}` } } });
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError('Please write your experience in the comment box');
      return;
    }
    try {
      setSubmittingReview(true);
      setReviewError('');
      setReviewSuccess('');
      await reviewService.createReview(id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviewSuccess('Your review has been successfully submitted!');
      await fetchReviews();
      const updated = await equipmentService.getById(id);
      setEquipment(updated);
    } catch (err) {
      setReviewError(err.response?.data?.message || err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Calculate rental days & total cost
  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    if (diffTime < 0) return 0;
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const days = calculateDays();
  const totalRentalCost = days * (equipment?.pricePerDay || 0);
  const totalPayableWithDeposit = totalRentalCost + (equipment?.securityDeposit || 0);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!user) {
      // Redirect to login
      navigate('/login', { state: { from: { pathname: `/user/equipment/${id}` } } });
      return;
    }

    if (days <= 0) {
      setBookingError('End date must be after or on the same day as start date');
      return;
    }

    try {
      setBookingLoading(true);
      const res = await bookingService.create({
        equipmentId: id,
        startDate,
        endDate,
      });
      setBookingSuccess(res);
    } catch (err) {
      setBookingError(
        err.response?.data?.message || 'Failed to submit booking request. Please try again.'
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 bg-slate-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-slate-200 rounded-3xl" />
            <div className="space-y-4">
              <div className="h-8 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-32 bg-slate-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{error || 'Equipment not found'}</h2>
        <Link
          to="/user/equipment"
          className="inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Equipment Catalog
        </Link>
      </div>
    );
  }

  const currentUserId = user?._id || user?.id;
  const equipmentOwnerId = equipment.ownerId?._id || equipment.ownerId;
  const isOwner = Boolean(
    user &&
    currentUserId &&
    equipmentOwnerId &&
    String(currentUserId) === String(equipmentOwnerId)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/user/equipment"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Equipment Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Media and Descriptions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Image */}
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
            <img
              src={equipment.image || '/images/default-equipment.jpg'}
              alt={equipment.name}
              className="w-full h-full object-cover"
            />
            {!equipment.availability && (
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-slate-900/80 text-white backdrop-blur-md shadow-xs">
                  Currently Unavailable
                </span>
              </div>
            )}
          </div>

          {/* Title & Location */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-semibold">
              <span className="text-orange-600 uppercase tracking-wider font-bold">
                {equipment.category}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {equipment.location}
              </span>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-extrabold text-slate-900">
                  {equipment.averageRating ? equipment.averageRating.toFixed(1) : (reviewStats.averageRating ? reviewStats.averageRating.toFixed(1) : '0.0')}
                </span>
                <span className="text-slate-400 font-normal">
                  ({equipment.totalReviews ?? reviewStats.totalReviews} {((equipment.totalReviews ?? reviewStats.totalReviews) === 1 ? 'review' : 'reviews')})
                </span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {equipment.name}
            </h1>
          </div>

          {/* Description Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Equipment Details & Specification
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {equipment.description}
            </p>
          </div>

          {/* Owner Info Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Owner Information
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm">
                  {equipment.ownerId?.name?.charAt(0) || 'O'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {equipment.ownerId?.name || 'Equipment Owner'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Location: {equipment.ownerId?.location || equipment.location}
                  </p>
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-semibold">
                  <CheckCircle className="w-3 h-3" /> Verified Owner
                </span>
              </div>
            </div>
          </div>

          {/* Real-Time GPS Location & Map Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-end">
              {/* Live Distance Check Button */}
              {userDistance !== null ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-xs font-bold text-orange-700">
                  <Navigation className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                  <span>{userDistance} km from your GPS</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={requestLiveLocation}
                  disabled={locating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  <Navigation
                    className={`w-3.5 h-3.5 ${
                      locating ? 'animate-spin text-orange-600' : 'text-slate-500'
                    }`}
                  />
                  <span>{locating ? 'Detecting GPS...' : 'Check My Distance'}</span>
                </button>
              )}
            </div>

            {/* Interactive Leaflet Map for this Machinery */}
            <EquipmentMap
              equipments={[equipment]}
              userCoords={userCoords}
              height="280px"
              singleMode={true}
              showControls={false}
            />
          </div>

          {/* Customer Reviews & Ratings Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 space-y-6 shadow-xs">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                  Reviews & Customer Ratings
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real feedback from contractors, builders, and farmers who rented this machine
                </p>
              </div>

              {/* Total review counter badge */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                  ★ {reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : '0.0'} / 5.0
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  ({reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'rating' : 'ratings'})
                </span>
              </div>
            </div>

            {/* Score Breakdown Overview */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
              {/* Big Score Box */}
              <div className="md:col-span-4 text-center md:border-r border-slate-200 md:pr-4">
                <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  {reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : '0.0'}
                </div>
                <div className="flex items-center justify-center gap-1 my-1.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(reviewStats.averageRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  Based on {reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'verified review' : 'verified reviews'}
                </p>
              </div>

              {/* Star Distribution Bars */}
              <div className="md:col-span-8 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviewStats.breakdown?.[star] || 0;
                  const pct =
                    reviewStats.totalReviews > 0
                      ? Math.round((count / reviewStats.totalReviews) * 100)
                      : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-7 text-right font-bold text-slate-700">{star} ★</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-slate-400 font-mono text-[11px]">
                        {count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Write a Review Form */}
            {!isOwner ? (
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-orange-600" />
                    {user ? 'Leave Your Rating & Review' : 'Log in to Leave a Review'}
                  </h4>
                  {user && (
                    <span className="text-xs text-slate-500">
                      Posting as <strong className="text-slate-800">{user.name}</strong>
                    </span>
                  )}
                </div>

                {reviewSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{reviewSuccess}</span>
                  </div>
                )}

                {reviewError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}

                {user ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    {/* Star Rating Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Your Rating:
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 cursor-pointer transition transform hover:scale-110 focus:outline-none"
                            title={`${star} Star${star > 1 ? 's' : ''}`}
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                (hoverRating || reviewRating) >= star
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-xs font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                          {hoverRating || reviewRating} / 5 Stars
                        </span>
                      </div>
                    </div>

                    {/* Review Comment Textarea */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Your Experience & Review:
                      </label>
                      <textarea
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Describe machine performance, condition, fuel economy, ease of operation..."
                        maxLength={1000}
                        required
                        className="w-full p-3 bg-white text-xs text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                      />
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                        <span>Min. 3 characters</span>
                        <span>{reviewComment.length}/1000</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {submittingReview ? 'Submitting Review...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-600">
                      Have you rented this equipment? Sign in to share your feedback with other builders and farmers.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        navigate('/login', { state: { from: { pathname: `/user/equipment/${id}` } } })
                      }
                      className="whitespace-nowrap px-4 py-2 bg-slate-900 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition cursor-pointer self-start sm:self-auto"
                    >
                      Sign In to Review
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                ℹ️ You are the owner of this equipment listing. Owners cannot review their own equipment.
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-bold text-slate-900">
                Customer Feedback ({reviews.length})
              </h4>

              {reviewsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl animate-pulse space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-1/4" />
                      <div className="h-3 bg-slate-200 rounded w-3/4" />
                    </div>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-3 divide-y divide-slate-100">
                  {reviews.map((rev) => {
                    const isMyReview =
                      user &&
                      (rev.userId?._id === user._id || rev.userId === user._id || rev.userId?._id === user.userId || rev.userId === user.userId);

                    return (
                      <div key={rev._id} className="pt-4 first:pt-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold overflow-hidden">
                              {rev.userId?.profileImage ? (
                                <img
                                  src={rev.userId.profileImage}
                                  alt={rev.userId.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                rev.userId?.name?.charAt(0) || 'U'
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900">
                                  {rev.userId?.name || 'Verified Renter'}
                                </span>
                                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold border border-emerald-200">
                                  Verified
                                </span>
                                {isMyReview && (
                                  <span className="text-[10px] text-orange-700 bg-orange-50 px-1.5 py-0.2 rounded font-semibold border border-orange-200">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {new Date(rev.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Stars */}
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= rev.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed pl-10.5">
                          {rev.comment}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-1">
                  <p className="text-xs font-bold text-slate-700">No reviews yet</p>
                  <p className="text-[11px] text-slate-400">
                    Be the first renter to review this equipment after your rental!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Booking Box Widget (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xl shadow-slate-100 space-y-6">
            {/* Price banner */}
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-5">
              <div>
                <span className="text-3xl font-extrabold text-slate-900">
                  ₹{equipment.pricePerDay.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-slate-500"> / day</span>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-extrabold text-slate-800">
                    {equipment.averageRating ? equipment.averageRating.toFixed(1) : (reviewStats.averageRating ? reviewStats.averageRating.toFixed(1) : '0.0')}
                  </span>
                  <span className="text-slate-400 font-medium">
                    ({equipment.totalReviews ?? reviewStats.totalReviews} {((equipment.totalReviews ?? reviewStats.totalReviews) === 1 ? 'review' : 'reviews')})
                  </span>
                </div>
              </div>
              {equipment.securityDeposit > 0 && (
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Refundable Deposit</span>
                  <span className="text-sm font-bold text-slate-800">
                    ₹{equipment.securityDeposit.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Booking Form or Success */}
            {bookingSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-emerald-900">
                    Booking Request Sent!
                  </h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    Your request has been submitted to {equipment.ownerId?.name}. You can track status in your dashboard.
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/user/bookings"
                    className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>View in My Bookings</span>
                  </Link>
                  <button
                    onClick={() => setBookingSuccess(null)}
                    className="text-xs font-semibold text-emerald-800 hover:underline"
                  >
                    Make another request
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Rental Dates
                </h3>

                {bookingError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">
                      Start Date
                    </label>
                    <input
                      type="date"
                      min={getTodayString()}
                      value={startDate}
                      onChange={(e) => {
                        const nextStart = e.target.value;
                        setStartDate(nextStart);
                        if (endDate && nextStart > endDate) {
                          setEndDate(nextStart);
                        }
                      }}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">
                      End Date
                    </label>
                    <input
                      type="date"
                      min={startDate || getTodayString()}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Calculation Summary */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>
                      ₹{equipment.pricePerDay} × {days} day{days > 1 ? 's' : ''}
                    </span>
                    <span className="font-semibold text-slate-800">
                      ₹{totalRentalCost.toLocaleString()}
                    </span>
                  </div>

                  {equipment.securityDeposit > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        Refundable Deposit
                        <Info className="w-3 h-3 text-slate-400" />
                      </span>
                      <span className="font-semibold text-slate-800">
                        ₹{equipment.securityDeposit.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-bold text-slate-900 text-sm">
                    <span>Total Estimate</span>
                    <span className="text-base text-orange-600 font-extrabold">
                      ₹{totalPayableWithDeposit.toLocaleString()}
                    </span>
                  </div>
                </div>

                {isOwner ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800 text-center">
                    You listed this equipment. You cannot rent your own machinery.
                  </div>
                ) : !equipment.availability ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 bg-slate-200 text-slate-500 rounded-xl font-bold text-xs cursor-not-allowed"
                  >
                    Currently Unavailable
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-orange-300/40 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {bookingLoading ? (
                      <span>Submitting Request...</span>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        <span>{user ? 'Request Booking' : 'Log In to Request Booking'}</span>
                      </>
                    )}
                  </button>
                )}
              </form>
            )}

            <div className="text-[11px] text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
              <p className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                No advance payment deducted until owner approves
              </p>
              <p className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                Deposit is 100% refundable after machine return
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetails;
