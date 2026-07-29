import React from 'react';

/**
 * DocumentDetailsModal — Modal dialog dedicated EXCLUSIVELY to showing document details
 * (VRC, chassis/engine numbers, revenue license, insurance policy, emission certificate).
 */
export default function DocumentDetailsModal({
  isOpen,
  onClose,
  currentVehicle,
  vehicleDocs,
  expandedDoc,
  setExpandedDoc
}) {
  if (!isOpen || !currentVehicle) return null;

  const docTypes = [
    { key: 'vrc', label: 'Vehicle Registration (VRC)', icon: 'badge', color: 'var(--c-primary)' },
    { key: 'revenue', label: 'Revenue License', icon: 'receipt_long', color: '#2563eb' },
    { key: 'insurance', label: 'Insurance Policy', icon: 'shield', color: '#059669' },
    { key: 'emission', label: 'Emission Certificate', icon: 'co2', color: '#d97706' }
  ];

  const activeDocKey = expandedDoc || 'vrc';

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-card animate-fade-in" style={{ maxWidth: '620px', padding: '32px', background: '#ffffff', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #edf2f7', paddingBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--c-primary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              DMT GOVERNMENT VERIFIED DOCUMENT INSPECTION
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

        {/* Document Selector Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '24px' }}>
          {docTypes.map(doc => (
            <button
              key={doc.key}
              onClick={() => setExpandedDoc(doc.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: activeDocKey === doc.key ? `2px solid ${doc.color}` : '1px solid #e2e8f0',
                background: activeDocKey === doc.key ? '#f8fafc' : '#ffffff',
                color: activeDocKey === doc.key ? '#0f172a' : '#64748b',
                fontWeight: activeDocKey === doc.key ? '700' : '600',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span className="material-icons" style={{ fontSize: '18px', color: doc.color }}>{doc.icon}</span>
              {doc.label}
            </button>
          ))}
        </div>

        {/* Detailed Document Parameters Display */}
        {vehicleDocs ? (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
            
            {/* VRC Document Details */}
            {activeDocKey === 'vrc' && vehicleDocs.vrc && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-icons" style={{ color: 'var(--c-primary)' }}>badge</span>
                    Vehicle Registration Certificate (VRC)
                  </h3>
                  <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '12px' }}>
                    VALID / REGISTERED
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', fontSize: '13px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Certificate Number</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '700', fontFamily: 'monospace', color: '#0f172a' }}>{vehicleDocs.vrc.docNo}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Chassis Number</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '800', fontFamily: 'monospace', color: '#2563eb' }}>{vehicleDocs.vrc.chassisNo}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Engine Number</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '800', fontFamily: 'monospace', color: '#2563eb' }}>{vehicleDocs.vrc.engineNo}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Issuing Authority</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '700', color: '#0f172a' }}>{vehicleDocs.vrc.authority}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Registration Issue Date</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '700', color: '#0f172a' }}>{vehicleDocs.vrc.issueDate}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Validity Expiry</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '700', color: '#0f172a' }}>{vehicleDocs.vrc.expiryDate}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue License Details */}
            {activeDocKey === 'revenue' && vehicleDocs.revenue && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-icons" style={{ color: '#2563eb' }}>receipt_long</span>
                    Revenue License Certificate
                  </h3>
                  <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '12px' }}>
                    {vehicleDocs.revenue.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', fontSize: '13px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>License Number</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '700', fontFamily: 'monospace', color: '#0f172a' }}>{vehicleDocs.revenue.licenseNo}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Annual Fee Paid</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '800', color: '#16a34a' }}>{vehicleDocs.revenue.fee}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Issue Date</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '700', color: '#0f172a' }}>{vehicleDocs.revenue.issueDate}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Expiry Date</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '700', color: '#0f172a' }}>{vehicleDocs.revenue.expiryDate}</p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Issuing Provincial Authority</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '700', color: '#0f172a' }}>{vehicleDocs.revenue.authority}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Insurance Policy Details */}
            {activeDocKey === 'insurance' && vehicleDocs.insurance && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-icons" style={{ color: '#059669' }}>shield</span>
                    Insurance Policy Certificate
                  </h3>
                  <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '12px' }}>
                    VERIFIED / ACTIVE
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', fontSize: '13px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Policy Number</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '700', fontFamily: 'monospace', color: '#0f172a' }}>{vehicleDocs.insurance.policyNo}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Underwriter</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '700', color: '#0f172a' }}>{vehicleDocs.insurance.underwriter}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Coverage Type</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '700', color: '#0f172a' }}>{vehicleDocs.insurance.policyType}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Annual Premium</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '800', color: '#059669' }}>{vehicleDocs.insurance.premium}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Issue Date</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '700', color: '#0f172a' }}>{vehicleDocs.insurance.issueDate}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Expiry Date</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '700', color: '#0f172a' }}>{vehicleDocs.insurance.expiryDate}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Emission Test Details */}
            {activeDocKey === 'emission' && vehicleDocs.emission && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-icons" style={{ color: '#d97706' }}>co2</span>
                    Vehicle Emission Certificate
                  </h3>
                  <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '12px' }}>
                    {vehicleDocs.emission.result}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', fontSize: '13px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Test Certificate No</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '700', fontFamily: 'monospace', color: '#0f172a' }}>{vehicleDocs.emission.testNo}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>CO Concentration</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '800', color: '#d97706' }}>{vehicleDocs.emission.coValue}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Testing Station</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '700', color: '#0f172a' }}>{vehicleDocs.emission.testingCenter}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Issue Date</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '700', color: '#0f172a' }}>{vehicleDocs.emission.issueDate}</p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Validity Expiry Date</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '700', color: '#0f172a' }}>{vehicleDocs.emission.expiryDate}</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          <p style={{ fontSize: '13px', color: 'var(--c-secondary)', fontStyle: 'italic' }}>Loading document parameters from DMT government registry...</p>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #edf2f7', paddingTop: '20px', marginTop: '24px' }}>
          <button onClick={onClose} className="btn-primary" style={{ padding: '10px 28px', fontWeight: '700' }}>
            CLOSE INSPECTION
          </button>
        </div>

      </div>
    </div>
  );
}
