import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Wrench, 
  User, 
  LogOut, 
  Menu, 
  X, 
  PlusCircle, 
  ShoppingCart, 
  LayoutDashboard, 
  PackageSearch,
  Compass,
  ChevronDown,
  LogIn,
  UserPlus
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isOwner } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const accountDropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setAccountDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setAccountDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/user/equipment') {
      return (
        location.pathname === '/' ||
        location.pathname === '/user/equipment' ||
        location.pathname === '/equipment'
      );
    }
    return location.pathname === path;
  };

  const handleBrowseClick = (e) => {
    if (location.pathname === '/' || location.pathname === '/user/equipment') {
      const el = document.getElementById('catalog');
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo at Left Corner */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-200 group-hover:bg-orange-700 transition">
                <Wrench className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                  Equip<span className="text-orange-600">Local</span>
                </span>
                <span className="text-[10px] text-slate-600 font-medium tracking-wider uppercase">
                  Rental Marketplace
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links & Profile */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {!isOwner && (
              <Link
                to="/#catalog"
                onClick={handleBrowseClick}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                  isActive('/user/equipment')
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Compass className="w-4 h-4" />
                Explore Machinery
              </Link>
            )}

            {user && (
              <>
                {isOwner ? (
                  // Owner Links
                  <>
                    <Link
                      to="/owner/dashboard"
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                        isActive('/owner/dashboard')
                          ? 'bg-orange-50 text-orange-600'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/owner/equipment"
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                        isActive('/owner/equipment')
                          ? 'bg-orange-50 text-orange-600'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      My Equipment
                    </Link>
                    <Link
                      to="/owner/bookings"
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                        isActive('/owner/bookings')
                          ? 'bg-orange-50 text-orange-600'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      Requests
                    </Link>
                    <Link
                      to="/owner/add-equipment"
                      className="ml-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add Equipment
                    </Link>
                  </>
                ) : (
                  // Renter / User Links
                  <Link
                    to="/user/bookings"
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                      isActive('/user/bookings')
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    My Bookings
                  </Link>
                )}
              </>
            )}

            {/* Account with Avatar Button & Dropdown */}
            <div className="relative pl-2" ref={accountDropdownRef}>
              {user ? (
                // Logged In User Account Button
                <button
                  type="button"
                  onClick={() => setAccountDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white transition cursor-pointer text-slate-800 focus:outline-none"
                  aria-expanded={accountDropdownOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold leading-tight">
                      {user.name?.split(' ')[0] || 'Account'}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold leading-none">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      accountDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              ) : (
                // Guest Account with Avatar Button
                <button
                  type="button"
                  onClick={() => setAccountDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white transition cursor-pointer text-slate-700 hover:text-slate-900 focus:outline-none"
                  aria-expanded={accountDropdownOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold">Account</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      accountDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              )}

              {/* Account Dropdown Menu */}
              {accountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {user ? (
                    // Logged in Dropdown
                    <>
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                          {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                            {user.role}
                          </span>
                        </div>
                      </div>

                      <div className="p-2 space-y-1">
                        {isOwner ? (
                          <>
                            <Link
                              to="/owner/dashboard"
                              onClick={() => setAccountDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                            >
                              <LayoutDashboard className="w-4 h-4 text-slate-500" />
                              <span>Dashboard</span>
                            </Link>
                            <Link
                              to="/owner/equipment"
                              onClick={() => setAccountDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                            >
                              <PackageSearch className="w-4 h-4 text-slate-500" />
                              <span>My Equipment</span>
                            </Link>
                            <Link
                              to="/owner/bookings"
                              onClick={() => setAccountDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                            >
                              <ShoppingCart className="w-4 h-4 text-slate-500" />
                              <span>Booking Requests</span>
                            </Link>
                            <Link
                              to="/owner/add-equipment"
                              onClick={() => setAccountDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-orange-600 bg-orange-50/80 hover:bg-orange-100/80 rounded-xl transition"
                            >
                              <PlusCircle className="w-4 h-4" />
                              <span>+ Add New Equipment</span>
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              to="/user/bookings"
                              onClick={() => setAccountDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                            >
                              <ShoppingCart className="w-4 h-4 text-slate-500" />
                              <span>My Bookings</span>
                            </Link>
                            <Link
                              to="/#catalog"
                              onClick={(e) => {
                                setAccountDropdownOpen(false);
                                handleBrowseClick(e);
                              }}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                            >
                              <Compass className="w-4 h-4 text-slate-500" />
                              <span>Explore Machinery</span>
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="pt-1 mt-1 border-t border-slate-100 p-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    // Guest Dropdown
                    <>
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 rounded-t-2xl">
                        <p className="text-xs font-bold text-slate-900">Welcome to EquipLocal</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Rent equipment or list machinery locally
                        </p>
                      </div>

                      <div className="p-2 space-y-1.5">
                        <Link
                          to="/login"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                        >
                          <LogIn className="w-4 h-4 text-slate-500" />
                          <span>Log In</span>
                        </Link>
                        <Link
                          to="/signup"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition shadow-xs"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Sign Up</span>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          {!isOwner && (
            <Link
              to="/#catalog"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleBrowseClick(e);
              }}
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                isActive('/user/equipment')
                  ? 'bg-orange-50 text-orange-600 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Explore Machinery
            </Link>
          )}

          {user ? (
            <>
              {isOwner ? (
                <>
                  <Link
                    to="/owner/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/owner/equipment"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Equipment
                  </Link>
                  <Link
                    to="/owner/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Booking Requests
                  </Link>
                  <Link
                    to="/owner/add-equipment"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-semibold text-orange-600 bg-orange-50"
                  >
                    + Add New Equipment
                  </Link>
                </>
              ) : (
                <Link
                  to="/user/bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-base font-medium flex items-center gap-2 ${
                    isActive('/user/bookings')
                      ? 'bg-orange-50 text-orange-600 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>My Bookings</span>
                </Link>
              )}

              {/* Mobile Account Details & Logout */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role} • {user.location}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition"
                >
                  Log Out
                </button>
              </div>
            </>
          ) : (
            // Mobile Guest Account Section
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex items-center gap-2 px-3 py-1 text-slate-800">
                <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Account</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 border border-slate-300 hover:bg-slate-50 transition"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>Log In</span>
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl text-white bg-orange-600 hover:bg-orange-700 shadow-xs transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
