import React, { useState, useEffect } from 'react';
import {
  Store,
  MapPin,
  Mail,
  Star,
  CheckCircle2,
  LayoutGrid,
  List,
  Edit3
} from 'lucide-react';
import apiClient from '../api/client';
import StarRating from '../components/StarRating';
import FilterBar from '../components/FilterBar';
import SortableTable from '../components/SortableTable';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortState, setSortState] = useState({ key: 'name', order: 'asc' });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Rating modal
  const [activeRatingStore, setActiveRatingStore] = useState(null);
  const [selectedScore, setSelectedScore] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/stores', {
        params: {
          search,
          sort: sortState.key,
          order: sortState.order
        }
      });
      if (res.data.success) {
        setStores(res.data.stores);
      }
    } catch (err) {
      console.error('Failed to fetch stores for user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [search, sortState]);

  const handleOpenRatingModal = (store) => {
    setActiveRatingStore(store);
    setSelectedScore(store.my_rating || 0);
  };

  const handleSaveRating = async () => {
    if (!activeRatingStore || selectedScore < 1 || selectedScore > 5) return;

    setSubmittingRating(true);
    const isUpdate = activeRatingStore.my_rating !== null && activeRatingStore.my_rating !== undefined;

    try {
      if (isUpdate) {
        await apiClient.put(`/stores/${activeRatingStore.id}/rating`, {
          rating: selectedScore
        });
        showFeedback(`Your rating for "${activeRatingStore.name}" was updated to ${selectedScore} ★!`);
      } else {
        await apiClient.post(`/stores/${activeRatingStore.id}/rating`, {
          rating: selectedScore
        });
        showFeedback(`Thank you! You rated "${activeRatingStore.name}" ${selectedScore} ★.`);
      }

      setActiveRatingStore(null);
      fetchStores();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to submit rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  // Table Columns
  const tableColumns = [
    {
      key: 'name',
      label: 'Store Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--sp-dark)', fontSize: '0.95rem' }}>{val}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.email}</div>
        </div>
      )
    },
    {
      key: 'address',
      label: 'Address',
      sortable: true,
      render: (val) => (
        <span style={{ fontSize: '0.875rem', color: 'var(--text-body)', maxWidth: '280px', display: 'inline-block' }}>
          {val}
        </span>
      )
    },
    {
      key: 'rating',
      label: 'Overall Rating',
      sortable: true,
      render: (_, row) => (
        <StarRating
          rating={Number(row.average_rating)}
          readOnly={true}
          count={row.total_ratings}
        />
      )
    },
    {
      key: 'my_rating',
      label: 'Your Rating',
      sortable: true,
      render: (val, row) =>
        val ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-rating">★ {val}/5</span>
            <button
              onClick={() => handleOpenRatingModal(row)}
              className="btn btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            >
              Modify
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleOpenRatingModal(row)}
            className="btn btn-mint"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            Rate Store
          </button>
        )
    }
  ];

  return (
    <div style={{ maxWidth: '1264px', margin: '0 auto', padding: '36px 20px' }}>
      {/* Toast Feedback */}
      {feedback && (
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
          <span style={{ fontWeight: 600 }}>{feedback}</span>
        </div>
      )}

      {/* Hero Header */}
      <div
        className="sp-card"
        style={{
          padding: '32px',
          marginBottom: '32px',
          background: '#FFFFFF',
          border: '1px solid var(--border-light)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-user">Normal User Portal</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--sp-dark)', marginBottom: '6px' }}>
            Stores Directory & Reviews
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            Browse registered stores, evaluate overall community ratings, and submit or update your reviews anytime.
          </p>
        </div>

        {/* View toggle */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '3px',
            border: '1px solid var(--border-light)'
          }}
        >
          <button
            onClick={() => setViewMode('grid')}
            style={{
              background: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'grid' ? 'var(--sp-dark)' : 'var(--text-muted)',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              boxShadow: viewMode === 'grid' ? 'var(--shadow-subtle)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <LayoutGrid size={15} />
            <span>Card Grid</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              background: viewMode === 'table' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'table' ? 'var(--sp-dark)' : 'var(--text-muted)',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              boxShadow: viewMode === 'table' ? 'var(--shadow-subtle)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <List size={15} />
            <span>Table View</span>
          </button>
        </div>
      </div>

      {/* Search & Sort Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}
      >
        <div style={{ flex: '1 1 320px', maxWidth: '480px' }}>
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            placeholder="Search stores by name or address..."
            onReset={() => {
              setSearch('');
              setSortState({ key: 'name', order: 'asc' });
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Sort by:</span>
          <select
            className="form-select"
            value={`${sortState.key}-${sortState.order}`}
            onChange={(e) => {
              const [key, order] = e.target.value.split('-');
              setSortState({ key, order });
            }}
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.875rem' }}
          >
            <option value="name-asc">Store Name (A to Z)</option>
            <option value="name-desc">Store Name (Z to A)</option>
            <option value="rating-desc">Highest Rated First</option>
            <option value="rating-asc">Lowest Rated First</option>
            <option value="address-asc">Address (A to Z)</option>
          </select>
        </div>
      </div>

      {/* Grid Mode */}
      {viewMode === 'grid' && (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div className="animate-pulse-subtle" style={{ fontSize: '1rem', fontWeight: 500 }}>
                Loading stores directory...
              </div>
            </div>
          ) : stores.length === 0 ? (
            <div className="sp-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Store size={40} color="var(--text-light)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ color: 'var(--sp-dark)', fontSize: '1.1rem' }}>No stores found matching your search.</h3>
              <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>Try searching with a different name or locality.</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '24px'
              }}
            >
              {stores.map((store) => {
                const hasMyRating = store.my_rating !== null && store.my_rating !== undefined;

                return (
                  <div
                    key={store.id}
                    className="sp-card"
                    style={{
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: hasMyRating ? '1px solid rgba(0, 231, 158, 0.6)' : '1px solid var(--border-light)'
                    }}
                  >
                    <div>
                      {/* Top Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            background: 'var(--sp-dark)',
                            color: 'var(--sp-mint)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Store size={20} />
                        </div>

                        {hasMyRating ? (
                          <span className="badge badge-user" style={{ fontWeight: 600 }}>
                            ★ You rated: {store.my_rating}/5
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Not rated yet</span>
                        )}
                      </div>

                      {/* Store Name & Email */}
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px', color: 'var(--sp-dark)' }}>
                        {store.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.825rem', marginBottom: '12px' }}>
                        <Mail size={14} />
                        <span>{store.email}</span>
                      </div>

                      {/* Address */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          color: 'var(--text-body)',
                          fontSize: '0.875rem',
                          marginBottom: '20px',
                          lineHeight: 1.4
                        }}
                      >
                        <MapPin size={16} color="var(--sp-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{store.address}</span>
                      </div>
                    </div>

                    {/* Bottom Area: Ratings & Actions */}
                    <div
                      style={{
                        borderTop: '1px solid var(--border-light)',
                        paddingTop: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '3px' }}>
                          Overall Rating
                        </div>
                        <StarRating
                          rating={Number(store.average_rating)}
                          readOnly={true}
                          count={store.total_ratings}
                        />
                      </div>

                      <button
                        onClick={() => handleOpenRatingModal(store)}
                        className={`btn ${hasMyRating ? 'btn-secondary' : 'btn-mint'}`}
                        style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                      >
                        {hasMyRating ? (
                          <>
                            <Edit3 size={14} />
                            <span>Modify</span>
                          </>
                        ) : (
                          <>
                            <Star size={14} fill="currentColor" />
                            <span>Rate</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Table Mode */}
      {viewMode === 'table' && (
        <SortableTable
          columns={tableColumns}
          data={stores}
          sortKey={sortState.key}
          sortOrder={sortState.order}
          onSort={(key) => {
            setSortState((prev) => ({
              key,
              order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
            }));
          }}
          loading={loading}
          emptyMessage="No stores found matching your search."
        />
      )}

      {/* RATING MODAL */}
      {activeRatingStore && (
        <div className="modal-backdrop" onClick={() => setActiveRatingStore(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <Star size={26} fill="#F59E0B" />
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--sp-dark)', marginBottom: '6px' }}>
              {activeRatingStore.my_rating ? 'Modify Your Rating' : 'Submit Your Rating'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '22px' }}>
              How was your experience at <strong style={{ color: 'var(--sp-dark)' }}>{activeRatingStore.name}</strong>?
            </p>

            {/* Interactive Stars Card */}
            <div
              style={{
                background: 'var(--bg-card-subtle)',
                padding: '24px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                marginBottom: '24px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <StarRating
                  rating={selectedScore}
                  size={36}
                  showLabel={false}
                  onRatingChange={(score) => setSelectedScore(score)}
                />
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--sp-dark)' }}>
                {selectedScore === 0 ? 'Click a star to select (1 to 5)' : `${selectedScore} out of 5 Stars`}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {selectedScore === 5 && 'Outstanding! Highly recommended.'}
                {selectedScore === 4 && 'Very Good! Satisfied experience.'}
                {selectedScore === 3 && 'Average experience.'}
                {selectedScore === 2 && 'Below expectations.'}
                {selectedScore === 1 && 'Poor experience.'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveRatingStore(null)}
                disabled={submittingRating}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveRating}
                disabled={submittingRating || selectedScore === 0}
                style={{ minWidth: '150px' }}
              >
                {submittingRating ? 'Saving...' : (activeRatingStore.my_rating ? 'Update Rating' : 'Submit Rating')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
