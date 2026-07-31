import React, { useEffect } from 'react';

/**
 * VehicleCarousel — Vehicle Carousel component displaying registered vehicles.
 * Document rows open DocumentDetailsModal directly.
 * Side-by-Side Action Buttons: REPORT STOLEN (First) & ACCESS CONTROL buttons directly on each vehicle card.
 * Dynamic Theme Backgrounds: Uses CSS variables (--c-card-bg, --c-card-sub-bg, --c-card-border, --c-card-text)
 * so vehicle cards adapt to Light Mode and Night Mode smoothly.
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
  isModalOpen = false
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isModalOpen) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') {
        handlePrevVehicle();
      } else if (e.key === 'ArrowRight') {
        handleNextVehicle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [vehicles.length, isModalOpen, handlePrevVehicle, handleNextVehicle]);

  return (
    <div 
      className="vehicle-carousel-container glass-card" 
      style={{ 
        padding: '20px', 
        borderRadius: '16px', 
        border: '1px solid var(--glass-border)',
        maxWidth: '520px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Carousel Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-icons" style={{ color: 'var(--c-primary)', fontSize: '22px' }}>directions_car</span>
          <h2 className="section-title" style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--c-text-bright)' }}>
            My Registered Vehicles
          </h2>
          {vehicles.length > 0 && (
            <span style={{ background: 'rgba(59, 130, 246, 0.12)', color: 'var(--c-primary)', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px' }}>
              {vehicles.length}
            </span>
          )}
        </div>

        {vehicles.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--c-secondary)', marginRight: '4px' }}>
              {activeVehicleIndex + 1} / {vehicles.length}
            </span>
            <button 
              onClick={handlePrevVehicle} 
              className="carousel-nav-btn" 
              style={{ width: '30px', height: '30px', minWidth: '30px' }}
              title="Previous Vehicle"
            >
              <span className="material-icons" style={{ fontSize: '20px' }}>chevron_left</span>
            </button>
            <button 
              onClick={handleNextVehicle} 
              className="carousel-nav-btn" 
              style={{ width: '30px', height: '30px', minWidth: '30px' }}
              title="Next Vehicle"
            >
              <span className="material-icons" style={{ fontSize: '20px' }}>chevron_right</span>
            </button>
          </div>
        )}
      </div>

      {/* Carousel Track */}
      {vehicles.length === 0 ? (
        <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--c-secondary)' }}>
          <span className="material-icons" style={{ fontSize: '36px', color: 'var(--c-card-subtext, #cbd5e1)', marginBottom: '6px' }}>no_crash</span>
          <p style={{ margin: 0, fontSize: '13px', fontStyle: 'italic' }}>
            No vehicles registered under this NIC in government records.
          </p>
        </div>
      ) : (
        <div style={{ overflow: 'hidden', width: '100%', borderRadius: '12px' }}>
          <div 
            style={{
              display: 'flex',
              transform: `translateX(-${activeVehicleIndex * 100}%)`,
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              width: '100%'
            }}
          >
            {vehicles.map((v, idx) => {
              const isStolen = v.status?.toUpperCase() === 'STOLEN';
              return (
                <div 
                  key={v.id || v.plateNumber || idx} 
                  style={{
                    flex: '0 0 100%',
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '2px'
                  }}
                >
                  <div 
                    className="vehicle-featured-card" 
                    style={{ 
                      background: 'var(--c-card-bg, #ffffff)', 
                      border: '1px solid var(--c-card-border, #e2e8f0)', 
                      borderRadius: '12px', 
                      padding: '20px', 
                      boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      justify: 'space-between',
                      minHeight: '275px',
                      transition: 'background-color 0.3s ease, border-color 0.3s ease'
                    }}
                  >
                    <div>
                      {/* Top Row: Plate Badge, Model & Status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--c-card-border, #f1f5f9)', paddingBottom: '12px', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="sl-plate-badge" style={{ background: 'var(--c-card-bg, #ffffff)', border: '1.5px solid var(--c-card-border, #1e293b)', borderRadius: '6px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '9px', fontWeight: '800', background: 'var(--c-primary, #002366)', color: '#ffffff', padding: '1px 3px', borderRadius: '2px' }}>LK</span>
                            <span style={{ fontSize: '15px', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '0.5px', color: 'var(--c-card-text, #0f172a)' }}>{v.plateNumber}</span>
                          </div>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--c-text-bright)' }}>
                              {v.model || 'Toyota Prius (Grey)'}
                            </h3>
                          </div>
                        </div>

                        <span className={`status-tag ${isStolen ? 'stolen' : 'active'}`} style={{ padding: '3px 10px', fontSize: '11px' }}>
                          <span className="material-icons" style={{ fontSize: '13px' }}>
                            {isStolen ? 'warning' : 'check_circle'}
                          </span>
                          {v.status || 'ACTIVE'}
                        </span>
                      </div>

                      {/* Class & Fuel Type Row */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'var(--c-card-sub-bg, #f8fafc)', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', border: '1px solid var(--c-card-border, #f1f5f9)' }}>
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--c-card-subtext, #64748b)', fontWeight: '700', textTransform: 'uppercase' }}>Vehicle Class</span>
                          <p style={{ margin: '1px 0 0 0', fontSize: '13px', fontWeight: '800', color: 'var(--c-card-text, #0f172a)' }}>Class {v.vehicleClass || 'B'}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--c-card-subtext, #64748b)', fontWeight: '700', textTransform: 'uppercase' }}>Fuel Type</span>
                          <p style={{ margin: '1px 0 0 0', fontSize: '13px', fontWeight: '800', color: 'var(--c-card-text, #0f172a)' }}>{v.fuelType || 'Petrol / Hybrid'}</p>
                        </div>
                      </div>

                      {/* Detailed Document Statuses Section (Clickable to Inspect Document) */}
                      <div style={{ marginBottom: '16px' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--c-card-subtext, #64748b)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                          DMT Verified Documents (Click to Inspect)
                        </span>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div 
                            onClick={() => openDocModal(v, 'vrc')}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--c-card-sub-bg, #f0fdf4)', border: '1px solid var(--c-card-border, #bbf7d0)', borderRadius: '6px', padding: '8px 10px', fontSize: '11.5px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                            title="Click to view Vehicle Registration Certificate (VRC) details"
                          >
                            <span style={{ fontWeight: '600', color: 'var(--c-card-text, #166534)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="material-icons" style={{ fontSize: '16px', color: '#16a34a' }}>badge</span>
                              Vehicle Registration Certificate (VRC)
                            </span>
                            <span style={{ fontWeight: '800', color: '#16a34a', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              VALID <span className="material-icons" style={{ fontSize: '14px' }}>open_in_new</span>
                            </span>
                          </div>

                          <div 
                            onClick={() => openDocModal(v, 'revenue')}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--c-card-sub-bg, #f0fdf4)', border: '1px solid var(--c-card-border, #bbf7d0)', borderRadius: '6px', padding: '8px 10px', fontSize: '11.5px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                            title="Click to view Revenue License details"
                          >
                            <span style={{ fontWeight: '600', color: 'var(--c-card-text, #166534)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="material-icons" style={{ fontSize: '16px', color: '#16a34a' }}>receipt_long</span>
                              Revenue License Certificate
                            </span>
                            <span style={{ fontWeight: '800', color: '#16a34a', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              ACTIVE <span className="material-icons" style={{ fontSize: '14px' }}>open_in_new</span>
                            </span>
                          </div>

                          <div 
                            onClick={() => openDocModal(v, 'insurance')}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--c-card-sub-bg, #f0fdf4)', border: '1px solid var(--c-card-border, #bbf7d0)', borderRadius: '6px', padding: '8px 10px', fontSize: '11.5px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                            title="Click to view Insurance Policy details"
                          >
                            <span style={{ fontWeight: '600', color: 'var(--c-card-text, #166534)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="material-icons" style={{ fontSize: '16px', color: '#16a34a' }}>shield</span>
                              Insurance Policy Certificate
                            </span>
                            <span style={{ fontWeight: '800', color: '#16a34a', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              VERIFIED <span className="material-icons" style={{ fontSize: '14px' }}>open_in_new</span>
                            </span>
                          </div>

                          <div 
                            onClick={() => openDocModal(v, 'emission')}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--c-card-sub-bg, #f0fdf4)', border: '1px solid var(--c-card-border, #bbf7d0)', borderRadius: '6px', padding: '8px 10px', fontSize: '11.5px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                            title="Click to view Vehicle Emission Certificate details"
                          >
                            <span style={{ fontWeight: '600', color: 'var(--c-card-text, #166534)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="material-icons" style={{ fontSize: '16px', color: '#16a34a' }}>co2</span>
                              Vehicle Emission Certificate
                            </span>
                            <span style={{ fontWeight: '800', color: '#16a34a', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              PASSED <span className="material-icons" style={{ fontSize: '14px' }}>open_in_new</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dual Primary Action Buttons Side-by-Side: REPORT STOLEN (First) & ACCESS CONTROL */}
                    <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px' }}>
                      <button 
                        onClick={() => handleMarkAsStolen(v.id || v.plateNumber)} 
                        className="btn-primary" 
                        style={{ 
                          width: '100%', 
                          justifyContent: 'center', 
                          padding: '11px 8px', 
                          fontSize: '11.5px', 
                          fontWeight: '800', 
                          borderRadius: '8px', 
                          background: isStolen ? '#b91c1c' : '#dc2626',
                          color: '#ffffff',
                          letterSpacing: '0.3px' 
                        }}
                        title={isStolen ? 'Vehicle is currently flagged as STOLEN' : 'Click to report vehicle as STOLEN'}
                      >
                        <span className="material-icons" style={{ fontSize: '16px' }}>report_problem</span>
                        {isStolen ? 'STOLEN' : 'REPORT STOLEN'}
                      </button>

                      <button 
                        onClick={() => openAccessControlModal(v)} 
                        className="btn-primary" 
                        style={{ width: '100%', justifyContent: 'center', padding: '11px 8px', fontSize: '12px', fontWeight: '800', borderRadius: '8px', letterSpacing: '0.3px' }}
                      >
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

      {/* Carousel Pagination Dots */}
      {vehicles.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
          {vehicles.map((v, idx) => (
            <button
              key={v.id || v.plateNumber || idx}
              onClick={() => setActiveVehicleIndex(idx)}
              className={`carousel-dot ${activeVehicleIndex === idx ? 'active' : ''}`}
              style={{
                height: '7px',
                width: activeVehicleIndex === idx ? '22px' : '7px',
                borderRadius: '4px',
                background: activeVehicleIndex === idx ? 'var(--c-primary)' : 'var(--c-card-border, #cbd5e1)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              title={`Go to vehicle ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
