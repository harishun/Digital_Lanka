import { useState, useEffect } from 'react';
import '../App.css';
import * as api from '../services/api';

// Modular Reusable Components
import VehicleCarousel from './VehicleCarousel';
import SharedVehiclesList from './SharedVehiclesList';
import CitizenProfileCard from './CitizenProfileCard';
import NotificationsInbox from './NotificationsInbox';
import DocumentDetailsModal from './DocumentDetailsModal';
import AccessControlModal from './AccessControlModal';
import OfficerDashboard from './OfficerDashboard';
import ViewProfileModal from './ViewProfileModal';
import VehicleRegistrationForm from './VehicleRegistrationForm';

// ── JWT decoder ───────────────────────────────────────────────────────────────
const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) { return null; }
};

// ── Role config ───────────────────────────────────────────────────────────────
const ROLE_META = {
  ROLE_USER:        { label: 'Citizen',       color: '#0ea5e9', bg: 'rgba(14,165,233,0.15)',   icon: 'account_circle',        badgeBg: '#0ea5e9' },
  ROLE_OFFICER:     { label: 'Police Officer', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',   icon: 'local_police',          badgeBg: '#f59e0b' },
  ROLE_ADMIN:       { label: 'Admin',          color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)',   icon: 'admin_panel_settings',  badgeBg: '#8b5cf6' },
  ROLE_SUPER_ADMIN: { label: 'Super Admin',    color: '#ef4444', bg: 'rgba(239,68,68,0.15)',    icon: 'security',              badgeBg: '#ef4444' },
};

function Dashboard({ token, onLogout }) {
  const decoded   = decodeJwt(token) || { nic: '', name: 'User', role: 'ROLE_USER' };
  const userNic   = decoded.nic;
  const userName  = decoded.name;
  const userRole  = decoded.role || 'ROLE_USER';
  const roleMeta  = ROLE_META[userRole] || ROLE_META['ROLE_USER'];

  // Officers start on CITIZEN tab; others always on CITIZEN
  const [activeTab, setActiveTab] = useState('CITIZEN');

  const [currentUser,        setCurrentUser]        = useState(null);
  const [vehicles,           setVehicles]           = useState([]);
  const [incomingInvitations,setIncomingInvitations]= useState([]);
  const [notifications,      setNotifications]      = useState([]);
  const [authorizedVehicles, setAuthorizedVehicles] = useState([]);
  const [activeVehicleIndex, setActiveVehicleIndex] = useState(0);

  // Modals
  const [isDocModalOpen,          setIsDocModalOpen]          = useState(false);
  const [isAccessControlModalOpen,setIsAccessControlModalOpen]= useState(false);
  const [isProfileModalOpen,      setIsProfileModalOpen]      = useState(false);
  const [isRegisterModalOpen,     setIsRegisterModalOpen]     = useState(false);
  const [currentVehicle,          setCurrentVehicle]          = useState(null);
  const [authorizations,          setAuthorizations]          = useState([]);
  const [vehicleDocs,             setVehicleDocs]             = useState(null);
  const [expandedDoc,             setExpandedDoc]             = useState('vrc');

  // Grant form state
  const [driverNic,     setDriverNic]     = useState('');
  const [accessType,    setAccessType]    = useState('PERMANENT');
  const [durationDays,  setDurationDays]  = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isError,       setIsError]       = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [userNic]);

  const loadData = async () => {
    try { setCurrentUser(api.getCitizen(userNic)); } catch (e) {}
    try { setVehicles(           await api.getVehiclesOwned(userNic)           || []); } catch (e) {}
    try { setIncomingInvitations(await api.getPendingInvitations(userNic)      || []); } catch (e) {}
    try { setNotifications(      await api.getMyNotifications(userNic)         || []); } catch (e) {}
    try { setAuthorizedVehicles( await api.getVehiclesAuthorizedToDrive(userNic) || []); } catch (e) {}
  };

  const handlePrevVehicle = () =>
    setActiveVehicleIndex(prev => prev > 0 ? prev - 1 : Math.max(0, vehicles.length - 1));
  const handleNextVehicle = () =>
    setActiveVehicleIndex(prev => prev < vehicles.length - 1 ? prev + 1 : 0);

  const openDocModal = async (vehicle, targetDoc = 'vrc') => {
    setCurrentVehicle(vehicle); setExpandedDoc(targetDoc); setIsDocModalOpen(true);
    try { setVehicleDocs(await api.getVehicleDocuments(vehicle.id, userNic)); } catch (e) {}
  };

  const openAccessControlModal = async (vehicle) => {
    setCurrentVehicle(vehicle);
    setDriverNic(''); setAccessType('PERMANENT'); setDurationDays('');
    setStatusMessage(''); setIsError(false); setIsAccessControlModalOpen(true);
    try { setAuthorizations(await api.getAuthorizationsByVehicle(vehicle.id, userNic)); } catch (e) {}
  };

  const reloadAuthorizations = async (vehicleId) => {
    try { setAuthorizations(await api.getAuthorizationsByVehicle(vehicleId, userNic)); } catch (e) {}
  };

  const handleMarkAsStolen = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to report this vehicle as STOLEN? This will alert law enforcement immediately.')) return;
    try { await api.reportVehicleStolen(vehicleId, userNic); setIsAccessControlModalOpen(false); loadData(); }
    catch (err) { alert(`Failed to report vehicle stolen: ${err.message}`); }
  };

  const handleGrantAccess = async (e) => {
    e.preventDefault(); setStatusMessage(''); setIsError(false);
    try {
      let startTime = null, endTime = null;
      if (accessType === 'TIME_BOUND') {
        const days = parseInt(durationDays);
        if (isNaN(days) || days <= 0) throw new Error('Please enter a valid number of days.');
        const now = new Date();
        startTime = now.toISOString();
        const end = new Date(); end.setDate(now.getDate() + days);
        endTime = end.toISOString();
      }
      await api.inviteDriver(userNic, currentVehicle.plateNumber || currentVehicle.id, driverNic.trim(), accessType, startTime, endTime);
      setStatusMessage(`Access invitation sent to ${driverNic}!`);
      setDriverNic(''); setDurationDays('');
      reloadAuthorizations(currentVehicle.id); loadData();
    } catch (err) { setIsError(true); setStatusMessage(err.message); }
  };

  const handleAcceptInvitation  = async (id) => { try { await api.respondToInvitation(id, true, userNic);  loadData(); } catch (e) { alert(e.message); } };
  const handleDeclineInvitation = async (id) => { try { await api.respondToInvitation(id, false, userNic); loadData(); } catch (e) { alert(e.message); } };
  const handleRevokeAccess      = async (id) => {
    try { await api.revokeAuthorization(currentVehicle.id, id, userNic); reloadAuthorizations(currentVehicle.id); loadData(); }
    catch (e) { alert(e.message); }
  };

  // ── Citizen portal JSX ────────────────────────────────────────────────────
  const CitizenPortal = () => (
    <div className="animate-fade-in">
      {/* Admin / Super-Admin role banner */}
      {(userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPER_ADMIN') && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 20px',
          marginBottom: '24px',
          borderRadius: '12px',
          background: roleMeta.bg,
          border: `1.5px solid ${roleMeta.color}`,
          color: roleMeta.color,
          fontWeight: '700', fontSize: '14px'
        }}>
          <span className="material-icons" style={{ fontSize: '22px' }}>{roleMeta.icon}</span>
          <div>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{roleMeta.label} Account</span>
            <span style={{ fontWeight: '400', marginLeft: '8px', opacity: 0.8, fontSize: '13px' }}>
              — Viewing Citizen Dashboard (full admin controls available via system panel)
            </span>
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <VehicleCarousel
            vehicles={vehicles}
            activeVehicleIndex={activeVehicleIndex}
            setActiveVehicleIndex={setActiveVehicleIndex}
            handlePrevVehicle={handlePrevVehicle}
            handleNextVehicle={handleNextVehicle}
            openAccessControlModal={openAccessControlModal}
            openDocModal={openDocModal}
            isModalOpen={isDocModalOpen || isAccessControlModalOpen}
          />
          <SharedVehiclesList authorizedVehicles={authorizedVehicles} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <CitizenProfileCard currentUser={currentUser} />
          <NotificationsInbox
            incomingInvitations={incomingInvitations}
            notifications={notifications}
            currentNic={userNic}
            handleAcceptInvitation={handleAcceptInvitation}
            handleDeclineInvitation={handleDeclineInvitation}
            loadData={loadData}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="grant-screen">
      <div className="vehicles-container">

        {/* ── Top Navigation Bar ─────────────────────────────────────────── */}
        <header className="dashboard-top-nav" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 28px',
          background: '#002366',
          color: '#ffffff',
          boxShadow: '0 4px 14px rgba(0,35,102,0.25)',
          borderRadius: '12px',
          marginBottom: '32px'
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="material-icons" style={{ fontSize: '32px', color: '#f59e0b' }}>verified_user</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.025em' }}>DIGITAL LANKA</div>
              <div style={{ fontSize: '11px', color: '#93c5fd' }}>Secure Driver &amp; Identity Registry</div>
            </div>
          </div>

          {/* Right side: user info + View Profile + Sign Out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

            {/* User identity block */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>{userName}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginTop: '4px' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  background: roleMeta.bg,
                  border: `1px solid ${roleMeta.color}`,
                  color: roleMeta.color,
                  fontSize: '10px', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase'
                }}>
                  <span className="material-icons" style={{ fontSize: '11px' }}>{roleMeta.icon}</span>
                  {roleMeta.label}
                </span>
                <span style={{ fontSize: '11px', color: '#93c5fd' }}>NIC: {userNic}</span>
              </div>
            </div>

            {/* View Profile Button */}
            <button
              id="view-profile-btn"
              onClick={() => setIsProfileModalOpen(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px',
                border: `1.5px solid ${roleMeta.color}`,
                background: roleMeta.bg,
                color: '#ffffff',
                fontSize: '13px', fontWeight: '700',
                borderRadius: '20px', cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseOut={e => e.currentTarget.style.background = roleMeta.bg}
            >
              <span className="material-icons" style={{ fontSize: '16px' }}>manage_accounts</span>
              View Profile
            </button>

            {/* Register New Vehicle Button */}
            <button
              id="register-vehicle-btn"
              onClick={() => setIsRegisterModalOpen(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px',
                border: '1.5px solid #34d399',
                background: 'rgba(52, 211, 153, 0.15)',
                color: '#ffffff',
                fontSize: '13px', fontWeight: '700',
                borderRadius: '20px', cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(52, 211, 153, 0.25)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(52, 211, 153, 0.15)'}
            >
              <span className="material-icons" style={{ fontSize: '16px' }}>add_circle</span>
              Register Vehicle
            </button>

            {/* Sign Out */}
            <button
              id="sign-out-btn"
              onClick={onLogout}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px',
                border: '1.5px solid #93c5fd',
                background: 'transparent',
                color: '#ffffff',
                fontSize: '13px', fontWeight: '700',
                borderRadius: '20px', cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              <span className="material-icons" style={{ fontSize: '18px' }}>logout</span>
              Sign Out
            </button>
          </div>
        </header>

        {/* ── Page Header ───────────────────────────────────────────────────── */}
        <div className="grant-header" style={{ marginTop: '0px' }}>
          <span className="material-icons grant-icon">verified</span>
          <h1 className="grant-title">National Registry Dashboard</h1>
          <p className="grant-subtitle">
            Integrated Government Services — DMT Registry, Law Enforcement &amp; Citizen Authorizations
          </p>

          {/* ── Tab toggle: only show for Officers ──────────────────────── */}
          {userRole === 'ROLE_OFFICER' && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
              <button
                id="tab-citizen-btn"
                onClick={() => setActiveTab('CITIZEN')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 28px', borderRadius: '30px',
                  fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                  border: activeTab === 'CITIZEN' ? '2px solid var(--c-primary)' : '1px solid #cbd5e1',
                  background: activeTab === 'CITIZEN' ? 'var(--c-primary)' : '#ffffff',
                  color: activeTab === 'CITIZEN' ? '#ffffff' : '#334155',
                  boxShadow: activeTab === 'CITIZEN' ? '0 4px 14px rgba(0,35,102,0.25)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <span className="material-icons" style={{ fontSize: '20px' }}>account_circle</span>
                Citizen Portal
              </button>

              <button
                id="tab-officer-btn"
                onClick={() => setActiveTab('OFFICER')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 28px', borderRadius: '30px',
                  fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                  border: activeTab === 'OFFICER' ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                  background: activeTab === 'OFFICER' ? '#0f172a' : '#ffffff',
                  color: activeTab === 'OFFICER' ? '#f59e0b' : '#334155',
                  boxShadow: activeTab === 'OFFICER' ? '0 4px 14px rgba(245,158,11,0.3)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <span className="material-icons" style={{ fontSize: '20px' }}>local_police</span>
                Officer Dashboard
              </button>
            </div>
          )}
        </div>

        {/* ── Content Area: Role-driven rendering ──────────────────────────── */}

        {/* CITIZEN: always show CitizenPortal */}
        {(userRole === 'ROLE_USER' || userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPER_ADMIN') && (
          <CitizenPortal />
        )}

        {/* OFFICER: tab-driven */}
        {userRole === 'ROLE_OFFICER' && activeTab === 'CITIZEN' && <CitizenPortal />}
        {userRole === 'ROLE_OFFICER' && activeTab === 'OFFICER' && (
          <OfficerDashboard currentNic={userNic} loadData={loadData} />
        )}

        {/* ── Modals ────────────────────────────────────────────────────────── */}
        <ViewProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          userNic={userNic}
          userName={userName}
          userRole={userRole}
          citizen={currentUser}
        />

        <DocumentDetailsModal
          isOpen={isDocModalOpen}
          onClose={() => setIsDocModalOpen(false)}
          currentVehicle={currentVehicle}
          vehicleDocs={vehicleDocs}
          expandedDoc={expandedDoc}
          setExpandedDoc={setExpandedDoc}
        />

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

        {/* Vehicle Asset Registration Modal */}
        {isRegisterModalOpen && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '20px'
            }}
            onClick={e => e.target === e.currentTarget && setIsRegisterModalOpen(false)}
          >
            <div style={{ maxWidth: '560px', width: '100%' }}>
              <VehicleRegistrationForm
                currentNic={userNic}
                onClose={() => setIsRegisterModalOpen(false)}
                onSuccess={() => { setIsRegisterModalOpen(false); loadData(); }}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;
