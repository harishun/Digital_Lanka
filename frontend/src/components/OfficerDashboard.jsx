import React, { useState, useEffect, useRef } from 'react';
import * as api from '../services/api';

function OfficerDashboard({ currentNic, currentUser }) {
  const [plateNo, setPlateNo] = useState('');
  const [dlNo, setDlNo] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes privacy lock
  const timerRef = useRef(null);

  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [violationSearch, setViolationSearch] = useState('');
  
  const [citationMsg, setCitationMsg] = useState('');
  const [issuedCitations, setIssuedCitations] = useState([]);

  // GPS State
  const [gps, setGps] = useState(null);
  const [gpsFetched, setGpsFetched] = useState(false);

  // Citation Types (Dynamic)
  const [availableViolations, setAvailableViolations] = useState([]);
  const [violations, setViolations] = useState([]);

  // Stolen Vehicles State
  const [stolenVehicles, setStolenVehicles] = useState([]);
  const [stolenMsg, setStolenMsg] = useState('');

  const fetchStolenVehicles = async () => {
    try {
      const data = await api.getStolenVehicles(currentNic);
      setStolenVehicles(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStolenVehicles();
  }, [currentNic]);

  const handleClearStolen = async (vehicleId) => {
    try {
      await api.markVehicleRecovered(vehicleId, "Recovered by officer", currentNic);
      setStolenMsg(`Successfully cleared stolen status for ${vehicleId}`);
      fetchStolenVehicles();
    } catch (e) {
      setStolenMsg(`Failed to clear stolen status: ${e.message}`);
    }
  };

  useEffect(() => {
    // Load citation types from localStorage (fallback to defaults if not set)
    try {
      const initialTypes = [
        { id: 1, label: 'Failure to obey traffic light', fine: '1000' },
        { id: 2, label: 'Speeding (Exceeding limit by 20km/h)', fine: '3000' },
        { id: 3, label: 'Driving without a valid insurance', fine: '25000' },
        { id: 4, label: 'Failure to wear seat belt', fine: '500' },
        { id: 5, label: 'Using mobile phone while driving', fine: '2000' },
        { id: 6, label: 'Driving under the influence (DUI)', fine: 'Court Fine' }
      ];
      const stored = JSON.parse(localStorage.getItem('dl_citation_types') || 'null');
      if (stored) {
        setAvailableViolations(stored);
      } else {
        setAvailableViolations(initialTypes);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

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
      const citizenData = await api.getCitizenProfile(dlNo.trim() || result.ownerNic);
      
      setData({
        citizen: citizenData,
        plateNo: plateNo.toUpperCase(),
        hasStolenAlert: false
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
      setError(err.message || 'No record found or access denied. Ensure plate or DL is correct.');
    }
  };

  const clearPrivacyData = () => {
    setSessionActive(false);
    setData(null);
    setPlateNo('');
    setDlNo('');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleExitSession = () => {
    clearPrivacyData();
    setViolations([]);
    setViolationSearch('');
    setCitationMsg('✓ Compliance check cleared — returned to officer dashboard without issuing citation.');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleAddViolation = (id) => {
    if (id && !violations.includes(id)) {
      setViolations([...violations, id]);
    }
  };

  const handleRemoveViolation = (id) => {
    setViolations(violations.filter(v => v !== id));
  };

  const handleIssueCitation = async () => {
    if (violations.length === 0) return;
    try {
      const violationString = violations.map(vId => availableViolations.find(v => v.id === vId)?.label).join(', ');
      
      let totalFine = 0;
      let hasCourtFine = false;
      violations.forEach(vId => {
        const fineVal = availableViolations.find(v => v.id === vId)?.fine;
        if (fineVal === 'Court Fine') {
          hasCourtFine = true;
        } else {
          totalFine += parseInt(fineVal || '0', 10);
        }
      });
      const fineAmountStr = hasCourtFine ? `Rs ${totalFine} + Court Summons` : `Rs ${totalFine}`;

      await api.issueCitation(
        dlNo.trim() || data.citizen.nic,
        plateNo.toUpperCase(),
        violationString,
        fineAmountStr,
        gps || "Colombo Fort Checkpoint",
        currentNic
      );

      const newCit = {
        id: `CIT-${Math.floor(Math.random() * 1000000)}`,
        plateNo: plateNo.toUpperCase(),
        driverNic: dlNo.trim() || data.citizen.nic,
        violations: violationString,
        totalFine: fineAmountStr,
        timestamp: new Date().toISOString(),
        gps: gps || "Colombo Fort Checkpoint"
      };

      setIssuedCitations([newCit, ...issuedCitations]);
      setCitationMsg(`CRITICAL ALERT: Traffic citation issued successfully for ${plateNo.toUpperCase()}.`);
      
      clearPrivacyData();
      setViolations([]);
    } catch (err) {
      setCitationMsg(`ERROR: Failed to issue citation - ${err.message}`);
    }
  };

  return (
    <div className="officer-dashboard-container animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
      
      {/* LEFT COLUMN: Profile & Search/Compliance */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Officer Profile Card */}
        <div className="glass-card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-icons" style={{ fontSize: '36px', color: '#38bdf8' }}>local_police</span>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Active Duty Officer</div>
              <h2 style={{ margin: '2px 0 4px 0', fontSize: '18px', fontWeight: '800' }}>{currentUser?.fullName || 'OFFICER'}</h2>
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>Batch No: {currentUser?.batchNumber || 'POL-88219'} | Rank: {currentUser?.rank || 'Inspector'}</div>
            </div>
          </div>
        </div>

        {/* Search Panel (When Not Active) */}
        {!sessionActive && (
          <div className="glass-card" style={{ padding: '28px', borderRadius: '16px', background: 'var(--c-card-bg, #ffffff)', border: '1px solid var(--c-card-border, #cbd5e1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--c-card-text, #0f172a)', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-icons" style={{ color: 'var(--c-primary)' }}>search</span>
              Roadside Compliance Inspection
            </h2>

            <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Vehicle Plate Number *</label>
                <input type="text" className="form-input" required value={plateNo} onChange={(e) => setPlateNo(e.target.value.toUpperCase())} placeholder="e.g. WP CAD-1234" />
              </div>
              <div>
                <label className="form-label">Driver NIC / DL Number *</label>
                <input type="text" className="form-input" required value={dlNo} onChange={(e) => setDlNo(e.target.value.toUpperCase())} placeholder="e.g. 197204509123" />
              </div>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-icons" style={{ fontSize: '16px' }}>camera_alt</span> ANPR Evidence Photo (Optional)
                </label>
                <div style={{ padding: '24px', border: '2px dashed var(--c-card-border, #cbd5e1)', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', background: 'var(--c-card-sub-bg, #f8fafc)' }}>
                  <span className="material-icons" style={{ color: 'var(--c-card-subtext, #94a3b8)', fontSize: '32px', marginBottom: '8px' }}>add_a_photo</span>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--c-card-subtext, #64748b)' }}>Click to capture or upload plate image</div>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '14px', fontWeight: '800', marginTop: '8px' }}>
                INITIATE INSPECTION
              </button>
            </form>

            {error && (
              <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', borderLeft: '3px solid #ef4444', fontSize: '13px', fontWeight: '600' }}>
                {error}
              </div>
            )}
          </div>
        )}

        {/* Active Privacy Session (When Active) */}
        {sessionActive && data && (
          <div className="glass-card" style={{ border: '2px solid #ef4444', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ background: '#ef4444', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="material-icons blink">privacy_tip</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>ACTIVE COMPLIANCE INSPECTION</h3>
                  <div style={{ fontSize: '12px', fontWeight: '600', opacity: 0.9 }}>Privacy Bypass Granted</div>
                </div>
              </div>
              <div style={{ background: '#ffffff', color: '#ef4444', padding: '6px 14px', borderRadius: '20px', fontWeight: '900', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-icons" style={{ fontSize: '18px' }}>timer</span>
                {formatTime(timeLeft)}
              </div>
            </div>

            <div style={{ padding: '24px', background: 'var(--c-card-bg, #ffffff)' }}>
              
              {/* Driver Section & Location Map */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--c-card-border)' }}>
                {/* Driver Info */}
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ width: '90px', height: '110px', background: '#cbd5e1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #94a3b8', flexShrink: 0 }}>
                    <img src={`https://i.pravatar.cc/150?u=${data.citizen.nic}`} alt="Driver" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--c-card-subtext)', textTransform: 'uppercase' }}>Verified Driver Identity</div>
                    <h3 style={{ margin: '4px 0 6px 0', fontSize: '20px', fontWeight: '800', color: 'var(--c-card-text)' }}>{data.citizen.fullName}</h3>
                    <div style={{ fontSize: '13px', color: 'var(--c-card-text)', marginBottom: '4px' }}><strong>NIC / DL:</strong> {data.citizen.nic}</div>
                    <div style={{ fontSize: '13px', color: 'var(--c-card-text)', marginBottom: '8px' }}><strong>Blood Type:</strong> <span style={{ color: '#ef4444', fontWeight: '700' }}>{data.citizen.bloodGroup}</span></div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ background: '#16a34a', color: '#ffffff', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>Valid DL</span>
                      {data.hasStolenAlert && (
                        <span style={{ background: '#dc2626', color: '#ffffff', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-icons" style={{ fontSize: '12px' }}>warning</span> STOLEN VEHICLE
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location Map embedded iframe */}
                <div style={{ width: '100%', height: '100%', minHeight: '130px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--c-card-border)', background: '#e2e8f0', position: 'relative' }}>
                  <iframe
                    title="Officer Location Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(gps || 'Colombo, Sri Lanka')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    allowFullScreen
                  />
                  {!gpsFetched && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', zIndex: 2 }}>
                      <span className="material-icons" style={{ animation: 'spin 1s linear infinite' }}>sync</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <button className="btn-secondary" onClick={() => setShowInsuranceModal(true)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px' }}>
                  <span className="material-icons" style={{ fontSize: '18px' }}>health_and_safety</span> Inspect Insurance
                </button>
                <button onClick={handleExitSession} className="btn-secondary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px' }}>
                  <span className="material-icons" style={{ fontSize: '18px' }}>exit_to_app</span> Clear & Exit
                </button>
              </div>

              {/* Issue Citation Form */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-icons" style={{ color: '#ef4444' }}>gavel</span> Issue Traffic Citation
                </h4>

                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">Add Violation Type</label>
                  <div style={{ position: 'relative' }}>
                    <div onClick={() => setShowDropdown(!showDropdown)} style={{ padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>Select violation to add...</span>
                      <span className="material-icons" style={{ fontSize: '18px' }}>arrow_drop_down</span>
                    </div>
                    {showDropdown && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <div style={{ padding: '8px' }}>
                          <input type="text" placeholder="Search..." value={violationSearch} onChange={(e) => setViolationSearch(e.target.value)} style={{ width: '100%', padding: '6px', fontSize: '12px', boxSizing: 'border-box', border: '1px solid #e2e8f0', borderRadius: '4px', marginBottom: '8px' }} onClick={(e) => e.stopPropagation()} />
                          {availableViolations.filter(v => v.label.toLowerCase().includes(violationSearch.toLowerCase())).map(v => (
                            <div key={v.id} onClick={() => { handleAddViolation(v.id); setShowDropdown(false); setViolationSearch(''); }} style={{ padding: '8px', fontSize: '12.5px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>
                              <strong>{v.label}</strong> (Rs {v.fine})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {violations.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#475569' }}>Selected Violations:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {violations.map(vId => {
                        const v = availableViolations.find(av => av.id === vId);
                        return (
                          <div key={vId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '6px' }}>
                            <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#0f172a' }}>{v.label}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#dc2626' }}>Rs {v.fine}</span>
                              <button onClick={() => handleRemoveViolation(vId)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, display: 'flex' }}>
                                <span className="material-icons" style={{ fontSize: '18px' }}>remove_circle</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button onClick={handleIssueCitation} disabled={violations.length === 0} className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '13px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <span className="material-icons" style={{ fontSize: '18px' }}>verified</span>
                  ISSUE CITATION & PENALTY
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Issued Citations Register */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--c-card-bg, #ffffff)', border: '1px solid var(--c-card-border, #cbd5e1)' }}>
        <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--c-card-text)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-icons" style={{ color: '#ea580c' }}>history</span>
          Issued Citations Register
        </h3>
        
        {citationMsg && (
          <div style={{ padding: '10px 14px', background: '#0f172a', color: '#ffffff', borderRadius: '8px', borderLeft: '4px solid #ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px' }}>{citationMsg}</span>
            <button onClick={() => setCitationMsg('')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><span className="material-icons" style={{ fontSize: '16px' }}>close</span></button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {issuedCitations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 20px', color: '#64748b' }}>
              <span className="material-icons" style={{ fontSize: '32px', opacity: 0.5, marginBottom: '8px' }}>check_circle_outline</span>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>No citations issued in this session.</div>
            </div>
          ) : (
            issuedCitations.map(cit => (
              <div key={cit.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Ref: {cit.id}</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{cit.plateNo}</div>
                  </div>
                  <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                    {cit.totalFine}
                  </span>
                </div>
                
                <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px', lineHeight: '1.4' }}>
                  <strong>Violations:</strong> {cit.violations}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(cit.timestamp).toLocaleTimeString()}</div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#0f172a' }}>NIC: {cit.driverNic}</div>
                </div>
              </div>
            ))
          )}
        </div>
        </div>

        {/* Stolen Vehicles Register */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--c-card-bg, #ffffff)', border: '1px solid var(--c-card-border, #cbd5e1)' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--c-card-text)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-icons" style={{ color: '#dc2626' }}>local_police</span>
            Active Stolen Vehicles
          </h3>
          
          {stolenMsg && (
            <div style={{ padding: '10px 14px', background: '#0f172a', color: '#ffffff', borderRadius: '8px', borderLeft: '4px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px' }}>{stolenMsg}</span>
              <button onClick={() => setStolenMsg('')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><span className="material-icons" style={{ fontSize: '16px' }}>close</span></button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stolenVehicles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 20px', color: '#64748b' }}>
                <span className="material-icons" style={{ fontSize: '32px', opacity: 0.5, marginBottom: '8px' }}>check_circle_outline</span>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>No active stolen vehicles reported.</div>
              </div>
            ) : (
              stolenVehicles.map(veh => (
                <div key={veh.id} style={{ padding: '16px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '900', color: '#991b1b' }}>{veh.vehicleId}</div>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#b91c1c', marginTop: '2px' }}>Reporter: {veh.reporterNic}</div>
                    </div>
                    <span style={{ background: '#ef4444', color: '#ffffff', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-icons" style={{ fontSize: '14px' }}>warning</span> STOLEN
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '11px', color: '#7f1d1d', marginBottom: '12px' }}>
                    <strong>Reported At:</strong> {new Date(veh.reportedAt).toLocaleString()}
                  </div>
                  
                  <button onClick={() => handleClearStolen(veh.vehicleId)} className="btn-primary" style={{ width: '100%', padding: '10px', fontSize: '12px', display: 'flex', justifyContent: 'center', gap: '6px', background: '#10b981', color: '#fff' }}>
                    <span className="material-icons" style={{ fontSize: '16px' }}>task_alt</span> MARK AS RECOVERED
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Insurance Modal */}
      {showInsuranceModal && data && (
        <div className="modal-overlay">
          <div className="glass-card modal-card animate-fade-in" style={{ maxWidth: '400px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-icons" style={{ color: '#16a34a' }}>verified</span>
                Insurance Verification
              </h3>
              <button onClick={() => setShowInsuranceModal(false)} className="btn-icon">
                <span className="material-icons">close</span>
              </button>
            </div>
            
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Status</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <span className="material-icons" style={{ fontSize: '18px' }}>check_circle</span> VALID ACTIVE POLICY
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Provider</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>Sri Lanka Insurance Corp</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Expiry Date</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>2025-10-15</div>
            </div>
            
            <button className="btn-primary" onClick={() => setShowInsuranceModal(false)} style={{ width: '100%', justifyContent: 'center' }}>CLOSE</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default OfficerDashboard;
