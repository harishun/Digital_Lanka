import React, { useState, useEffect } from 'react';

/**
 * AdminDashboard — Unified Administrator & Super Admin Governance Terminal.
 * Manages institutional provisioning, officer/administrator promotions, system directory sync, 
 * user role assignments, and citation classes.
 */
export default function AdminDashboard({ currentNic, currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Promote / Role Assignment Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleForm, setRoleForm] = useState({
    role: 'ADMIN',
    department: 'Traffic Management',
    policeStation: 'Colombo Fort Police Station',
    batchNumber: 'POL-9921',
    rank: 'Inspector'
  });

  // Provision New System Account Modal
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [searchNic, setSearchNic] = useState('');
  const [drpUser, setDrpUser] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    role: 'ADMIN',
    department: 'Licensing Operations',
    policeStation: 'Western Province Central HQ',
    batchNumber: 'POL-8833',
    rank: 'Sergeant'
  });

  // Citation Types Management State
  const [citationTypes, setCitationTypes] = useState([]);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [typeForm, setTypeForm] = useState({
    label: '',
    fine: ''
  });

  const loadUsersDirectory = () => {
    setLoading(true);
    try {
      const initialUsers = [
        { nic: '197204509123', fullName: 'W.M. Sugathadasa', email: 'sugathadasa@digitallanka.gov.lk', role: 'ROOT_ADMIN', department: 'National Executive Governance', status: 'ACTIVE' },
        { nic: '197828430012', fullName: 'Insp. S. Jayasuriya', email: 'jayasuriya@police.gov.lk', role: 'OFFICER', policeStation: 'Western Province Traffic Command', batchNumber: 'POL-88219', rank: 'Inspector', status: 'ACTIVE' },
        { nic: '198503402948', fullName: 'Arjun Ranaweera', email: 'arjun@gmail.com', role: 'CITIZEN', department: 'N/A', status: 'ACTIVE' },
        { nic: '199003402948', fullName: 'K.A. Don Perera', email: 'perera@gmail.com', role: 'CITIZEN', department: 'N/A', status: 'ACTIVE' },
        { nic: '198012304958', fullName: 'Mahinda Rathnayake', email: 'mahinda@gmail.com', role: 'CITIZEN', department: 'N/A', status: 'ACTIVE' }
      ];
      
      const stored = JSON.parse(localStorage.getItem('dl_system_users') || 'null');
      if (!stored) {
        localStorage.setItem('dl_system_users', JSON.stringify(initialUsers));
        setUsers(initialUsers);
      } else {
        setUsers(stored);
      }
    } catch (e) {
      console.error("Failed to load users directory", e);
    } finally {
      setLoading(false);
    }
  };

  const loadCitationTypes = () => {
    try {
      const initialTypes = [
        { id: 1, label: 'Failure to obey traffic light', fine: '1000' },
        { id: 2, label: 'Speeding (Exceeding limit by 20km/h)', fine: '3000' },
        { id: 3, label: 'Driving without a valid insurance', fine: '25000' },
        { id: 4, label: 'Failure to wear seat belt', fine: '500' },
        { id: 5, label: 'Using mobile phone while driving', fine: '2000' },
        { id: 6, label: 'Driving under the influence (DUI)', fine: 'Court Fine' }
      ];
      const stored = JSON.parse(localStorage.getItem('dl_citation_types') || 'null');
      if (!stored) {
        localStorage.setItem('dl_citation_types', JSON.stringify(initialTypes));
        setCitationTypes(initialTypes);
      } else {
        setCitationTypes(stored);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadUsersDirectory();
    loadCitationTypes();
  }, []);

  const saveUsersDirectory = (updatedList) => {
    setUsers(updatedList);
    localStorage.setItem('dl_system_users', JSON.stringify(updatedList));
  };

  const saveCitationTypes = (updatedList) => {
    setCitationTypes(updatedList);
    localStorage.setItem('dl_citation_types', JSON.stringify(updatedList));
  };

  const handleSyncDRP = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setStatusMsg('✓ Successfully synchronized user directory with DRP & Police registries.');
      loadUsersDirectory();
    }, 800);
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setRoleForm({
      role: user.role === 'ROOT_ADMIN' ? 'ROOT_ADMIN' : (user.role || 'ADMIN'),
      department: user.department || 'Traffic Management',
      policeStation: user.policeStation || 'Colombo Fort Police Station',
      batchNumber: user.batchNumber || 'POL-7712',
      rank: user.rank || 'Inspector'
    });
    setIsRoleModalOpen(true);
  };

  const handleRoleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (currentUser?.role !== 'ROOT_ADMIN' && roleForm.role === 'ROOT_ADMIN') {
      alert("Only Root Admins can grant ROOT_ADMIN privileges.");
      return;
    }
    
    if (currentUser?.role !== 'ROOT_ADMIN' && selectedUser.role === 'ROOT_ADMIN') {
      alert("You cannot modify a Root Admin account.");
      return;
    }

    const updated = users.map(u => {
      if (u.nic === selectedUser.nic) {
        return {
          ...u,
          role: roleForm.role,
          department: roleForm.role === 'ADMIN' ? roleForm.department : (u.department || 'N/A'),
          policeStation: roleForm.role === 'OFFICER' ? roleForm.policeStation : undefined,
          batchNumber: roleForm.role === 'OFFICER' ? roleForm.batchNumber : undefined,
          rank: roleForm.role === 'OFFICER' ? roleForm.rank : undefined
        };
      }
      return u;
    });

    saveUsersDirectory(updated);
    setIsRoleModalOpen(false);
    setStatusMsg(`✓ User ${selectedUser.fullName} (${selectedUser.nic}) updated to role: ${roleForm.role}!`);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  // Citation Types Functions
  const openTypeModal = (type = null) => {
    if (type) {
      setEditingType(type);
      setTypeForm({ label: type.label, fine: type.fine });
    } else {
      setEditingType(null);
      setTypeForm({ label: '', fine: '' });
    }
    setIsTypeModalOpen(true);
  };

  const handleTypeSubmit = (e) => {
    e.preventDefault();
    let updatedTypes = [...citationTypes];
    if (editingType) {
      updatedTypes = updatedTypes.map(t => t.id === editingType.id ? { ...t, ...typeForm } : t);
      setStatusMsg(`✓ Citation type updated successfully!`);
    } else {
      const newId = citationTypes.length > 0 ? Math.max(...citationTypes.map(t => t.id)) + 1 : 1;
      updatedTypes.push({ id: newId, ...typeForm });
      setStatusMsg(`✓ Citation type added successfully!`);
    }
    saveCitationTypes(updatedTypes);
    setIsTypeModalOpen(false);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleRemoveType = (id) => {
    if(window.confirm('Are you sure you want to remove this citation type?')) {
      const updatedTypes = citationTypes.filter(t => t.id !== id);
      saveCitationTypes(updatedTypes);
      setStatusMsg(`✓ Citation type removed successfully!`);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.nic.includes(searchQuery) ||
    (u.role && u.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <div className="admin-dashboard-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, #002366 0%, #1e3a8a 100%)', color: '#ffffff', padding: '24px 32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-icons" style={{ fontSize: '32px', color: '#93c5fd' }}>admin_panel_settings</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#ffffff' }}>
                Unified Administrator Portal — Welcome, {currentUser?.fullName || currentNic}
              </h2>
              <span style={{ background: '#3b82f6', color: '#ffffff', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>
                SYSTEM GOVERNANCE
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#cbd5e1' }}>
              Manage Institutional Provisions, Network Configurations, and Officer Registries
            </p>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div style={{ padding: '14px 20px', borderRadius: '10px', fontSize: '13.5px', fontWeight: '800', background: 'rgba(34, 197, 94, 0.12)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.3)' }}>
          {statusMsg}
        </div>
      )}

      {/* Main Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, minHeight: '80vh' }}>
        
        {/* Right Column: System User Directory (Now Full Width) */}
        <div className="glass-card" style={{ padding: '28px', borderRadius: '16px', background: 'var(--c-card-bg, #ffffff)', border: '1px solid var(--c-card-border, #cbd5e1)', flex: 1, minHeight: '75vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--c-card-text, #0f172a)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-icons" style={{ color: 'var(--c-primary)' }}>manage_accounts</span>
                System User Directory
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--c-card-subtext, #64748b)' }}>Manage network accounts and provision roles.</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Search user..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ padding: '8px 12px 8px 36px', width: '220px', fontSize: '13px' }}
                />
                <span className="material-icons" style={{ position: 'absolute', left: '10px', top: '9px', fontSize: '18px', color: '#94a3b8' }}>search</span>
              </div>
              <button onClick={handleSyncDRP} disabled={syncing} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                <span className="material-icons" style={{ fontSize: '18px' }}>{syncing ? 'sync' : 'cloud_sync'}</span>
                {syncing ? 'Syncing...' : 'Sync Registry'}
              </button>
            </div>
          </div>

          <div style={{ border: '1px solid var(--c-card-border, #e2e8f0)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead style={{ background: 'var(--c-card-sub-bg, #f8fafc)', color: 'var(--c-card-subtext, #475569)', fontSize: '11px', textTransform: 'uppercase' }}>
                <tr>
                  <th style={{ width: '30%', padding: '14px 16px', fontWeight: '800', borderBottom: '2px solid var(--c-card-border, #e2e8f0)' }}>USER IDENTITY</th>
                  <th style={{ width: '20%', padding: '14px 16px', fontWeight: '800', borderBottom: '2px solid var(--c-card-border, #e2e8f0)' }}>ASSIGNED ROLE</th>
                  <th style={{ width: '30%', padding: '14px 16px', fontWeight: '800', borderBottom: '2px solid var(--c-card-border, #e2e8f0)' }}>DEPARTMENT</th>
                  <th style={{ width: '20%', padding: '14px 16px', fontWeight: '800', borderBottom: '2px solid var(--c-card-border, #e2e8f0)', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? filteredUsers.map((u, i) => (
                  <tr key={u.nic} style={{ borderBottom: '1px solid var(--c-card-border, #e2e8f0)', background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: '800', color: 'var(--c-card-text, #0f172a)' }}>{u.fullName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--c-card-subtext, #64748b)', fontFamily: 'monospace' }}>NIC: {u.nic}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        background: u.role === 'ROOT_ADMIN' ? 'rgba(220, 38, 38, 0.1)' : u.role === 'ADMIN' ? 'rgba(59, 130, 246, 0.1)' : u.role === 'OFFICER' ? 'rgba(234, 88, 12, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                        color: u.role === 'ROOT_ADMIN' ? '#dc2626' : u.role === 'ADMIN' ? '#2563eb' : u.role === 'OFFICER' ? '#ea580c' : '#475569',
                        padding: '4px 10px', borderRadius: '12px', fontSize: '10.5px', fontWeight: '900'
                      }}>
                        {u.role || 'CITIZEN'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--c-card-text)' }}>
                      {u.department || u.policeStation || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button onClick={() => openRoleModal(u)} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '11.5px', fontWeight: '700', borderRadius: '6px' }}>
                        Manage Role
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>No users match the search criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      </div>

      {/* Role Management Modal */}
      {isRoleModalOpen && selectedUser && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="glass-card modal-card animate-fade-in" style={{ maxWidth: '500px', width: '100%', padding: '32px' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '900', color: 'var(--c-card-text)' }}>Assign Institutional Role</h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '13.5px', color: 'var(--c-card-subtext)' }}>
              Modify network privileges for <strong>{selectedUser.fullName}</strong> (NIC: {selectedUser.nic}).
            </p>

            <form onSubmit={handleRoleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">System Role Level *</label>
                <select className="form-input" value={roleForm.role} onChange={(e) => setRoleForm({ ...roleForm, role: e.target.value })}>
                  <option value="CITIZEN">Standard Citizen (Level 0)</option>
                  <option value="OFFICER">Law Enforcement Officer (Level 1)</option>
                  <option value="ADMIN">System Administrator (Level 2)</option>
                  {currentUser?.role === 'ROOT_ADMIN' && <option value="ROOT_ADMIN">Root Super Admin (Level 3)</option>}
                </select>
              </div>

              {roleForm.role === 'OFFICER' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', background: 'var(--c-card-sub-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--c-card-border)' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Police Station / Command *</label>
                    <input type="text" className="form-input" value={roleForm.policeStation} onChange={(e) => setRoleForm({ ...roleForm, policeStation: e.target.value })} required />
                  </div>
                  <div>
                    <label className="form-label">Officer Rank *</label>
                    <select className="form-input" value={roleForm.rank} onChange={(e) => setRoleForm({ ...roleForm, rank: e.target.value })}>
                      <option value="Constable">Constable</option>
                      <option value="Sergeant">Sergeant</option>
                      <option value="Sub-Inspector">Sub-Inspector (SI)</option>
                      <option value="Inspector">Inspector (IP)</option>
                      <option value="Chief Inspector">Chief Inspector (CIP)</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Batch Number *</label>
                    <input type="text" className="form-input" value={roleForm.batchNumber} onChange={(e) => setRoleForm({ ...roleForm, batchNumber: e.target.value })} required />
                  </div>
                </div>
              )}

              {roleForm.role === 'ADMIN' && (
                <div style={{ marginBottom: '16px', background: 'var(--c-card-sub-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--c-card-border)' }}>
                  <label className="form-label">Assigned Department</label>
                  <select className="form-input" value={roleForm.department} onChange={(e) => setRoleForm({ ...roleForm, department: e.target.value })}>
                    <option value="Traffic Management">Traffic Management Division</option>
                    <option value="Licensing Operations">Licensing Operations (DMT)</option>
                    <option value="Revenue & Tax Collection">Revenue & Tax Collection (IRD)</option>
                    <option value="IT Systems Support">IT Systems Support</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" onClick={() => setIsRoleModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>CANCEL</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>APPLY ROLE</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Citation Type Modal */}
      {isTypeModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="glass-card modal-card animate-fade-in" style={{ maxWidth: '400px', width: '100%', padding: '32px' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '900', color: 'var(--c-card-text)' }}>
              {editingType ? 'Edit Citation Type' : 'Add Citation Type'}
            </h2>
            <form onSubmit={handleTypeSubmit} style={{ marginTop: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Violation Label *</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={typeForm.label}
                  onChange={(e) => setTypeForm({ ...typeForm, label: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label className="form-label">Fine Amount (or "Court Fine") *</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={typeForm.fine}
                  onChange={(e) => setTypeForm({ ...typeForm, fine: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setIsTypeModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>CANCEL</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>SAVE</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
