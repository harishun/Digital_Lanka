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

function App() {
  const [activeTab, setActiveTab] = useState('CITIZEN'); // 'CITIZEN' | 'OFFICER'

  const [currentNic, setCurrentNic] = useState(() => {
    const saved = localStorage.getItem('current_user_nic');
    const activeNics = ['197204509123', '198503402948', '199003402948'];
    if (!saved || !activeNics.includes(saved)) {
      localStorage.setItem('current_user_nic', '197204509123');
      return '197204509123';
    }
    return saved;
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

  const personas = [
    { nic: '197204509123', name: 'W.M. Sugathadasa (Owner & Driver)', role: 'Citizen' },
    { nic: '198503402948', name: 'Arjun Ranaweera (Driver/Owner)', role: 'Citizen' },
    { nic: '199003402948', name: 'K.A. Don Perera (Driver)', role: 'Citizen' }
  ];

  useEffect(() => {
    loadData();
    // Poll updates every 8 seconds to keep notification & access tables synced without backend overload
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [currentNic]);

  const loadData = async () => {
    try {
      const citizen = api.getCitizen(currentNic);
      setCurrentUser(citizen);
    } catch (err) {
      console.warn("Failed to load citizen profile:", err.message);
    }

    try {
      const ownedList = await api.getVehiclesOwned(currentNic);
      setVehicles(ownedList || []);
    } catch (err) {
      console.warn("Failed to load owned vehicles:", err.message);
    }

    try {
      const invList = await api.getPendingInvitations(currentNic);
      setIncomingInvitations(invList || []);
    } catch (err) {
      console.warn("Failed to load invitations:", err.message);
    }

    try {
      const notifList = await api.getMyNotifications(currentNic);
      setNotifications(notifList || []);
    } catch (err) {
      console.warn("Failed to load notifications:", err.message);
    }

    try {
      const authVehList = await api.getVehiclesAuthorizedToDrive(currentNic);
      setAuthorizedVehicles(authVehList || []);
    } catch (err) {
      console.warn("Failed to load authorized vehicles:", err.message);
    }
  };

  const handlePrevVehicle = () => {
    setActiveVehicleIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, vehicles.length - 1)));
  };

  const handleNextVehicle = () => {
    setActiveVehicleIndex((prev) => (prev < vehicles.length - 1 ? prev + 1 : 0));
  };

  const handlePersonaChange = (e) => {
    const nextNic = e.target.value;
    setCurrentNic(nextNic);
    setActiveVehicleIndex(0);
    localStorage.setItem('current_user_nic', nextNic);
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

  return (
    <div className="grant-screen">
      <div className="vehicles-container">

        {/* Dashboard Header */}
        <div className="grant-header">
          <span className="material-icons grant-icon">verified</span>
          <h1 className="grant-title">Digital Lanka — Vehicle & Driver Registry</h1>
          <p className="grant-subtitle">
            Integrated Government Services — DMT Registry, Law Enforcement & Citizen Authorizations
          </p>

          {/* Navigation Bar Tabs: Citizen Portal vs Officer Dashboard */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
            <button
              onClick={() => setActiveTab('CITIZEN')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '30px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                border: activeTab === 'CITIZEN' ? '2px solid var(--c-primary)' : '1px solid #cbd5e1',
                background: activeTab === 'CITIZEN' ? 'var(--c-primary)' : '#ffffff',
                color: activeTab === 'CITIZEN' ? '#ffffff' : '#334155',
                boxShadow: activeTab === 'CITIZEN' ? '0 4px 14px rgba(0, 35, 102, 0.25)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <span className="material-icons" style={{ fontSize: '20px' }}>account_circle</span>
              Citizen Portal
            </button>

            <button
              onClick={() => setActiveTab('OFFICER')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '30px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                border: activeTab === 'OFFICER' ? '2px solid #0f172a' : '1px solid #cbd5e1',
                background: activeTab === 'OFFICER' ? '#0f172a' : '#ffffff',
                color: activeTab === 'OFFICER' ? '#ffffff' : '#334155',
                boxShadow: activeTab === 'OFFICER' ? '0 4px 14px rgba(15, 23, 42, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <span className="material-icons" style={{ fontSize: '20px', color: activeTab === 'OFFICER' ? '#60a5fa' : 'inherit' }}>local_police</span>
              Officer Dashboard
            </button>
          </div>
        </div>

        {/* Tab 1: Citizen Portal */}
        {activeTab === 'CITIZEN' && (
          <div className="animate-fade-in">
            {/* Persona Switcher Bar Component */}
            <PersonaSwitcherBar
              currentNic={currentNic}
              handlePersonaChange={handlePersonaChange}
              personas={personas}
            />

            {/* Main Two-Column Layout */}
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }}>
              
              {/* Left Column: Vehicle Carousel & Shared Vehicles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* Reusable Vehicle Carousel Component */}
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

                {/* Reusable Shared Vehicles Component */}
                <SharedVehiclesList
                  authorizedVehicles={authorizedVehicles}
                />

              </div>

              {/* Right Column: Citizen Profile & Inbox */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* Reusable Citizen Profile Component */}
                <CitizenProfileCard
                  currentUser={currentUser}
                />

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
        )}

        {/* Tab 2: Standalone Officer Dashboard Component */}
        {activeTab === 'OFFICER' && (
          <OfficerDashboard
            currentNic={currentNic}
            loadData={loadData}
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

      </div>
    </div>
  );
}

export default App;
