import React, { useState } from 'react';

/**
 * AccessControlModal — Modal dialog for managing vehicle access controls.
 * Color Coded Statuses:
 * - PENDING: Yellow / Amber (#fef3c7, #b45309)
 * - GRANTED: Green (#dcfce7, #15803d)
 * - DECLINED / REVOKED: Red (#fef2f2, #dc2626)
 */
export default function AccessControlModal({
  isOpen,
  onClose,
  currentVehicle,
  authorizations = [],
  driverNic,
  setDriverNic,
  accessType,
  setAccessType,
  durationDays,
  setDurationDays,
  handleGrantAccess,
  handleRevokeAccess,
  handleMarkAsStolen,
  statusMessage,
  isError
}) {
  const [showHistory, setShowHistory] = useState(false);

  if (!isOpen || !currentVehicle) return null;

  // Status Badge Styling Helper
  const getStatusBadgeStyle = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'PENDING') {
      return { background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }; // YELLOW
    }
    if (s === 'GRANTED') {
      return { background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }; // GREEN
    }
    if (s === 'DECLINED' || s === 'REVOKED') {
      return { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }; // RED
    }
    return { background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }; // GRAY
  };

  // Filter current active drivers vs past access history
  const currentAccessedUsers = authorizations.filter(a => a.status === 'GRANTED' || a.status === 'PENDING');
  const pastAccessHistory = authorizations.filter(a => a.status === 'REVOKED' || a.status === 'EXPIRED' || a.status === 'DECLINED');

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-card animate-fade-in" style={{ maxWidth: '640px', padding: '32px', background: '#ffffff', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #edf2f7', paddingBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--c-primary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              VEHICLE ACCESS CONTROL & AUTHORIZATION
            </span>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '800', color: 'var(--c-text-bright)' }}>
              {currentVehicle.plateNumber}
            </h2>
            <span style={{ fontSize: '13px', color: 'var(--c-secondary)' }}>
              {currentVehicle.model || 'Toyota Prius'} | Category: Class {currentVehicle.vehicleClass || 'B'}
            </span>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
            <span className="material-icons" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* Section 1: Grant / Invite New Driver Access Form (TOP) */}
        <div style={{ marginBottom: '28px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-icons" style={{ fontSize: '18px', color: 'var(--c-primary)' }}>person_add</span>
            Grant New Driver Access
          </h3>

          <form onSubmit={handleGrantAccess} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="form-label" style={{ marginBottom: '4px', fontSize: '12px' }}>Driver NIC Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 198503402948"
                value={driverNic}
                onChange={(e) => setDriverNic(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label" style={{ marginBottom: '4px', fontSize: '12px' }}>Access Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setAccessType('PERMANENT')}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: accessType === 'PERMANENT' ? '2px solid var(--c-primary)' : '1px solid #cbd5e1',
                    background: accessType === 'PERMANENT' ? 'rgba(0, 35, 102, 0.06)' : '#ffffff',
                    fontWeight: accessType === 'PERMANENT' ? '700' : '600',
                    color: accessType === 'PERMANENT' ? 'var(--c-primary)' : '#475569',
                    fontSize: '12.5px',
                    cursor: 'pointer'
                  }}
                >
                  Permanent Access
                </button>
                <button
                  type="button"
                  onClick={() => setAccessType('TIME_BOUND')}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: accessType === 'TIME_BOUND' ? '2px solid var(--c-primary)' : '1px solid #cbd5e1',
                    background: accessType === 'TIME_BOUND' ? 'rgba(0, 35, 102, 0.06)' : '#ffffff',
                    fontWeight: accessType === 'TIME_BOUND' ? '700' : '600',
                    color: accessType === 'TIME_BOUND' ? 'var(--c-primary)' : '#475569',
                    fontSize: '12.5px',
                    cursor: 'pointer'
                  }}
                >
                  Temporary (Time-Bound)
                </button>
              </div>
            </div>

            {accessType === 'TIME_BOUND' && (
              <div>
                <label className="form-label" style={{ marginBottom: '4px', fontSize: '12px' }}>Access Duration (Days)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 7"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  min="1"
                  required
                />
              </div>
            )}

            {statusMessage && (
              <div style={{ padding: '10px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: isError ? '#fef2f2' : '#f0fdf4', color: isError ? '#dc2626' : '#15803d', border: isError ? '1px solid #fecaca' : '1px solid #bbf7d0' }}>
                {statusMessage}
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ padding: '12px', justifyContent: 'center', fontWeight: '700', fontSize: '13px' }}>
              SEND ACCESS INVITATION
            </button>
          </form>
        </div>

        {/* Section 2: Currently Authorized & Accessed Users */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-icons" style={{ fontSize: '18px', color: 'var(--c-primary)' }}>verified_user</span>
            Currently Authorized & Accessed Users ({currentAccessedUsers.length})
          </h3>

          {currentAccessedUsers.length === 0 ? (
            <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', color: 'var(--c-secondary)', fontStyle: 'italic' }}>
              No drivers currently hold active driving authorization for this vehicle.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentAccessedUsers.map((auth) => {
                const badgeStyle = getStatusBadgeStyle(auth.status);
                return (
                  <div key={auth.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>Driver NIC: <span style={{ fontFamily: 'monospace' }}>{auth.authorizedNic}</span></span>
                        <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', ...badgeStyle }}>
                          {auth.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                        Access Type: <strong>{auth.accessType}</strong>
                      </div>
                    </div>

                    {auth.status === 'GRANTED' && (
                      <button 
                        onClick={() => handleRevokeAccess(auth.id)} 
                        className="btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '11px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontWeight: '700' }}
                      >
                        REVOKE ACCESS
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 3: History Log (Color Coded) */}
        <div style={{ marginBottom: '24px' }}>
          <button 
            type="button"
            onClick={() => setShowHistory(!showHistory)} 
            style={{ width: '100%', background: showHistory ? '#f1f5f9' : '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 16px', color: 'var(--c-primary)', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-icons" style={{ fontSize: '18px' }}>history</span>
              {showHistory ? 'Hide Access History Log' : `View Access History (${pastAccessHistory.length} Records)`}
            </span>
            <span className="material-icons" style={{ fontSize: '18px' }}>{showHistory ? 'expand_less' : 'expand_more'}</span>
          </button>

          {showHistory && (
            <div className="animate-fade-in" style={{ marginTop: '12px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              {pastAccessHistory.length === 0 ? (
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                  No past revoked, expired, or declined authorization records in history log.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pastAccessHistory.map((hist) => {
                    const badgeStyle = getStatusBadgeStyle(hist.status);
                    return (
                      <div key={hist.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#334155' }}>
                            Driver NIC: <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>{hist.authorizedNic}</span>
                          </div>
                          <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                            Access: {hist.accessType} | Record ID: {hist.id}
                          </div>
                        </div>

                        <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', ...badgeStyle }}>
                          {hist.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #edf2f7', paddingTop: '20px' }}>
          {currentVehicle.status?.toUpperCase() === 'STOLEN' ? (
            <span style={{ color: '#dc2626', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-icons">warning</span> REPORTED STOLEN
            </span>
          ) : (
            <button 
              onClick={() => handleMarkAsStolen(currentVehicle.plateNumber || currentVehicle.id)} 
              className="btn-secondary" 
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '12px', fontWeight: '700' }}
            >
              <span className="material-icons" style={{ fontSize: '16px' }}>report_problem</span>
              REPORT STOLEN
            </button>
          )}

          <button onClick={onClose} className="btn-primary" style={{ padding: '8px 24px' }}>
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
}
