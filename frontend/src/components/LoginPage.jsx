import { useState } from 'react';
import * as api from '../services/api';
import '../Auth.css';

function LoginPage({ onLoginSuccess, onSwitchToSignup }) {
  const [nic, setNic] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nic.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.login(nic.trim(), password);
      onLoginSuccess(data.token, nic.trim());
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-section">
            <span className="material-icons auth-logo-icon">verified_user</span>
          </div>
          <h2 className="auth-title">Digital Lanka Sign In</h2>
          <p className="auth-subtitle">National Identity & Driver Registry Portal</p>
        </div>

        {error && (
          <div className="auth-alert auth-alert-danger" style={{ marginBottom: '20px' }}>
            <span className="material-icons auth-alert-icon">error_outline</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-nic">National Identity Card (NIC)</label>
            <div className="form-input-wrapper">
              <span className="material-icons form-input-icon">badge</span>
              <input
                id="login-nic"
                type="text"
                className="form-input"
                placeholder="e.g. 197204509123 or 902234567V"
                value={nic}
                onChange={(e) => setNic(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="form-input-wrapper">
              <span className="material-icons form-input-icon">lock</span>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                Logging in...
              </>
            ) : (
              <>
                <span className="material-icons">login</span>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? 
          <span className="auth-link" onClick={onSwitchToSignup}>
            Register here
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

export default LoginPage;
