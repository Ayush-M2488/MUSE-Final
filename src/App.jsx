import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import LoginPage from './components/loginPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import Dashboard from './components/dashboard/Dashboard';
import LandingPage from './components/landing/LandingPage';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dashRole, setDashRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('muse_token');
    const role = localStorage.getItem('muse_role');

    if (token && role) {
      setDashRole(role);
    } else {
      setDashRole(null);
    }
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={
        <LoginPage
          initialRole={location.state?.role || 'student'}
          onBack={() => navigate('/')}
          onLoginSuccess={(role) => { setDashRole(role); navigate('/dashboard', { replace: true }); }}
        />
      } />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/dashboard" element={
        dashRole ? (
          <Dashboard 
            role={dashRole} 
            onLogout={() => { 
              setDashRole(null); 
              localStorage.removeItem('muse_token'); 
              localStorage.removeItem('muse_role'); 
              localStorage.removeItem('muse_user'); 
              navigate('/', { replace: true }); 
              window.scrollTo(0, 0); 
            }} 
          />
        ) : (
          <LoginPage
            initialRole="student"
            onBack={() => navigate('/')}
            onLoginSuccess={(role) => { setDashRole(role); navigate('/dashboard', { replace: true }); }}
          />
        )
      } />
    </Routes>
  );
}