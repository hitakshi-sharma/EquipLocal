import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Navigation, Star } from 'lucide-react';

const EquipmentCard = ({ equipment }) => {
  const {
    _id,
    name,
    category,
    description,
    pricePerDay,
    securityDeposit,
    location,
    distance,
    image,
    availability,
    averageRating = 0,
    totalReviews = 0,
  } = equipment;

  const fallbackImage = '/images/default-equipment.jpg';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col group">
      {/* Image container */}
      <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
        <img
          src={image || fallbackImage}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          onError={(e) => {
            e.target.src = fallbackImage;
          }}
        />
        {/* Only show badge if machine is currently rented */}
        {!availability && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-900/80 text-white backdrop-blur-md shadow-xs">
              Currently Rented
            </span>
          </div>
        )}

        {/* Real-Time GPS Distance Tag */}
        {distance !== undefined && distance !== null && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-orange-600/90 text-white backdrop-blur-md shadow-xs flex items-center gap-1">
              <Navigation className="w-3 h-3" />
              <span>{distance < 1 ? `${Math.round(distance * 1000)}m away` : `${distance} km away`}</span>
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Location */}
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-orange-600 text-[11px] uppercase tracking-wider">
              {category}
            </span>
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{location}</span>
              {distance !== undefined && distance !== null && (
                <span className="text-orange-600 font-bold">({distance}km)</span>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition line-clamp-1">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1 mb-2">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            {totalReviews > 0 ? (
              <span className="text-xs font-bold text-slate-800">
                {averageRating.toFixed(1)}{' '}
                <span className="text-slate-400 font-normal">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
              </span>
            ) : (
              <span className="text-[11px] font-medium text-slate-400">New listing</span>
            )}
          </div>

          {/* Description */}
          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Pricing and Action */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-xl font-extrabold text-slate-900">
                ₹{pricePerDay.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-medium"> / day</span>
            </div>
            {securityDeposit > 0 && (
              <span className="text-[11px] font-medium text-slate-500">
                Deposit: ₹{securityDeposit.toLocaleString()}
              </span>
            )}
          </div>

          <Link
            to={`/user/equipment/${_id}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-orange-600 transition duration-150 shadow-xs"
          >
            <span>View Details & Rent</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;
