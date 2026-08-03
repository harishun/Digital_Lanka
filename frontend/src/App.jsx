import React, { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import CitizenPortal from './CitizenPortal';
import AdminPortal from './AdminPortal';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const role = localStorage.getItem('role');
  const [officerMode, setOfficerMode] = useState('citizen'); // Default to Citizen Portal for officers

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isOfficer = role === 'ROLE_OFFICER' || role === 'POLICE_OFFICER';

  let content;
  if (!token) {
    content = <Login setToken={setToken} />;
  } else if (isOfficer) {
    if (officerMode === 'officer') {
      content = <Dashboard setToken={setToken} onSwitchToCitizen={() => setOfficerMode('citizen')} />;
    } else {
      content = (
        <CitizenPortal
          setToken={setToken}
          isOfficer={true}
          onSwitchToOfficer={() => setOfficerMode('officer')}
        />
      );
    }
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
