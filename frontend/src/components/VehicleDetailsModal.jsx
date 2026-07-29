import React, { useState } from 'react';

/**
 * VehicleDetailsModal — Modal dialog displaying:
 * 1. Relevant details of government-verified vehicle documents.
 * 2. Current active authorized users/drivers.
 * 3. Interactive toggle to reveal previous access history (revoked, expired, declined records).
 */
export default function VehicleDetailsModal({
  isOpen,
  onClose,
  currentVehicle,
  vehicleDocs,
  authorizations = [],
  expandedDoc,
  setExpandedDoc,
  showHistory,
  setShowHistory,
  handleRevokeAccess,
  handleMarkAsStolen
}) {
  if (!isOpen || !currentVehicle) return null;

  // Filter current active vs past history authorizations
  const currentAuthorizedDrivers = authorizations.filter(a => a.status === 'GRANTED' || a.status === 'PENDING');
  const pastAccessHistory = authorizations.filter(a => a.status === 'REVOKED' || a.status === 'EXPIRED' || a.status === 'DECLINED');

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-card animate-fade-in" style={{ maxWidth: '680px', padding: '32px', background: '#ffffff', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #edf2f7', paddingBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--c-primary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              DMT GOVERNMENT VEHICLE REGISTRY & ACCESS MANAGEMENT
            </span>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '800', color: 'var(--c-text-bright)' }}>
              {currentVehicle.plateNumber}
            </h2>
            <span style={{ fontSize: '13px', color: 'var(--c-secondary)' }}>
              {currentVehicle.model || 'Toyota Prius'} | Class {currentVehicle.vehicleClass || 'B'} | Owner NIC: <strong>{currentVehicle.ownerNic}</strong>
            </span>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
            <span className="material-icons" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* Section 1: Detailed Government Documents */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-icons" style={{ fontSize: '18px', color: 'var(--c-primary)' }}>description</span>
            Verified Document Details (DMT Government Database)
          </h3>
          
          {vehicleDocs ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* Vehicle Registration Certificate (VRC) */}
              {vehicleDocs.vrc && (
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden' }}>
                  <div 
                    onClick={() => setExpandedDoc(expandedDoc === 'vrc' ? null : 'vrc')}
                    style={{ padding: '12px 16px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="material-icons" style={{ color: 'var(--c-primary)', fontSize: '20px' }}>badge</span>
                      <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>Vehicle Registration Certificate (VRC)</strong>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--c-primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {expandedDoc === 'vrc' ? 'Hide Details' : 'View Details'}
                      <span className="material-icons" style={{ fontSize: '18px' }}>{expandedDoc === 'vrc' ? 'expand_less' : 'expand_more'}</span>
                    </span>
                  </div>
                  {expandedDoc === 'vrc' && (
                    <div style={{ padding: '16px', background: '#ffffff', borderTop: '1px solid #e2e8f0', fontSize: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
                      <div>Doc No: <strong style={{ fontFamily: 'monospace' }}>{vehicleDocs.vrc.docNo}</strong></div>
                      <div>Authority: <strong>{vehicleDocs.vrc.authority}</strong></div>
                      <div>Issue Date: <strong>{vehicleDocs.vrc.issueDate}</strong></div>
                      <div>Expiry Date: <strong>{vehicleDocs.vrc.expiryDate}</strong></div>
                      <div>Chassis No: <strong style={{ fontFamily: 'monospace', color: '#1e293b' }}>{vehicleDocs.vrc.chassisNo}</strong></div>
                      <div>Engine No: <strong style={{ fontFamily: 'monospace', color: '#1e293b' }}>{vehicleDocs.vrc.engineNo}</strong></div>
                    </div>
                  )}
                </div>
              )}

              {/* Revenue License Certificate */}
              {vehicleDocs.revenue && (
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden' }}>
                  <div 
                    onClick={() => setExpandedDoc(expandedDoc === 'revenue' ? null : 'revenue')}
                    style={{ padding: '12px 16px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="material-icons" style={{ color: '#2563eb', fontSize: '20px' }}>receipt_long</span>
                      <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>Revenue License Certificate</strong>
                    </div>
                    <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {expandedDoc === 'revenue' ? 'Hide Details' : 'View Details'}
                      <span className="material-icons" style={{ fontSize: '18px' }}>{expandedDoc === 'revenue' ? 'expand_less' : 'expand_more'}</span>
                    </span>
                  </div>
                  {expandedDoc === 'revenue' && (
                    <div style={{ padding: '16px', background: '#ffffff', borderTop: '1px solid #e2e8f0', fontSize: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
                      <div>License No: <strong style={{ fontFamily: 'monospace' }}>{vehicleDocs.revenue.licenseNo}</strong></div>
                      <div>Status: <strong style={{ color: '#16a34a' }}>{vehicleDocs.revenue.status}</strong></div>
                      <div>Issue Date: <strong>{vehicleDocs.revenue.issueDate}</strong></div>
                      <div>Expiry Date: <strong>{vehicleDocs.revenue.expiryDate}</strong></div>
                      <div>Annual Fee Paid: <strong>{vehicleDocs.revenue.fee}</strong></div>
                      <div>Issuing Authority: <strong>{vehicleDocs.revenue.authority}</strong></div>
                    </div>
                  )}
                </div>
              )}

              {/* Insurance Policy Certificate */}
              {vehicleDocs.insurance && (
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden' }}>
                  <div 
                    onClick={() => setExpandedDoc(expandedDoc === 'insurance' ? null : 'insurance')}
                    style={{ padding: '12px 16px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="material-icons" style={{ color: '#059669', fontSize: '20px' }}>shield</span>
                      <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>Insurance Policy Certificate</strong>
                    </div>
                    <span style={{ fontSize: '12px', color: '#059669', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {expandedDoc === 'insurance' ? 'Hide Details' : 'View Details'}
                      <span className="material-icons" style={{ fontSize: '18px' }}>{expandedDoc === 'insurance' ? 'expand_less' : 'expand_more'}</span>
                    </span>
                  </div>
                  {expandedDoc === 'insurance' && (
                    <div style={{ padding: '16px', background: '#ffffff', borderTop: '1px solid #e2e8f0', fontSize: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
                      <div>Policy No: <strong style={{ fontFamily: 'monospace' }}>{vehicleDocs.insurance.policyNo}</strong></div>
                      <div>Underwriter: <strong>{vehicleDocs.insurance.underwriter}</strong></div>
                      <div>Coverage Type: <strong>{vehicleDocs.insurance.policyType}</strong></div>
                      <div>Annual Premium: <strong>{vehicleDocs.insurance.premium}</strong></div>
                      <div>Issue Date: <strong>{vehicleDocs.insurance.issueDate}</strong></div>
                      <div>Expiry Date: <strong>{vehicleDocs.insurance.expiryDate}</strong></div>
                    </div>
                  )}
                </div>
              )}

              {/* Emission Test Certificate */}
              {vehicleDocs.emission && (
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden' }}>
                  <div 
                    onClick={() => setExpandedDoc(expandedDoc === 'emission' ? null : 'emission')}
                    style={{ padding: '12px 16px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="material-icons" style={{ color: '#d97706', fontSize: '20px' }}>co2</span>
                      <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>Vehicle Emission Certificate</strong>
                    </div>
                    <span style={{ fontSize: '12px', color: '#d97706', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {expandedDoc === 'emission' ? 'Hide Details' : 'View Details'}
                      <span className="material-icons" style={{ fontSize: '18px' }}>{expandedDoc === 'emission' ? 'expand_less' : 'expand_more'}</span>
                    </span>
                  </div>
                  {expandedDoc === 'emission' && (
                    <div style={{ padding: '16px', background: '#ffffff', borderTop: '1px solid #e2e8f0', fontSize: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
                      <div>Test Certificate No: <strong style={{ fontFamily: 'monospace' }}>{vehicleDocs.emission.testNo}</strong></div>
                      <div>Test Result: <strong style={{ color: '#16a34a' }}>{vehicleDocs.emission.result}</strong></div>
                      <div>Testing Center: <strong>{vehicleDocs.emission.testingCenter}</strong></div>
                      <div>CO Concentration: <strong>{vehicleDocs.emission.coValue}</strong></div>
                      <div>Issue Date: <strong>{vehicleDocs.emission.issueDate}</strong></div>
                      <div>Expiry Date: <strong>{vehicleDocs.emission.expiryDate}</strong></div>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--c-secondary)', fontStyle: 'italic' }}>Loading vehicle document parameters from DMT government registry...</p>
          )}
        </div>

        {/* Section 2: Current Authorized Users */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-icons" style={{ fontSize: '18px', color: 'var(--c-primary)' }}>group</span>
              Current Authorized Users ({currentAuthorizedDrivers.length})
            </h3>

            {/* Click to view previous access history */}
            <button 
              onClick={() => setShowHistory(!showHistory)} 
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', color: 'var(--c-primary)', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span className="material-icons" style={{ fontSize: '16px' }}>history</span>
              {showHistory ? 'Hide Access History' : `View Access History (${pastAccessHistory.length})`}
            </button>
          </div>

          {currentAuthorizedDrivers.length === 0 ? (
            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', color: 'var(--c-secondary)', fontStyle: 'italic' }}>
              No current active driver authorizations granted for this vehicle.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentAuthorizedDrivers.map((auth) => (
                <div key={auth.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', padding: '12px 16px', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '13px' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>
                      Driver NIC: <span style={{ fontFamily: 'monospace' }}>{auth.authorizedNic}</span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#166534', marginTop: '2px' }}>
                      Access Type: <strong>{auth.accessType}</strong> | Status: <strong style={{ color: '#15803d' }}>{auth.status}</strong>
                    </div>
                  </div>

                  {auth.status === 'GRANTED' && (
                    <button 
                      onClick={() => handleRevokeAccess(auth.id)} 
                      className="btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '11px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontWeight: '700' }}
                    >
                      REVOKE ACCESS
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Previous Access History (Revealed when clicked) */}
        {showHistory && (
          <div className="animate-fade-in" style={{ marginBottom: '24px', background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-icons" style={{ fontSize: '18px', color: '#64748b' }}>manage_search</span>
              Previous Authorization & Access History Logs
            </h4>

            {pastAccessHistory.length === 0 ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                No past revoked or expired authorization records found in history log.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pastAccessHistory.map((hist) => (
                  <div key={hist.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#334155' }}>
                        Driver NIC: <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>{hist.authorizedNic}</span>
                      </div>
                      <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                        Access: {hist.accessType} | Record ID: {hist.id}
                      </div>
                    </div>

                    <span style={{ fontSize: '11px', fontWeight: '800', color: hist.status === 'REVOKED' ? '#dc2626' : '#64748b', background: hist.status === 'REVOKED' ? '#fef2f2' : '#f1f5f9', padding: '2px 8px', borderRadius: '4px', border: hist.status === 'REVOKED' ? '1px solid #fecaca' : '1px solid #cbd5e1' }}>
                      {hist.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #edf2f7', paddingTop: '20px' }}>
          {currentVehicle.status?.toUpperCase() === 'STOLEN' ? (
            <span style={{ color: '#dc2626', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-icons">warning</span> REPORTED STOLEN
            </span>
          ) : (
            <button 
              onClick={() => handleMarkAsStolen(currentVehicle.plateNumber || currentVehicle.id)} 
              className="btn-secondary" 
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '12px', fontWeight: '700' }}
            >
              <span className="material-icons" style={{ fontSize: '16px' }}>report_problem</span>
              MARK AS STOLEN
            </button>
          )}

          <button onClick={onClose} className="btn-primary" style={{ padding: '8px 24px' }}>
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
}
