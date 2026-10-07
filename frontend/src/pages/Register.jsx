import React, { useState } from 'react';
import { User, Mail, MapPin, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StorePulseLogo from '../components/StorePulseLogo';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress
} from '../utils/validators';

const Register = ({ onNavigate }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Field validation checks
  const nameError = validateName(formData.name);
  const emailError = validateEmail(formData.email);
  const addressError = validateAddress(formData.address);
  const passwordError = validatePassword(formData.password);
  const confirmPasswordError =
    formData.password !== formData.confirmPassword ? 'Passwords do not match.' : null;

  // Live password checklists
  const passLength = formData.password.length >= 8 && formData.password.length <= 16;
  const passUpper = /[A-Z]/.test(formData.password);
  const passSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
  const isFormValid =
    !nameError && !emailError && !addressError && !passwordError && !confirmPasswordError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      address: true,
      password: true,
      confirmPassword: true
    });
    setError('');

    if (!isFormValid) {
      setError('Please resolve all validation errors before proceeding.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        password: formData.password
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
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
          maxWidth: '540px',
          padding: '40px 36px',
          backgroundColor: '#FFFFFF'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-block', marginBottom: '14px' }}>
            <StorePulseLogo height={38} variant="dark" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--sp-dark)', marginBottom: '6px' }}>
            Get Started
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Join StorePulse to discover, evaluate, and rate stores
          </p>
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
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">
              <span>Full Name <span className="req">*</span></span>
              <span className="form-hint">{formData.name.length}/60 chars (Min 20)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="name"
                className={`form-input ${touched.name && nameError ? 'is-invalid' : ''}`}
                placeholder="20 to 60 characters long"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => handleBlur('name')}
                required
                style={{ paddingLeft: '40px' }}
              />
              <User
                size={18}
                color="var(--text-light)"
                style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            {touched.name && nameError && <span className="form-error">{nameError}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">
              <span>Email Address <span className="req">*</span></span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                name="email"
                className={`form-input ${touched.email && emailError ? 'is-invalid' : ''}`}
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                required
                style={{ paddingLeft: '40px' }}
              />
              <Mail
                size={18}
                color="var(--text-light)"
                style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            {touched.email && emailError && <span className="form-error">{emailError}</span>}
          </div>

          {/* Address */}
          <div className="form-group">
            <label className="form-label">
              <span>Physical Address <span className="req">*</span></span>
              <span className="form-hint">{formData.address.length}/400 chars</span>
            </label>
            <div style={{ position: 'relative' }}>
              <textarea
                name="address"
                rows="2"
                className={`form-textarea ${touched.address && addressError ? 'is-invalid' : ''}`}
                placeholder="Street address, city, state, zip code (Max 400 chars)"
                value={formData.address}
                onChange={handleChange}
                onBlur={() => handleBlur('address')}
                required
                style={{ paddingLeft: '40px' }}
              />
              <MapPin
                size={18}
                color="var(--text-light)"
                style={{ position: 'absolute', left: '13px', top: '16px' }}
              />
            </div>
            {touched.address && addressError && <span className="form-error">{addressError}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">
              <span>Password <span className="req">*</span></span>
              <span className="form-hint">8–16 characters</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                name="password"
                className={`form-input ${touched.password && passwordError ? 'is-invalid' : ''}`}
                placeholder="e.g. Secret@1234"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                required
                style={{ paddingLeft: '40px' }}
              />
              <Lock
                size={18}
                color="var(--text-light)"
                style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>

            {/* Checklist */}
            <div
              style={{
                background: 'var(--bg-card-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                marginTop: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontSize: '0.78rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passLength ? '#047857' : 'var(--text-muted)' }}>
                <CheckCircle2 size={13} color={passLength ? '#047857' : '#94A3B8'} />
                <span>8 to 16 characters</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passUpper ? '#047857' : 'var(--text-muted)' }}>
                <CheckCircle2 size={13} color={passUpper ? '#047857' : '#94A3B8'} />
                <span>At least one uppercase character</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passSpecial ? '#047857' : 'var(--text-muted)' }}>
                <CheckCircle2 size={13} color={passSpecial ? '#047857' : '#94A3B8'} />
                <span>At least one special character</span>
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">
              <span>Confirm Password <span className="req">*</span></span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                name="confirmPassword"
                className={`form-input ${touched.confirmPassword && confirmPasswordError ? 'is-invalid' : ''}`}
                placeholder="Confirm chosen password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur('confirmPassword')}
                required
                style={{ paddingLeft: '40px' }}
              />
              <Lock
                size={18}
                color="var(--text-light)"
                style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            {touched.confirmPassword && confirmPasswordError && (
              <span className="form-error">{confirmPasswordError}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !isFormValid}
            style={{ width: '100%', padding: '12px', marginTop: '12px', fontWeight: 600 }}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('login')}
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
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
