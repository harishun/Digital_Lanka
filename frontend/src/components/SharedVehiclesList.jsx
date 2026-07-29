import React from 'react';

/**
 * SharedVehiclesList — Reusable component for displaying vehicles authorized to drive.
 * Status badge is color coded GREEN for GRANTED access.
 */
export default function SharedVehiclesList({ authorizedVehicles }) {
  return (
    <div className="glass-card" style={{ padding: '24px', borderRadius: '12px' }}>
      <h2 className="section-title" style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="material-icons" style={{ color: 'var(--c-primary)' }}>key_visualizer</span>
        Authorized Driving Access (Shared Vehicles)
      </h2>
      {authorizedVehicles.length === 0 ? (
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--c-secondary)', fontStyle: 'italic' }}>
          You have not been granted access to drive any external vehicles.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {authorizedVehicles.map((av) => (
            <div 
              key={av.id || av.authorizationId || av.authId} 
              className="invitation-item" 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 18px' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', fontFamily: 'monospace', color: '#0f172a' }}>
                    {av.plateNumber || av.vehicleId}
                  </p>
                  <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    GRANTED
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--c-secondary)' }}>
                  Model: <strong>{av.model || 'Toyota Prius (Grey)'}</strong> | Owner NIC: <strong>{av.ownerNic}</strong> | Type: <strong>{av.accessType}</strong>
                </p>
              </div>
              <span className="material-icons" style={{ color: '#16a34a', fontSize: '24px' }}>verified</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
