import React, { useState } from 'react';
import { KeyRound, LogOut, Shield, Store, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StorePulseLogo from './StorePulseLogo';
import ChangePasswordModal from './ChangePasswordModal';

const Navbar = ({ onNavigate, currentView }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="badge badge-admin"><Shield size={12} /> System Admin</span>;
      case 'STORE_OWNER':
        return <span className="badge badge-owner"><Store size={12} /> Store Owner</span>;
      case 'NORMAL_USER':
        return <span className="badge badge-user"><UserCheck size={12} /> Normal User</span>;
      default:
        return null;
    }
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 90,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-light)',
          padding: '0 24px',
          height: '76px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            maxWidth: '1264px',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Logo matching storepulse.co */}
          <div
            onClick={() => onNavigate && onNavigate(isAuthenticated ? 'dashboard' : 'login')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              userSelect: 'none'
            }}
          >
            <StorePulseLogo height={34} variant="dark" />
          </div>

          {/* Right Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isAuthenticated ? (
              <>
                {/* Active user details pill */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'var(--bg-card-subtle)',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--sp-dark)',
                      color: 'var(--sp-mint)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem'
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--sp-dark)',
                        maxWidth: '160px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {user?.name}
                    </span>
                    <div style={{ marginTop: '1px' }}>
                      {getRoleBadge(user?.role)}
                    </div>
                  </div>
                </div>

                {/* Password modal trigger */}
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                  title="Update Password"
                >
                  <KeyRound size={15} />
                  <span>Password</span>
                </button>

                {/* Logout button */}
                <button
                  onClick={logout}
                  className="btn btn-danger"
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button
                  onClick={() => onNavigate && onNavigate('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: currentView === 'login' ? 'var(--sp-dark)' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  Login
                </button>
                <button
                  onClick={() => onNavigate && onNavigate('register')}
                  className="btn btn-primary"
                  style={{
                    padding: '9px 18px',
                    borderRadius: '5px',
                    fontSize: '0.875rem'
                  }}
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
