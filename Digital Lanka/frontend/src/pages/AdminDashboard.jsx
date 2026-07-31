import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, Search, User, MapPin, Calendar, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const { authState } = useContext(AuthContext);
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
      const response = await axios.get(`/api/citizens/nic/${cleanNic}`);
      setCitizen(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`No citizen record found in the DRP registry for NIC "${cleanNic}".`);
      } else {
        setError('Failed to fetch citizen registry details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Admin Welcome Header */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem 2rem' }}>
        <div className="placeholder-icon-wrapper" style={{ margin: 0, color: 'var(--primary)', borderColor: 'var(--primary-glow)' }}>
          <ShieldAlert size={36} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Admin Portal</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.15rem' }}>
            Logged in as: <strong style={{ color: 'var(--primary)' }}>{authState.fullName}</strong> ({authState.email})
          </p>
        </div>
      </div>

      {/* Info Card about Admin restriction */}
      <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
          As an <strong>ADMIN</strong>, you have access to general database lookup consoles. Role modifications, approvals, and user accounts configuration are restricted to the <strong>SUPER ADMIN</strong> console.
        </p>
      </div>

      {/* DRP Citizen Lookup Form */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={18} style={{ color: 'var(--primary)' }} />
          National Citizen Registry Lookup
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Query the Department of Registration of Persons (DRP) database in real-time to verify a citizen's official registry profile.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <FileText size={16} />
            </span>
            <input
              type="text"
              className="form-input"
              placeholder="Enter NIC Number (e.g., 198503402948 or 197204509123)"
              style={{ paddingLeft: '2.75rem' }}
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem', height: '46px' }} disabled={loading}>
            {loading ? 'Searching DRP...' : 'Query Registry'}
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ color: 'var(--text-secondary)' }}>Querying government mock servers...</div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert-banner alert-error" style={{ margin: 0 }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* DRP Citizen Profile Result Card */}
      {citizen && (
        <div className="card animate-fadeIn" style={{ borderLeft: '4px solid var(--success)', padding: '2rem' }}>
          
          {/* Card Header with Verified Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>
                  <CheckCircle2 size={12} style={{ marginRight: '0.25rem' }} /> Verified DRP Record
                </span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem' }}>{citizen.full_name || citizen.fullName}</h2>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.15rem' }}>
                Official National Identity Profile
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>NATIONAL ID (NIC)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>{citizen.nic}</div>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            
            {/* Left Column: Personal Metadata */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px dashed var(--card-border)', paddingBottom: '0.5rem' }}>
                Identity Metadata
              </h4>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <User size={16} style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gender</div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{citizen.gender}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Calendar size={16} style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date of Birth</div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{citizen.date_of_birth || citizen.dateOfBirth}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <FileText size={16} style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Office Registry IC Number</div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{citizen.ic_number || citizen.icNumber || 'N/A'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <MapPin size={16} style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Birthplace / District</div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {citizen.place_of_birth || citizen.placeOfBirth || 'N/A'}, {citizen.district_of_birth || citizen.districtOfBirth || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Address and Issuance */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px dashed var(--card-border)', paddingBottom: '0.5rem' }}>
                Residential & Card Details
              </h4>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <MapPin size={16} style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered Postal Address</div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: '1.4' }}>
                    {citizen.address_house || citizen.addressHouse || ''} {citizen.address_road || citizen.addressRoad || ''}<br />
                    {citizen.address_city || citizen.addressCity || ''} {citizen.address_postal_code || citizen.addressPostalCode || ''}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Calendar size={16} style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>NIC Card Issued Date</div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{citizen.issued_date || citizen.issuedDate || 'N/A'}</div>
                </div>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Registry Status: ACTIVE</span>
            <span>Department of Registration of Persons, Sri Lanka</span>
          </div>

        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
