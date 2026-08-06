import React, { useState } from 'react';
import * as api from '../services/api';

/**
 * VehicleRegistrationForm — Modal dialog for registering a new vehicle.
 * Matches AccessControlModal styling: modal-overlay, glass-card modal-card.
 * Sticky red X close (no circle). No footer CLOSE button.
 */
const VehicleRegistrationForm = ({ currentNic, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    customName: '', make: '', model: '',
    chassisNumber: '', plateNumber: '', color: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: 'info', message: 'Submitting registration...' });
    try {
      const response = await api.registerVehicleAsset(formData, currentNic);
      setStatus({ type: 'success', message: `Vehicle registered successfully! Status: ${response.status}` });
      setFormData({ customName: '', make: '', model: '', chassisNumber: '', plateNumber: '', color: '' });
      if (onSuccess) setTimeout(onSuccess, 1200);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-card animate-fade-in" style={{ position: 'relative', maxWidth: '640px', padding: '32px', background: 'var(--c-card-bg, #ffffff)', border: '1px solid var(--c-card-border, #cbd5e1)', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.4)', transition: 'background-color 0.3s ease' }}>

        {/* Sticky Red X Close Button (no circle background) */}
        <button
          onClick={onClose}
          style={{
            position: 'sticky',
            top: '0px',
            float: 'right',
            zIndex: 20,
            background: 'none',
            color: '#dc2626',
            border: 'none',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, opacity 0.15s ease'
          }}
          title="Close Vehicle Registration"
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.opacity = '0.8'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
        >
          <span className="material-icons" style={{ fontSize: '28px', fontWeight: 'bold' }}>close</span>
        </button>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--c-card-border, #edf2f7)', paddingBottom: '16px', paddingRight: '40px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--c-primary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              DMT DIGITAL ASSET REGISTRATION
            </span>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '800', color: 'var(--c-text-bright)' }}>
              Register New Vehicle
            </h2>
            <span style={{ fontSize: '13px', color: 'var(--c-secondary)' }}>
              Link a new vehicle to your NIC: <strong>{currentNic}</strong>
            </span>
          </div>
        </div>

        {/* Registration Form Section */}
        <div style={{ marginBottom: '0', background: 'var(--c-card-sub-bg, #f8fafc)', padding: '20px', borderRadius: '12px', border: '1px solid var(--c-card-border, #e2e8f0)', transition: 'background-color 0.3s ease' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--c-card-text, #0f172a)', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-icons" style={{ fontSize: '18px', color: 'var(--c-primary)' }}>directions_car</span>
            Vehicle Details
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Vehicle Nickname */}
            <div>
              <label className="form-label" style={{ marginBottom: '4px', fontSize: '12px', color: 'var(--c-card-subtext)' }}>Vehicle Nickname *</label>
              <input type="text" className="form-input" name="customName" value={formData.customName} onChange={handleChange} placeholder="e.g. My Daily Ride" required />
            </div>

            {/* Make & Model */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '4px', fontSize: '12px', color: 'var(--c-card-subtext)' }}>Make / Brand *</label>
                <input type="text" className="form-input" name="make" value={formData.make} onChange={handleChange} placeholder="e.g. Toyota" required />
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: '4px', fontSize: '12px', color: 'var(--c-card-subtext)' }}>Model *</label>
                <input type="text" className="form-input" name="model" value={formData.model} onChange={handleChange} placeholder="e.g. Prius Alpha" required />
              </div>
            </div>

            {/* Plate Number & Color */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '4px', fontSize: '12px', color: 'var(--c-card-subtext)' }}>Plate Number *</label>
                <input type="text" className="form-input" name="plateNumber" value={formData.plateNumber} onChange={handleChange} placeholder="e.g. WP CAD-9876" required />
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: '4px', fontSize: '12px', color: 'var(--c-card-subtext)' }}>Color</label>
                <input type="text" className="form-input" name="color" value={formData.color} onChange={handleChange} placeholder="e.g. Pearl White" />
              </div>
            </div>

            {/* Chassis Number */}
            <div>
              <label className="form-label" style={{ marginBottom: '4px', fontSize: '12px', color: 'var(--c-card-subtext)' }}>Chassis Number *</label>
              <input type="text" className="form-input" name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} placeholder="e.g. ZVW41-1234567" required />
            </div>

            {/* Status Message */}
            {status.message && (
              <div style={{
                padding: '10px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                background: status.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : status.type === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                color: status.type === 'success' ? '#22c55e' : status.type === 'error' ? '#ef4444' : '#3b82f6',
                border: `1px solid ${status.type === 'success' ? 'rgba(34,197,94,0.3)' : status.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)'}`
              }}>
                {status.message}
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '12px', justifyContent: 'center', fontWeight: '700', fontSize: '13px', opacity: isSubmitting ? 0.6 : 1 }}>
              {isSubmitting ? 'SUBMITTING...' : 'SUBMIT REGISTRATION'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default VehicleRegistrationForm;
