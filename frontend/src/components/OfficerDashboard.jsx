import React, { useState, useEffect, useRef } from 'react';
import * as api from '../services/api';
import CitizenProfileCard from './CitizenProfileCard';

/**
 * OfficerDashboard — Roadside Law Enforcement & Citation Panel.
 * Features 5-minute time-locked privacy session, ANPR plate search,
 * violation checklist, fine calculator, revenue/insurance modals, roadside seizure controls,
 * and the Issued Citations History Register for the officer.
 */
export default function OfficerDashboard({ currentNic, loadData, onSwitchToCitizen }) {
  const [plateNo, setPlateNo] = useState('');
  const [dlNo, setDlNo] = useState('');
  const [plateImage, setPlateImage] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [violations, setViolations] = useState([]);
  const [citationMsg, setCitationMsg] = useState('');
  const [gps, setGps] = useState(null);
  const [gpsFetched, setGpsFetched] = useState(false);
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [violationSearch, setViolationSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [citationDetails, setCitationDetails] = useState(null);
  const [shiftEnded, setShiftEnded] = useState(false);
  const [issuedCitations, setIssuedCitations] = useState([]);

  const timerRef = useRef(null);
  const endShiftTimerRef = useRef(null);

  const refreshIssuedCitations = () => {
    try {
      const list = api.getCitationsForOfficer(currentNic);
      setIssuedCitations(list);
    } catch (e) {
      console.error("Failed to load officer citations", e);
    }
  };

  useEffect(() => {
    refreshIssuedCitations();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (endShiftTimerRef.current) clearTimeout(endShiftTimerRef.current);
    };
  }, [currentNic]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGps(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
          setGpsFetched(true);
        },
        (err) => {
          console.warn("GPS failed", err);
          setGps("6.9271, 79.8612 (Colombo)");
          setGpsFetched(true);
        },
        { timeout: 5000 }
      );
    } else {
      setGps("6.9271, 79.8612 (Colombo)");
      setGpsFetched(true);
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setCitationMsg('');
    try {
      const result = await api.queryCompliance(plateNo.trim(), dlNo.trim(), currentNic);
      const citizenData = api.getCitizenProfile(dlNo.trim() || result.ownerNic);
      
      setData({
        driverNic: dlNo.trim() || result.ownerNic,
        driverName: citizenData.fullName || 'REGISTERED CITIZEN',
        bloodGroup: citizenData.bloodGroup || 'O+',
        plateNo: plateNo.toUpperCase(),
        insuranceStatus: 'VALID',
        revenueStatus: 'VALID',
        status: result.vehicleStatus || 'ACTIVE',
        validOperators: 'A, B, C1'
      });

      setSessionActive(true);
      setTimeLeft(300);
      
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            clearPrivacyData();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Search failed');
    }
  };

  const clearPrivacyData = () => {
    setSessionActive(false);
    setData(null);
    setCitationMsg('Session expired. Data cleared for privacy.');
  };

  const handleCitation = async () => {
    if (violations.length === 0) {
      alert('Please select at least one violation.');
      return;
    }
    const violationString = violations.map(vId => availableViolations.find(v => v.id === vId)?.label).join(', ');
    try {
      const newCit = api.issueCitation(
        data.plateNo,
        data.driverNic,
        violationString,
        gps || "Colombo Fort Checkpoint",
        violations.reduce((sum, vId) => {
          const fineVal = availableViolations.find(v => v.id === vId)?.fine;
          return sum + (fineVal === 'Court Fine' ? 0 : parseInt(fineVal || '0', 10));
        }, 0),
        "INSP. S. JAYASURIYA",
        "POL-88219",
        currentNic
      );

      setCitationDetails({
        msg: `Citation Ref: ${newCit.referenceNumber} successfully issued!`,
        gps,
        violationType: violationString,
        timestamp: new Date().toLocaleString()
      });
      setShowCitationModal(true);
      refreshIssuedCitations();
    } catch (err) {
      setCitationMsg(err.message || 'Citation submission failed');
    }
  };

  const handleEndShift = () => {
    if (shiftEnded) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSessionActive(false);
    setData(null);
    setTimeLeft(300);
    setViolations([]);
    setViolationSearch('');
    setCitationDetails(null);
    setCitationMsg('');
    setShiftEnded(true);

    endShiftTimerRef.current = setTimeout(() => {
      if (onSwitchToCitizen) onSwitchToCitizen();
    }, 1600);
  };

  const handleExitSession = () => {
    setSessionActive(false);
    setData(null);
    setTimeLeft(300);
    setViolations([]);
    setViolationSearch('');
    setCitationMsg('✓ Compliance check cleared — returned to officer dashboard without issuing citation.');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const availableViolations = [
    { id: 1, label: 'RECKLESS/DANGEROUS DRIVING TWO WHEELER', fine: '1000' },
    { id: 2, label: 'OVER SPEEDING', fine: '2000' },
    { id: 3, label: 'DEFECTIVE REGISTRATION NO PLATE', fine: '500' },
    { id: 4, label: 'WRONG PARKING', fine: '1000' },
    { id: 5, label: 'WITHOUT DRIVING LICENSE', fine: '1000' },
    { id: 6, label: 'JUMPING TRAFFIC SIGNAL', fine: '500' },
    { id: 7, label: 'USING MOBILE PHONE WHILE DRIVING', fine: '1000' },
    { id: 8, label: 'NOT WEARING SEAT BELT', fine: '500' },
    { id: 9, label: 'RIDING WITHOUT HELMET', fine: '500' },
    { id: 10, label: 'WITHOUT INSURANCE', fine: '2000' },
    { id: 11, label: 'EXPIRED REVENUE LICENSE', fine: '1500' },
    { id: 12, label: 'DRIVING UNDER INFLUENCE (DUI)', fine: 'Court Fine' }
  ];

  const handleAddViolation = (id) => {
    if (id && !violations.includes(id)) {
      setViolations([...violations, id]);
    }
  };

  const handleRemoveViolation = (id) => {
    setViolations(violations.filter(v => v !== id));
  };

  return (
    <div className="officer-dashboard-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Officer Command Banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', padding: '24px 32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-icons" style={{ fontSize: '32px', color: '#60a5fa' }}>local_police</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#ffffff' }}>
                Law Enforcement Command Terminal
              </h2>
              <span style={{ background: '#22c55e', color: '#ffffff', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>
                LIVE NETWORK
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
              Officer: <strong>Insp. S. Jayasuriya (Batch #POL-88219)</strong> | Western Province Traffic Division
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleEndShift}
            disabled={shiftEnded}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '700', borderRadius: '8px', background: '#dc2626', color: '#ffffff' }}
          >
            {shiftEnded ? 'Ending Shift…' : 'End Shift'}
          </button>
        </div>
      </div>

      {/* End Shift Toast */}
      {shiftEnded && (
        <div style={{ padding: '14px 20px', background: '#0f172a', color: '#ffffff', borderRadius: '12px', borderLeft: '4px solid #22c55e', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="material-icons" style={{ color: '#22c55e', fontSize: '24px' }}>check_circle</span>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#4ade80', textTransform: 'uppercase' }}>✓ SHIFT ENDED</div>
            <div style={{ fontSize: '13px', fontWeight: '600' }}>Enforcement session cleared. Returning to Citizen Portal…</div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {citationMsg && (
        <div style={{ padding: '14px 20px', background: '#0f172a', color: '#ffffff', borderRadius: '12px', borderLeft: '4px solid #ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="material-icons" style={{ color: '#ef4444', fontSize: '24px' }}>warning</span>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#fca5a5', textTransform: 'uppercase' }}>ENFORCEMENT ACTION</div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>{citationMsg}</div>
            </div>
          </div>
          <button onClick={() => setCitationMsg('')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <span className="material-icons" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>
      )}

      {/* Search Panel */}
      {!sessionActive && (
        <div className="glass-card" style={{ padding: '28px', borderRadius: '16px', background: 'var(--c-card-bg, #ffffff)', border: '1px solid var(--c-card-border, #cbd5e1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--c-card-text, #0f172a)', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="material-icons" style={{ color: 'var(--c-primary)' }}>search</span>
            ANPR Roadside Search & Compliance Inspection
          </h2>

          <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'end' }}>
            <div>
              <label className="form-label" style={{ marginBottom: '6px', fontSize: '12px' }}>Vehicle Plate Number *</label>
              <input 
                type="text" 
                className="form-input"
                required
                value={plateNo}
                onChange={(e) => setPlateNo(e.target.value.toUpperCase())}
                placeholder="e.g. WP CAD-1234"
              />
            </div>

            <div>
              <label className="form-label" style={{ marginBottom: '6px', fontSize: '12px' }}>Driver NIC / DL Number *</label>
              <input 
                type="text" 
                className="form-input"
                required
                value={dlNo}
                onChange={(e) => setDlNo(e.target.value.toUpperCase())}
                placeholder="e.g. 197204509123"
              />
            </div>

            <div>
              <label className="form-label" style={{ marginBottom: '6px', fontSize: '12px' }}>ANPR Evidence Photo</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setPlateImage(e.target.files[0])}
                className="form-input"
                style={{ padding: '8px' }}
              />
            </div>

            <div style={{ gridColumn: 'span 3', marginTop: '8px' }}>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '14px', fontWeight: '800' }}>
                <span className="material-icons" style={{ fontSize: '20px' }}>search</span>
                EXECUTE COMPLIANCE SEARCH
              </button>
            </div>
          </form>

          {error && (
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
              {error}
            </div>
          )}
        </div>
      )}

      {/* Time-Locked Privacy Session Active */}
      {sessionActive && data && (
        <div className="glass-card animate-fade-in" style={{ padding: '0', overflow: 'hidden', borderRadius: '16px', border: '2px solid #dc2626', background: 'var(--c-card-bg, #ffffff)' }}>
          
          {/* Privacy Bar */}
          <div style={{ background: '#dc2626', color: '#ffffff', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '15px' }}>
              <span className="material-icons" style={{ fontSize: '20px' }}>privacy_tip</span>
              TIME-LOCKED PRIVACY SESSION ACTIVE (5 MIN LIMIT)
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 16px', borderRadius: '8px', fontFamily: 'monospace', fontWeight: '900', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-icons" style={{ fontSize: '20px' }}>timer</span>
                {formatTime(timeLeft)}
              </div>

              <button 
                onClick={handleExitSession}
                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#ffffff', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span className="material-icons" style={{ fontSize: '18px' }}>logout</span>
                EXIT SESSION
              </button>
            </div>
          </div>

          {/* Session Body */}
          <div style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
            
            {/* Left: Driver License & Vehicle Compliance Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: 'var(--c-card-text, #0f172a)', borderBottom: '2px solid var(--c-card-border, #cbd5e1)', paddingBottom: '8px' }}>
                Driver License & Identification
              </h3>

              <div style={{ width: '100%', maxWidth: '540px' }}>
                <CitizenProfileCard currentUser={{
                  nic: data.driverNic,
                  fullName: data.driverName,
                  dateOfBirth: '1972-06-15',
                  bloodGroup: data.bloodGroup,
                  donor: true,
                  address: 'No. 45, Flower Road, Colombo 07',
                  vehicleClasses: [
                    { classCode: 'A1', description: 'Light Motor Cycles', issuedDate: '1995-04-10', expiryDate: '2032-06-15' },
                    { classCode: 'A', description: 'Motor Cycles', issuedDate: '1995-04-10', expiryDate: '2032-06-15' },
                    { classCode: 'B', description: 'Dual Purpose Vehicles', issuedDate: '1995-04-10', expiryDate: '2032-06-15' }
                  ]
                }} />
              </div>

              <h3 style={{ margin: '12px 0 0 0', fontSize: '16px', fontWeight: '800', color: 'var(--c-card-text, #0f172a)', borderBottom: '2px solid var(--c-card-border, #cbd5e1)', paddingBottom: '8px' }}>
                Compliance Markers
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ padding: '14px', borderRadius: '10px', background: data.insuranceStatus === 'VALID' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)', borderLeft: `4px solid ${data.insuranceStatus === 'VALID' ? '#22c55e' : '#ef4444'}` }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--c-card-subtext)', textTransform: 'uppercase' }}>INSURANCE STATUS</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '900', color: data.insuranceStatus === 'VALID' ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-icons" style={{ fontSize: '20px' }}>{data.insuranceStatus === 'VALID' ? 'check_circle' : 'warning'}</span>
                    {data.insuranceStatus}
                  </p>
                </div>

                <div style={{ padding: '14px', borderRadius: '10px', background: data.revenueStatus === 'VALID' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)', borderLeft: `4px solid ${data.revenueStatus === 'VALID' ? '#22c55e' : '#ef4444'}` }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--c-card-subtext)', textTransform: 'uppercase' }}>REVENUE LICENSE</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '900', color: data.revenueStatus === 'VALID' ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-icons" style={{ fontSize: '20px' }}>{data.revenueStatus === 'VALID' ? 'check_circle' : 'warning'}</span>
                    {data.revenueStatus}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button onClick={() => setShowRevenueModal(true)} className="btn-secondary" style={{ padding: '10px', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
                  <span className="material-icons" style={{ fontSize: '16px' }}>description</span> View Revenue License
                </button>
                <button onClick={() => setShowInsuranceModal(true)} className="btn-secondary" style={{ padding: '10px', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
                  <span className="material-icons" style={{ fontSize: '16px' }}>security</span> View Insurance
                </button>
              </div>
            </div>

            {/* Right: Citation & Violation Checklist */}
            <div style={{ background: 'var(--c-card-sub-bg, #f8fafc)', padding: '24px', borderRadius: '14px', border: '1px solid var(--c-card-border, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: 'var(--c-card-text, #0f172a)' }}>
                Issue Traffic Citation
              </h3>

              {/* Stolen Check */}
              <div>
                {data.status === 'STOLEN' ? (
                  <div style={{ background: '#dc2626', color: '#ffffff', padding: '16px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="material-icons" style={{ fontSize: '32px', color: '#fbbf24' }}>warning</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '900' }}>🚨 REPORTED STOLEN VEHICLE</h4>
                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', opacity: 0.9 }}>Vehicle {data.plateNo} is listed as STOLEN. Perform roadside seizure immediately.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', color: '#15803d', padding: '12px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-icons" style={{ fontSize: '20px', color: '#16a34a' }}>check_circle</span>
                    ✓ CLEAR — Vehicle ({data.plateNo}) not flagged stolen
                  </div>
                )}
              </div>

              {/* Violation Selector */}
              <div style={{ position: 'relative' }}>
                <label className="form-label" style={{ marginBottom: '6px', fontSize: '12px' }}>Select Violations *</label>
                <input 
                  type="text"
                  value={violationSearch}
                  onChange={(e) => { setViolationSearch(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  placeholder="Search offences..."
                  className="form-input"
                />

                {showDropdown && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 30, maxHeight: '200px', overflowY: 'auto', background: '#ffffff', border: '1px solid var(--c-card-border, #cbd5e1)', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                    {availableViolations
                      .filter(v => v.label.toLowerCase().includes(violationSearch.toLowerCase()))
                      .map(v => (
                        <div 
                          key={v.id} 
                          onClick={() => { handleAddViolation(v.id); setViolationSearch(''); setShowDropdown(false); }}
                          style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>{v.id}. {v.label}</span>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: '#dc2626', background: 'rgba(220,38,38,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                            {v.fine === 'Court Fine' ? v.fine : `Rs ${v.fine}`}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Selected Violations List */}
              {violations.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid var(--c-card-border, #cbd5e1)' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--c-card-subtext)', textTransform: 'uppercase' }}>SELECTED OFFENCES</span>
                  {violations.map(vId => {
                    const v = availableViolations.find(av => av.id === vId);
                    return (
                      <div key={vId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div>
                          <span style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', display: 'block' }}>OFFENSE #{v?.id}</span>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>{v?.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '900', color: '#dc2626' }}>
                            {v?.fine === 'Court Fine' ? 'Court Fine' : `Rs ${v?.fine}`}
                          </span>
                          <button onClick={() => handleRemoveViolation(vId)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                            <span className="material-icons" style={{ fontSize: '16px' }}>close</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #0f172a', paddingTop: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a' }}>TOTAL FINE AMOUNT:</span>
                    <span style={{ fontSize: '16px', fontWeight: '900', color: '#dc2626' }}>
                      {violations.some(vId => availableViolations.find(av => av.id === vId)?.fine === 'Court Fine') 
                        ? 'Court Fine Required'
                        : `Rs ${violations.reduce((sum, vId) => sum + parseInt(availableViolations.find(av => av.id === vId)?.fine || '0', 10), 0).toLocaleString()}`
                      }
                    </span>
                  </div>
                </div>
              )}

              {/* GPS Info */}
              <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-icons" style={{ fontSize: '16px', color: 'var(--c-primary)' }}>location_on</span>
                <span>GPS Lock: <strong>{gps || 'Acquiring location...'}</strong></span>
              </div>

              {/* Submit Citation */}
              <button 
                onClick={handleCitation}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '14px', fontWeight: '800', background: '#dc2626', color: '#ffffff' }}
              >
                <span className="material-icons" style={{ fontSize: '20px' }}>gavel</span>
                SUBMIT CITATION & LOCK DATA
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── OFFICER'S ISSUED CITATIONS REGISTER ── */}
      <div className="glass-card" style={{ padding: '24px 28px', borderRadius: '16px', background: 'var(--c-card-bg, #ffffff)', border: '1px solid var(--c-card-border, #cbd5e1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="material-icons" style={{ color: 'var(--c-primary)', fontSize: '24px' }}>assignment_turned_in</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: 'var(--c-card-text, #0f172a)' }}>
                Officer Issued Citations & Violations Log
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: 'var(--c-card-subtext, #64748b)' }}>
                Registered roadside traffic citations issued by Insp. S. Jayasuriya
              </p>
            </div>
          </div>

          <span style={{ background: 'rgba(59, 130, 246, 0.12)', color: 'var(--c-primary)', fontSize: '12px', fontWeight: '800', padding: '3px 10px', borderRadius: '12px' }}>
            {issuedCitations.length} TOTAL ISSUED
          </span>
        </div>

        {issuedCitations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px', background: 'var(--c-card-sub-bg, #f8fafc)', borderRadius: '12px', border: '1px dashed var(--c-card-border, #cbd5e1)' }}>
            <span className="material-icons" style={{ fontSize: '32px', opacity: 0.3 }}>playlist_add_check</span>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', fontWeight: '600', color: 'var(--c-card-subtext)' }}>No citations issued during this shift.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {issuedCitations.map(cit => (
              <div key={cit.id || cit.referenceNumber} style={{ padding: '14px 18px', background: 'var(--c-card-sub-bg, #f8fafc)', borderRadius: '10px', border: '1px solid var(--c-card-border, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '900', color: '#dc2626', fontFamily: 'monospace' }}>{cit.referenceNumber}</span>
                    <span style={{ fontSize: '10.5px', fontWeight: '800', color: cit.status === 'PAID' ? '#16a34a' : '#dc2626', background: cit.status === 'PAID' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', padding: '2px 8px', borderRadius: '4px' }}>
                      {cit.status}
                    </span>
                  </div>
                  <h4 style={{ margin: '4px 0 2px 0', fontSize: '14px', fontWeight: '800', color: 'var(--c-card-text, #0f172a)' }}>{cit.nature}</h4>
                  <span style={{ fontSize: '11.5px', color: 'var(--c-card-subtext, #64748b)' }}>
                    Driver NIC: <strong>{cit.driverNic || '197204509123'}</strong> • Plate: <strong>{cit.plateNumber || 'WP CAD-1234'}</strong> • Location: {cit.place}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '14px', fontWeight: '900', color: '#dc2626' }}>Rs {cit.amount?.toLocaleString()}</span>
                  <div style={{ fontSize: '11px', color: 'var(--c-card-subtext)', marginTop: '2px' }}>{cit.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Citation Details Confirmation Modal */}
      {showCitationModal && citationDetails && (
        <div className="modal-overlay">
          <div className="glass-card modal-card animate-fade-in" style={{ maxWidth: '480px', padding: '28px', textAlign: 'center' }}>
            <span className="material-icons" style={{ fontSize: '56px', color: '#22c55e' }}>check_circle</span>
            <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: '12px 0 6px 0' }}>CITATION ISSUED</h2>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '20px' }}>{citationDetails.msg}</p>
            
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'left', fontSize: '12.5px', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 4px 0' }}><strong>Violation:</strong> {citationDetails.violationType}</p>
              <p style={{ margin: '0 0 4px 0' }}><strong>GPS Lock:</strong> {citationDetails.gps}</p>
              <p style={{ margin: 0 }}><strong>Timestamp:</strong> {citationDetails.timestamp}</p>
            </div>

            <button 
              onClick={() => { setShowCitationModal(false); clearPrivacyData(); }}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontWeight: '800' }}
            >
              ACKNOWLEDGE & CLOSE
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
