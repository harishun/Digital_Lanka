import { useState } from 'react';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Dashboard from './components/Dashboard';

function App() {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('jwt_token') || null;
  });
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('current_user_nic');
    setToken(null);
    setIsRegistering(false);
  };

  if (token) {
    return <Dashboard token={token} onLogout={handleLogout} />;
  }

  if (isRegistering) {
    return (
      <SignupPage
        onSignupSuccess={handleLoginSuccess}
        onSwitchToLogin={() => setIsRegistering(false)}
      />
    );
  }

  return (
    <LoginPage
      onLoginSuccess={handleLoginSuccess}
      onSwitchToSignup={() => setIsRegistering(true)}
    />
  );
}

export default App;
