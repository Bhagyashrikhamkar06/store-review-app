import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import StorePulseLogo from './components/StorePulseLogo';

const MainApp = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '14px',
          backgroundColor: 'var(--bg-page)'
        }}
      >
        <StorePulseLogo height={42} variant="dark" />
        <div className="animate-pulse-subtle" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--sp-dark)' }}>
          Loading StorePulse...
        </div>
      </div>
    );
  }

  // Not authenticated: Login or Register
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)' }}>
        <Navbar onNavigate={(view) => setAuthView(view)} currentView={authView} />
        <main style={{ flex: 1 }}>
          {authView === 'login' ? (
            <Login onNavigate={(view) => setAuthView(view)} />
          ) : (
            <Register onNavigate={(view) => setAuthView(view)} />
          )}
        </main>
        <footer
          style={{
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid var(--border-light)',
            padding: '24px 20px',
            textAlign: 'center'
          }}
        >
          <div style={{ maxWidth: '1264px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <StorePulseLogo height={26} variant="dark" />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              &copy; {new Date().getFullYear()} StorePulse. Powerful Tools for Modern Store Rating & Performance.
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Authenticated: Dashboard by Role
  const renderRoleDashboard = () => {
    switch (user?.role) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'STORE_OWNER':
        return <StoreOwnerDashboard />;
      case 'NORMAL_USER':
      default:
        return <UserDashboard />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)' }}>
      <Navbar onNavigate={() => {}} currentView="dashboard" />
      <main style={{ flex: 1 }}>
        {renderRoleDashboard()}
      </main>
      <footer
        style={{
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid var(--border-light)',
          padding: '28px 20px',
          marginTop: '48px'
        }}
      >
        <div style={{ maxWidth: '1264px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <StorePulseLogo height={28} variant="dark" />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Logged in as <strong>{user?.name}</strong> &bull; Role: <strong>{user?.role}</strong> &bull; &copy; {new Date().getFullYear()} StorePulse
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
