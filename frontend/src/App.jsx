import { useState, useEffect } from 'react';
import './App.css';
import * as api from './services/api';

// Modular Reusable Components
import PersonaSwitcherBar from './components/PersonaSwitcherBar';
import VehicleCarousel from './components/VehicleCarousel';
import SharedVehiclesList from './components/SharedVehiclesList';
import CitizenProfileCard from './components/CitizenProfileCard';
import NotificationsInbox from './components/NotificationsInbox';
import DocumentDetailsModal from './components/DocumentDetailsModal';
import AccessControlModal from './components/AccessControlModal';
import OfficerDashboard from './components/OfficerDashboard';
import VehicleRegistrationForm from './components/VehicleRegistrationForm';
import CitizenCitationsList from './components/CitizenCitationsList';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [activeTab, setActiveTab] = useState('CITIZEN'); // 'CITIZEN' | 'OFFICER' | 'ADMIN' | 'SUPER_ADMIN'
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('current_user_role') || 'CITIZEN';
  });

  // Night Mode / Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('digital_lanka_theme') || 'light';
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('digital_lanka_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  const [isRegistrationFormOpen, setIsRegistrationFormOpen] = useState(false);
  const [authMode, setAuthMode] = useState('NONE'); // 'NONE' | 'LOGIN' | 'SIGNUP'



  const [currentNic, setCurrentNic] = useState(() => {
    return localStorage.getItem('current_user_nic') || null;
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [incomingInvitations, setIncomingInvitations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [authorizedVehicles, setAuthorizedVehicles] = useState([]);
  
  // Carousel state
  const [activeVehicleIndex, setActiveVehicleIndex] = useState(0);

  // Modals state
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isAccessControlModalOpen, setIsAccessControlModalOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [authorizations, setAuthorizations] = useState([]);
  const [vehicleDocs, setVehicleDocs] = useState(null);
  
  // Expanded document details in modal
  const [expandedDoc, setExpandedDoc] = useState('vrc');

  // Form state
  const [driverNic, setDriverNic] = useState('');
  const [accessType, setAccessType] = useState('PERMANENT');
  const [durationDays, setDurationDays] = useState('');
  
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleLoginSuccess = (token, userNic) => {
    if (userNic) {
      setCurrentNic(userNic);
      localStorage.setItem('current_user_nic', userNic);
      
      let role = 'CITIZEN';
      try {
        const storedUsers = JSON.parse(localStorage.getItem('dl_system_users') || '[]');
        const u = storedUsers.find(u => u.nic === userNic);
        if (u && u.role) {
          role = u.role;
        }
      } catch(e) { console.warn("Failed to check dl_system_users"); }

      setUserRole(role);
      localStorage.setItem('current_user_role', role);

      if (role === 'OFFICER') {
        setActiveTab('OFFICER');
      } else if (role === 'ADMIN') {
        setActiveTab('ADMIN');
      } else if (role === 'SUPER_ADMIN' || role === 'ROOT_ADMIN') {
        setActiveTab('SUPER_ADMIN');
      } else {
        setActiveTab('CITIZEN');
      }
    }
    setActiveVehicleIndex(0);
    setAuthMode('NONE');
    loadData();
  };

  const handleLogout = () => {
    if (currentNic) {
      localStorage.removeItem(`jwt_token_${currentNic}`);
    }
    // Also remove the fallback mock tokens just in case
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('jwt_token_') || key.startsWith('mock_jwt_token_')) {
        localStorage.removeItem(key);
      }
    });
    
    setCurrentNic(null);
    setCurrentUser(null);
    localStorage.removeItem('current_user_nic');
    setAuthMode('LOGIN');
  };



  useEffect(() => {
    loadData();
    // Sync polling loop every 3 seconds for instant notification & authorization updates
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [currentNic]);

  const loadData = async () => {
    try {
      // Concurrent parallel data fetching for zero lag
      const [meRes, ownedRes, invRes, notifRes, authVehRes] = await Promise.allSettled([
        api.getMe(currentNic),
        api.getVehiclesOwned(currentNic),
        api.getPendingInvitations(currentNic),
        api.getMyNotifications(currentNic),
        api.getVehiclesAuthorizedToDrive(currentNic)
      ]);

      if (meRes.status === 'fulfilled' && meRes.value) {
        setCurrentUser(meRes.value);
        if (meRes.value.role) {
          setUserRole(meRes.value.role);
          localStorage.setItem('current_user_role', meRes.value.role);
        }
      }
      
      if (ownedRes.status === 'fulfilled') setVehicles(ownedRes.value || []);
      if (invRes.status === 'fulfilled') setIncomingInvitations(invRes.value || []);
      if (notifRes.status === 'fulfilled') setNotifications(notifRes.value || []);
      if (authVehRes.status === 'fulfilled') setAuthorizedVehicles(authVehRes.value || []);
    } catch (err) {
      console.warn("Error during parallel data load:", err.message);
    }
  };

  const handlePrevVehicle = () => {
    setActiveVehicleIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, vehicles.length - 1)));
  };

  const handleNextVehicle = () => {
    setActiveVehicleIndex((prev) => (prev < vehicles.length - 1 ? prev + 1 : 0));
  };


  const openDocModal = async (vehicle, targetDoc = 'vrc') => {
    setCurrentVehicle(vehicle);
    setExpandedDoc(targetDoc);
    setIsDocModalOpen(true);

    try {
      const docs = await api.getVehicleDocuments(vehicle.id, currentNic);
      setVehicleDocs(docs);
    } catch (err) {
      console.error("Failed to load vehicle documents:", err.message);
    }
  };

  const openAccessControlModal = async (vehicle) => {
    setCurrentVehicle(vehicle);
    setDriverNic('');
    setAccessType('PERMANENT');
    setDurationDays('');
    setStatusMessage('');
    setIsError(false);
    setIsAccessControlModalOpen(true);

    try {
      const authList = await api.getAuthorizationsByVehicle(vehicle.id, currentNic);
      setAuthorizations(authList);
    } catch (err) {
      console.error("Failed to load vehicle authorizations:", err.message);
    }
  };

  const reloadAuthorizations = async (vehicleId) => {
    try {
      const authList = await api.getAuthorizationsByVehicle(vehicleId, currentNic);
      setAuthorizations(authList);
    } catch (err) {
      console.error("Failed to reload authorizations:", err.message);
    }
  };

  const handleMarkAsStolen = async (vehicleId) => {
    if (!window.confirm("Are you sure you want to report this vehicle as STOLEN? This will alert law enforcement immediately.")) {
      return;
    }
    try {
      await api.reportVehicleStolen(vehicleId, currentNic);
      setIsAccessControlModalOpen(false);
      loadData();
    } catch (err) {
      alert(`Failed to report vehicle stolen: ${err.message}`);
    }
  };

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    setIsError(false);

    try {
      let startTime = null;
      let endTime = null;
      if (accessType === 'TIME_BOUND') {
        const days = parseInt(durationDays);
        if (isNaN(days) || days <= 0) {
          throw new Error("Please enter a valid number of days for temporary access.");
        }
        const now = new Date();
        startTime = now.toISOString();
        const end = new Date();
        end.setDate(now.getDate() + days);
        endTime = end.toISOString();
      }

      await api.inviteDriver(
        currentNic,
        currentVehicle.plateNumber || currentVehicle.id,
        driverNic.trim(),
        accessType,
        startTime,
        endTime
      );

      setStatusMessage(`Access invitation successfully sent to Driver NIC: ${driverNic}!`);
      setDriverNic('');
      setDurationDays('');
      reloadAuthorizations(currentVehicle.id);
      loadData();
    } catch (err) {
      setIsError(true);
      setStatusMessage(err.message);
    }
  };

  const handleAcceptInvitation = async (authId) => {
    try {
      await api.respondToInvitation(authId, true, currentNic);
      loadData();
    } catch (err) {
      alert(`Failed to accept invitation: ${err.message}`);
    }
  };

  const handleDeclineInvitation = async (authId) => {
    try {
      await api.respondToInvitation(authId, false, currentNic);
      loadData();
    } catch (err) {
      alert(`Failed to decline invitation: ${err.message}`);
    }
  };

  const handleRevokeAccess = async (authId) => {
    try {
      await api.revokeAuthorization(currentVehicle.id, authId, currentNic);
      reloadAuthorizations(currentVehicle.id);
      loadData();
    } catch (err) {
      alert(`Failed to revoke access: ${err.message}`);
    }
  };

  const availableTabs = ['CITIZEN', 'OFFICER', 'ADMIN', 'SUPER_ADMIN'].filter(tab => {
    if ((userRole === 'ROOT_ADMIN' || userRole === 'SUPER_ADMIN') && (tab === 'CITIZEN' || tab === 'SUPER_ADMIN')) return true;
    if (userRole === 'ADMIN' && (tab === 'CITIZEN' || tab === 'ADMIN')) return true;
    if (userRole === 'OFFICER' && (tab === 'CITIZEN' || tab === 'OFFICER')) return true;
    return tab === 'CITIZEN' && userRole === 'CITIZEN'; // Fallback for pure citizens
  });

  // Ensure 'CITIZEN' is always available if the above somehow fails to include it
  if (!availableTabs.includes('CITIZEN')) {
    availableTabs.unshift('CITIZEN');
  }

  return (
    <div className="grant-screen" style={{ padding: '16px 24px' }}>


      {/* Unauthenticated State (Login / Signup) */}
      {!currentNic ? (
        authMode === 'SIGNUP' ? (
          <SignupPage onSignupSuccess={handleLoginSuccess} onSwitchToLogin={() => setAuthMode('LOGIN')} />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} onSwitchToSignup={() => setAuthMode('SIGNUP')} />
        )
      ) : (
        <div className="vehicles-container" style={{ paddingTop: '0px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Dashboard Header Title Bar */}
          <div className="title-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--c-primary, #002366)', color: '#ffffff', padding: '12px 24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-icons" style={{ color: '#38bdf8', fontSize: '28px' }}>verified</span>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#ffffff', letterSpacing: '0.5px' }}>DIGITAL LANKA</h1>
            </div>

            {availableTabs.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                {availableTabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '6px 16px', fontSize: '12px', fontWeight: '800', borderRadius: '20px', cursor: 'pointer', border: 'none',
                      background: activeTab === tab ? '#ffffff' : 'transparent',
                      color: activeTab === tab ? 'var(--c-primary)' : 'rgba(255,255,255,0.7)',
                      transition: 'all 0.2s ease',
                      boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                    }}
                  >
                    {tab.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Theme Toggle Switch */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-icons" style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)' }}>light_mode</span>
                <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px' }}>
                  <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', transition: '.4s', borderRadius: '22px'
                  }}>
                    <span style={{
                      position: 'absolute', height: '16px', width: '16px', left: theme === 'dark' ? '20px' : '3px', bottom: '3px',
                      backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                    }}></span>
                  </span>
                </label>
                <span className="material-icons" style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)' }}>dark_mode</span>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#ffffff', transition: 'all 0.2s ease'
                }}
              >
                <span className="material-icons" style={{ fontSize: '16px' }}>logout</span>
                LOGOUT
              </button>
            </div>
          </div>

          {/* Render Dashboard Based on Active Tab */}
          {activeTab === 'CITIZEN' && (
            <div className="animate-fade-in">
              {/* Main Three-Column Layout */}
              <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
              
                {/* Left Column: Citizen Profile & Vehicle Carousel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Reusable Citizen Profile Component */}
                  <CitizenProfileCard
                    currentUser={currentUser}
                  />

                  {/* Reusable Vehicle Carousel Component */}
                  <VehicleCarousel
                    vehicles={vehicles}
                    activeVehicleIndex={activeVehicleIndex}
                    setActiveVehicleIndex={setActiveVehicleIndex}
                    handlePrevVehicle={handlePrevVehicle}
                    handleNextVehicle={handleNextVehicle}
                    openAccessControlModal={openAccessControlModal}
                    openDocModal={openDocModal}
                    handleMarkAsStolen={handleMarkAsStolen}
                    isModalOpen={isDocModalOpen || isAccessControlModalOpen || isRegistrationFormOpen}
                    onRegisterClick={() => setIsRegistrationFormOpen(true)}
                  />
                </div>

                {/* Middle Column: Authorized Driving Access (Shared Vehicles) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
                  {/* Reusable Shared Vehicles Component */}
                  <SharedVehiclesList
                    authorizedVehicles={authorizedVehicles}
                    currentUser={currentUser}
                  />
                </div>

                {/* Right Column: Penalties & Inbox */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
                  <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Reusable Traffic Citations & Fine History Component */}
                    <CitizenCitationsList
                      currentNic={currentNic}
                    />
                  </div>

                  <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Reusable Notifications Inbox Component */}
                    <NotificationsInbox
                      incomingInvitations={incomingInvitations}
                      notifications={notifications}
                      currentNic={currentNic}
                      handleAcceptInvitation={handleAcceptInvitation}
                      handleDeclineInvitation={handleDeclineInvitation}
                      loadData={loadData}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Tab 2: Standalone Officer Dashboard Component */}
        {activeTab === 'OFFICER' && (
          <OfficerDashboard
            currentNic={currentNic}
            currentUser={currentUser}
            loadData={loadData}
            onSwitchToCitizen={() => setActiveTab('CITIZEN')}
          />
        )}

        {/* Tab 3 & 4: Unified Administrator Governance Console */}
        {(activeTab === 'ADMIN' || activeTab === 'SUPER_ADMIN') && (
          <AdminDashboard
            currentNic={currentNic}
            currentUser={currentUser}
          />
        )}


        {/* Dedicated Document Details Modal Component */}
        <DocumentDetailsModal
          isOpen={isDocModalOpen}
          onClose={() => setIsDocModalOpen(false)}
          currentVehicle={currentVehicle}
          vehicleDocs={vehicleDocs}
          expandedDoc={expandedDoc}
          setExpandedDoc={setExpandedDoc}
        />

        {/* Dedicated Access Control & Authorization Modal Component */}
        <AccessControlModal
          isOpen={isAccessControlModalOpen}
          onClose={() => setIsAccessControlModalOpen(false)}
          currentVehicle={currentVehicle}
          authorizations={authorizations}
          driverNic={driverNic}
          setDriverNic={setDriverNic}
          accessType={accessType}
          setAccessType={setAccessType}
          durationDays={durationDays}
          setDurationDays={setDurationDays}
          handleGrantAccess={handleGrantAccess}
          handleRevokeAccess={handleRevokeAccess}
          handleMarkAsStolen={handleMarkAsStolen}
          statusMessage={statusMessage}
          isError={isError}
        />

        {/* Vehicle Registration Form Modal (top-level so overlay covers full viewport) */}
        {isRegistrationFormOpen && (
          <VehicleRegistrationForm 
            currentNic={currentNic} 
            onClose={() => setIsRegistrationFormOpen(false)} 
            onSuccess={() => {
              setIsRegistrationFormOpen(false);
              loadData();
            }}
          />
        )}





      </div>
      )}
    </div>
  );
}

export default App;
