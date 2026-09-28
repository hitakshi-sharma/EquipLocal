import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// User / Renter Pages
import EquipmentList from './pages/user/EquipmentList';
import EquipmentDetails from './pages/user/EquipmentDetails';
import MyBookings from './pages/user/MyBookings';

// Owner Pages
import Dashboard from './pages/owner/Dashboard';
import AddEquipment from './pages/owner/AddEquipment';
import ManageEquipment from './pages/owner/ManageEquipment';
import BookingRequests from './pages/owner/BookingRequests';

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

const OwnerRoute = ({ children }) => {
  const { user, loading, isOwner } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!isOwner) return <Navigate to="/user/equipment" replace />;
  return children;
};

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* User / Renter Routes */}
          <Route path="/user/equipment" element={<EquipmentList />} />
          <Route path="/user/equipment/:id" element={<EquipmentDetails />} />
          <Route
            path="/user/bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />

          {/* User convenience aliases */}
          <Route path="/equipment" element={<Navigate to="/user/equipment" replace />} />
          <Route path="/equipment/:id" element={<EquipmentDetails />} />
          <Route path="/bookings" element={<Navigate to="/user/bookings" replace />} />

          {/* Owner Protected Routes */}
          <Route
            path="/owner/dashboard"
            element={
              <OwnerRoute>
                <Dashboard />
              </OwnerRoute>
            }
          />
          <Route
            path="/owner/equipment"
            element={
              <OwnerRoute>
                <ManageEquipment />
              </OwnerRoute>
            }
          />
          <Route
            path="/owner/add-equipment"
            element={
              <OwnerRoute>
                <AddEquipment />
              </OwnerRoute>
            }
          />
          <Route
            path="/owner/bookings"
            element={
              <OwnerRoute>
                <BookingRequests />
              </OwnerRoute>
            }
          />

          {/* 404 Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
