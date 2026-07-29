import React, { useState } from 'react';
import * as api from '../services/api';

/**
 * OfficerDashboard — Simple Law Enforcement Officer Panel for conducting
 * roadside compliance checks and marking stolen vehicles as retrieved / recovered.
 */
export default function OfficerDashboard({ currentNic, loadData }) {
  const [officerPlate, setOfficerPlate] = useState('');
  const [officerDriverNic, setOfficerDriverNic] = useState('');
  const [complianceResult, setComplianceResult] = useState(null);
  const [officerStatusMessage, setOfficerStatusMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Dedicated Recovery Panel State
  const [recoveryPlateInput, setRecoveryPlateInput] = useState('');
  const [recoveryRemarks, setRecoveryRemarks] = useState('Vehicle intercepted and retrieved during law enforcement patrol check.');
  const [recoveryStatusMsg, setRecoveryStatusMsg] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);

  // Recent Inspection Activity History
  const [inspectionHistory, setInspectionHistory] = useState([]);

  // Quick preset shortcuts for fast testing
  const presets = [
    { label: 'WP LA-9999 (Sugathadasa)', plate: 'WP LA-9999', driverNic: '197204509123' },
    { label: 'WP LA-9999 (Authorized Arjun)', plate: 'WP LA-9999', driverNic: '198503402948' },
    { label: 'WP CAD-1234 (Sugathadasa)', plate: 'WP CAD-1234', driverNic: '197204509123' }
  ];

  const handleRunComplianceCheck = async (e) => {
    if (e) e.preventDefault();
    setOfficerStatusMessage('');
    setComplianceResult(null);
    if (!officerPlate.trim()) return;

    setIsSearching(true);
    try {
      const result = await api.queryCompliance(officerPlate.trim(), officerDriverNic.trim(), currentNic);
      if (result.error) {
        setOfficerStatusMessage(result.error);
      } else {
        setComplianceResult(result);
        const logEntry = {
          id: 'log_' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          plate: result.plateNumber,
          driverNic: officerDriverNic.trim() || 'Not Queried',
          status: result.vehicleStatus,
          allowed: result.allowed,
          alert: result.alert
        };
        setInspectionHistory(prev => [logEntry, ...prev.slice(0, 9)]);
      }
    } catch (err) {
      setOfficerStatusMessage(`Verification error: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMarkVehicleAsRetrieved = async (e) => {
    if (e) e.preventDefault();
    setRecoveryStatusMsg('');
    const targetPlate = recoveryPlateInput.trim() || officerPlate.trim();
    if (!targetPlate) {
      setRecoveryStatusMsg("Please enter or select a vehicle license plate number to mark as retrieved.");
      return;
    }

    setIsRecovering(true);
    try {
      await api.markVehicleRecovered(targetPlate, recoveryRemarks, currentNic);
      setRecoveryStatusMsg(`SUCCESS: Vehicle ${targetPlate} has been officially marked as RETRIEVED / RECOVERED in the Digital Lanka Application Database!`);
      setComplianceResult(null);
      setRecoveryPlateInput('');
      setOfficerPlate('');
      if (loadData) loadData();
    } catch (err) {
      setRecoveryStatusMsg(`Recovery Failed: ${err.message}`);
    } finally {
      setIsRecovering(false);
    }
  };

  const applyPreset = (plate, driverNic) => {
    setOfficerPlate(plate);
    setOfficerDriverNic(driverNic);
    setRecoveryPlateInput(plate);
  };

  return (
    <div className="officer-dashboard-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Officer Command Banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', padding: '24px 32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                Officer: <strong>Insp. S. Jayasuriya (Batch #POL-88219)</strong> | Western Province Traffic Command
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '12px', color: '#cbd5e1' }}>
            <div>Connected Database: <strong style={{ color: '#60a5fa' }}>DMT & Police Registry</strong></div>
            <div style={{ marginTop: '2px', color: '#94a3b8' }}>Encryption: 256-bit SSL Standard</div>
          </div>
        </div>
      </div>

      {/* ── SIMPLE OFFICER PANEL: STOLEN VEHICLE RETRIEVAL ────────────────── */}
      <div className="glass-card" style={{ padding: '24px 28px', borderRadius: '16px', background: 'linear-gradient(145deg, #f0fdf4 0%, #ffffff 100%)', border: '2px solid #22c55e' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="material-icons" style={{ fontSize: '28px', color: '#16a34a' }}>published_with_changes</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#14532d' }}>
                Stolen Vehicle Retrieval & Recovery Panel
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#166534' }}>
                Mark stolen vehicles as retrieved in DMT government records upon law enforcement recovery
              </p>
            </div>
          </div>

          <span style={{ background: '#16a34a', color: '#ffffff', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '6px' }}>
            OFFICER RECOVERY ACTION
          </span>
        </div>

        {/* Retrieval Form */}
        <form onSubmit={handleMarkVehicleAsRetrieved} style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr auto', gap: '14px', alignItems: 'end' }}>
          <div>
            <label className="form-label" style={{ marginBottom: '4px', fontSize: '12px', color: '#14532d' }}>Vehicle Plate Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. WP LA-9999"
              value={recoveryPlateInput}
              onChange={(e) => setRecoveryPlateInput(e.target.value)}
              required
              style={{ borderColor: '#86efac' }}
            />
          </div>

          <div>
            <label className="form-label" style={{ marginBottom: '4px', fontSize: '12px', color: '#14532d' }}>Officer Recovery Remarks</label>
            <input
              type="text"
              className="form-input"
              placeholder="Recovery remarks"
              value={recoveryRemarks}
              onChange={(e) => setRecoveryRemarks(e.target.value)}
              style={{ borderColor: '#86efac' }}
            />
          </div>

          <button
            type="submit"
            disabled={isRecovering}
            style={{
              background: '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              height: '46px',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
            }}
          >
            <span className="material-icons" style={{ fontSize: '18px' }}>check_circle</span>
            {isRecovering ? 'MARKING...' : 'MARK AS RETRIEVED'}
          </button>
        </form>

        {recoveryStatusMsg && (
          <div style={{ marginTop: '14px', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', background: recoveryStatusMsg.startsWith('SUCCESS') ? '#dcfce7' : '#fef2f2', color: recoveryStatusMsg.startsWith('SUCCESS') ? '#14532d' : '#991b1b', border: recoveryStatusMsg.startsWith('SUCCESS') ? '1px solid #86efac' : '1px solid #fecaca' }}>
            {recoveryStatusMsg}
          </div>
        )}
      </div>

      {/* Main Roadside Verification Console */}
      <div className="glass-card" style={{ padding: '24px 28px', borderRadius: '16px', background: '#ffffff' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-icons" style={{ color: 'var(--c-primary)' }}>search</span>
          Roadside Vehicle & Driver Compliance Verification
        </h3>

        {/* Presets */}
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
            Quick Test Shortcuts
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {presets.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyPreset(p.plate, p.driverNic)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleRunComplianceCheck} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
          <div>
            <label className="form-label" style={{ marginBottom: '6px' }}>Vehicle License Plate Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. WP LA-9999"
              value={officerPlate}
              onChange={(e) => setOfficerPlate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label" style={{ marginBottom: '6px' }}>Operating Driver NIC (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 198503402948"
              value={officerDriverNic}
              onChange={(e) => setOfficerDriverNic(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isSearching}
            style={{ padding: '12px 24px', height: '46px', whiteSpace: 'nowrap', fontWeight: '700' }}
          >
            <span className="material-icons">policy</span>
            {isSearching ? 'VERIFYING...' : 'RUN INSPECTION'}
          </button>
        </form>

        {officerStatusMessage && (
          <div style={{ marginTop: '16px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
            {officerStatusMessage}
          </div>
        )}
      </div>

      {/* Compliance Result Terminal Display */}
      {complianceResult && (
        <div className="glass-card animate-fade-in" style={{ padding: '24px 28px', borderRadius: '16px', background: complianceResult.allowed ? 'linear-gradient(145deg, #f0fdf4 0%, #ffffff 100%)' : 'linear-gradient(145deg, #fef2f2 0%, #ffffff 100%)', border: `2px solid ${complianceResult.allowed ? '#22c55e' : '#ef4444'}` }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '16px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-icons" style={{ fontSize: '32px', color: complianceResult.allowed ? '#16a34a' : '#dc2626' }}>
                {complianceResult.allowed ? 'verified_user' : 'gavel'}
              </span>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: complianceResult.allowed ? '#15803d' : '#b91c1c' }}>
                  INSPECTION VERIFICATION RESULT
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '19px', fontWeight: '800', color: complianceResult.allowed ? '#14532d' : '#7f1d1d' }}>
                  {complianceResult.alert || 'Compliance Verified'}
                </h3>
              </div>
            </div>

            {complianceResult.vehicleStatus === 'STOLEN' && (
              <button 
                onClick={() => handleMarkVehicleAsRetrieved()} 
                style={{ background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span className="material-icons" style={{ fontSize: '18px' }}>check_circle</span>
                MARK AS RETRIEVED
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Plate Number</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: '800', fontFamily: 'monospace', color: '#0f172a' }}>
                {complianceResult.plateNumber}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>DMT Registry Status</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: '800', color: complianceResult.vehicleStatus === 'STOLEN' ? '#dc2626' : '#16a34a' }}>
                {complianceResult.vehicleStatus}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Registered Owner NIC</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                {complianceResult.ownerNic}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Activity History Log */}
      {inspectionHistory.length > 0 && (
        <div className="glass-card" style={{ padding: '20px 24px', borderRadius: '16px', background: '#ffffff' }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-icons" style={{ color: 'var(--c-primary)' }}>history</span>
            Session Inspection Activity Log ({inspectionHistory.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {inspectionHistory.map((item) => (
              <div 
                key={item.id} 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12.5px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>{item.timestamp}</span>
                  <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>{item.plate}</strong>
                  <span style={{ color: '#64748b', fontSize: '11.5px' }}>Driver: {item.driverNic}</span>
                </div>

                <span style={{ fontSize: '11.5px', fontWeight: '700', color: item.allowed ? '#16a34a' : '#dc2626' }}>
                  {item.alert}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
