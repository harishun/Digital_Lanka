import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Trash2, 
  Shield, 
  RefreshCw, 
  X, 
  Search, 
  AlertTriangle,
  Eye,
  EyeOff,
  Users,
  CheckCircle,
  Database,
  Plus
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Role Assignment Modal State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [roleData, setRoleData] = useState({
    role: 'ADMIN',
    password: '',
    department: '',
    batchNumber: '',
    rank: '',
    policeStation: ''
  });

  // Add User State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [searchNic, setSearchNic] = useState('');
  const [drpUser, setDrpUser] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showAddUserPassword, setShowAddUserPassword] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    role: 'ADMIN',
    department: '',
    batchNumber: '',
    rank: '',
    policeStation: ''
  });

  // Fetch users on load
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncDRP = async () => {
    setSyncing(true);
    setError('');
    setSuccess('');
    try {
      await axios.post('/api/admin/users/sync');
      setSuccess('Successfully synchronized citizen directory with DRP API.');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Synchronization with DRP failed.');
    } finally {
      setSyncing(false);
    }
  };

  const openAddUserModal = () => {
    setSearchNic('');
    setDrpUser(null);
    setSearchError('');
    setNewUserForm({
      email: '',
      password: '',
      role: 'ADMIN',
      department: '',
      batchNumber: '',
      rank: '',
      policeStation: ''
    });
    setIsAddUserModalOpen(true);
    setShowAddUserPassword(false);
  };

  const handleDrpSearch = async (e) => {
    e.preventDefault();
    setSearchError('');
    setDrpUser(null);
    if (!searchNic.trim()) {
      setSearchError('Please enter a valid NIC.');
      return;
    }
    setSearchLoading(true);
    try {
      const response = await axios.get(`/api/citizens/nic/${searchNic.trim()}`);
      if (response.data) {
        setDrpUser(response.data);
        setNewUserForm(prev => ({
          ...prev,
          email: `${response.data.nic.toLowerCase()}@digitallanka.lk`
        }));
      } else {
        setSearchError('Citizen not found in DRP Mock Database.');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setSearchError('Citizen not found in DRP Mock Database.');
      } else {
        setSearchError(err.response?.data?.message || 'Failed to search citizen.');
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setSearchError('');
    setError('');
    setSuccess('');

    if (!drpUser) {
      setSearchError('Please search and find a citizen first.');
      return;
    }

    if (!newUserForm.email || newUserForm.email.trim() === '') {
      setSearchError('Email is required.');
      return;
    }

    if (!newUserForm.password || newUserForm.password.trim() === '') {
      setSearchError('Password is required.');
      return;
    }

    if (newUserForm.role === 'ADMIN' && !newUserForm.department) {
      setSearchError('Department is required for Administrators.');
      return;
    }

    if (newUserForm.role === 'OFFICER') {
      if (!newUserForm.batchNumber || !newUserForm.rank || !newUserForm.policeStation) {
        setSearchError('Batch number, rank, and police station are required for Traffic Officers.');
        return;
      }
    }

    const payload = {
      nic: drpUser.nic,
      fullName: drpUser.fullName || drpUser.full_name,
      email: newUserForm.email,
      password: newUserForm.password,
      role: newUserForm.role,
      department: newUserForm.role === 'ADMIN' ? newUserForm.department : null,
      batchNumber: newUserForm.role === 'OFFICER' ? newUserForm.batchNumber : null,
      rank: newUserForm.role === 'OFFICER' ? newUserForm.rank : null,
      policeStation: newUserForm.role === 'OFFICER' ? newUserForm.policeStation : null
    };

    setSearchLoading(true);
    try {
      await axios.post('/api/admin/users', payload);
      setSuccess(`User successfully created for ${drpUser.fullName || drpUser.full_name} with role ${newUserForm.role}.`);
      setIsAddUserModalOpen(false);
      fetchUsers();
    } catch (err) {
      setSearchError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setSearchLoading(false);
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    // Pre-populate fields based on user's current role
    setRoleData({
      role: user.role === 'CITIZEN' ? 'ADMIN' : user.role,
      password: '',
      department: user.department || '',
      batchNumber: user.batchNumber || '',
      rank: user.rank || '',
      policeStation: user.policeStation || ''
    });
    setIsRoleModalOpen(true);
    setShowPassword(false);
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (!roleData.password || roleData.password.trim().isEmpty) {
      setError('Password is required when assigning roles.');
      return;
    }

    if (roleData.role === 'ADMIN' && !roleData.department) {
      setError('Department is required for Administrators.');
      return;
    }

    if (roleData.role === 'OFFICER') {
      if (!roleData.batchNumber || !roleData.rank || !roleData.policeStation) {
        setError('Batch number, rank, and police station are required for Traffic Officers.');
        return;
      }
    }

    try {
      await axios.put(`/api/admin/users/${selectedUser.id}/role`, roleData);
      setSuccess(`Role updated successfully for citizen: ${selectedUser.fullName}.`);
      setIsRoleModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user ${user.fullName}?`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await axios.delete(`/api/admin/users/${user.id}`);
      setSuccess(`Deleted record for '${user.fullName}'.`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  // Search Filtering
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    const roleText = user.role.replace('_', ' ').toLowerCase();
    
    return (
      user.fullName?.toLowerCase().includes(query) ||
      user.nic?.toLowerCase().includes(query) ||
      roleText.includes(query) ||
      user.department?.toLowerCase().includes(query) ||
      user.policeStation?.toLowerCase().includes(query)
    );
  });

  // Stats Counters
  const totalCitizens = users.length;
  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const officerCount = users.filter(u => u.role === 'OFFICER').length;
  const unassignedCount = users.filter(u => u.role === 'CITIZEN').length;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Super Admin Console</h1>
          <p className="page-subtitle">Manage system directory, provision roles, and synchronize citizen data</p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="alert-banner alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="alert-banner alert-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '12px' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Database Records</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{totalCitizens}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(2, 132, 199, 0.1)', color: 'var(--accent-cyan)', borderRadius: '12px' }}>
            <Shield size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>System Administrators</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{adminCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(13, 148, 136, 0.1)', color: 'var(--accent-teal)', borderRadius: '12px' }}>
            <Database size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Traffic Officers</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{officerCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(148, 163, 184, 0.1)', color: 'var(--text-secondary)', borderRadius: '12px' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Unassigned Citizens</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{unassignedCount}</div>
          </div>
        </div>
      </div>

      {/* Search & Actions Panel */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '450px', minWidth: '280px' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name, NIC, department or station..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={fetchUsers} className="btn btn-secondary" disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Reload</span>
            </button>
            <button onClick={handleSyncDRP} className="btn btn-secondary" disabled={syncing} style={{ gap: '0.5rem' }}>
              <Database size={16} className={syncing ? 'animate-spin' : ''} />
              <span>{syncing ? 'Syncing DRP...' : 'Sync DRP'}</span>
            </button>
            <button onClick={openAddUserModal} className="btn btn-primary" style={{ gap: '0.5rem', background: 'var(--accent-teal)', borderColor: 'var(--accent-teal)' }}>
              <Plus size={16} />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading && users.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <RefreshCw size={36} className="animate-spin text-muted" style={{ margin: '0 auto 1rem auto' }} />
            <p>Loading directory...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <AlertTriangle size={36} className="text-muted" style={{ margin: '0 auto 1rem auto' }} />
            <p>No matching directory records found.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Citizen Info</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Institutional Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.fullName}</div>
                      <div className="meta-detail" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>NIC: <strong>{user.nic}</strong></div>
                    </td>
                    <td>
                      <span className={`badge badge-${user.role.toLowerCase()}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {user.role === 'CITIZEN' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <span style={{ width: '8px', height: '8px', background: 'var(--text-muted)', borderRadius: '50%' }}></span>
                          Unassigned
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>
                          <span style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }}></span>
                          Active
                        </span>
                      )}
                    </td>
                    <td>
                      {user.role === 'SUPER_ADMIN' && (
                        <span className="meta-detail" style={{ color: 'var(--text-muted)' }}>System Root Account</span>
                      )}
                      {user.role === 'ADMIN' && (
                        <div style={{ fontSize: '0.9rem' }}>
                          Dept: <strong>{user.department || 'N/A'}</strong>
                        </div>
                      )}
                      {user.role === 'OFFICER' && (
                        <div style={{ fontSize: '0.85rem' }}>
                          <div>Station: <strong>{user.policeStation || 'N/A'}</strong></div>
                          <div className="meta-detail" style={{ color: 'var(--text-muted)' }}>Rank: {user.rank || 'N/A'} | Batch: {user.batchNumber || 'N/A'}</div>
                        </div>
                      )}
                      {user.role === 'CITIZEN' && (
                        <span className="meta-detail" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Pending Assignment</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {user.role !== 'SUPER_ADMIN' ? (
                          <>
                            <button 
                              onClick={() => openRoleModal(user)} 
                              className="btn btn-secondary btn-icon" 
                              title="Assign Role"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                            >
                              <Shield size={14} />
                              <span>Assign Role</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user)} 
                              className="btn btn-danger btn-icon" 
                              title="Delete Record"
                              style={{ padding: '0.4rem 0.5rem' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Locked</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Assignment Modal */}
      {isRoleModalOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="card modal-content" style={{ maxWidth: '500px', width: '90%' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={20} className="text-primary" />
                <span>Configure Portal Access</span>
              </h2>
              <button className="modal-close" onClick={() => setIsRoleModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRoleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  Assigning credentials and permissions for:
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.25rem' }}>
                  {selectedUser.fullName}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  NIC: {selectedUser.nic}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">System Role</label>
                <select
                  className="form-input"
                  value={roleData.role}
                  onChange={(e) => setRoleData({ ...roleData, role: e.target.value })}
                >
                  <option value="ADMIN">System Administrator</option>
                  <option value="OFFICER">Traffic Officer</option>
                </select>
              </div>

              {/* Password Setting - Required */}
              <div className="form-group">
                <label className="form-label">Account Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={roleData.password}
                    onChange={(e) => setRoleData({ ...roleData, password: e.target.value })}
                    placeholder="Set secure password for this user"
                    required
                  />
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>This password will be required for them to log in using their NIC.</span>
              </div>

              {/* Dynamic Inputs for ADMIN */}
              {roleData.role === 'ADMIN' && (
                <div className="form-group animate-slideUp">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-input"
                    value={roleData.department}
                    onChange={(e) => setRoleData({ ...roleData, department: e.target.value })}
                    placeholder="e.g. Traffic Management, Licensing"
                    required
                  />
                </div>
              )}

              {/* Dynamic Inputs for OFFICER */}
              {roleData.role === 'OFFICER' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-slideUp">
                  <div className="form-group">
                    <label className="form-label">Police Station</label>
                    <input
                      type="text"
                      className="form-input"
                      value={roleData.policeStation}
                      onChange={(e) => setRoleData({ ...roleData, policeStation: e.target.value })}
                      placeholder="e.g. Colombo Fort Police Station"
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Batch Number</label>
                      <input
                        type="text"
                        className="form-input"
                        value={roleData.batchNumber}
                        onChange={(e) => setRoleData({ ...roleData, batchNumber: e.target.value })}
                        placeholder="e.g. B-7412"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Rank</label>
                      <input
                        type="text"
                        className="form-input"
                        value={roleData.rank}
                        onChange={(e) => setRoleData({ ...roleData, rank: e.target.value })}
                        placeholder="e.g. Sergeant, Inspector"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="modal-footer" style={{ marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsRoleModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search & Add DRP Citizen Modal */}
      {isAddUserModalOpen && (
        <div className="modal-overlay">
          <div className="card modal-content" style={{ maxWidth: '550px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} style={{ color: 'var(--primary)' }} />
                <span>Search & Add DRP Citizen</span>
              </h2>
              <button className="modal-close" onClick={() => setIsAddUserModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Step 1: DRP NIC Search */}
            <form onSubmit={handleDrpSearch} style={{ marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Search Citizen by NIC (DRP Registry)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 198503402948 or 222222222V"
                    value={searchNic}
                    onChange={(e) => setSearchNic(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary" disabled={searchLoading}>
                    {searchLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
            </form>

            {/* Error inside Modal */}
            {searchError && (
              <div className="alert-banner alert-error" style={{ marginBottom: '1.5rem' }}>
                <AlertTriangle size={18} />
                <span>{searchError}</span>
              </div>
            )}

            {/* Step 2: Citizen Details & System Credentials Assignment */}
            {drpUser ? (
              <form onSubmit={handleAddUserSubmit} className="animate-slideUp">
                <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.04)', borderRadius: '8px', border: '1px solid var(--card-border)', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>DRP Registry Record</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem' }}>
                    <div>NIC: <strong style={{ color: 'var(--text-primary)' }}>{drpUser.nic}</strong></div>
                    <div>Gender: <strong style={{ color: 'var(--text-primary)' }}>{drpUser.gender}</strong></div>
                    <div style={{ gridColumn: 'span 2' }}>Full Name: <strong style={{ color: 'var(--text-primary)' }}>{drpUser.fullName || drpUser.full_name}</strong></div>
                    <div>Date of Birth: <strong style={{ color: 'var(--text-primary)' }}>{drpUser.dateOfBirth || drpUser.date_of_birth}</strong></div>
                    <div style={{ gridColumn: 'span 2' }}>Address: <strong style={{ color: 'var(--text-primary)' }}>
                      {[drpUser.addressHouse || drpUser.address_house, drpUser.addressRoad || drpUser.address_road, drpUser.addressCity || drpUser.address_city].filter(Boolean).join(', ') || 'N/A'}
                    </strong></div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">System Role</label>
                  <select
                    className="form-input"
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  >
                    <option value="ADMIN">System Administrator</option>
                    <option value="OFFICER">Traffic Officer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="e.g. name@domain.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Account Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showAddUserPassword ? 'text' : 'password'}
                      className="form-input"
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      placeholder="Set secure password for this user"
                      required
                    />
                    <button
                      type="button"
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      onClick={() => setShowAddUserPassword(!showAddUserPassword)}
                    >
                      {showAddUserPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>This password will be required for them to log in.</span>
                </div>

                {/* Dynamic Inputs for ADMIN */}
                {newUserForm.role === 'ADMIN' && (
                  <div className="form-group animate-slideUp">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newUserForm.department}
                      onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                      placeholder="e.g. Traffic Management, Licensing"
                      required
                    />
                  </div>
                )}

                {/* Dynamic Inputs for OFFICER */}
                {newUserForm.role === 'OFFICER' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-slideUp">
                    <div className="form-group">
                      <label className="form-label">Police Station</label>
                      <input
                        type="text"
                        className="form-input"
                        value={newUserForm.policeStation}
                        onChange={(e) => setNewUserForm({ ...newUserForm, policeStation: e.target.value })}
                        placeholder="e.g. Colombo Fort Police Station"
                        required
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Batch Number</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newUserForm.batchNumber}
                          onChange={(e) => setNewUserForm({ ...newUserForm, batchNumber: e.target.value })}
                          placeholder="e.g. B-7412"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Rank</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newUserForm.rank}
                          onChange={(e) => setNewUserForm({ ...newUserForm, rank: e.target.value })}
                          placeholder="e.g. Sergeant, Inspector"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="modal-footer" style={{ marginTop: '2rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsAddUserModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={searchLoading}>
                    {searchLoading ? 'Saving...' : 'Add User'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', borderTop: '1px solid var(--card-border)' }}>
                <Search size={32} style={{ margin: '0 auto 0.5rem auto', opacity: 0.5 }} />
                <p>Search a citizen by NIC to configure their system account details.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
