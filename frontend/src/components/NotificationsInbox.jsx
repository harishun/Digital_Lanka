import React from 'react';
import * as api from '../services/api';

/**
 * NotificationsInbox — Reusable component for displaying driving access invitations & notifications.
 * Support displaying all notifications with badge indicators (NEW / READ) so messages are never hidden.
 */
export default function NotificationsInbox({
  incomingInvitations = [],
  notifications = [],
  currentNic,
  handleAcceptInvitation,
  handleDeclineInvitation,
  loadData
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      {/* Incoming Invitations Card */}
      {incomingInvitations.length > 0 && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span className="material-icons" style={{ color: '#f59e0b' }}>notifications_active</span>
            <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '700', color: 'var(--c-text-bright)' }}>
              Incoming Invitations ({incomingInvitations.length})
            </h2>
          </div>
          <div className="invitations-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {incomingInvitations.map((inv) => (
              <div 
                key={inv.authId || inv.id} 
                className="invitation-item" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px', 
                  background: 'rgba(245, 158, 11, 0.1)', 
                  border: '1px solid rgba(245, 158, 11, 0.3)', 
                  borderRadius: '8px', 
                  padding: '14px',
                  transition: 'background-color 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13.5px', fontWeight: '700', color: 'var(--c-card-text, #78350f)' }}>
                      Drive Vehicle: <strong style={{ color: '#f59e0b' }}>{inv.plateNumber || inv.vehicleId}</strong>
                    </p>
                    <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--c-card-subtext, #b45309)' }}>
                      Owner NIC: {inv.ownerNic} | Access: <strong>{inv.accessType}</strong>
                    </p>
                  </div>

                  <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    PENDING
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleDeclineInvitation(inv.authId || inv.id)} 
                    className="btn-secondary" 
                    style={{ flex: 1, padding: '8px 12px', fontSize: '11px', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', justifyContent: 'center', fontWeight: '700' }}
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
      <div className="glass-card" style={{ padding: '24px', borderRadius: '12px', flex: 1, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="section-title" style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--c-text-bright)' }}>
            <span className="material-icons" style={{ color: 'var(--c-primary)' }}>inbox</span>
            Inbox & System Alerts ({notifications.length})
          </h2>
        </div>

        {notifications.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', background: 'var(--c-card-sub-bg, #f8fafc)', borderRadius: '8px', border: '1px solid var(--c-card-border, #edf2f7)' }}>
            <span className="material-icons" style={{ fontSize: '32px', color: 'var(--c-card-subtext, #cbd5e1)', marginBottom: '4px' }}>mark_email_read</span>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--c-secondary)', fontStyle: 'italic' }}>
              No notifications in your inbox.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
            {notifications.map((n) => {
              const isUnread = !n.isRead && !n.is_read && !n.read;
              return (
                <div 
                  key={n.id || Math.random()} 
                  style={{ 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--c-card-border, #edf2f7)', 
                    background: isUnread ? 'var(--c-card-sub-bg, #f0f9ff)' : 'var(--c-card-bg, #ffffff)', 
                    borderLeft: isUnread ? '4px solid var(--c-primary)' : '4px solid var(--c-card-border, #cbd5e1)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '4px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isUnread && (
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} title="Unread Notification" />
                      )}
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--c-text-bright)' }}>{n.title}</span>
                    </div>

                    {isUnread ? (
                      <button 
                        onClick={async () => {
                          await api.readNotification(n.id, currentNic);
                          loadData();
                        }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--c-primary)', fontSize: '11px', fontWeight: '800', cursor: 'pointer', padding: 0 }}
                      >
                        MARK READ
                      </button>
                    ) : (
                      <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--c-card-subtext, #94a3b8)' }}>READ</span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--c-text)', lineHeight: '1.4' }}>{n.message}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
