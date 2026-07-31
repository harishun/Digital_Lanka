import React, { useContext } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminDashboard from './pages/AdminDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import Unauthorized from './pages/Unauthorized';
import { LogOut, User as UserIcon } from 'lucide-react';

const Layout = ({ children }) => {
  const { authState, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!authState.isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <Link to="/" className="nav-brand" style={{ cursor: 'pointer', textDecoration: 'none' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Traffic Portal</span>
        </Link>
        <div className="nav-actions">
          <div className="user-badge-nav">
            <UserIcon size={14} className="text-muted" />
            <span>{authState.fullName}</span>
            <span className="role-indicator">({authState.role})</span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-icon" title="Log Out">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </nav>
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
};

const NavigationWrapper = () => {
  const { authState } = useContext(AuthContext);

  if (authState.isAuthenticated) {
    // Redirect logged in users to their role-specific dashboard
    switch (authState.role) {
      case 'SUPER_ADMIN':
        return <Navigate to="/super-admin" replace />;
      case 'ADMIN':
        return <Navigate to="/admin" replace />;
      case 'OFFICER':
        return <Navigate to="/officer" replace />;
      default:
        return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Navigate to="/login" replace />;
};

const AppContent = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes by Role */}
      <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
        <Route path="/super-admin" element={<Layout><SuperAdminDashboard /></Layout>} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['OFFICER']} />}>
        <Route path="/officer" element={<Layout><OfficerDashboard /></Layout>} />
      </Route>

      {/* Shared Protected Route */}
      <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'OFFICER', 'USER']} />}>
        <Route path="/unauthorized" element={<Layout><Unauthorized /></Layout>} />
      </Route>

      {/* Catch-All / Home redirects */}
      <Route path="/" element={<NavigationWrapper />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
