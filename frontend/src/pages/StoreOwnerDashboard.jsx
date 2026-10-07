import React, { useState, useEffect } from 'react';
import {
  Store,
  Users,
  MapPin,
  Mail,
  Calendar,
  ShieldAlert
} from 'lucide-react';
import apiClient from '../api/client';
import StarRating from '../components/StarRating';
import SortableTable from '../components/SortableTable';
import { useAuth } from '../context/AuthContext';

const StoreOwnerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortState, setSortState] = useState({ key: 'date', order: 'desc' });

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/owner/dashboard', {
        params: {
          sort: sortState.key,
          order: sortState.order
        }
      });
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load store owner dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [sortState]);

  // Customer ratings table columns
  const columns = [
    {
      key: 'name',
      label: 'Customer Name',
      sortable: true,
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--sp-dark)' }}>{row.user_name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.user_email}</div>
        </div>
      )
    },
    {
      key: 'rating',
      label: 'Rating Given',
      sortable: true,
      render: (val) => (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <StarRating rating={val} readOnly={true} showLabel={false} />
          <span className="badge badge-rating" style={{ fontSize: '0.8rem' }}>{val} / 5</span>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Submission Date',
      sortable: true,
      render: (_, row) => {
        const dateObj = new Date(row.updated_at || row.created_at);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-body)' }}>
            <Calendar size={14} color="var(--text-muted)" />
            <span>{dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        );
      }
    }
  ];

  if (loading && !data) {
    return (
      <div style={{ maxWidth: '1264px', margin: '0 auto', padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="animate-pulse-subtle" style={{ fontSize: '1.1rem', fontWeight: 500 }}>
          Loading Store Owner metrics...
        </div>
      </div>
    );
  }

  if (data && !data.hasStore) {
    return (
      <div style={{ maxWidth: '780px', margin: '48px auto', padding: '0 20px' }}>
        <div className="sp-card" style={{ padding: '48px 32px', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <ShieldAlert size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--sp-dark)', marginBottom: '8px' }}>
            No Store Assigned Yet
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 20px', fontSize: '0.95rem' }}>
            Your account is registered as a Store Owner, but no store has been linked to your profile by the System Administrator yet.
          </p>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
            Please contact the platform administrator to link your store.
          </div>
        </div>
      </div>
    );
  }

  const { store, averageRating, totalRatings, ratings } = data || {};

  return (
    <div style={{ maxWidth: '1264px', margin: '0 auto', padding: '36px 20px' }}>
      {/* Top Banner in StorePulse Dark Navy #010030 */}
      <div
        className="sp-card-dark"
        style={{
          padding: '36px',
          marginBottom: '32px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '24px'
        }}
      >
        {/* Store Meta */}
        <div style={{ flex: '1 1 340px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
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
              <Store size={13} /> Store Owner Console
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
            {store?.name}
          </h1>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', color: '#94A3B8', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={16} color="var(--sp-mint)" />
              <span style={{ color: '#E2E8F0' }}>{store?.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} color="var(--sp-mint)" />
              <span style={{ color: '#E2E8F0' }}>{store?.address}</span>
            </div>
          </div>
        </div>

        {/* Big Average Score Highlight */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '20px 28px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(0, 231, 158, 0.3)',
            boxShadow: '0 0 25px rgba(0, 231, 158, 0.15)'
          }}
        >
          <div
            style={{
              fontSize: '3.4rem',
              fontWeight: 800,
              lineHeight: 1,
              color: 'var(--sp-mint)',
              letterSpacing: '-0.03em'
            }}
          >
            {averageRating.toFixed(1)}
          </div>

          <div>
            <div style={{ marginBottom: '4px' }}>
              <StarRating rating={averageRating} size={22} showLabel={false} readOnly={true} />
            </div>
            <div style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 600 }}>
              Average Store Rating
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
              Based on <strong style={{ color: '#FFFFFF' }}>{totalRatings}</strong> customer {totalRatings === 1 ? 'rating' : 'ratings'}
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--sp-dark)' }}>
            Customer Feedback & Ratings
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            List of users who submitted ratings for your store
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Users size={16} />
          <span>{ratings?.length || 0} reviews received</span>
        </div>
      </div>

      {/* Ratings Table */}
      <SortableTable
        columns={columns}
        data={ratings || []}
        sortKey={sortState.key}
        sortOrder={sortState.order}
        onSort={(key) => {
          setSortState((prev) => ({
            key,
            order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
          }));
        }}
        loading={loading}
        emptyMessage="No customer ratings have been submitted for your store yet."
      />
    </div>
  );
};

export default StoreOwnerDashboard;
