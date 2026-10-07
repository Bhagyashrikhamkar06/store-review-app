import React, { useState, useEffect } from 'react';
import {
  Users,
  Store,
  Star,
  Plus,
  UserPlus,
  Building2,
  X,
  AlertCircle,
  CheckCircle2,
  Shield,
  Layers
} from 'lucide-react';
import apiClient from '../api/client';
import SortableTable from '../components/SortableTable';
import StarRating from '../components/StarRating';
import FilterBar from '../components/FilterBar';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
  validateStoreName
} from '../utils/validators';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stores'); // 'stores' | 'users'

  // Stats
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Stores List
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [storeSearch, setStoreSearch] = useState('');
  const [storeSort, setStoreSort] = useState({ key: 'name', order: 'asc' });

  // Users List
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userSort, setUserSort] = useState({ key: 'name', order: 'asc' });

  // Modals
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [storeOwnersList, setStoreOwnersList] = useState([]);

  // Forms
  const [storeForm, setStoreForm] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [storeFormError, setStoreFormError] = useState('');
  const [storeFormLoading, setStoreFormLoading] = useState(false);

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'NORMAL_USER'
  });
  const [userFormError, setUserFormError] = useState('');
  const [userFormLoading, setUserFormLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await apiClient.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      setStoresLoading(true);
      const res = await apiClient.get('/admin/stores', {
        params: {
          search: storeSearch,
          sort: storeSort.key,
          order: storeSort.order
        }
      });
      if (res.data.success) {
        setStores(res.data.stores);
      }
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    } finally {
      setStoresLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await apiClient.get('/admin/users', {
        params: {
          search: userSearch,
          role: userRoleFilter || undefined,
          sort: userSort.key,
          order: userSort.order
        }
      });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchStoreOwners = async () => {
    try {
      const res = await apiClient.get('/admin/store-owners');
      if (res.data.success) {
        setStoreOwnersList(res.data.storeOwners);
      }
    } catch (err) {
      console.error('Failed to fetch store owners list:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'stores') {
      fetchStores();
    }
  }, [activeTab, storeSearch, storeSort]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, userSearch, userRoleFilter, userSort]);

  const handleOpenStoreModal = () => {
    fetchStoreOwners();
    setStoreForm({ name: '', email: '', address: '', owner_id: '' });
    setStoreFormError('');
    setIsStoreModalOpen(true);
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setStoreFormError('');

    const nameErr = validateStoreName(storeForm.name);
    if (nameErr) return setStoreFormError(nameErr);

    const emailErr = validateEmail(storeForm.email);
    if (emailErr) return setStoreFormError(emailErr);

    const addrErr = validateAddress(storeForm.address);
    if (addrErr) return setStoreFormError(addrErr);

    setStoreFormLoading(true);
    try {
      await apiClient.post('/admin/stores', {
        name: storeForm.name.trim(),
        email: storeForm.email.trim(),
        address: storeForm.address.trim(),
        owner_id: storeForm.owner_id ? parseInt(storeForm.owner_id, 10) : null
      });

      setIsStoreModalOpen(false);
      showFeedback('Store added successfully!');
      fetchStores();
      fetchStats();
    } catch (err) {
      setStoreFormError(err.response?.data?.message || err.message || 'Failed to create store.');
    } finally {
      setStoreFormLoading(false);
    }
  };

  const handleOpenUserModal = () => {
    setUserForm({
      name: '',
      email: '',
      password: '',
      address: '',
      role: 'NORMAL_USER'
    });
    setUserFormError('');
    setIsUserModalOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserFormError('');

    const nameErr = validateName(userForm.name);
    if (nameErr) return setUserFormError(nameErr);

    const emailErr = validateEmail(userForm.email);
    if (emailErr) return setUserFormError(emailErr);

    const passErr = validatePassword(userForm.password);
    if (passErr) return setUserFormError(passErr);

    const addrErr = validateAddress(userForm.address);
    if (addrErr) return setUserFormError(addrErr);

    setUserFormLoading(true);
    try {
      await apiClient.post('/admin/users', {
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        password: userForm.password,
        address: userForm.address.trim(),
        role: userForm.role
      });

      setIsUserModalOpen(false);
      showFeedback('User account created successfully!');
      fetchUsers();
      fetchStats();
    } catch (err) {
      setUserFormError(err.response?.data?.message || err.message || 'Failed to create user.');
    } finally {
      setUserFormLoading(false);
    }
  };

  const showFeedback = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Store Columns
  const storeColumns = [
    {
      key: 'name',
      label: 'Store Name',
      sortable: true,
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--sp-dark)' }}>{val}</span>
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (val) => <span style={{ color: 'var(--text-body)' }}>{val}</span>
    },
    {
      key: 'address',
      label: 'Address',
      sortable: true,
      render: (val) => (
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '300px', display: 'inline-block' }}>
          {val}
        </span>
      )
    },
    {
      key: 'owner_name',
      label: 'Assigned Owner',
      sortable: false,
      render: (val) =>
        val ? (
          <span className="badge badge-owner">{val}</span>
        ) : (
          <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontStyle: 'italic' }}>Unassigned</span>
        )
    },
    {
      key: 'rating',
      label: 'Average Rating',
      sortable: true,
      render: (_, row) => (
        <StarRating
          rating={Number(row.average_rating)}
          readOnly={true}
          count={row.total_ratings}
        />
      )
    }
  ];

  // User Columns
  const userColumns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--sp-dark)' }}>{val}</span>
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (val) => <span style={{ color: 'var(--text-body)' }}>{val}</span>
    },
    {
      key: 'address',
      label: 'Address',
      sortable: true,
      render: (val) => (
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '280px', display: 'inline-block' }}>
          {val}
        </span>
      )
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (role) => {
        if (role === 'ADMIN') return <span className="badge badge-admin">System Admin</span>;
        if (role === 'STORE_OWNER') return <span className="badge badge-owner">Store Owner</span>;
        return <span className="badge badge-user">Normal User</span>;
      }
    },
    {
      key: 'rating',
      label: 'Store Rating (Owners)',
      sortable: true,
      render: (_, row) => {
        if (row.role !== 'STORE_OWNER') {
          return <span style={{ color: 'var(--text-light)' }}>—</span>;
        }
        if (!row.store_name) {
          return <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontStyle: 'italic' }}>No store assigned</span>;
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-body)', fontWeight: 600 }}>{row.store_name}</span>
            <StarRating rating={Number(row.store_rating)} readOnly={true} />
          </div>
        );
      }
    }
  ];

  return (
    <div style={{ maxWidth: '1264px', margin: '0 auto', padding: '36px 20px' }}>
      {/* Toast */}
      {feedbackMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'var(--sp-dark)',
            color: '#FFFFFF',
            border: '1px solid var(--sp-mint)',
            padding: '14px 22px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-hover)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 1100,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <CheckCircle2 size={20} color="var(--sp-mint)" />
          <span style={{ fontWeight: 600 }}>{feedbackMessage}</span>
        </div>
      )}

      {/* Top Hero Section */}
      <div
        className="sp-card-dark"
        style={{
          padding: '36px',
          marginBottom: '32px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '640px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span
              style={{
                background: 'rgba(0, 231, 158, 0.2)',
                color: 'var(--sp-mint)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Shield size={12} /> System Administrator
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
            Platform Overview & Operations
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
            Manage registered stores, audit platform users, track real-time customer ratings, and enforce access roles.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 1 }}>
          <button onClick={handleOpenStoreModal} className="btn btn-mint" style={{ padding: '10px 18px' }}>
            <Building2 size={18} />
            <span>Add Store</span>
          </button>
          <button
            onClick={handleOpenUserModal}
            className="btn btn-secondary"
            style={{ padding: '10px 18px', background: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <UserPlus size={18} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '36px'
        }}
      >
        {/* Total Users */}
        <div className="sp-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'var(--sp-blue-light)',
              color: 'var(--sp-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Users size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
              Total Users
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--sp-dark)', marginTop: '2px' }}>
              {statsLoading ? '...' : stats.totalUsers}
            </div>
          </div>
        </div>

        {/* Total Stores */}
        <div className="sp-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'var(--sp-mint-light)',
              color: '#047857',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Store size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
              Total Stores
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--sp-dark)', marginTop: '2px' }}>
              {statsLoading ? '...' : stats.totalStores}
            </div>
          </div>
        </div>

        {/* Total Ratings */}
        <div className="sp-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Star size={26} fill="#F59E0B" color="#D97706" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
              Total Ratings Submitted
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--sp-dark)', marginTop: '2px' }}>
              {statsLoading ? '...' : stats.totalRatings}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-light)',
          marginBottom: '24px'
        }}
      >
        <button
          onClick={() => setActiveTab('stores')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 20px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-family)',
            color: activeTab === 'stores' ? 'var(--sp-dark)' : 'var(--text-muted)',
            borderBottom: activeTab === 'stores' ? '3px solid var(--sp-dark)' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Building2 size={18} />
          <span>Stores Directory ({stores.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 20px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-family)',
            color: activeTab === 'users' ? 'var(--sp-dark)' : 'var(--text-muted)',
            borderBottom: activeTab === 'users' ? '3px solid var(--sp-dark)' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Users size={18} />
          <span>Platform Users ({users.length})</span>
        </button>
      </div>

      {/* Tab 1: Stores Directory */}
      {activeTab === 'stores' && (
        <div>
          <FilterBar
            search={storeSearch}
            onSearchChange={setStoreSearch}
            placeholder="Search stores by name, email, or address..."
            onReset={() => {
              setStoreSearch('');
              setStoreSort({ key: 'name', order: 'asc' });
            }}
          />

          <SortableTable
            columns={storeColumns}
            data={stores}
            sortKey={storeSort.key}
            sortOrder={storeSort.order}
            onSort={(key) => {
              setStoreSort((prev) => ({
                key,
                order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
              }));
            }}
            loading={storesLoading}
            emptyMessage="No stores match your search criteria."
          />
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === 'users' && (
        <div>
          <FilterBar
            search={userSearch}
            onSearchChange={setUserSearch}
            placeholder="Search users by name, email, or address..."
            showRoleFilter={true}
            roleFilter={userRoleFilter}
            onRoleFilterChange={setUserRoleFilter}
            onReset={() => {
              setUserSearch('');
              setUserRoleFilter('');
              setUserSort({ key: 'name', order: 'asc' });
            }}
          />

          <SortableTable
            columns={userColumns}
            data={users}
            sortKey={userSort.key}
            sortOrder={userSort.order}
            onSort={(key) => {
              setUserSort((prev) => ({
                key,
                order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
              }));
            }}
            loading={usersLoading}
            emptyMessage="No users found matching current filters."
          />
        </div>
      )}

      {/* MODAL: ADD STORE */}
      {isStoreModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsStoreModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    background: 'var(--sp-dark)',
                    color: 'var(--sp-mint)',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Building2 size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--sp-dark)' }}>Add New Store</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Register a new store into StorePulse</p>
                </div>
              </div>
              <button
                onClick={() => setIsStoreModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {storeFormError && (
              <div
                style={{
                  background: '#FFF1F2',
                  border: '1px solid #FECDD3',
                  color: '#BE123C',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '16px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={16} />
                <span>{storeFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStore}>
              <div className="form-group">
                <label className="form-label">
                  <span>Store Name <span className="req">*</span></span>
                  <span className="form-hint">3 to 100 characters</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Metro Gourmet & Groceries"
                  value={storeForm.name}
                  onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Store Email <span className="req">*</span></span>
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="store@example.com"
                  value={storeForm.email}
                  onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Physical Address <span className="req">*</span></span>
                  <span className="form-hint">{storeForm.address.length}/400 chars</span>
                </label>
                <textarea
                  rows="2"
                  className="form-textarea"
                  placeholder="Street, locality, city, state, zip code"
                  value={storeForm.address}
                  onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Assign Store Owner</span>
                  <span className="form-hint">(Optional)</span>
                </label>
                <select
                  className="form-select"
                  value={storeForm.owner_id}
                  onChange={(e) => setStoreForm({ ...storeForm, owner_id: e.target.value })}
                >
                  <option value="">-- No Owner Assigned --</option>
                  {storeOwnersList.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email}) {owner.current_store_name ? `[Current: ${owner.current_store_name}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsStoreModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={storeFormLoading}>
                  {storeFormLoading ? 'Adding Store...' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD USER */}
      {isUserModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsUserModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    background: 'var(--sp-dark)',
                    color: 'var(--sp-mint)',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <UserPlus size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--sp-dark)' }}>Add New User</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Provision an admin, user, or owner account</p>
                </div>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {userFormError && (
              <div
                style={{
                  background: '#FFF1F2',
                  border: '1px solid #FECDD3',
                  color: '#BE123C',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '16px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={16} />
                <span>{userFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">
                  <span>Full Name <span className="req">*</span></span>
                  <span className="form-hint">{userForm.name.length}/60 chars (Min 20)</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="20 to 60 characters required"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Email Address <span className="req">*</span></span>
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="user@example.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Account Role <span className="req">*</span></span>
                </label>
                <select
                  className="form-select"
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                >
                  <option value="NORMAL_USER">Normal User</option>
                  <option value="STORE_OWNER">Store Owner</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Password <span className="req">*</span></span>
                  <span className="form-hint">8–16 chars, 1 uppercase, 1 special</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="e.g. Admin@1234"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Address <span className="req">*</span></span>
                  <span className="form-hint">{userForm.address.length}/400 chars</span>
                </label>
                <textarea
                  rows="2"
                  className="form-textarea"
                  placeholder="Address (Max 400 chars)"
                  value={userForm.address}
                  onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsUserModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={userFormLoading}>
                  {userFormLoading ? 'Creating User...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
