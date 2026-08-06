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
      setStatus({ type: 'success', message: `Registration submitted! Status: ${response.status || 'PENDING_VERIFICATION'}` });
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
          Register New Vehicle Asset
        </h3>
        
        {onClose && (
          <button 
            type="button"
            onClick={onClose} 
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', padding: '6px 12px' }}
          >
            <span className="material-icons" style={{ fontSize: '16px' }}>arrow_back</span>
            Back
          </button>
        )}
      </div>

      {status.message && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '13px',
          fontWeight: '600',
          background: status.type === 'error' ? '#fef2f2' : status.type === 'success' ? '#f0fdf4' : '#eff6ff',
          color: status.type === 'error' ? '#991b1b' : status.type === 'success' ? '#166534' : '#1e40af',
          border: `1px solid ${status.type === 'error' ? '#fecaca' : status.type === 'success' ? '#bbf7d0' : '#bfdbfe'}`
        }}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--c-text-muted)', marginBottom: '4px' }}>Custom Asset Name</label>
          <input
            type="text"
            name="customName"
            value={formData.customName}
            onChange={handleChange}
            placeholder="e.g. My Personal Prius"
            required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--outline)', fontSize: '14px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--c-text-muted)', marginBottom: '4px' }}>Make / Manufacturer</label>
            <input
              type="text"
              name="make"
              value={formData.make}
              onChange={handleChange}
              placeholder="e.g. Toyota"
              required
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--outline)', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--c-text-muted)', marginBottom: '4px' }}>Model</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="e.g. Prius"
              required
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--outline)', fontSize: '14px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--c-text-muted)', marginBottom: '4px' }}>License Plate Number</label>
            <input
              type="text"
              name="plateNumber"
              value={formData.plateNumber}
              onChange={handleChange}
              placeholder="e.g. WP CAA-1234"
              required
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--outline)', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--c-text-muted)', marginBottom: '4px' }}>Chassis Number</label>
            <input
              type="text"
              name="chassisNumber"
              value={formData.chassisNumber}
              onChange={handleChange}
              placeholder="e.g. CH123456789"
              required
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--outline)', fontSize: '14px' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--c-text-muted)', marginBottom: '4px' }}>Color</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="e.g. Pearl White"
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--outline)', fontSize: '14px' }}
          />
        </div>

        <button
          type="submit"
          style={{
            marginTop: '8px',
            padding: '12px',
            background: 'var(--c-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span className="material-icons" style={{ fontSize: '18px' }}>send</span>
          Submit Vehicle Registration
        </button>
      </form>
    </div>
  );
};

export default VehicleRegistrationForm;
