import React from 'react';

/**
 * GrantAccessModal — Reusable modal dialog for inviting a driver to access a vehicle.
 */
export default function GrantAccessModal({
  isOpen,
  onClose,
  currentVehicle,
  driverNic,
  setDriverNic,
  accessType,
  setAccessType,
  durationDays,
  setDurationDays,
  handleGrantAccess,
  statusMessage,
  isError
}) {
  if (!isOpen || !currentVehicle) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-card animate-fade-in" style={{ padding: '32px', background: '#ffffff', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #edf2f7', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '700', color: 'var(--c-text-bright)' }}>
              Grant Driving Access
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--c-secondary)' }}>
              Vehicle: <strong>{currentVehicle.plateNumber}</strong> ({currentVehicle.model || 'Toyota Prius'})
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--c-secondary)' }}
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {statusMessage && (
          <div className={`status-banner ${isError ? 'error' : 'success'}`} style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '8px', background: isError ? '#fef2f2' : '#f0fdf4', color: isError ? '#991b1b' : '#166534', border: `1px solid ${isError ? '#fecaca' : '#bbf7d0'}` }}>
            <span className="material-icons" style={{ fontSize: '18px', marginRight: '8px', verticalAlign: 'middle' }}>
              {isError ? 'error' : 'check_circle'}
            </span>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleGrantAccess}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Authorized Driver NIC</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 199003402948"
              value={driverNic}
              onChange={(e) => setDriverNic(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Access Duration Type</label>
            <div className="radio-options" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label className="radio-label">
                <input
                  type="radio"
                  name="accessType"
                  value="PERMANENT"
                  checked={accessType === 'PERMANENT'}
                  onChange={() => setAccessType('PERMANENT')}
                />
                <div>
                  <strong>Permanent Access</strong>
                  <div style={{ fontSize: '12px', color: 'var(--c-secondary)' }}>Unlimited access until explicitly revoked</div>
                </div>
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  name="accessType"
                  value="TIME_BOUND"
                  checked={accessType === 'TIME_BOUND'}
                  onChange={() => setAccessType('TIME_BOUND')}
                />
                <div>
                  <strong>Temporary Access (Time-Bound)</strong>
                  <div style={{ fontSize: '12px', color: 'var(--c-secondary)' }}>Automatically expires after set duration</div>
                </div>
              </label>
            </div>
          </div>

          {accessType === 'TIME_BOUND' && (
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Access Duration (Days)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 7"
                min="1"
                max="365"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                required
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-secondary" 
              style={{ flex: 1, justifyContent: 'center' }}
            >
              CANCEL
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ flex: 1, justifyContent: 'center' }}
            >
              CONFIRM ACCESS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
