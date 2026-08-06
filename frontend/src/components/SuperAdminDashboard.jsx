import React, { useState, useEffect } from 'react';
import * as api from '../services/api';

/**
 * SuperAdminDashboard — Super Admin Governance & Role Promotion Terminal from dev-thanuja.
 * Manages institutional provisioning, officer/administrator promotions, system directory sync, and user role assignments.
 */
export default function SuperAdminDashboard({ currentNic }) {
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

  const loadUsersDirectory = () => {
    setLoading(true);
    try {
      // Load directory of users with default initial users
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

  useEffect(() => {
    loadUsersDirectory();
  }, []);

  const saveUsersDirectory = (updatedList) => {
    setUsers(updatedList);
    localStorage.setItem('dl_system_users', JSON.stringify(updatedList));
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
    setStatusMsg(`✓ User ${selectedUser.fullName} (${selectedUser.nic}) promoted/updated to role: ${roleForm.role}!`);
  };

  const handleDrpSearch = (e) => {
    e.preventDefault();
    setSearchError('');
    setDrpUser(null);
    if (!searchNic.trim()) return;

    setSearchLoading(true);
    setTimeout(() => {
      const citizen = api.getCitizenProfile(searchNic.trim());
      if (citizen) {
        setDrpUser(citizen);
        setNewUserForm(prev => ({
          ...prev,
          email: `${citizen.nic}@digitallanka.gov.lk`
        }));
      } else {
        setSearchError('Citizen not found in DRP registry.');
      }
      setSearchLoading(false);
    }, 400);
  };

  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    if (!drpUser) return;

    const newUser = {
      nic: drpUser.nic,
      fullName: drpUser.fullName,
      email: newUserForm.email,
      role: newUserForm.role,
      department: newUserForm.role === 'ADMIN' ? newUserForm.department : 'N/A',
      policeStation: newUserForm.role === 'OFFICER' ? newUserForm.policeStation : undefined,
      batchNumber: newUserForm.role === 'OFFICER' ? newUserForm.batchNumber : undefined,
      rank: newUserForm.role === 'OFFICER' ? newUserForm.rank : undefined,
      status: 'ACTIVE'
    };

    const updated = [newUser, ...users.filter(u => u.nic !== newUser.nic)];
    saveUsersDirectory(updated);
    setIsAddUserModalOpen(false);
    setStatusMsg(`✓ New ${newUserForm.role} account created for ${drpUser.fullName}!`);
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.nic.includes(searchQuery) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="super-admin-dashboard-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Super Admin Command Banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', color: '#ffffff', padding: '28px 32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '58px', height: '58px', borderRadius: '14px', background: 'rgba(234, 179, 8, 0.2)', border: '1px solid rgba(234, 179, 8, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-icons" style={{ fontSize: '34px', color: '#fde047' }}>verified</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#ffffff' }}>
                Super Admin Governance Terminal
              </h2>
              <span style={{ background: '#eab308', color: '#0f172a', fontSize: '10px', fontWeight: '900', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>
                SUPER ADMIN LEVEL
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: '#94a3b8' }}>
              Officer & Administrator Role Promotions, Provisioning, and Institutional User Management
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleSyncDRP}
            disabled={syncing}
            className="btn-secondary"
            style={{ padding: '10px 18px', fontSize: '13px', fontWeight: '800', background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px' }}
          >
            <span className="material-icons" style={{ fontSize: '18px' }}>sync</span>
            {syncing ? 'SYNCING...' : 'SYNC DRP DIRECTORY'}
          </button>

          <button
            onClick={() => { setSearchNic(''); setDrpUser(null); setIsAddUserModalOpen(true); }}
            className="btn-primary"
            style={{ padding: '10px 18px', fontSize: '13px', fontWeight: '800', background: '#22c55e', color: '#ffffff', borderRadius: '8px' }}
          >
            <span className="material-icons" style={{ fontSize: '18px' }}>person_add</span>
            PROVISION NEW SYSTEM USER
          </button>
        </div>
      </div>

      {statusMsg && (
        <div style={{ padding: '14px 20px', borderRadius: '10px', fontSize: '13.5px', fontWeight: '800', background: 'rgba(34, 197, 94, 0.12)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.3)' }}>
          {statusMsg}
        </div>
      )}

      {/* Directory & Role Assignment Table */}
      <div className="glass-card" style={{ padding: '28px', borderRadius: '16px', background: 'var(--c-card-bg, #ffffff)', border: '1px solid var(--c-card-border, #cbd5e1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--c-card-text, #0f172a)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-icons" style={{ color: 'var(--c-primary)' }}>manage_accounts</span>
            Institutional User Accounts & Role Assignment Register
          </h3>

          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name, NIC, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '36px', fontSize: '13px' }}
            />
            <span className="material-icons" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '18px' }}>search</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--c-card-sub-bg, #f8fafc)', borderBottom: '2px solid var(--c-card-border, #e2e8f0)', color: 'var(--c-card-subtext, #64748b)' }}>
                <th style={{ padding: '12px 14px', fontWeight: '800' }}>CITIZEN / USER</th>
                <th style={{ padding: '12px 14px', fontWeight: '800' }}>NIC NUMBER</th>
                <th style={{ padding: '12px 14px', fontWeight: '800' }}>CURRENT ROLE</th>
                <th style={{ padding: '12px 14px', fontWeight: '800' }}>ASSIGNED DEPARTMENT / STATION</th>
                <th style={{ padding: '12px 14px', fontWeight: '800' }}>STATUS</th>
                <th style={{ padding: '12px 14px', fontWeight: '800', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.nic} style={{ borderBottom: '1px solid var(--c-card-border, #f1f5f9)' }}>
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: '800', color: 'var(--c-card-text, #0f172a)' }}>{u.fullName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--c-card-subtext, #64748b)' }}>{u.email}</div>
                  </td>

                  <td style={{ padding: '14px', fontFamily: 'monospace', fontWeight: '800', color: 'var(--c-primary)' }}>
                    {u.nic}
                  </td>

                  <td style={{ padding: '14px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: '900', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase',
                      background: u.role === 'ROOT_ADMIN' ? '#fef3c7' : u.role === 'ADMIN' ? '#dbeafe' : u.role === 'OFFICER' ? '#dcfce7' : '#f1f5f9',
                      color: u.role === 'ROOT_ADMIN' ? '#92400e' : u.role === 'ADMIN' ? '#1e40af' : u.role === 'OFFICER' ? '#166534' : '#475569',
                      border: u.role === 'ROOT_ADMIN' ? '1px solid #fde68a' : u.role === 'ADMIN' ? '1px solid #bfdbfe' : u.role === 'OFFICER' ? '1px solid #bbf7d0' : '1px solid #e2e8f0'
                    }}>
                      {u.role === 'ROOT_ADMIN' ? '👑 ROOT ADMIN' : u.role === 'ADMIN' ? '🛡️ ADMIN' : u.role === 'OFFICER' ? '👮 OFFICER' : '👤 CITIZEN'}
                    </span>
                  </td>

                  <td style={{ padding: '14px', color: 'var(--c-card-text)' }}>
                    {u.role === 'OFFICER' ? `${u.policeStation || 'Traffic Command'} (${u.rank || 'Officer'})` : (u.department || 'N/A')}
                  </td>

                  <td style={{ padding: '14px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#16a34a' }}>✓ {u.status || 'ACTIVE'}</span>
                  </td>

                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <button
                      onClick={() => openRoleModal(u)}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '800', borderRadius: '6px' }}
                    >
                      <span className="material-icons" style={{ fontSize: '16px' }}>admin_panel_settings</span>
                      Promote / Assign Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Assignment & Officer Promotion Modal */}
      {isRoleModalOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="glass-card modal-card animate-fade-in" style={{ maxWidth: '500px', padding: '28px', position: 'relative' }}>
            <button onClick={() => setIsRoleModalOpen(false)} style={{ position: 'sticky', top: '0', float: 'right', background: 'none', border: 'none', color: '#dc2626', fontSize: '24px', fontWeight: '800', cursor: 'pointer' }}>✕</button>

            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>
              Assign System Role & Department
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>
              Target Citizen: <strong>{selectedUser.fullName}</strong> ({selectedUser.nic})
            </p>

            <form onSubmit={handleRoleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '6px', fontSize: '12px' }}>System Access Role *</label>
                <select
                  className="form-input"
                  value={roleForm.role}
                  onChange={(e) => setRoleForm({ ...roleForm, role: e.target.value })}
                >
                  <option value="CITIZEN">Citizen (Standard Driver)</option>
                  <option value="OFFICER">Traffic Law Enforcement Officer</option>
                  <option value="ADMIN">System Administrator</option>
                  <option value="ROOT_ADMIN">Root Executive Super Admin</option>
                </select>
              </div>

              {roleForm.role === 'ADMIN' && (
                <div>
                  <label className="form-label" style={{ marginBottom: '6px', fontSize: '12px' }}>Department / Division *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={roleForm.department}
                    onChange={(e) => setRoleForm({ ...roleForm, department: e.target.value })}
                    required
                  />
                </div>
              )}

              {roleForm.role === 'OFFICER' && (
                <>
                  <div>
                    <label className="form-label" style={{ marginBottom: '6px', fontSize: '12px' }}>Police Station / Division *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={roleForm.policeStation}
                      onChange={(e) => setRoleForm({ ...roleForm, policeStation: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label" style={{ marginBottom: '6px', fontSize: '12px' }}>Officer Batch No *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={roleForm.batchNumber}
                        onChange={(e) => setRoleForm({ ...roleForm, batchNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ marginBottom: '6px', fontSize: '12px' }}>Rank *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={roleForm.rank}
                        onChange={(e) => setRoleForm({ ...roleForm, rank: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontWeight: '900', marginTop: '8px' }}>
                CONFIRM ROLE PROMOTION
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Provision New User Modal */}
      {isAddUserModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-card animate-fade-in" style={{ maxWidth: '520px', padding: '28px', position: 'relative' }}>
            <button onClick={() => setIsAddUserModalOpen(false)} style={{ position: 'sticky', top: '0', float: 'right', background: 'none', border: 'none', color: '#dc2626', fontSize: '24px', fontWeight: '800', cursor: 'pointer' }}>✕</button>

            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>
              Provision New System Account
            </h3>
            <p style={{ margin: '0 0 18px 0', fontSize: '13px', color: '#64748b' }}>
              Search citizen by NIC in DRP Mock registry to assign system credentials.
            </p>

            <form onSubmit={handleDrpSearch} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', marginBottom: '20px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Enter Citizen NIC (e.g. 198503402948)"
                value={searchNic}
                onChange={(e) => setSearchNic(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary" disabled={searchLoading} style={{ padding: '10px 18px', fontWeight: '800' }}>
                {searchLoading ? 'Searching...' : 'Search DRP'}
              </button>
            </form>

            {searchError && (
              <div style={{ marginBottom: '16px', padding: '10px', background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>
                {searchError}
              </div>
            )}

            {drpUser && (
              <form onSubmit={handleAddUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '8px', color: '#166534', fontSize: '13px' }}>
                  <strong>Verified Citizen:</strong> {drpUser.fullName} | NIC: <strong>{drpUser.nic}</strong>
                </div>

                <div>
                  <label className="form-label" style={{ marginBottom: '4px', fontSize: '12px' }}>System Role *</label>
                  <select
                    className="form-input"
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  >
                    <option value="ADMIN">System Administrator</option>
                    <option value="OFFICER">Traffic Officer</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ marginBottom: '4px', fontSize: '12px' }}>Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontWeight: '900', background: '#22c55e' }}>
                  PROVISION USER ACCOUNT
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
