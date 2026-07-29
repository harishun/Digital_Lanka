import React from 'react';

/**
 * OfficerSimulator — Reusable component for simulating roadside law enforcement compliance checks.
 */
export default function OfficerSimulator({
  officerPlate,
  setOfficerPlate,
  officerDriverNic,
  setOfficerDriverNic,
  handleRunComplianceCheck,
  complianceResult,
  officerStatusMessage,
  handleRecoverVehicle
}) {
  return (
    <div className="glass-card" style={{ marginTop: '32px', padding: '28px', borderRadius: '16px', border: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.9)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span className="material-icons" style={{ color: 'var(--c-primary)', fontSize: '28px' }}>local_police</span>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--c-text-bright)' }}>
            Roadside Traffic Law Enforcement Compliance Simulator
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--c-secondary)' }}>
            Simulate an officer verifying driver authorization on the road
          </p>
        </div>
      </div>

      <form onSubmit={handleRunComplianceCheck} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'end', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
            Vehicle Plate Number
          </label>
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
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
            Operating Driver NIC
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. 198503402948"
            value={officerDriverNic}
            onChange={(e) => setOfficerDriverNic(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-primary" style={{ padding: '12px 20px', height: '46px', whiteSpace: 'nowrap' }}>
          <span className="material-icons">search</span>
          RUN CHECK
        </button>
      </form>

      {officerStatusMessage && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
          {officerStatusMessage}
        </div>
      )}

      {complianceResult && (
        <div style={{ background: complianceResult.allowed ? '#f0fdf4' : '#fef2f2', border: `1px solid ${complianceResult.allowed ? '#bbf7d0' : '#fecaca'}`, borderRadius: '12px', padding: '20px', marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-icons" style={{ color: complianceResult.allowed ? '#16a34a' : '#dc2626', fontSize: '24px' }}>
                {complianceResult.allowed ? 'check_circle' : 'cancel'}
              </span>
              <strong style={{ fontSize: '16px', color: complianceResult.allowed ? '#15803d' : '#b91c1c' }}>
                {complianceResult.alert || 'Compliance Check Complete'}
              </strong>
            </div>

            {complianceResult.vehicleStatus === 'STOLEN' && (
              <button 
                onClick={() => handleRecoverVehicle(complianceResult.plateNumber)} 
                className="btn-primary" 
                style={{ background: '#16a34a', padding: '6px 14px', fontSize: '12px' }}
              >
                MARK AS RECOVERED
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '13px' }}>
            <div>Plate: <strong>{complianceResult.plateNumber}</strong></div>
            <div>Vehicle Registry Status: <strong style={{ color: complianceResult.vehicleStatus === 'STOLEN' ? '#dc2626' : '#16a34a' }}>{complianceResult.vehicleStatus}</strong></div>
            <div>Registered Owner: <strong>{complianceResult.ownerNic}</strong></div>
          </div>
        </div>
      )}
    </div>
  );
}
