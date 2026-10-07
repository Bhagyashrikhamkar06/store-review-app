import React from 'react';
import { Search, X, Filter } from 'lucide-react';

const FilterBar = ({
  search = '',
  onSearchChange,
  placeholder = 'Search by name, address or email...',
  roleFilter = '',
  onRoleFilterChange,
  showRoleFilter = false,
  onReset
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}
    >
      {/* Search Input */}
      <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '440px' }}>
        <Search
          size={18}
          color="var(--text-light)"
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          className="form-input"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ paddingLeft: '40px', paddingRight: search ? '36px' : '14px' }}
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Role Filter & Reset */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {showRoleFilter && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => onRoleFilterChange(e.target.value)}
              style={{ width: 'auto', minWidth: '160px', padding: '10px 14px' }}
            >
              <option value="">All Roles</option>
              <option value="ADMIN">System Admin</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="NORMAL_USER">Normal User</option>
            </select>
          </div>
        )}

        {(search || roleFilter) && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onReset}
            style={{ padding: '9px 14px', fontSize: '0.85rem' }}
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
