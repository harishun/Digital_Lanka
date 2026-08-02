import React, { useState } from 'react';
import * as api from '../services/api';

const VehicleRegistrationForm = ({ currentNic, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    customName: '',
    make: '',
    model: '',
    chassisNumber: '',
    plateNumber: '',
    color: ''
  });

  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'info', message: 'Submitting registration...' });

    try {
      const response = await api.registerVehicleAsset(formData, currentNic);
      setStatus({ type: 'success', message: `Registration submitted! Status: ${response.status}` });
      setFormData({
        customName: '',
        make: '',
        model: '',
        chassisNumber: '',
        plateNumber: '',
        color: ''
      });
      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="glass-card" style={{ marginTop: '0', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: 'var(--c-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-icons">directions_car</span>
          Register New Vehicle
        </h3>
        
        {onClose && (
          <button 
            type="button"
            onClick={onClose} 
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', padding: '6px 12px' }}
          >
            <span className="material-icons" style={{ fontSize: '16px' }}>arrow_back</span>
            Back to Dashboard
          </button>
        )}
      </div>
      
      <p style={{ color: 'var(--c-secondary)', fontSize: '14px', marginBottom: '24px' }}>
        Register your vehicle asset by providing the vehicle details below.
      </p>

      {status.message && (
        <div style={{
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '16px',
          background: status.type === 'error' ? '#ffebee' : status.type === 'success' ? '#e8f5e9' : '#e3f2fd',
          color: status.type === 'error' ? 'var(--danger)' : status.type === 'success' ? 'var(--success)' : 'var(--c-primary)'
        }}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600 }}>Custom Name</label>
          <input required name="customName" value={formData.customName} onChange={handleChange} placeholder="e.g. My Daily Commuter" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600 }}>Plate Number</label>
          <input required name="plateNumber" value={formData.plateNumber} onChange={handleChange} placeholder="WP CAD-1234" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600 }}>Make</label>
          <input required name="make" value={formData.make} onChange={handleChange} placeholder="Honda" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600 }}>Model</label>
          <input required name="model" value={formData.model} onChange={handleChange} placeholder="Vezel" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600 }}>Chassis Number</label>
          <input required name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} placeholder="CHA-998822110-B" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600 }}>Color</label>
          <input required name="color" value={formData.color} onChange={handleChange} placeholder="White" style={inputStyle} />
        </div>

        <div style={{ gridColumn: '1 / -1', marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-primary">
            <span className="material-icons">send</span>
            Submit Registration
          </button>
        </div>
      </form>
    </div>
  );
};

const inputStyle = {
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid var(--glass-border)',
  fontFamily: 'var(--font-public-sans)',
  fontSize: '14px',
  outline: 'none'
};

export default VehicleRegistrationForm;
