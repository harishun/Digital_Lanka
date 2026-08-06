import React, { useState, useEffect } from 'react';
import api from './api';
import { getCurrentNic } from './identity';
import * as registryApi from './services/api';
import './App.css';
import { User, FileText, Upload, CheckCircle, Clock, Shield, Car, Bell } from 'lucide-react';

// Modular Reusable Components from Harishun & Achchuthan
import VehicleCarousel from './components/VehicleCarousel';
import SharedVehiclesList from './components/SharedVehiclesList';
import CitizenProfileCard from './components/CitizenProfileCard';
import NotificationsInbox from './components/NotificationsInbox';
import DocumentDetailsModal from './components/DocumentDetailsModal';
import AccessControlModal from './components/AccessControlModal';
import VehicleRegistrationForm from './components/VehicleRegistrationForm';

function CitizenPortal({ isOfficer, onSwitchToOfficer }) {
  const [portalTab, setPortalTab] = useState('REGISTRY'); // 'REGISTRY' (Harishun & Achchuthan) | 'CITATIONS' (Ahkash)
  
  // Ahkash Citations State
  const [citations, setCitations] = useState([]);
  const [receiptFile, setReceiptFile] = useState(null);
  const [selectedCitationId, setSelectedCitationId] = useState(null);
  const [msg, setMsg] = useState('');

  // Harishun & Achchuthan Registry State
  const [isRegistrationFormOpen, setIsRegistrationFormOpen] = useState(false);
  // Identity is owned by identity.js and switched from the global persona bar
  // in App.jsx. App remounts this component on change, so this is read once.
  const currentNic = getCurrentNic();
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
  const [expandedDoc, setExpandedDoc] = useState('vrc');

  // Form state
  const [driverNic, setDriverNic] = useState('');
  const [accessType, setAccessType] = useState('PERMANENT');
  const [durationDays, setDurationDays] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchCitations();
    loadRegistryData();
    const interval = setInterval(loadRegistryData, 8000);
    return () => clearInterval(interval);
  }, [currentNic]);

  const fetchCitations = async () => {
    try {
      const res = await api.get('/citations/my');
      setCitations(res.data);
    } catch (err) {
      console.error('Failed to load citations:', err);
    }
  };

  const loadRegistryData = async () => {
    try {
      const citizen = registryApi.getCitizen(currentNic);
      setCurrentUser(citizen);
    } catch (err) {
      console.warn("Failed to load citizen profile:", err.message);
    }

    try {
      const ownedList = await registryApi.getVehiclesOwned(currentNic);
      setVehicles(ownedList || []);
    } catch (err) {
      console.warn("Failed to load owned vehicles:", err.message);
    }

    try {
      const invList = await registryApi.getPendingInvitations(currentNic);
      setIncomingInvitations(invList || []);
    } catch (err) {
      console.warn("Failed to load invitations:", err.message);
    }

    try {
      const notifList = await registryApi.getMyNotifications(currentNic);
      setNotifications(notifList || []);
    } catch (err) {
      console.warn("Failed to load notifications:", err.message);
    }

    try {
      const authVehList = await registryApi.getVehiclesAuthorizedToDrive(currentNic);
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

  const openDocModal = async (vehicle, targetDoc = 'vrc') => {
    setCurrentVehicle(vehicle);
    setExpandedDoc(targetDoc);
    setIsDocModalOpen(true);

    try {
      const docs = await registryApi.getVehicleDocuments(vehicle.id, currentNic);
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
      const authList = await registryApi.getAuthorizationsByVehicle(vehicle.id, currentNic);
      setAuthorizations(authList);
    } catch (err) {
      console.error("Failed to load vehicle authorizations:", err.message);
    }
  };

  const reloadAuthorizations = async (vehicleId) => {
    try {
      const authList = await registryApi.getAuthorizationsByVehicle(vehicleId, currentNic);
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
      await registryApi.reportVehicleStolen(vehicleId, currentNic);
      setIsAccessControlModalOpen(false);
      loadRegistryData();
    } catch (err) {
      alert(`Failed to report vehicle stolen: ${err.message}`);
    }
  };

  const handleReportRetrieval = async (vehicleId) => {
    if (!window.confirm("Confirm this vehicle is back in your possession? This will close your theft report and law enforcement will stop treating it as stolen.")) {
      return;
    }
    try {
      await registryApi.reportVehicleRetrieved(vehicleId, currentNic);
      setIsAccessControlModalOpen(false);
      loadRegistryData();
    } catch (err) {
      alert(`Failed to report vehicle retrieval: ${err.message}`);
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

      await registryApi.inviteDriver(
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
      loadRegistryData();
    } catch (err) {
      setIsError(true);
      setStatusMessage(err.message);
    }
  };

  const handleAcceptInvitation = async (authId) => {
    try {
      await registryApi.respondToInvitation(authId, true, currentNic);
      loadRegistryData();
    } catch (err) {
      alert(`Failed to accept invitation: ${err.message}`);
    }
  };

  const handleDeclineInvitation = async (authId) => {
    try {
      await registryApi.respondToInvitation(authId, false, currentNic);
      loadRegistryData();
    } catch (err) {
      alert(`Failed to decline invitation: ${err.message}`);
    }
  };

  const handleRevokeAccess = async (authId) => {
    try {
      await registryApi.revokeAuthorization(currentVehicle.id, authId, currentNic);
      reloadAuthorizations(currentVehicle.id);
      loadRegistryData();
    } catch (err) {
      alert(`Failed to revoke access: ${err.message}`);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!receiptFile || !selectedCitationId) return;

    const formData = new FormData();
    formData.append('receipt', receiptFile);

    try {
      const res = await api.post(`/citations/${selectedCitationId}/pay`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMsg(res.data);
      setSelectedCitationId(null);
      setReceiptFile(null);
      fetchCitations();
    } catch (err) {
      setMsg(err.response?.data || 'Upload failed');
    }
  };

  return (
    <div className="min-h-screen bg-lightBg font-sans text-gray-800">
      <header className="bg-darkBlue text-white p-4 shadow-md flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <User size={28} className="text-blue-300" />
          <h1 className="text-xl font-bold tracking-wider">CITIZEN PORTAL — DIGITAL LANKA</h1>
        </div>

        {/* Portal Section Switcher Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setPortalTab('REGISTRY')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition flex items-center gap-2 ${
              portalTab === 'REGISTRY'
                ? 'bg-blue-600 text-white shadow-lg border-2 border-blue-400'
                : 'bg-blue-900 text-blue-200 hover:bg-blue-800'
            }`}
          >
            <span>🏛️ Vehicle & Driver Registry</span>
          </button>

          <button
            onClick={() => setPortalTab('CITATIONS')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition flex items-center gap-2 ${
              portalTab === 'CITATIONS'
                ? 'bg-blue-600 text-white shadow-lg border-2 border-blue-400'
                : 'bg-blue-900 text-blue-200 hover:bg-blue-800'
            }`}
          >
            <span>🚨 My Penalty Citations</span>
            {citations.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{citations.length}</span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {isOfficer && (
            <button
              onClick={onSwitchToOfficer}
              className="text-sm bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-lg shadow-md transition flex items-center gap-2 transform active:scale-95"
            >
              <span>👮‍♂️ Officer Dashboard (Penalty Citation)</span>
            </button>
          )}
        </div>
      </header>

      {/* TAB 1: HARISHUN & ACHCHUTHAN VEHICLE & DRIVER REGISTRY */}
      {portalTab === 'REGISTRY' && (
        <div className="max-w-7xl mx-auto mt-6 p-4 animate-fade-in">
          <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px', marginTop: '24px' }}>
            {/* Left Column: Carousel & Shared Vehicles OR Registration Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {isRegistrationFormOpen ? (
                <VehicleRegistrationForm
                  currentNic={currentNic}
                  onClose={() => setIsRegistrationFormOpen(false)}
                  onSuccess={() => {
                    setIsRegistrationFormOpen(false);
                    loadRegistryData();
                  }}
                />
              ) : (
                <>
                  <VehicleCarousel
                    vehicles={vehicles}
                    activeVehicleIndex={activeVehicleIndex}
                    setActiveVehicleIndex={setActiveVehicleIndex}
                    handlePrevVehicle={handlePrevVehicle}
                    handleNextVehicle={handleNextVehicle}
                    openAccessControlModal={openAccessControlModal}
                    openDocModal={openDocModal}
                    handleMarkAsStolen={handleMarkAsStolen}
                    handleReportRetrieval={handleReportRetrieval}
                    isModalOpen={isDocModalOpen || isAccessControlModalOpen}
                    onRegisterClick={() => setIsRegistrationFormOpen(true)}
                  />

                  <SharedVehiclesList authorizedVehicles={authorizedVehicles} />
                </>
              )}
            </div>

            {/* Right Column: Harishun Smart ID Card & Notifications Inbox */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <CitizenProfileCard currentUser={currentUser} />

              <NotificationsInbox
                incomingInvitations={incomingInvitations}
                notifications={notifications}
                currentNic={currentNic}
                handleAcceptInvitation={handleAcceptInvitation}
                handleDeclineInvitation={handleDeclineInvitation}
                loadData={loadRegistryData}
              />
            </div>
          </div>

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
        </div>
      )}

      {/* TAB 2: AHKASH CITATIONS & FINE PAYMENT */}
      {portalTab === 'CITATIONS' && (
        <main className="max-w-5xl mx-auto mt-8 p-4 animate-fade-in">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-darkBlue">
            <FileText size={24} /> My Penalty Citations
          </h2>
          {msg && <p className="text-green-600 mb-4 font-medium bg-green-50 p-3 rounded">{msg}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {citations.map((c) => (
              <div key={c.id} className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-darkBlue">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-gray-700">Ref: {c.referenceNumber}</span>
                  <span
                    className={`px-3 py-1 rounded text-sm font-bold ${
                      c.status === 'PENDING_PAYMENT'
                        ? 'bg-red-100 text-red-700'
                        : c.status === 'VERIFYING'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Violation:</strong> {c.violationType}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Date:</strong> {new Date(c.timestamp).toLocaleString()}
                </p>

                {c.status === 'PENDING_PAYMENT' && (
                  <form onSubmit={handleUpload} className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Upload Payment Receipt</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          setReceiptFile(e.target.files[0]);
                          setSelectedCitationId(c.id);
                        }}
                        className="text-sm border p-1 rounded flex-1"
                        required
                      />
                      <button
                        type="submit"
                        className="bg-darkBlue text-white px-4 py-2 rounded hover:bg-blue-900 transition flex items-center gap-1"
                      >
                        <Upload size={16} /> Submit
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
            {citations.length === 0 && <p className="text-gray-500">You have no penalty citations.</p>}
          </div>
        </main>
      )}

    </div>
  );
}

export default CitizenPortal;

