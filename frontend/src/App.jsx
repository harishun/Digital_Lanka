import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import CitizenPortal from './CitizenPortal';
import AdminPortal from './AdminPortal';
import PersonaSwitcherBar from './components/PersonaSwitcherBar';
import {
  PERSONAS,
  getCurrentNic,
  getCurrentRole,
  setCurrentNic,
  onIdentityChange,
  ROLE_OFFICER,
  ROLE_ADMIN,
} from './identity';

/**
 * App — portal routing.
 *
 * There is no login gate: the active persona (see identity.js) decides which
 * portal is shown. An officer is also a citizen, so they get both the Officer
 * Dashboard and the Citizen Portal with a button to switch between them.
 *
 * The persona switcher lives here rather than inside the Citizen Portal so that
 * it is reachable from every portal — otherwise switching to the admin persona
 * would strand you in AdminPortal with no way back.
 *
 * HANDOVER NOTE: when login lands, delete the PersonaSwitcherBar and drive
 * `nic`/`role` off the authenticated session instead.
 */
function App() {
  const [nic, setNic] = useState(getCurrentNic);
  const [officerMode, setOfficerMode] = useState('citizen'); // officers land on their citizen portal

  useEffect(() => {
    const sync = () => setNic(getCurrentNic());
    const unsubscribe = onIdentityChange(sync);
    window.addEventListener('storage', sync); // keep other tabs in step
    return () => {
      unsubscribe();
      window.removeEventListener('storage', sync);
    };
  }, []);

  const role = getCurrentRole();
  const isOfficer = role === ROLE_OFFICER;

  // Switching to a non-officer persona must not leave us on the officer view.
  useEffect(() => {
    if (!isOfficer && officerMode !== 'citizen') {
      setOfficerMode('citizen');
    }
  }, [isOfficer, officerMode]);

  const handlePersonaChange = (e) => setCurrentNic(e.target.value);

  // `key={nic}` remounts the active portal on a persona switch, so no stale
  // vehicles, citations or notifications from the previous user survive.
  let content;
  if (isOfficer && officerMode === 'officer') {
    content = <Dashboard key={nic} onSwitchToCitizen={() => setOfficerMode('citizen')} />;
  } else if (role === ROLE_ADMIN) {
    content = <AdminPortal key={nic} />;
  } else {
    content = (
      <CitizenPortal
        key={nic}
        isOfficer={isOfficer}
        onSwitchToOfficer={() => setOfficerMode('officer')}
      />
    );
  }

  return (
    <div>
      <div style={{ padding: '12px 16px 0' }}>
        <PersonaSwitcherBar
          currentNic={nic}
          handlePersonaChange={handlePersonaChange}
          personas={PERSONAS}
        />
      </div>
      {content}
    </div>
  );
}

export default App;
