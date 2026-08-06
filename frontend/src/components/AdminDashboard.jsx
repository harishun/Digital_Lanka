import React, { useState } from 'react';
import * as api from '../services/api';

/**
 * AdminDashboard — General Administrator lookup console for querying national citizen DRP registry.
 * Uses Material Icons and clean glass-card design system.
 */
export default function AdminDashboard({ currentNic }) {
  const [nic, setNic] = useState('');
  const [citizen, setCitizen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    const cleanNic = nic.trim();
    if (!cleanNic) return;

    setLoading(true);
    setError('');
    setCitizen(null);

    try {
      const citizenData = api.getCitizenProfile(cleanNic);
      if (citizenData) {
        setCitizen(citizenData);
      } else {
        setError(`No citizen record found in DRP registry for NIC "${cleanNic}".`);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch citizen registry details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, #002366 0%, #1e3a8a 100%)', color: '#ffffff', padding: '24px 32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-icons" style={{ fontSize: '32px', color: '#93c5fd' }}>admin_panel_settings</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#ffffff' }}>
                System Administrator Portal
              </h2>
              <span style={{ background: '#3b82f6', color: '#ffffff', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>
                LEVEL 2 ACCESS
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#cbd5e1' }}>
              National Citizen Registry Query & Institutional Operations Console
            </p>
          </div>
        </div>
      </div>

      {/* DRP Citizen Registry Lookup */}
      <div className="glass-card" style={{ padding: '28px', borderRadius: '16px', background: 'var(--c-card-bg, #ffffff)', border: '1px solid var(--c-card-border, #cbd5e1)' }}>
        <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--c-card-text, #0f172a)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-icons" style={{ color: 'var(--c-primary)' }}>search</span>
          Department of Registration of Persons (DRP) Registry Lookup
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--c-card-subtext, #64748b)', margin: '0 0 20px 0' }}>
          Query the national citizen database in real-time to inspect official registry records and driving license credentials.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '14px', alignItems: 'end' }}>
          <div>
            <label className="form-label" style={{ marginBottom: '6px', fontSize: '12px' }}>Enter Citizen NIC Number *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 197204509123 or 198503402948"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '12px 24px', fontWeight: '800', height: '46px' }}>
            <span className="material-icons" style={{ fontSize: '20px' }}>find_in_page</span>
            {loading ? 'QUERYING...' : 'QUERY DRP REGISTRY'}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: '16px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>
            {error}
          </div>
        )}
      </div>

      {/* Citizen Registry Result Card */}
      {citizen && (
        <div className="glass-card animate-fade-in" style={{ padding: '28px', borderRadius: '16px', background: 'var(--c-card-bg, #ffffff)', border: '2px solid #22c55e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--c-card-border, #e2e8f0)', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#16a34a', fontSize: '11px', fontWeight: '900', padding: '3px 10px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-icons" style={{ fontSize: '14px' }}>check_circle</span> VERIFIED DRP RECORD
              </span>
              <h2 style={{ margin: '8px 0 2px 0', fontSize: '22px', fontWeight: '900', color: 'var(--c-card-text, #0f172a)' }}>{citizen.fullName}</h2>
              <span style={{ fontSize: '13px', color: 'var(--c-card-subtext, #64748b)' }}>License Number: <strong>{citizen.licenseNumber}</strong></span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '10px', color: 'var(--c-card-subtext)', fontWeight: '800', textTransform: 'uppercase' }}>NIC NUMBER</span>
              <div style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'monospace', color: 'var(--c-primary)' }}>{citizen.nic}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', fontSize: '13px', background: 'var(--c-card-sub-bg, #f8fafc)', padding: '18px', borderRadius: '12px', border: '1px solid var(--c-card-border, #e2e8f0)' }}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--c-card-subtext)', fontWeight: '800', textTransform: 'uppercase' }}>Date of Birth</span>
              <p style={{ margin: '3px 0 0 0', fontWeight: '800', color: 'var(--c-card-text)' }}>{citizen.dateOfBirth}</p>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--c-card-subtext)', fontWeight: '800', textTransform: 'uppercase' }}>Gender</span>
              <p style={{ margin: '3px 0 0 0', fontWeight: '800', color: 'var(--c-card-text)' }}>{citizen.gender}</p>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--c-card-subtext)', fontWeight: '800', textTransform: 'uppercase' }}>Blood Group / Donor</span>
              <p style={{ margin: '3px 0 0 0', fontWeight: '800', color: 'var(--c-card-text)' }}>{citizen.bloodGroup} {citizen.donor ? ' (Organ Donor)' : ''}</p>
            </div>
            <div style={{ gridColumn: 'span 3' }}>
              <span style={{ fontSize: '10px', color: 'var(--c-card-subtext)', fontWeight: '800', textTransform: 'uppercase' }}>Registered Address</span>
              <p style={{ margin: '3px 0 0 0', fontWeight: '800', color: 'var(--c-card-text)' }}>{citizen.address}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
