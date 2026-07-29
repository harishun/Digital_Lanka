import React from 'react';
import * as api from '../services/api';

/**
 * NotificationsInbox — Reusable component for displaying driving access invitations & notifications.
 * Yellow badge for PENDING invitations.
 */
export default function NotificationsInbox({
  incomingInvitations,
  notifications,
  currentNic,
  handleAcceptInvitation,
  handleDeclineInvitation,
  loadData
}) {
  const unreadNotifs = notifications.filter(n => !n.isRead);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Incoming Invitations Card */}
      {incomingInvitations.length > 0 && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span className="material-icons" style={{ color: '#d97706' }}>notifications_active</span>
            <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '700' }}>Incoming Invitations</h2>
          </div>
          <div className="invitations-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {incomingInvitations.map((inv) => (
              <div 
                key={inv.authId || inv.id} 
                className="invitation-item" 
                style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#fdf6b2', border: '1px solid #fef08a', borderRadius: '8px', padding: '14px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13.5px', fontWeight: '700', color: '#78350f' }}>
                      Drive Vehicle: <strong style={{ color: '#92400e' }}>{inv.plateNumber || inv.vehicleId}</strong>
                    </p>
                    <p style={{ margin: 0, fontSize: '11.5px', color: '#b45309' }}>
                      Owner NIC: {inv.ownerNic} | Access: <strong>{inv.accessType}</strong>
                    </p>
                  </div>

                  <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    PENDING
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleDeclineInvitation(inv.authId || inv.id)} 
                    className="btn-secondary" 
                    style={{ flex: 1, padding: '8px 12px', fontSize: '11px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', justifyContent: 'center', fontWeight: '700' }}
                  >
                    DECLINE
                  </button>
                  <button 
                    onClick={() => handleAcceptInvitation(inv.authId || inv.id)} 
                    className="btn-primary" 
                    style={{ flex: 1, padding: '8px 12px', fontSize: '11px', background: '#16a34a', color: '#ffffff', justifyContent: 'center', fontWeight: '700' }}
                  >
                    ACCEPT
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inbox / Notifications List Card */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '12px' }}>
        <h2 className="section-title" style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-icons" style={{ color: 'var(--c-primary)' }}>inbox</span>
          Inbox / Notifications
        </h2>
        {unreadNotifs.length === 0 ? (
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--c-secondary)', fontStyle: 'italic' }}>
            No unread notifications in your inbox.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', overflowY: 'auto' }}>
            {unreadNotifs.map((n) => (
              <div 
                key={n.id} 
                style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf2f7', background: '#f0f9ff', borderLeft: '3px solid var(--c-primary)', display: 'flex', flexDirection: 'column', gap: '4px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--c-text-bright)' }}>{n.title}</span>
                  <button 
                    onClick={async () => {
                      await api.readNotification(n.id, currentNic);
                      loadData();
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--c-primary)', fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                  >
                    MARK READ
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--c-text)' }}>{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
