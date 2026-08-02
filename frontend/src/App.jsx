import React, { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import CitizenPortal from './CitizenPortal';
import AdminPortal from './AdminPortal';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const role = localStorage.getItem('role');

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  let content;
  if (!token) {
    content = <Login setToken={setToken} />;
  } else if (role === 'ROLE_OFFICER') {
    content = <Dashboard setToken={setToken} />;
  } else if (role === 'ROLE_CITIZEN') {
    content = <CitizenPortal setToken={setToken} />;
  } else if (role === 'ROLE_ADMIN') {
    content = <AdminPortal setToken={setToken} />;
  } else {
    content = <Login setToken={setToken} />;
  }

  return (
    <div>
      {content}
    </div>
  );
}

export default App;
