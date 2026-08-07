import React from 'react';

/**
 * OfficerProfileCard — Specialized Profile Card for Law Enforcement Officers.
 */
export default function OfficerProfileCard({ currentUser }) {
  if (!currentUser) return null;

  return (
    <div 
      className="id-card-wrapper animate-fade-in"
      style={{ 
        width: '100%',
        maxWidth: '540px',
        margin: '0 auto 24px auto',
        aspectRatio: '85.6 / 54'
      }} 
    >
      <div 
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          borderRadius: '16px',
          background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
          border: '1.5px solid rgba(59, 130, 246, 0.4)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.4), 0 2px 6px rgba(59, 130, 246, 0.2)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column'
        }}
      >
        {/* Card Header Band */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #001845 100%)',
          color: '#ffffff',
          padding: '12px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxSizing: 'border-box',
          borderBottom: '3px solid #60a5fa'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              border: '2px solid #ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
            }}>
              <span className="material-icons" style={{ fontSize: '20px', color: '#ffffff' }}>local_police</span>
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#93c5fd', display: 'block' }}>
                SRI LANKA POLICE DEPARTMENT
              </span>
              <h2 style={{ margin: '1px 0 0 0', fontSize: '16px', fontWeight: '900', color: '#ffffff', letterSpacing: '0.4px' }}>
                LAW ENFORCEMENT CREDENTIAL
              </h2>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(59, 130, 246, 0.22)',
            border: '1.5px solid rgba(59, 130, 246, 0.7)',
            padding: '5px 14px', borderRadius: '20px'
          }}>
            <span className="material-icons" style={{ fontSize: '16px', color: '#60a5fa' }}>gavel</span>
            <span style={{ fontSize: '13px', fontWeight: '900', color: '#ffffff', letterSpacing: '0.5px' }}>ON DUTY</span>
          </div>
        </div>

        {/* Card Body */}
        <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '125px 1fr', gap: '20px', flex: 1, alignItems: 'center' }}>
            
            {/* Photo Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ 
                width: '125px', height: '150px', 
                borderRadius: '8px', 
                background: '#cbd5e1', 
                border: '2px solid rgba(255,255,255,0.2)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                position: 'relative', overflow: 'hidden'
              }}>
                <img 
                  src={`https://i.pravatar.cc/300?u=${currentUser.nic}`}
                  alt="Officer Photo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>

            {/* Officer Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 6px', width: '100%' }}>
              
              <div style={{ gridColumn: 'span 2', marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Full Name</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', lineHeight: '1.2' }}>{currentUser.fullName}</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Rank</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#f1f5f9' }}>{currentUser.rank || 'Traffic Officer'}</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Batch Number</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#f1f5f9' }}>{currentUser.batchNumber || 'N/A'}</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>National ID</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#f1f5f9' }}>{currentUser.nic}</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Station</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#f1f5f9' }}>{currentUser.policeStation || 'Traffic Division'}</div>
              </div>

            </div>
          </div>
          
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>
              Digital Lanka Police Net
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Authorized Signature</div>
              <div style={{ fontSize: '24px', fontFamily: '"Brush Script MT", cursive', color: '#cbd5e1', lineHeight: '0.8', marginTop: '6px' }}>{currentUser.fullName.split(' ')[0]}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
