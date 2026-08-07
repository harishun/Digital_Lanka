import React from 'react';

/**
 * SharedVehiclesList — Reusable component for displaying vehicles authorized to drive.
 * Status badge is color coded GREEN for GRANTED access.
 * Dynamic theme background variables so card adapts to Night Mode.
 */
export default function SharedVehiclesList({ authorizedVehicles, currentUser }) {
  return (
    <div className="glass-card" style={{ padding: '24px', borderRadius: '12px', height: '100%', boxSizing: 'border-box' }}>
      <h2 className="section-title" style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--c-text-bright)' }}>
        <span className="material-icons" style={{ color: 'var(--c-primary)' }}>key_visualizer</span>
        Authorized Driving Access
      </h2>
      {authorizedVehicles.length === 0 ? (
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--c-secondary)', fontStyle: 'italic', textAlign: 'center' }}>
          You have not been granted access to drive any external vehicles.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {authorizedVehicles.map((av) => {
            const isOwner = currentUser && av.ownerNic === currentUser.nic;
            return (
              <div 
                key={av.id || av.authorizationId || av.authId} 
                className="invitation-item" 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  background: 'var(--c-card-sub-bg, #f8fafc)', 
                  border: '1px solid var(--c-card-border, #e2e8f0)', 
                  borderRadius: '8px', 
                  padding: '14px 18px',
                  transition: 'background-color 0.3s ease, border-color 0.3s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', fontFamily: 'monospace', color: 'var(--c-card-text, #0f172a)' }}>
                      {av.plateNumber || av.vehicleId}
                    </p>
                    <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#16a34a', border: '1px solid rgba(34, 197, 94, 0.3)', fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {isOwner ? 'OWNED' : 'GRANTED'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--c-secondary)' }}>
                    Model: <strong style={{ color: 'var(--c-card-text)' }}>{av.model || 'Toyota Prius (Grey)'}</strong> | Owner: <strong style={{ color: 'var(--c-card-text)' }}>{isOwner ? 'You' : av.ownerNic}</strong> | Type: <strong style={{ color: 'var(--c-card-text)' }}>{isOwner ? 'OWNER' : av.accessType}</strong>
                  </p>
                </div>
                <span className="material-icons" style={{ color: '#16a34a', fontSize: '24px' }}>verified</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
