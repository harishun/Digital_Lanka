import React, { useState } from 'react';

/**
 * CitizenProfileCard — Standalone Smart Citizen ID & Driving License Card.
 * Front side: Large, prominent text filling space cleanly.
 * Back side: Compact classes and dates to accommodate future vehicle classes easily.
 */
export default function CitizenProfileCard({ currentUser }) {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!currentUser) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]} / ${parts[1]} / ${parts[0]}`;
    return dateStr;
  };

  const vehicleClasses = currentUser.vehicleClasses || [];

  return (
    <div 
      className="id-card-wrapper animate-fade-in"
      style={{ 
        perspective: '1200px', 
        cursor: 'pointer', 
        width: '100%',
        maxWidth: '540px',
        margin: '0 auto 24px auto',
        aspectRatio: '85.6 / 54'
      }} 
      onClick={() => setIsFlipped(!isFlipped)}
      title="Click card to flip between Front and Back"
    >
      <div 
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* ── FRONT SIDE ── */}
        <div 
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            boxSizing: 'border-box',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            borderRadius: '16px',
            background: 'linear-gradient(145deg, var(--c-card-bg, #ffffff) 0%, var(--c-card-sub-bg, #f8fafc) 100%)',
            border: '1.5px solid var(--c-card-border, #cbd5e1)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.12), 0 2px 6px rgba(0,35,102,0.06)',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            transition: 'background-color 0.3s ease, border-color 0.3s ease'
          }}
        >
          {/* Card Header Band */}
          <div style={{
            background: 'linear-gradient(135deg, var(--c-primary, #002366) 0%, #001845 100%)',
            color: '#ffffff',
            padding: '12px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxSizing: 'border-box',
            borderBottom: '3px solid #fbbf24'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                border: '2px solid #ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
              }}>🇱🇰</div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#93c5fd', display: 'block' }}>
                  DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA
                </span>
                <h2 style={{ margin: '1px 0 0 0', fontSize: '16px', fontWeight: '900', color: '#ffffff', letterSpacing: '0.4px' }}>
                  NATIONAL SMART IDENTITY & DRIVING LICENSE
                </h2>
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(74, 222, 128, 0.22)',
              border: '1.5px solid rgba(74, 222, 128, 0.7)',
              padding: '5px 14px', borderRadius: '20px'
            }}>
              <span className="material-icons" style={{ fontSize: '16px', color: '#4ade80' }}>verified</span>
              <span style={{ fontSize: '13px', fontWeight: '900', color: '#ffffff', letterSpacing: '0.5px' }}>ACTIVE</span>
            </div>
          </div>

          {/* Card Body */}
          <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '125px 1fr', gap: '20px', flex: 1, alignItems: 'center' }}>
              {/* Photo & NIC */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  position: 'relative', width: '110px', height: '124px', borderRadius: '14px',
                  overflow: 'hidden', border: '2px solid var(--c-card-border, #cbd5e1)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                }}>
                  <div style={{
                    width: '100%', height: '100%',
                    background: 'linear-gradient(160deg, #3b82f6 0%, var(--c-primary, #002366) 70%, #001845 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#ffffff', fontSize: '48px', fontWeight: '800'
                  }}>
                    {currentUser.fullName ? currentUser.fullName.charAt(0) : 'U'}
                  </div>
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(to top, rgba(0,35,102,0.95), rgba(0,35,102,0.6))',
                    color: '#ffffff', fontSize: '11px', fontWeight: '800', textAlign: 'center',
                    padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.6px'
                  }}>
                    {currentUser.role || 'CITIZEN'}
                  </div>
                </div>
                <div style={{ marginTop: '10px', textAlign: 'center', width: '100%' }}>
                  <span style={{ fontSize: '11px', color: 'var(--c-card-subtext, #64748b)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px' }}>NIC NUMBER</span>
                  <p style={{
                    margin: '3px 0 0 0', fontSize: '14.5px', fontWeight: '900',
                    color: 'var(--c-primary, #002366)',
                    letterSpacing: '0.6px', fontFamily: "'Courier New', monospace",
                    background: 'var(--c-card-sub-bg, #f1f5f9)', padding: '4px 8px', borderRadius: '6px',
                    border: '1px solid var(--c-card-border, #cbd5e1)'
                  }}>
                    {currentUser.nic}
                  </p>
                </div>
              </div>

              {/* Citizen Details */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '4px 0' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--c-card-subtext, #64748b)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px' }}>FULL NAME</span>
                  <h3 style={{ margin: '3px 0 0 0', fontSize: '19px', fontWeight: '900', color: 'var(--c-card-text, #0f172a)', textTransform: 'uppercase', letterSpacing: '0.3px', lineHeight: '1.2' }}>
                    {currentUser.fullName}
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 14px' }}>
                  {[
                    { label: 'DATE OF BIRTH', value: formatDate(currentUser.dateOfBirth), color: 'var(--c-card-text, #0f172a)' },
                    { label: 'GENDER', value: currentUser.gender || 'Male', color: 'var(--c-card-text, #0f172a)' },
                    { label: 'BLOOD GROUP', value: currentUser.bloodGroup || 'B+', color: '#dc2626' },
                    { label: 'ORGAN DONOR', value: currentUser.donor ? 'YES ✓' : 'NO', color: currentUser.donor ? '#16a34a' : 'var(--c-card-text, #0f172a)' }
                  ].map((f, i) => (
                    <div key={i}>
                      <span style={{ fontSize: '10.5px', color: 'var(--c-card-subtext, #64748b)', fontWeight: '800', textTransform: 'uppercase' }}>{f.label}</span>
                      <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: '800', color: f.color }}>{f.value}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <span style={{ fontSize: '10.5px', color: 'var(--c-card-subtext, #64748b)', fontWeight: '800', textTransform: 'uppercase' }}>PERMANENT ADDRESS</span>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13.5px', fontWeight: '700', color: 'var(--c-card-text, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser.address || 'No. 45, Flower Road, Colombo 07'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1.5px solid var(--c-card-border, #e2e8f0)', paddingTop: '10px', marginTop: '10px' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--c-card-subtext, #64748b)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                ISSUE DATE: {currentUser.dateOfIssue || '10 / 04 / 1995'}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--c-primary, #002366)', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="material-icons" style={{ fontSize: '17px' }}>flip_to_back</span>
                FLIP CARD →
              </span>
            </div>
          </div>
        </div>

        {/* ── BACK SIDE — Compact Classes & Dates to fit future classes ── */}
        <div 
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            boxSizing: 'border-box',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: '16px',
            background: 'linear-gradient(145deg, var(--c-card-bg, #ffffff) 0%, var(--c-card-sub-bg, #f8fafc) 100%)',
            border: '1.5px solid var(--c-card-border, #cbd5e1)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.12), 0 2px 6px rgba(0,35,102,0.06)',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            transition: 'background-color 0.3s ease, border-color 0.3s ease'
          }}
        >
          {/* Back Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--c-primary, #002366) 0%, #001845 100%)',
            color: '#ffffff', padding: '10px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxSizing: 'border-box',
            borderBottom: '2.5px solid #fbbf24'
          }}>
            <div>
              <span style={{ fontSize: '9.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#93c5fd', display: 'block' }}>
                DEPARTMENT OF MOTOR TRAFFIC • SRI LANKA
              </span>
              <h3 style={{ margin: '1px 0 0 0', fontSize: '13.5px', fontWeight: '900', color: '#ffffff' }}>
                AUTHORIZED VEHICLE DRIVING CLASSES
              </h3>
            </div>
            <span style={{
              fontSize: '11px', fontWeight: '900', color: '#ffffff', fontFamily: "'Courier New', monospace",
              background: 'rgba(255,255,255,0.15)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.25)'
            }}>
              {currentUser.licenseNumber || 'DL-1972045-Y'}
            </span>
          </div>

          {/* Classes Table — Compact row padding & crisp font size */}
          <div style={{ flex: 1, padding: '10px 14px', overflowY: 'auto' }}>
            {vehicleClasses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--c-card-subtext, #64748b)' }}>
                <span className="material-icons" style={{ fontSize: '32px', opacity: 0.4 }}>no_crash</span>
                <p style={{ margin: '6px 0 0 0', fontSize: '13px', fontWeight: '700', color: 'var(--c-card-subtext, #475569)' }}>No driving classes authorized.</p>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '55px 1fr 85px 85px',
                  gap: '6px', padding: '4px 6px',
                  borderBottom: '2px solid var(--c-primary, #002366)',
                  marginBottom: '4px'
                }}>
                  {['CLASS', 'DESCRIPTION', 'ISSUED', 'EXPIRY'].map(h => (
                    <span key={h} style={{ fontSize: '9.5px', fontWeight: '900', color: 'var(--c-primary, #002366)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</span>
                  ))}
                </div>

                {/* Rows */}
                {vehicleClasses.map((cls, idx) => (
                  <div 
                    key={cls.classCode || idx} 
                    style={{
                      display: 'grid', gridTemplateColumns: '55px 1fr 85px 85px',
                      gap: '6px', padding: '4px 6px',
                      background: idx % 2 === 0 ? 'var(--c-card-sub-bg, #f8fafc)' : 'transparent',
                      borderRadius: '4px', alignItems: 'center',
                      marginBottom: '2px'
                    }}
                  >
                    <span style={{
                      fontSize: '11px', fontWeight: '900', color: '#ffffff',
                      background: 'var(--c-primary, #002366)',
                      padding: '2px 6px', borderRadius: '4px', textAlign: 'center',
                      display: 'inline-block'
                    }}>
                      {cls.classCode}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--c-card-text, #334155)' }}>
                      {cls.description}
                    </span>
                    <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--c-card-text, #0f172a)', fontFamily: "'Courier New', monospace" }}>
                      {cls.issuedDate || cls.issued || '15/03/2015'}
                    </span>
                    <span style={{
                      fontSize: '10.5px', fontWeight: '700', fontFamily: "'Courier New', monospace",
                      color: cls.expired ? '#dc2626' : '#16a34a'
                    }}>
                      {cls.expiryDate || cls.expiry || '14/03/2035'}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Back Footer */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 16px', borderTop: '1.5px solid var(--c-card-border, #e2e8f0)'
          }}>
            <span style={{ fontSize: '9.5px', color: 'var(--c-card-subtext, #64748b)', fontWeight: '800' }}>DIGITAL LANKA SMART CITIZEN ECOSYSTEM</span>
            <span style={{ fontSize: '11.5px', color: 'var(--c-primary, #002366)', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ← FLIP TO FRONT
              <span className="material-icons" style={{ fontSize: '15px' }}>flip_to_front</span>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
