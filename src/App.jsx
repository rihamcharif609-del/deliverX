import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import SenderDashboard from './pages/SenderDashboard';
import CourierDashboard from './pages/CourierDashboard';
import AdminDeliveries from './pages/AdminDeliveries';
import CreateDelivery from './pages/CreateDelivery';
import Tracking from './pages/Tracking';
import Users from './pages/Users';
import AvailableDeliveries from './pages/AvailableDeliveries';
import SenderDeliveries from './pages/senderDeliveries';
import CourierDeliveries from './pages/courierdeliveries';
import UserDetails from './pages/UserDetails';
import AdminProfile from './pages/AdminProfile';
import SenderProfile from './pages/SenderProfile';
import CourierProfile from './pages/CourierProfile';
import UserProfile from './pages/UserProfile';
import VerificationPending from './pages/VerificationPending';
import AdminCourierVerification from './pages/AdminCourierVerification';
import { DeliveryProvider } from './context/DeliveryContext';
import { CourierVerificationProvider, useCourierVerification } from './context/CourierVerificationContext';
import './styles/profile.css';
import React, { useState } from 'react';

function AppRoutes() {
  const [userRole, setUserRole] = useState('admin');
  const { isCourierVerified } = useCourierVerification();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login setUserRole={setUserRole} />} />
      <Route path="/register" element={<Register />} />

      {/* ADMIN */}
      <Route path="/admin" element={<AdminDashboard setUserRole={setUserRole} />} />
      <Route path="/admin/deliveries" element={<AdminDeliveries userRole={userRole} setUserRole={setUserRole} />} />
      <Route path="/admin/users" element={<Users setUserRole={setUserRole} />} />
      <Route
        path="/admin/courier-verification"
        element={<AdminCourierVerification setUserRole={setUserRole} />}
      />
      <Route path="/admin/profile" element={<AdminProfile />} />
      <Route path="/admin/users/:id" element={<UserProfile />} />
      <Route path="/admin/users/Details/:id" element={<UserDetails />} />

      {/* SENDER */}
      <Route path="/sender" element={<SenderDashboard />} />
      <Route path="/sender/deliveries" element={<SenderDeliveries userRole={userRole} setUserRole={setUserRole} />} />
      <Route path="/sender/create" element={<CreateDelivery />} />
      <Route path="/sender/tracking" element={<Tracking />} />
      <Route path="/sender/tracking/:id" element={<Tracking />} />
      <Route path="/sender/profile" element={<SenderProfile />} />

      {/* COURIER */}
      <Route path="/courier" element={<CourierDashboard />} />
      <Route
        path="/courier/available"
        element={isCourierVerified ? <AvailableDeliveries /> : <VerificationPending />}
      />
      <Route
        path="/courier/deliveries"
        element={isCourierVerified ? <CourierDeliveries userRole={userRole} setUserRole={setUserRole} /> : <VerificationPending />}
      />
      <Route path="/courier/profile" element={<CourierProfile />} />
    </Routes>
  );
}

function App() {
  return (
    <DeliveryProvider>
      <CourierVerificationProvider>
        <AppRoutes />
      </CourierVerificationProvider>
    </DeliveryProvider>
  );
}

export default App;
