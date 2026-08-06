import React, { useEffect } from 'react';

/**
 * VehicleCarousel — Vehicle Carousel component.
 * Maintained gap in Row 2 when empty so header spacing never collapses.
 * Enlarged text sizes on vehicle cards for maximum clarity and visual impact.
 * When empty (0 vehicles), the Register New Vehicle button is placed directly in the center of the empty card box.
 */
export default function VehicleCarousel({
  vehicles,
  activeVehicleIndex,
  setActiveVehicleIndex,
  handlePrevVehicle,
  handleNextVehicle,
  openAccessControlModal,
  openDocModal,
  handleMarkAsStolen,
  isModalOpen = false,
  onRegisterClick
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isModalOpen) return;
      if (['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowLeft') handlePrevVehicle();
      else if (e.key === 'ArrowRight') handleNextVehicle();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [vehicles.length, isModalOpen, handlePrevVehicle, handleNextVehicle]);

  return (
    <div 
      className="vehicle-carousel-container glass-card" 
      style={{ 
        padding: '20px', borderRadius: '16px', 
        border: '1px solid var(--glass-border)',
        maxWidth: '540px', margin: '0 auto',
        width: '100%', height: '440px', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
      }}
    >
      {/* ── Top Header Section ── */}
      <div>
        {/* Row 1: Section Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="material-icons" style={{ color: 'var(--c-primary)', fontSize: '24px' }}>directions_car</span>
          <h2 className="section-title" style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: 'var(--c-text-bright)' }}>
            My Registered Vehicles
          </h2>
          {vehicles.length > 0 && (
            <span style={{ background: 'rgba(59, 130, 246, 0.12)', color: 'var(--c-primary)', fontSize: '12px', fontWeight: '800', padding: '2px 9px', borderRadius: '12px' }}>
              {vehicles.length}
            </span>
          )}
        </div>

        {/* Row 2: Controls Row — ALWAYS maintained so top gap never collapses */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', minHeight: '34px' }}>
          <div>
            {vehicles.length > 0 && onRegisterClick && (
              <button 
                onClick={onRegisterClick}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: '700', padding: '7px 16px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                <span className="material-icons" style={{ fontSize: '17px' }}>add_circle</span>
                Register New Vehicle
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '80px', justifyContent: 'flex-end' }}>
            {vehicles.length > 1 && (
              <>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--c-secondary)', marginRight: '4px' }}>
                  {activeVehicleIndex + 1} / {vehicles.length}
                </span>
                <button onClick={handlePrevVehicle} className="carousel-nav-btn" style={{ width: '32px', height: '32px', minWidth: '32px', borderRadius: '6px' }} title="Previous Vehicle">
                  <span className="material-icons" style={{ fontSize: '20px' }}>chevron_left</span>
                </button>
                <button onClick={handleNextVehicle} className="carousel-nav-btn" style={{ width: '32px', height: '32px', minWidth: '32px', borderRadius: '6px' }} title="Next Vehicle">
                  <span className="material-icons" style={{ fontSize: '20px' }}>chevron_right</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {vehicles.length === 0 ? (
          /* Empty State — Register Button Centered inside card */
          <div style={{ 
            flex: 1, padding: '24px', textAlign: 'center', 
            background: 'var(--c-card-sub-bg, #f8fafc)', borderRadius: '14px',
            border: '1.5px dashed var(--c-card-border, #cbd5e1)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
            boxSizing: 'border-box'
          }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '50%', 
              background: 'rgba(0, 35, 102, 0.08)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              color: 'var(--c-primary, #002366)' 
            }}>
              <span className="material-icons" style={{ fontSize: '34px' }}>directions_car</span>
            </div>

            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '17.5px', fontWeight: '800', color: 'var(--c-card-text, #0f172a)' }}>
                No Vehicles Registered
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--c-card-subtext, #475569)', lineHeight: '1.5' }}>
                You don't have any vehicles linked to your NIC yet.<br />
                Register your first vehicle to get started.
              </p>
            </div>

            {onRegisterClick && (
              <button 
                onClick={onRegisterClick}
                className="btn-primary"
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', 
                  fontSize: '14px', fontWeight: '800', 
                  padding: '12px 24px', borderRadius: '10px', 
                  cursor: 'pointer', marginTop: '4px',
                  boxShadow: '0 4px 14px rgba(0, 35, 102, 0.25)'
                }}
              >
                <span className="material-icons" style={{ fontSize: '20px' }}>add_circle</span>
                Register New Vehicle
              </button>
            )}
          </div>
        ) : (
          /* Populated Carousel — Enlarged Typography */
          <div style={{ overflow: 'hidden', width: '100%', borderRadius: '12px', height: '100%' }}>
            <div style={{
              display: 'flex',
              transform: `translateX(-${activeVehicleIndex * 100}%)`,
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              width: '100%', height: '100%'
            }}>
              {vehicles.map((v, idx) => {
                const isStolen = v.status?.toUpperCase() === 'STOLEN';
                const customName = v.customName || v.custom_name || v.customTitle || 'My Vehicle';
                const make = v.make || v.brand || 'Toyota';
                const model = v.model || 'Prius';
                const color = v.color || 'Pearl White';

                return (
                  <div key={v.id || v.plateNumber || idx} style={{ flex: '0 0 100%', width: '100%', height: '100%', boxSizing: 'border-box', padding: '2px' }}>
                    <div className="vehicle-featured-card" style={{ 
                      background: 'var(--c-card-bg, #ffffff)', 
                      border: '1.5px solid var(--c-card-border, #e2e8f0)', 
                      borderRadius: '14px', padding: '16px 18px', 
                      boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      height: '100%', boxSizing: 'border-box',
                      transition: 'background-color 0.3s ease, border-color 0.3s ease'
                    }}>
                      <div>
                        {/* Custom Name & Status */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--c-card-subtext, #64748b)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>VEHICLE NICKNAME</span>
                            <h3 style={{ margin: '2px 0 0 0', fontSize: '19.5px', fontWeight: '900', color: 'var(--c-card-text, #0f172a)' }}>{customName}</h3>
                          </div>

                          <div 
                            onClick={() => openDocModal(v, 'vrc')}
                            className={`status-tag ${isStolen ? 'stolen' : 'active'}`} 
                            style={{ 
                              padding: '5px 12px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer', 
                              display: 'flex', alignItems: 'center', gap: '5px',
                              boxShadow: isStolen ? '0 2px 8px rgba(220,38,38,0.25)' : '0 2px 8px rgba(22,163,74,0.25)',
                              border: isStolen ? '1.5px solid #dc2626' : '1.5px solid #16a34a'
                            }}
                            title="Click to inspect verified compliance documents"
                          >
                            <span className="material-icons" style={{ fontSize: '15px' }}>{isStolen ? 'warning' : 'description'}</span>
                            <span>{isStolen ? 'STOLEN' : 'ACTIVE • VIEW DOCS 📄'}</span>
                          </div>
                        </div>

                        {/* License Plate — Large & Prominent */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                          <div style={{ 
                            background: '#ffffff', border: '2.5px solid #0f172a', borderRadius: '8px', 
                            padding: '5px 18px', display: 'flex', alignItems: 'center', gap: '10px',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                          }}>
                            <span style={{ fontSize: '11.5px', fontWeight: '900', background: 'var(--c-primary, #002366)', color: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>LK</span>
                            <span style={{ fontSize: '25px', fontWeight: '900', fontFamily: 'monospace', letterSpacing: '1.5px', color: '#0f172a' }}>
                              {v.plateNumber || 'WP CAD-1234'}
                            </span>
                          </div>
                        </div>

                        {/* Specs Grid — Larger labels & values */}
                        <div style={{ 
                          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 10px', 
                          background: 'var(--c-card-sub-bg, #f8fafc)', padding: '10px 14px', borderRadius: '10px', 
                          border: '1px solid var(--c-card-border, #e2e8f0)' 
                        }}>
                          {[
                            { label: 'MAKE / BRAND', value: make },
                            { label: 'MODEL', value: model },
                            { label: 'COLOR', value: color },
                            { label: 'VEHICLE CLASS', value: `Class ${v.vehicleClass || 'B'}` },
                            { label: 'FUEL TYPE', value: v.fuelType || 'Petrol / Hybrid', span: 2 }
                          ].map((spec, i) => (
                            <div key={i} style={spec.span ? { gridColumn: `span ${spec.span}` } : {}}>
                              <span style={{ fontSize: '10px', color: 'var(--c-card-subtext, #64748b)', fontWeight: '800', textTransform: 'uppercase' }}>{spec.label}</span>
                              <p style={{ margin: '2px 0 0 0', fontSize: '13.5px', fontWeight: '800', color: 'var(--c-card-text, #0f172a)' }}>{spec.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons — Bold & Larger */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px', marginTop: '10px' }}>
                        <button onClick={() => handleMarkAsStolen(v.id || v.plateNumber)} className="btn-primary" style={{ 
                          width: '100%', justifyContent: 'center', padding: '11px 8px', fontSize: '12px', fontWeight: '800', borderRadius: '8px', 
                          background: isStolen ? '#b91c1c' : '#dc2626', color: '#ffffff', letterSpacing: '0.3px' 
                        }} title={isStolen ? 'Vehicle flagged as STOLEN' : 'Report vehicle as STOLEN'}>
                          <span className="material-icons" style={{ fontSize: '16px' }}>report_problem</span>
                          {isStolen ? 'STOLEN' : 'REPORT STOLEN'}
                        </button>
                        <button onClick={() => openAccessControlModal(v)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px 8px', fontSize: '12.5px', fontWeight: '800', borderRadius: '8px', letterSpacing: '0.3px' }}>
                          <span className="material-icons" style={{ fontSize: '16px' }}>vpn_key</span>
                          ACCESS CONTROL
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Fixed Footer Pagination Bar ── */}
      <div style={{ height: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '8px' }}>
        {vehicles.length > 1 && (
          <div style={{ display: 'flex', gap: '6px' }}>
            {vehicles.map((v, idx) => (
              <button key={v.id || v.plateNumber || idx} onClick={() => setActiveVehicleIndex(idx)}
                className={`carousel-dot ${activeVehicleIndex === idx ? 'active' : ''}`}
                style={{ height: '6px', width: activeVehicleIndex === idx ? '20px' : '6px', borderRadius: '4px',
                  background: activeVehicleIndex === idx ? 'var(--c-primary)' : 'var(--c-card-border, #cbd5e1)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }} title={`Go to vehicle ${idx + 1}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
