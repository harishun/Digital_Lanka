import { useState } from 'react';
import * as api from '../services/api';
import '../Auth.css';

function SignupPage({ onSignupSuccess, onSwitchToLogin }) {
  const [step, setStep] = useState(1);
  const [nic, setNic] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNicCheck = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!nic.trim()) {
      setError('Please enter your National Identity Card number.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.verifyNic(nic.trim());
      setFullName(data.fullName || `Citizen (${nic.trim()})`);
      setInfo(`NIC Verified: ${data.fullName || nic.trim()}`);
      setStep(2);
    } catch (err) {
      setError(err.message || 'NIC verification failed. Please check the NIC format.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !phone.trim() || !password || !confirmPassword) {
      setError('Please fill in all registration fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.register(nic.trim(), email.trim(), phone.trim(), password, confirmPassword);
      onSignupSuccess(data.token, nic.trim());
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-section">
            <span className="material-icons auth-logo-icon">person_add</span>
          </div>
          <h2 className="auth-title">Citizen Registration</h2>
          <p className="auth-subtitle">Register your National Driver Profile</p>
        </div>

        {/* Auth Steps Progress Bar */}
        <div className="auth-steps">
          <div className={`auth-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            {step > 1 ? <span className="material-icons" style={{ fontSize: '18px' }}>check</span> : '1'}
          </div>
          <div className={`auth-step ${step >= 2 ? 'active' : ''}`}>2</div>
        </div>

        {error && (
          <div className="auth-alert auth-alert-danger" style={{ marginBottom: '20px' }}>
            <span className="material-icons auth-alert-icon">error_outline</span>
            <span>{error}</span>
          </div>
        )}

        {info && (
          <div className="auth-alert auth-alert-info" style={{ marginBottom: '20px' }}>
            <span className="material-icons auth-alert-icon">info</span>
            <span>{info}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleNicCheck} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="register-nic">Enter your NIC</label>
              <div className="form-input-wrapper">
                <span className="material-icons form-input-icon">badge</span>
                <input
                  id="register-nic"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 197204509123 or 902234567V"
                  value={nic}
                  onChange={(e) => setNic(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary auth-action-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="material-icons" style={{ animation: 'spin 1s linear infinite' }}>sync</span>
                  Verifying NIC...
                </>
              ) : (
                <>
                  <span className="material-icons">arrow_forward</span>
                  Verify NIC & Continue
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            {/* Verified badge */}
            <div className="citizen-name-badge">
              <span className="material-icons">check_circle</span>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verified Citizen</div>
                <strong>{fullName}</strong>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-email">Email Address</label>
              <div className="form-input-wrapper">
                <span className="material-icons form-input-icon">email</span>
                <input
                  id="register-email"
                  type="email"
                  className="form-input"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-phone">Phone Number</label>
              <div className="form-input-wrapper">
                <span className="material-icons form-input-icon">phone</span>
                <input
                  id="register-phone"
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 0777123456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-password">Password</label>
              <div className="form-input-wrapper">
                <span className="material-icons form-input-icon">lock</span>
                <input
                  id="register-password"
                  type="password"
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm-password">Confirm Password</label>
              <div className="form-input-wrapper">
                <span className="material-icons form-input-icon">lock</span>
                <input
                  id="register-confirm-password"
                  type="password"
                  className="form-input"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ flex: 1, padding: '14px', borderRadius: '8px' }}
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ flex: 2, padding: '14px', borderRadius: '8px', justifyContent: 'center' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="material-icons" style={{ animation: 'spin 1s linear infinite' }}>sync</span>
                    Registering...
                  </>
                ) : (
                  <>
                    <span className="material-icons">how_to_reg</span>
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="auth-footer">
          Already have an account? 
          <span className="auth-link" onClick={onSwitchToLogin}>
            Sign In here
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default SignupPage;
