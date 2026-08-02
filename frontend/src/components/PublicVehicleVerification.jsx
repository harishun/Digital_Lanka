import React, { useState } from 'react';
import * as api from '../services/api';

const PublicVehicleVerification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [plateNumber, setPlateNumber] = useState('');
  const [nic, setNic] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await api.publicVerifyVehicle(plateNumber, nic);
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setPlateNumber('');
    setNic('');
    setResult(null);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--c-primary)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '30px',
          padding: '12px 24px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0, 35, 102, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1000
        }}
      >
        <span className="material-icons">search</span>
        Public Vehicle Verification
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div className="glass-card animate-fade-in" style={{ width: '400px', maxWidth: '90%', position: 'relative' }}>
            <button 
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '16px', right: '16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <span className="material-icons">close</span>
            </button>
            
            <h3 style={{ marginTop: 0, color: 'var(--c-primary)' }}>Verify Vehicle Registration</h3>
            <p style={{ fontSize: '14px', color: 'var(--c-secondary)', marginBottom: '24px' }}>
              Check if a vehicle is officially registered in Digital Lanka. You must provide the vehicle number and the owner's NIC.
            </p>

            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Vehicle Plate Number</label>
                <input 
                  required 
                  value={plateNumber} 
                  onChange={(e) => setPlateNumber(e.target.value)} 
                  placeholder="e.g. WP CAD-1234" 
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--glass-border)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Owner's NIC</label>
                <input 
                  required 
                  value={nic} 
                  onChange={(e) => setNic(e.target.value)} 
                  placeholder="e.g. 197204509123" 
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--glass-border)' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '8px' }} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </form>

            {result && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                borderRadius: '8px',
                background: result.isRegisteredAndActive ? '#e8f5e9' : '#ffebee',
                border: `1px solid ${result.isRegisteredAndActive ? 'var(--success)' : 'var(--danger)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span className="material-icons" style={{ color: result.isRegisteredAndActive ? 'var(--success)' : 'var(--danger)', fontSize: '28px' }}>
                  {result.isRegisteredAndActive ? 'check_circle' : 'cancel'}
                </span>
                <div>
                  <div style={{ fontWeight: '600', color: result.isRegisteredAndActive ? 'var(--success)' : 'var(--danger)' }}>
                    {result.isRegisteredAndActive ? 'Valid Registration' : 'Not Found / Inactive'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--c-text-variant)' }}>
                    {result.isRegisteredAndActive 
                      ? 'This vehicle is officially registered to the provided NIC.' 
                      : 'No active registration found for this Plate + NIC combination.'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PublicVehicleVerification;
