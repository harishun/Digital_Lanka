import React, { useState } from 'react';

/**
 * AccessControlModal — Modal dialog for managing vehicle access controls.
 * Color Coded Statuses:
 * - PENDING: Yellow / Amber
 * - GRANTED: Green
 * - DECLINED / REVOKED: Red
 * Sticky Red Top-Right Close Button & Red Footer Close Button.
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
      return { background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' };
    }
    if (s === 'GRANTED') {
      return { background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)' };
    }
    if (s === 'DECLINED' || s === 'REVOKED') {
      return { background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' };
    }
    return { background: 'var(--c-card-sub-bg, #f1f5f9)', color: 'var(--c-card-subtext, #475569)', border: '1px solid var(--c-card-border, #cbd5e1)' };
  };

  const currentAccessedUsers = authorizations.filter(a => a.status === 'GRANTED' || a.status === 'PENDING');
  const pastAccessHistory = authorizations.filter(a => a.status === 'REVOKED' || a.status === 'EXPIRED' || a.status === 'DECLINED');

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-card animate-fade-in" style={{ position: 'relative', maxWidth: '640px', padding: '32px', background: 'var(--c-card-bg, #ffffff)', border: '1px solid var(--c-card-border, #cbd5e1)', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.4)', transition: 'background-color 0.3s ease' }}>
        
        {/* Sticky Red Top-Right Close Button */}
        <button 
          onClick={onClose} 
          style={{ 
            position: 'sticky', 
            top: '0px', 
            float: 'right', 
            zIndex: 20,
            background: '#dc2626', 
            color: '#ffffff', 
            border: 'none', 
            borderRadius: '50%', 
            width: '34px', 
            height: '34px', 
            minWidth: '34px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer', 
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.45)',
            transition: 'transform 0.15s ease' 
          }}
          title="Close Access Control Modal"
        >
          <span className="material-icons" style={{ fontSize: '20px', fontWeight: 'bold' }}>close</span>
        </button>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--c-card-border, #edf2f7)', paddingBottom: '16px', paddingRight: '40px' }}>
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
        </div>

        {/* Section 1: Grant / Invite New Driver Access Form (TOP) */}
        <div style={{ marginBottom: '28px', background: 'var(--c-card-sub-bg, #f8fafc)', padding: '20px', borderRadius: '12px', border: '1px solid var(--c-card-border, #e2e8f0)', transition: 'background-color 0.3s ease' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--c-card-text, #0f172a)', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-icons" style={{ fontSize: '18px', color: 'var(--c-primary)' }}>person_add</span>
            Grant New Driver Access
          </h3>

          <form onSubmit={handleGrantAccess} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="form-label" style={{ marginBottom: '4px', fontSize: '12px', color: 'var(--c-card-subtext)' }}>Driver NIC Number</label>
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
              <label className="form-label" style={{ marginBottom: '4px', fontSize: '12px', color: 'var(--c-card-subtext)' }}>Access Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setAccessType('PERMANENT')}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: accessType === 'PERMANENT' ? '2px solid var(--c-primary)' : '1px solid var(--c-card-border, #cbd5e1)',
                    background: accessType === 'PERMANENT' ? 'rgba(59, 130, 246, 0.12)' : 'var(--c-card-bg, #ffffff)',
                    fontWeight: accessType === 'PERMANENT' ? '700' : '600',
                    color: accessType === 'PERMANENT' ? 'var(--c-primary)' : 'var(--c-card-subtext, #475569)',
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
                    border: accessType === 'TIME_BOUND' ? '2px solid var(--c-primary)' : '1px solid var(--c-card-border, #cbd5e1)',
                    background: accessType === 'TIME_BOUND' ? 'rgba(59, 130, 246, 0.12)' : 'var(--c-card-bg, #ffffff)',
                    fontWeight: accessType === 'TIME_BOUND' ? '700' : '600',
                    color: accessType === 'TIME_BOUND' ? 'var(--c-primary)' : 'var(--c-card-subtext, #475569)',
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
                <label className="form-label" style={{ marginBottom: '4px', fontSize: '12px', color: 'var(--c-card-subtext)' }}>Access Duration (Days)</label>
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
              <div style={{ padding: '10px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: isError ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.12)', color: isError ? '#ef4444' : '#22c55e', border: isError ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)' }}>
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
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--c-card-subtext, #64748b)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-icons" style={{ fontSize: '18px', color: 'var(--c-primary)' }}>verified_user</span>
            Currently Authorized & Accessed Users ({currentAccessedUsers.length})
          </h3>

          {currentAccessedUsers.length === 0 ? (
            <div style={{ padding: '14px 16px', background: 'var(--c-card-sub-bg, #f8fafc)', borderRadius: '8px', border: '1px solid var(--c-card-border, #e2e8f0)', fontSize: '13px', color: 'var(--c-secondary)', fontStyle: 'italic' }}>
              No drivers currently hold active driving authorization for this vehicle.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentAccessedUsers.map((auth) => {
                const badgeStyle = getStatusBadgeStyle(auth.status);
                return (
                  <div key={auth.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--c-card-sub-bg, #ffffff)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--c-card-border, #e2e8f0)', fontSize: '13px' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: 'var(--c-card-text, #0f172a)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>Driver NIC: <span style={{ fontFamily: 'monospace' }}>{auth.authorizedNic}</span></span>
                        <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', ...badgeStyle }}>
                          {auth.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--c-card-subtext, #64748b)', marginTop: '4px' }}>
                        Access Type: <strong style={{ color: 'var(--c-card-text)' }}>{auth.accessType}</strong>
                      </div>
                    </div>

                    {auth.status === 'GRANTED' && (
                      <button 
                        onClick={() => handleRevokeAccess(auth.id)} 
                        className="btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '11px', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: '700' }}
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

        {/* Section 3: Expandable Past Access History Log */}
        <div style={{ borderTop: '1px solid var(--c-card-border, #edf2f7)', paddingTop: '16px' }}>
          <button 
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', padding: '8px 0', color: 'var(--c-card-subtext, #64748b)', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-icons" style={{ fontSize: '18px' }}>history</span>
              View Authorization History Log ({pastAccessHistory.length})
            </span>
            <span className="material-icons" style={{ fontSize: '20px' }}>
              {showHistory ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {showHistory && (
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pastAccessHistory.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--c-secondary)', fontStyle: 'italic', padding: '8px 0' }}>
                  No past authorization history logged.
                </div>
              ) : (
                pastAccessHistory.map((log) => {
                  const badgeStyle = getStatusBadgeStyle(log.status);
                  return (
                    <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--c-card-sub-bg, #f8fafc)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--c-card-border, #e2e8f0)', fontSize: '12px' }}>
                      <div>
                        <span style={{ fontWeight: '700', color: 'var(--c-card-text, #334155)', fontFamily: 'monospace' }}>{log.authorizedNic}</span>
                        <span style={{ color: 'var(--c-card-subtext)', marginLeft: '8px' }}>Type: {log.accessType}</span>
                      </div>
                      <span style={{ fontSize: '9.5px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', ...badgeStyle }}>
                        {log.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--c-card-border, #edf2f7)', paddingTop: '20px', marginTop: '24px' }}>
          <button 
            onClick={onClose} 
            className="btn-secondary" 
            style={{ 
              padding: '10px 24px', 
              fontWeight: '800', 
              background: '#dc2626', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '8px', 
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)' 
            }}
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
}
