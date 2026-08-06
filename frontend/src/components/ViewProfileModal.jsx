import React from 'react';

const ROLE_META = {
  ROLE_USER:        { label: 'Citizen',     color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)', icon: 'account_circle' },
  ROLE_OFFICER:     { label: 'Police Officer', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: 'local_police' },
  ROLE_ADMIN:       { label: 'Admin',        color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: 'admin_panel_settings' },
  ROLE_SUPER_ADMIN: { label: 'Super Admin',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: 'security' },
};

export default function ViewProfileModal({ isOpen, onClose, userNic, userName, userRole, citizen }) {
  if (!isOpen) return null;

  const meta = ROLE_META[userRole] || ROLE_META['ROLE_USER'];

  // Derive initials for avatar
  const initials = (userName || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div
      id="view-profile-modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
        overflow: 'hidden',
        animation: 'slideUp 0.25s ease'
      }}>
        {/* Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #002366 0%, #1e40af 100%)',
          padding: '28px 28px 20px',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            id="close-profile-modal-btn"
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'rgba(255,255,255,0.15)', border: 'none',
              color: '#fff', borderRadius: '50%', width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '18px', transition: 'background 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <span className="material-icons" style={{ fontSize: '18px' }}>close</span>
          </button>

          {/* Avatar */}
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', fontWeight: '800', color: '#002366',
            border: '3px solid rgba(255,255,255,0.4)',
            marginBottom: '14px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
          }}>
            {initials}
          </div>

          <div style={{ fontWeight: '800', fontSize: '20px', color: '#ffffff', letterSpacing: '-0.025em' }}>
            {userName}
          </div>
          <div style={{ fontSize: '13px', color: '#93c5fd', marginTop: '4px' }}>
            NIC: {userNic}
          </div>

          {/* Role badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            marginTop: '12px',
            padding: '5px 12px',
            borderRadius: '20px',
            background: meta.bg,
            border: `1px solid ${meta.color}`,
            color: meta.color,
            fontWeight: '700', fontSize: '12px', letterSpacing: '0.04em'
          }}>
            <span className="material-icons" style={{ fontSize: '14px' }}>{meta.icon}</span>
            {meta.label.toUpperCase()}
          </div>
        </div>

        {/* Profile Details */}
        <div style={{ padding: '24px 28px 28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {citizen ? (
              <>
                <ProfileRow icon="cake"        label="Date of Birth"  value={citizen.dateOfBirth  || '—'} />
                <ProfileRow icon="wc"           label="Gender"         value={citizen.gender        || '—'} />
                <ProfileRow icon="home"         label="Address"        value={citizen.address       || '—'} />
                <ProfileRow icon="place"        label="Place of Birth" value={citizen.placeOfBirth  || '—'} />
                <ProfileRow icon="bloodtype"    label="Blood Group"    value={citizen.bloodGroup    || '—'} />
                <ProfileRow icon="credit_card"  label="Licence No."    value={citizen.licenseNumber || '—'} />
                <ProfileRow icon="volunteer_activism" label="Organ Donor" value={citizen.donor ? 'Yes ✓' : 'No'} />
                {citizen.vehicleClasses && citizen.vehicleClasses.length > 0 && (
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                    padding: '12px 14px',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <span className="material-icons" style={{ color: '#002366', fontSize: '18px', marginTop: '2px' }}>directions_car</span>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vehicle Classes</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {citizen.vehicleClasses.map((vc, i) => (
                          <span key={i} style={{
                            padding: '3px 10px',
                            background: '#002366',
                            color: '#ffffff',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '700'
                          }}>
                            {vc.classCode}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Officer / Admin — no DRP licence data */
              <>
                <ProfileRow icon="badge"       label="NIC"       value={userNic} />
                <ProfileRow icon="shield"      label="Role"      value={meta.label} />
                {userRole === 'ROLE_OFFICER' && (
                  <ProfileRow icon="local_police" label="Department" value="Sri Lanka Police" />
                )}
                {(userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPER_ADMIN') && (
                  <ProfileRow icon="admin_panel_settings" label="Access Level" value="System Administration" />
                )}
              </>
            )}

          </div>

          <button
            onClick={onClose}
            id="close-profile-modal-bottom-btn"
            style={{
              marginTop: '24px',
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #002366, #1e40af)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
            onMouseOut={e => e.currentTarget.style.opacity = '1'}
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}

function ProfileRow({ icon, label, value }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 14px',
      background: '#f8fafc',
      borderRadius: '10px',
      border: '1px solid #e2e8f0'
    }}>
      <span className="material-icons" style={{ color: '#002366', fontSize: '18px', flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '600', marginTop: '1px' }}>{value}</div>
      </div>
    </div>
  );
}
