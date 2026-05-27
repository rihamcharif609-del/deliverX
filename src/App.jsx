import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
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
import { useAuth } from './context/AuthContext';
import './styles/profile.css';
import React from 'react';

const roleRoutes = {
  admin: '/admin',
  sender: '/sender',
  courier: '/courier',
};

const RequireAuth = ({ allowedRoles, children }) => {
  const { initializing, isAuthenticated, userRole } = useAuth();
  const location = useLocation();

  if (initializing) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={roleRoutes[userRole] || '/login'} replace />;
  }

  return children;
};

const PublicAuthRoute = ({ children }) => {
  const { initializing, isAuthenticated, userRole } = useAuth();

  if (initializing) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={roleRoutes[userRole] || '/sender'} replace />;
  }

  return children;
};

function AppRoutes() {
  const { userRole } = useAuth();
  const { isCourierVerified } = useCourierVerification();
  const setUserRole = () => {};

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicAuthRoute><Login /></PublicAuthRoute>} />
      <Route path="/register" element={<PublicAuthRoute><Register /></PublicAuthRoute>} />

      {/* ADMIN */}
      <Route path="/admin" element={<RequireAuth allowedRoles={['admin']}><AdminDashboard setUserRole={setUserRole} /></RequireAuth>} />
      <Route path="/admin/deliveries" element={<RequireAuth allowedRoles={['admin']}><AdminDeliveries userRole={userRole} setUserRole={setUserRole} /></RequireAuth>} />
      <Route path="/admin/users" element={<RequireAuth allowedRoles={['admin']}><Users setUserRole={setUserRole} /></RequireAuth>} />
      <Route
        path="/admin/courier-verification"
        element={<RequireAuth allowedRoles={['admin']}><AdminCourierVerification setUserRole={setUserRole} /></RequireAuth>}
      />
      <Route path="/admin/profile" element={<RequireAuth allowedRoles={['admin']}><AdminProfile /></RequireAuth>} />
      <Route path="/admin/users/:id" element={<RequireAuth allowedRoles={['admin']}><UserProfile /></RequireAuth>} />
      <Route path="/admin/users/Details/:id" element={<RequireAuth allowedRoles={['admin']}><UserDetails /></RequireAuth>} />

      {/* SENDER */}
      <Route path="/sender" element={<RequireAuth allowedRoles={['sender']}><SenderDashboard /></RequireAuth>} />
      <Route path="/sender/deliveries" element={<RequireAuth allowedRoles={['sender']}><SenderDeliveries userRole={userRole} setUserRole={setUserRole} /></RequireAuth>} />
      <Route path="/sender/create" element={<RequireAuth allowedRoles={['sender']}><CreateDelivery /></RequireAuth>} />
      <Route path="/sender/tracking" element={<RequireAuth allowedRoles={['sender']}><Tracking /></RequireAuth>} />
      <Route path="/sender/tracking/:id" element={<RequireAuth allowedRoles={['sender']}><Tracking /></RequireAuth>} />
      <Route path="/sender/profile" element={<RequireAuth allowedRoles={['sender']}><SenderProfile /></RequireAuth>} />

      {/* COURIER */}
      <Route path="/courier" element={<RequireAuth allowedRoles={['courier']}><CourierDashboard /></RequireAuth>} />
      <Route
        path="/courier/available"
        element={<RequireAuth allowedRoles={['courier']}>{isCourierVerified ? <AvailableDeliveries /> : <VerificationPending />}</RequireAuth>}
      />
      <Route
        path="/courier/deliveries"
        element={<RequireAuth allowedRoles={['courier']}>{isCourierVerified ? <CourierDeliveries userRole={userRole} setUserRole={setUserRole} /> : <VerificationPending />}</RequireAuth>}
      />
      <Route path="/courier/profile" element={<RequireAuth allowedRoles={['courier']}><CourierProfile /></RequireAuth>} />
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
