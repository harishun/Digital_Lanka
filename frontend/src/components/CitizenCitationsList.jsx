import React, { useState, useEffect } from 'react';
import * as api from '../services/api';

/**
 * CitizenCitationsList — Displays active traffic violations & penalty history for a citizen.
 * Features tabs for Current Pending Violations vs Paid Violation History.
 * Allows uploading proof of payment for pending fines.
 */
export default function CitizenCitationsList({ currentNic }) {
  const [citations, setCitations] = useState([]);
  const [activeTab, setActiveTab] = useState('PENDING'); // 'PENDING' | 'HISTORY'
  const [payingCitation, setPayingCitation] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCitations = async () => {
    try {
      const list = await api.getCitationsForCitizen(currentNic);
      setCitations(list);
    } catch (e) {
      console.error("Failed to load citizen citations", e);
    }
  };

  useEffect(() => {
    loadCitations();
  }, [currentNic]);

  const pendingCitations = citations.filter(c => c.status === 'PENDING_PAYMENT' || c.status === 'PENDING');
  const historyCitations = citations.filter(c => c.status === 'PAID' || c.status === 'CLEARED' || c.status === 'VERIFYING');

  const handlePaySubmit = (e) => {
    e.preventDefault();
    if (!payingCitation) return;
    setIsSubmitting(true);
    setStatusMsg('');

    try {
      api.submitProofOfPayment(payingCitation.id, receiptFile);
      setStatusMsg(`Payment receipt for ${payingCitation.referenceNumber} submitted successfully! Status updated to PAID.`);
      setPayingCitation(null);
      setReceiptFile(null);
      loadCitations();
    } catch (err) {
      setStatusMsg(`Payment error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="citizen-citations-container glass-card animate-fade-in" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--glass-border)', margin: '0 auto', width: '100%', boxSizing: 'border-box', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header & Section Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-icons" style={{ color: 'var(--c-primary)', fontSize: '24px' }}>gavel</span>
          <div>
            <h2 className="section-title" style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--c-text-bright)' }}>
              Traffic Citations & Penalty Fines
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--c-card-subtext, #64748b)', fontWeight: '600' }}>
              Official Police & DMT Penalty Register
            </span>
          </div>
        </div>

        {pendingCitations.length > 0 && (
          <span style={{ background: '#dc2626', color: '#ffffff', fontSize: '11px', fontWeight: '900', padding: '3px 10px', borderRadius: '12px', letterSpacing: '0.4px' }}>
            {pendingCitations.length} PENDING FINE{pendingCitations.length > 1 ? 'S' : ''}
          </span>
        )}
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'var(--c-card-sub-bg, #f1f5f9)', padding: '4px', borderRadius: '10px', border: '1px solid var(--c-card-border, #e2e8f0)' }}>
        <button
          onClick={() => setActiveTab('PENDING')}
          style={{
            flex: 1, padding: '8px 12px', fontSize: '12px', fontWeight: '800', borderRadius: '8px', cursor: 'pointer', border: 'none',
            background: activeTab === 'PENDING' ? 'var(--c-card-bg, #ffffff)' : 'transparent',
            color: activeTab === 'PENDING' ? '#dc2626' : 'var(--c-card-subtext, #64748b)',
            boxShadow: activeTab === 'PENDING' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
          }}
        >
          <span className="material-icons" style={{ fontSize: '16px' }}>error_outline</span>
          Current Violations ({pendingCitations.length})
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          style={{
            flex: 1, padding: '8px 12px', fontSize: '12px', fontWeight: '800', borderRadius: '8px', cursor: 'pointer', border: 'none',
            background: activeTab === 'HISTORY' ? 'var(--c-card-bg, #ffffff)' : 'transparent',
            color: activeTab === 'HISTORY' ? 'var(--c-primary, #002366)' : 'var(--c-card-subtext, #64748b)',
            boxShadow: activeTab === 'HISTORY' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
          }}
        >
          <span className="material-icons" style={{ fontSize: '16px' }}>history</span>
          Violation History ({historyCitations.length})
        </button>
      </div>

      {statusMsg && (
        <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', background: 'rgba(34, 197, 94, 0.12)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.3)' }}>
          {statusMsg}
        </div>
      )}

      {/* ── Pending Fines View ── */}
      {activeTab === 'PENDING' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {pendingCitations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px', background: 'var(--c-card-sub-bg, #f8fafc)', borderRadius: '12px', border: '1px dashed var(--c-card-border, #cbd5e1)' }}>
              <span className="material-icons" style={{ fontSize: '36px', color: '#16a34a', opacity: 0.8 }}>verified_user</span>
              <h3 style={{ margin: '8px 0 2px 0', fontSize: '15px', fontWeight: '800', color: 'var(--c-card-text, #0f172a)' }}>No Outstanding Traffic Violations</h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--c-card-subtext, #64748b)' }}>You have a clean driving record with zero pending fines.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingCitations.map(cit => (
                <div key={cit.id || cit.referenceNumber} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.04)', border: '1.5px solid rgba(239, 68, 68, 0.3)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: '900', color: '#dc2626', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{cit.referenceNumber}</span>
                      <h4 style={{ margin: '2px 0 0 0', fontSize: '14.5px', fontWeight: '800', color: 'var(--c-card-text, #0f172a)' }}>{cit.nature}</h4>
                    </div>

                    <span style={{ background: '#dc2626', color: '#ffffff', fontSize: '12px', fontWeight: '900', padding: '4px 10px', borderRadius: '6px' }}>
                      Rs {cit.amount?.toLocaleString() || '1,000'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11.5px', color: 'var(--c-card-subtext, #64748b)', background: 'var(--c-card-sub-bg, #ffffff)', padding: '10px', borderRadius: '8px', border: '1px solid var(--c-card-border, #f1f5f9)' }}>
                    <div><strong>Vehicle Plate:</strong> {cit.plateNumber || 'WP CAD-1234'}</div>
                    <div><strong>Location:</strong> {cit.place || 'Colombo'}</div>
                    <div><strong>Officer:</strong> {cit.officerName || 'Police Officer'}</div>
                    <div><strong>Date & Time:</strong> {cit.date}</div>
                  </div>

                  <button
                    onClick={() => setPayingCitation(cit)}
                    className="btn-primary"
                    style={{ padding: '10px', justifyContent: 'center', fontSize: '12.5px', fontWeight: '800', background: '#dc2626', color: '#ffffff', borderRadius: '8px' }}
                  >
                    <span className="material-icons" style={{ fontSize: '16px' }}>payment</span>
                    SETTLE FINE / UPLOAD RECEIPT
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Paid History View ── */}
      {activeTab === 'HISTORY' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {historyCitations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px', background: 'var(--c-card-sub-bg, #f8fafc)', borderRadius: '12px', border: '1px dashed var(--c-card-border, #cbd5e1)' }}>
              <span className="material-icons" style={{ fontSize: '36px', opacity: 0.3 }}>history</span>
              <p style={{ margin: '8px 0 0 0', fontSize: '13px', fontWeight: '600', color: 'var(--c-card-subtext)' }}>No violation history recorded.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {historyCitations.map(cit => (
                <div key={cit.id || cit.referenceNumber} style={{ padding: '14px', borderRadius: '10px', background: 'var(--c-card-sub-bg, #f8fafc)', border: '1px solid var(--c-card-border, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--c-primary)', fontFamily: 'monospace' }}>{cit.referenceNumber}</span>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: '#16a34a', background: 'rgba(34,197,94,0.12)', padding: '2px 6px', borderRadius: '4px' }}>
                        {cit.status === 'PAID' ? 'PAID ✓' : 'CLEARED ✓'}
                      </span>
                    </div>
                    <h4 style={{ margin: '3px 0 2px 0', fontSize: '13.5px', fontWeight: '800', color: 'var(--c-card-text, #0f172a)' }}>{cit.nature}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--c-card-subtext, #64748b)' }}>{cit.date} • {cit.place}</span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '13px', fontWeight: '900', color: 'var(--c-card-text)' }}>Rs {cit.amount?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Receipt Modal */}
      {payingCitation && (
        <div className="modal-overlay">
          <div className="glass-card modal-card animate-fade-in" style={{ maxWidth: '440px', padding: '28px', position: 'relative' }}>
            <button onClick={() => setPayingCitation(null)} style={{ position: 'sticky', top: '0', float: 'right', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
              <span className="material-icons" style={{ fontSize: '24px' }}>close</span>
            </button>

            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              Settle Citation Fine
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
              Ref: <strong>{payingCitation.referenceNumber}</strong> | Amount: <strong style={{ color: '#dc2626' }}>Rs {payingCitation.amount?.toLocaleString()}</strong>
            </p>

            <form onSubmit={handlePaySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '4px', fontSize: '12px' }}>Upload Payment Bank Receipt Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceiptFile(e.target.files[0])}
                  className="form-input"
                  required
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '12px', justifyContent: 'center', fontWeight: '800', background: '#16a34a' }}>
                {isSubmitting ? 'SUBMITTING...' : 'CONFIRM & SUBMIT PAYMENT'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
