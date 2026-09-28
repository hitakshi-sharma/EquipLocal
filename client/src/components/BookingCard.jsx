import React from 'react';
import { Calendar, User, Phone, MapPin, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const BookingCard = ({
  booking,
  isOwnerView = false,
  onAccept,
  onReject,
  onCancel,
}) => {
  const {
    _id,
    equipmentId: equipment,
    renterId: renter,
    ownerId: owner,
    startDate,
    endDate,
    totalAmount,
    status,
    createdAt,
  } = booking;

  const otherPerson = isOwnerView ? renter : owner;
  const personRole = isOwnerView ? 'Renter' : 'Owner';

  const sDate = new Date(startDate);
  const eDate = new Date(endDate);
  const diffDays = Math.max(1, Math.ceil(Math.abs(eDate - sDate) / (1000 * 60 * 60 * 24)));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
      {/* Equipment thumbnail & Main Info */}
      <div className="flex items-center gap-4 min-w-70">
        <img
          src={equipment?.image || '/images/default-equipment.jpg'}
          alt={equipment?.name || 'Equipment'}
          className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl object-cover bg-slate-100 border border-slate-100 shrink-0"
        />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md border ${
                statusStyles[status] || statusStyles.pending
              }`}
            >
              {status}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Requested on {formatDate(createdAt)}
            </span>
          </div>
          <h4 className="text-base font-bold text-slate-900 line-clamp-1">
            {equipment?.name || 'Equipment Deleted'}
          </h4>
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3 text-orange-500" />
            {equipment?.location || 'Location specified upon confirmation'}
          </p>
        </div>
      </div>

      {/* Date and Amount details */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 text-xs md:text-sm border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 w-full md:w-auto">
        <div className="space-y-1">
          <span className="text-slate-400 text-xs font-semibold uppercase flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Rental Period
          </span>
          <p className="font-semibold text-slate-800">
            {formatDate(startDate)} → {formatDate(endDate)}
          </p>
          <p className="text-xs text-slate-500">{diffDays} day{diffDays > 1 ? 's' : ''}</p>
        </div>

        <div className="space-y-1">
          <span className="text-slate-400 text-xs font-semibold uppercase">
            Total Price
          </span>
          <p className="text-base font-extrabold text-slate-900">
            ₹{totalAmount?.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500">
            (₹{equipment?.pricePerDay || 0}/day)
          </p>
        </div>
      </div>

      {/* Other Party Info (Renter or Owner) */}
      <div className="bg-slate-50 rounded-xl p-3 text-xs w-full md:w-56 border border-slate-100 space-y-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {personRole} Contact
        </span>
        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span className="truncate">{otherPerson?.name || 'User'}</span>
        </div>
        <div className="text-slate-500 flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span>{otherPerson?.phone || 'Not shared'}</span>
        </div>
        <div className="text-slate-500 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">{otherPerson?.location || 'Unknown'}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        {isOwnerView && status === 'pending' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onAccept && onAccept(_id)}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <CheckCircle className="w-4 h-4" />
              Accept
            </button>
            <button
              onClick={() => onReject && onReject(_id)}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-rose-200"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        )}

        {!isOwnerView && status === 'pending' && (
          <button
            onClick={() => onCancel && onCancel(_id)}
            className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-semibold transition border border-slate-200"
          >
            Cancel Request
          </button>
        )}

        {status === 'accepted' && (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Confirmed
          </span>
        )}

        {status === 'rejected' && (
          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
            Request Declined
          </span>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
