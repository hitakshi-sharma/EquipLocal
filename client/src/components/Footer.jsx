import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Heart, ShieldCheck, Clock, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white">
                <Wrench className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Equip<span className="text-orange-500">Local</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Hyper-local equipment rental marketplace connecting verified contractors, builders, farmers, and DIYers with local machinery owners.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span>Available in Delhi, Noida, Faridabad, Ghaziabad, and expanding pan-India</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/user/equipment" className="hover:text-orange-400 transition">
                  Browse All Equipment
                </Link>
              </li>
              <li>
                <Link to="/user/equipment?category=Construction" className="hover:text-orange-400 transition">
                  Construction Machines
                </Link>
              </li>
              <li>
                <Link to="/user/equipment?category=Agriculture" className="hover:text-orange-400 transition">
                  Agricultural Tools
                </Link>
              </li>
              <li>
                <Link to="/user/equipment?category=Power+Tools" className="hover:text-orange-400 transition">
                  Power Tools
                </Link>
              </li>
            </ul>
          </div>

          {/* Owner Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              For Owners
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/signup" className="hover:text-orange-400 transition">
                  List Your Equipment
                </Link>
              </li>
              <li>
                <Link to="/owner/dashboard" className="hover:text-orange-400 transition">
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Security Deposit Protection</span>
              </li>
              <li>
                <span className="text-slate-400">Verified Local Renters</span>
              </li>
            </ul>
          </div>

          {/* MVP Trust Highlights */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Why EquipLocal?
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Transparent security deposits & verified listings</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Fast owner approvals within hours</span>
              </li>
              <li className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Zero idle equipment waste for owners</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} EquipLocal. All rights reserved. Built for MVP Equipment Rentals.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Indian Contractors & Farmers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
