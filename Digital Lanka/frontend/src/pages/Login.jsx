import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, User, ShieldAlert, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login, isLoading } = useContext(AuthContext);
  const [nic, setNic] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nic || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const result = await login(nic, password);
    if (result.success) {
      // Redirect based on role returned from login API
      switch (result.role) {
        case 'SUPER_ADMIN':
          navigate('/super-admin');
          break;
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'OFFICER':
          navigate('/officer');
          break;
        default:
          navigate('/unauthorized');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="card login-card">
        <div className="login-header">
          <div className="login-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1>Traffic Portal</h1>
          <p>Module 6: Institutional Provisioning & Login</p>
        </div>

        {error && (
          <div className="alert-banner alert-error">
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="nic">NIC Number</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <User size={16} />
              </span>
              <input
                id="nic"
                type="text"
                className="form-input"
                placeholder="e.g. 197204509123 or 991234567V"
                style={{ paddingLeft: '2.75rem' }}
                value={nic}
                onChange={(e) => setNic(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={16} />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.5rem', height: '46px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <p>Demo Super Admin Login:</p>
          <code style={{ color: 'var(--accent-cyan)' }}>000000000V</code> / <code style={{ color: 'var(--accent-cyan)' }}>superadmin123</code>
        </div>
      </div>
    </div>
  );
};

export default Login;
