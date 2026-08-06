import React from 'react';

/**
 * PersonaSwitcherBar — Reusable component for switching active citizen personas.
 */
export default function PersonaSwitcherBar({ currentNic, handlePersonaChange, personas, onOpenAuth }) {

  return (
    <div 
      className="persona-switcher-bar glass-card" 
      style={{ 
        display: 'flex', 
        justify: 'space-between', 
        alignItems: 'center', 
        padding: '16px 24px', 
        marginBottom: '32px', 
        borderRadius: '12px', 
        border: '1px solid var(--glass-border)', 
        background: 'rgba(21, 5, 110, 0.85)' 
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className="material-icons" style={{ color: 'var(--c-primary)', fontSize: '28px' }}>account_circle</span>
        <div>
          <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--c-text-bright)' }}>Acting Citizen Persona</h4>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--c-secondary)' }}>Switch persona to test authorization flow</p>
        </div>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <select 
          value={currentNic} 
          onChange={handlePersonaChange} 
          style={{ 
            padding: '10px 16px', 
            borderRadius: '8px', 
            border: '1px solid var(--outline)', 
            background: '#ffffff', 
            color: 'var(--c-text)', 
            fontSize: '14px', 
            fontWeight: '600', 
            cursor: 'pointer', 
            outline: 'none', 
            minWidth: '260px' 
          }}
        >
          {personas.map((p) => (
            <option key={p.nic} value={p.nic}>{p.name}</option>
          ))}
        </select>

        {onOpenAuth && (
          <button
            type="button"
            onClick={onOpenAuth}
            className="btn-primary"
            style={{
              padding: '10px 16px',
              fontSize: '13.5px',
              fontWeight: '800',
              borderRadius: '8px',
              background: '#22c55e',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <span className="material-icons" style={{ fontSize: '18px' }}>lock</span>
            Sign In / Register
          </button>
        )}
      </div>

    </div>
  );
}
