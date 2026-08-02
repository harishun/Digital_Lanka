import React, { useState } from 'react';

/**
 * CitizenProfileCard — National Identity Card component adhering to application brand colors:
 * - Primary Brand Color: var(--c-primary, #002366)
 * - Front Top Header: Features Sri Lankan National Emblem Crest & Republic Header.
 * - Dynamic Multiple Vehicle Classes Handling: Auto-adjusting flex-wrap and scroll containers
 *   on both FRONT (badges) and BACK (metadata table) so that any number of vehicle classes (1 to 10+)
 *   are handled cleanly without breaking card height alignment (fixed 350px).
 * - 3D Hardware-Accelerated Flip between FRONT and BACK.
 */
export default function CitizenProfileCard({ currentUser }) {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!currentUser) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '01 / 01 / 1990';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]} / ${parts[1]} / ${parts[0]}`;
    }
    return dateStr;
  };

  const vehicleClasses = currentUser.vehicleClasses || [];

  return (
    <div 
      className="id-card-wrapper animate-fade-in"
      style={{ perspective: '1000px', cursor: 'pointer', width: '100%', marginBottom: '24px' }} 
      onClick={() => setIsFlipped(!isFlipped)}
      title="Click card to flip between Front and Back"
    >
      <div 
        style={{
          position: 'relative',
          width: '100%',
          height: '340px',
          transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* ── FRONT SIDE ─────────────────────────────────────────────────── */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: '14px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between'
          }}
        >
          {/* Top Brand Header Bar with Sri Lankan National Emblem */}
          <div style={{ background: 'var(--c-primary, #002366)', color: '#ffffff', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '62px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fbbf24', border: '1.5px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} title="Democratic Socialist Republic of Sri Lanka Emblem">
                🇱🇰
              </div>
              <div>
                <span style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#93c5fd', display: 'block', marginBottom: '3px', paddingTop: '2px' }}>
                  REPUBLIC OF SRI LANKA • NATIONAL IDENTITY CARD
                </span>
                <h2 style={{ margin: 0, fontSize: '13.5px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.5px' }}>
                  SRI LANKA SMART IDENTITY & DRIVING LICENSE
                </h2>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.1)', padding: '3px 8px', borderRadius: '6px' }}>
              <span className="material-icons" style={{ fontSize: '15px', color: '#4ade80' }}>verified</span>
              <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.5px' }}>
                ACTIVE
              </span>
            </div>
          </div>

          {/* Card Front Content Area (Evenly Distributed) */}
          <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '18px' }}>
              
              {/* Left Column: Photo & NIC Number */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'relative', width: '105px', height: '115px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1', background: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #3b82f6 0%, var(--c-primary, #002366) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '40px', fontWeight: '800' }}>
                    {currentUser.fullName ? currentUser.fullName.charAt(0) : 'U'}
                  </div>
                  <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--c-primary, #002366)', border: '2px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-icons" style={{ fontSize: '12px', color: '#ffffff' }}>check</span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '8.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                    NIC NUMBER
                  </span>
                  <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                    {currentUser.nic}
                  </span>
                </div>
              </div>

              {/* Right Column: User Details */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
                
                {/* Full Name */}
                <div>
                  <span style={{ fontSize: '8.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                    FULL NAME
                  </span>
                  <h3 style={{ margin: '1px 0 0 0', fontSize: '16.5px', fontWeight: '800', color: '#0f172a', letterSpacing: '0.2px' }}>
                    {currentUser.fullName}
                  </h3>
                </div>

                {/* Date of Birth & Blood Group/Organ Donor (Side by Side) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '8px', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '8.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                      DATE OF BIRTH
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', fontFamily: 'monospace', display: 'block', marginTop: '1px' }}>
                      {formatDate(currentUser.dateOfBirth)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '13px' }}>🩸</span>
                      <div>
                        <span style={{ fontSize: '7px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>BLOOD</span>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a' }}>{currentUser.bloodGroup || 'O+'}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '13px' }}>💚</span>
                      <div>
                        <span style={{ fontSize: '7px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>DONOR</span>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a' }}>{currentUser.donor !== false ? 'YES' : 'NO'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Driving Eligibility: Handles 1 to 10+ vehicle classes with auto-wrapping & max height scroll */}
                <div style={{ background: '#f8fafc', padding: '7px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '8.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      DRIVING ELIGIBILITY ({vehicleClasses.length} CLASSES)
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: '800', fontSize: '11.5px' }}>
                      <span>VALID</span>
                      <span className="material-icons" style={{ fontSize: '14px' }}>check_circle_outline</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', maxHeight: '58px', overflowY: 'auto', paddingRight: '2px' }}>
                    {vehicleClasses.map((vc) => (
                      <span key={vc.classCode} style={{ background: 'var(--c-primary, #002366)', color: '#ffffff', fontSize: '9.5px', fontWeight: '800', padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        CLASS {vc.classCode}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Row: Digital Signature & Issued By */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '6px', marginTop: '6px' }}>
              <div>
                <span style={{ fontSize: '8px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                  DIGITAL SIGNATURE
                </span>
                <div style={{ fontFamily: '"Brush Script MT", cursive, sans-serif', fontSize: '18px', color: '#1e293b', padding: '2px 8px', borderRadius: '4px', border: '1px dashed #cbd5e1', marginTop: '2px', background: '#fafafa', display: 'inline-block' }}>
                  {currentUser.fullName || 'Johnathan Doe'}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '8px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>ISSUED BY</span>
                <span style={{ fontSize: '9.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>CENTRAL IDENTITY AUTHORITY</span>
              </div>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '4px', textAlign: 'center', fontSize: '9px', color: '#64748b', borderTop: '1px solid #edf2f7' }}>
            🔄 Click Card to Flip to Reverso / Card Back
          </div>
        </div>

        {/* ── BACK SIDE ──────────────────────────────────────────────────── */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: '14px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between'
          }}
        >
          {/* Top Brand Header Bar */}
          <div style={{ background: 'var(--c-primary, #002366)', color: '#ffffff', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '62px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fbbf24', border: '1.5px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} title="Democratic Socialist Republic of Sri Lanka Emblem">
                🇱🇰
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#ffffff' }}>
                CARD BACK / REVERSO
              </span>
            </div>

            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#93c5fd' }}>
              NATIONAL IDENTITY SYSTEM
            </span>
          </div>

          {/* Card Back Main Info Container */}
          <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            
            {/* Address & Place of Birth Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                  PERMANENT ADDRESS
                </span>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', fontWeight: '700', color: '#0f172a', lineHeight: '1.3' }}>
                  {currentUser.address || '123 Heritage Lane, Capital City, Metro Province'}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                  PLACE OF BIRTH
                </span>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>
                  {currentUser.placeOfBirth || 'Capital City General Hospital'}
                </p>
              </div>
            </div>

            {/* Driving License Metadata Container (Auto-scrolls if 4+ vehicle classes exist) */}
            <div style={{ background: 'rgba(0, 35, 102, 0.04)', border: '1px solid rgba(0, 35, 102, 0.12)', borderRadius: '10px', padding: '12px 14px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-icons" style={{ fontSize: '16px', color: 'var(--c-primary, #002366)' }}>directions_car</span>
                  <h4 style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: 'var(--c-primary, #002366)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    DRIVING LICENSE METADATA
                  </h4>
                </div>
                <span style={{ fontSize: '9.5px', fontWeight: '800', color: 'var(--c-primary, #002366)', background: 'rgba(0,35,102,0.08)', padding: '1px 6px', borderRadius: '4px' }}>
                  {vehicleClasses.length} CLASSES AUTHORIZED
                </span>
              </div>

              {/* Table Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '8px', fontSize: '9px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '6px' }}>
                <span>VEHICLE CLASS</span>
                <span>ISSUED DATE</span>
                <span>EXPIRY DATE</span>
              </div>

              {/* Table Rows (Max height 135px scrollable for multiple vehicle classes) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '135px', overflowY: 'auto', paddingRight: '2px' }}>
                {vehicleClasses.map((vc) => (
                  <div key={vc.classCode} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '8px', alignItems: 'center', fontSize: '11px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ background: 'var(--c-primary, #002366)', color: '#ffffff', fontSize: '9px', fontWeight: '800', padding: '1px 6px', borderRadius: '3px', minWidth: '18px', textAlign: 'center' }}>
                        {vc.classCode}
                      </span>
                      <span style={{ fontWeight: '700', color: '#1e293b' }}>
                        {vc.description || (vc.classCode === 'A' ? 'Motorcycle' : vc.classCode === 'B' ? 'Passenger' : 'Vehicle')}
                      </span>
                    </div>

                    <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#334155' }}>
                      {formatDate(vc.issuedDate)}
                    </span>

                    <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#334155' }}>
                      {formatDate(vc.expiryDate)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Row Note */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #edf2f7', paddingTop: '6px', marginTop: '6px' }}>
              <span style={{ fontSize: '8.5px', color: '#64748b', fontStyle: 'italic' }}>
                OFFICIAL REPUBLIC OF SRI LANKA IDENTITY CREDENTIAL
              </span>
              <span style={{ fontSize: '8.5px', fontWeight: '800', color: 'var(--c-primary, #002366)' }}>
                CENTRAL AUTHORITY
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
