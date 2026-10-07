import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StorePulseLogo from '../components/StorePulseLogo';

const Login = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 76px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 20px',
        backgroundColor: 'var(--bg-page)'
      }}
    >
      <div
        className="sp-card"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '40px 36px',
          backgroundColor: '#FFFFFF'
        }}
      >
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-block', marginBottom: '14px' }}>
            <StorePulseLogo height={38} variant="dark" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--sp-dark)', marginBottom: '6px' }}>
            Sign In
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Access store ratings, customer feedback & management
          </p>
        </div>

        {/* 1-Click Demo Accounts for Easy Testing */}
        <div
          style={{
            background: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            marginBottom: '24px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--sp-dark)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '10px'
            }}
          >
            <Sparkles size={14} color="var(--sp-mint-hover)" />
            <span>Quick Demo Logins (1-Click Fill)</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleDemoFill('admin@roxiller.com', 'Admin@1234')}
              style={{ fontSize: '0.785rem', padding: '6px 10px', background: '#FFFFFF' }}
            >
              👑 Admin
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleDemoFill('robert.owner@stores.com', 'Owner@1234')}
              style={{ fontSize: '0.785rem', padding: '6px 10px', background: '#FFFFFF' }}
            >
              🏬 Store Owner
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleDemoFill('alexander.user@email.com', 'User@1234')}
              style={{ fontSize: '0.785rem', padding: '6px 10px', background: '#FFFFFF' }}
            >
              👤 Normal User
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: '#FFF1F2',
              border: '1px solid #FECDD3',
              color: '#BE123C',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label">
              <span>Email Address <span className="req">*</span></span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '40px' }}
              />
              <Mail
                size={18}
                color="var(--text-light)"
                style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">
              <span>Password <span className="req">*</span></span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '40px' }}
              />
              <Lock
                size={18}
                color="var(--text-light)"
                style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !email || !password}
            style={{ width: '100%', padding: '12px', marginTop: '10px', fontWeight: 600 }}
          >
            {loading ? 'Authenticating...' : 'Sign In to StorePulse'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('register')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--sp-blue)',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-family)',
              textDecoration: 'underline'
            }}
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
