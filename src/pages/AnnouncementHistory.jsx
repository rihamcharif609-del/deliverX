import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useDelivery } from '../context/DeliveryContext';
import { SectionLoading } from '../components/LoadingSpinner';
import { AnnouncementTypeBadge } from '../components/AnnouncementBadge';
import { 
  FaBullhorn, 
  FaSearch, 
  FaCheckDouble, 
  FaCheck, 
  FaExclamationCircle, 
  FaCalendarAlt, 
  FaUserShield,
  FaTimes,
  FaEye,
  FaShieldAlt,
  FaInbox
} from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const formatDate = (isoString) => {
  if (!isoString) return 'Recent';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(isoString);
  }
};

const AnnouncementHistory = ({ userRole }) => {
  const { user } = useAuth();
  const currentRole = user?.role || userRole || 'sender';
  const { fetchNotifications } = useDelivery();

  const [announcements, setAnnouncements] = useState([]);
  const [summary, setSummary] = useState({ total_published: 0, unread_count: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [readFilter, setReadFilter] = useState('all'); // 'all' | 'unread' | 'read'

  // Modal inspection
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // Action loadings
  const [markingAll, setMarkingAll] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { data } = await axios.get(`${API_BASE_URL}/announcements`);
      setAnnouncements(Array.isArray(data.data) ? data.data : []);
      setSummary(data.summary || { total_published: 0, unread_count: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load platform announcements.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleMarkAsRead = async (announcement) => {
    if (announcement.is_read || actionLoadingId === announcement.id) return;
    setActionLoadingId(announcement.id);

    try {
      await axios.post(`${API_BASE_URL}/announcements/${announcement.id}/read`);

      // Update local state
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === announcement.id ? { ...a, is_read: true, read_at: new Date().toISOString() } : a
        )
      );

      setSummary((prev) => ({
        ...prev,
        unread_count: Math.max(0, prev.unread_count - 1),
      }));

      // Refresh notification counts in header
      fetchNotifications().catch(() => {});
    } catch (err) {
      console.warn('Could not mark announcement as read.', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (summary.unread_count === 0 || markingAll) return;
    setMarkingAll(true);

    try {
      await axios.post(`${API_BASE_URL}/announcements/read-all`);

      setAnnouncements((prev) =>
        prev.map((a) => ({ ...a, is_read: true, read_at: a.read_at || new Date().toISOString() }))
      );

      setSummary((prev) => ({
        ...prev,
        unread_count: 0,
      }));

      // Refresh notification counts in header
      fetchNotifications().catch(() => {});
    } catch (err) {
      console.warn('Could not mark all announcements as read.', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleOpenDetail = (announcement) => {
    setSelectedAnnouncement(announcement);
    if (!announcement.is_read) {
      handleMarkAsRead(announcement);
    }
  };

  // Filtered announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.message.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'all' || a.type === typeFilter;

      let matchesRead = true;
      if (readFilter === 'unread') matchesRead = !a.is_read;
      else if (readFilter === 'read') matchesRead = Boolean(a.is_read);

      return matchesSearch && matchesType && matchesRead;
    });
  }, [announcements, searchTerm, typeFilter, readFilter]);

  const typeCounts = useMemo(() => {
    return {
      all: announcements.length,
      unread: announcements.filter((a) => !a.is_read).length,
      info: announcements.filter((a) => a.type === 'info').length,
      warning: announcements.filter((a) => a.type === 'warning').length,
      important: announcements.filter((a) => a.type === 'important').length,
      maintenance: announcements.filter((a) => a.type === 'maintenance').length,
    };
  }, [announcements]);

  const metricCards = [
    { key: 'all', label: 'All Notices', count: typeCounts.all, color: '#2563eb' },
    { key: 'unread', label: 'Unread', count: typeCounts.unread, color: '#ef4444', isReadFilter: true },
    { key: 'info', label: 'Info', count: typeCounts.info, color: '#3b82f6' },
    { key: 'warning', label: 'Warnings', count: typeCounts.warning, color: '#f59e0b' },
    { key: 'important', label: 'Important', count: typeCounts.important, color: '#ef4444' },
    { key: 'maintenance', label: 'Maintenance', count: typeCounts.maintenance, color: '#8b5cf6' },
  ];

  return (
    <MainLayout userRole={currentRole} activePage="announcements">
      {/* ===== HERO PAGE HEADER ===== */}
      <div className="dashboard-hero-banner" style={{ marginBottom: '24px' }}>
        <div className="hero-banner-content">
          <div className="hero-banner-tag">
            <FaBullhorn style={{ fontSize: '11px' }} />
            <span>PLATFORM ANNOUNCEMENTS & ADVISORIES</span>
          </div>
          <h1 className="hero-banner-title">
            Global Announcements 📢
          </h1>
          <p className="hero-banner-subtitle">
            Stay informed with official platform notices, service disruptions, weather alerts, and maintenance windows.
          </p>
        </div>

        <div className="hero-banner-actions">
          {summary.unread_count > 0 ? (
            <button
              type="button"
              className="dashboard-btn-outline"
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(37, 99, 235, 0.12)',
                color: '#2563eb',
                borderColor: 'rgba(37, 99, 235, 0.3)',
                padding: '10px 18px',
                borderRadius: '12px',
                fontWeight: '700',
              }}
            >
              <FaCheckDouble size={13} />
              {markingAll ? 'Updating...' : `Mark All as Read (${summary.unread_count})`}
            </button>
          ) : (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '12px',
              color: '#10b981',
              fontSize: '13px',
              fontWeight: '700',
            }}>
              <FaCheck /> All Caught Up
            </div>
          )}
        </div>
      </div>

      {/* ===== METRIC FILTER CARDS ===== */}
      <div className="delivery-metrics-row" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(6, 1fr)' }}>
        {metricCards.map((card) => {
          const isActive = card.isReadFilter
            ? readFilter === 'unread'
            : typeFilter === card.key && readFilter === 'all';

          return (
            <div
              key={card.key}
              className={`metric-filter-card ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (card.isReadFilter) {
                  setReadFilter('unread');
                  setTypeFilter('all');
                } else {
                  setReadFilter('all');
                  setTypeFilter(card.key);
                }
              }}
              style={{ cursor: 'pointer', padding: '14px 16px' }}
            >
              <div className="metric-card-top" style={{ marginBottom: '4px' }}>
                <span className="metric-card-label" style={{ fontSize: '12px', margin: 0 }}>
                  {card.label}
                </span>
                <span className="metric-card-count" style={{ fontSize: '18px', color: isActive ? card.color : 'var(--text-primary)' }}>
                  {card.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== SEARCH & FILTER TOOLBAR ===== */}
      <div className="deliveries-toolbar">
        <div className="toolbar-search-box">
          <FaSearch className="toolbar-search-icon" />
          <input
            type="text"
            placeholder="Search announcements by title or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="toolbar-search-input"
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="admin-table-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="important">Important</option>
            <option value="maintenance">Maintenance</option>
          </select>

          <select
            className="admin-table-select"
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>

          <div className="toolbar-active-filter-tag">
            Showing: <strong>{filteredAnnouncements.length}</strong> of {announcements.length}
          </div>
        </div>
      </div>

      {/* ===== ANNOUNCEMENTS LIST ===== */}
      <SectionLoading loading={isLoading} label="Loading platform announcements..." minHeight="260px">
        {error && (
          <div className="form-submit-error-banner" style={{ marginBottom: '20px' }}>
            <FaExclamationCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {filteredAnnouncements.length === 0 ? (
          <div className="form-section-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(37, 99, 235, 0.1)',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              margin: '0 auto 16px auto',
            }}>
              <FaInbox />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
              No Announcements Found
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0, maxWidth: '420px', marginInline: 'auto' }}>
              {searchTerm || typeFilter !== 'all' || readFilter !== 'all'
                ? 'No announcements match your search or filter criteria. Try clearing filters.'
                : 'There are currently no platform announcements posted by administration.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredAnnouncements.map((announcement) => {
              const isUnread = !announcement.is_read;
              const typeColor = 
                announcement.type === 'warning' ? '#f59e0b' :
                announcement.type === 'important' ? '#ef4444' :
                announcement.type === 'maintenance' ? '#8b5cf6' : '#2563eb';

              return (
                <div
                  key={announcement.id}
                  className="form-section-card"
                  style={{
                    padding: '22px 24px',
                    borderLeft: `4px solid ${typeColor}`,
                    background: isUnread ? 'var(--card-background)' : 'var(--card-background)',
                    boxShadow: isUnread ? '0 4px 20px rgba(0, 0, 0, 0.08)' : 'var(--shadow-sm)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                    {/* Header info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <AnnouncementTypeBadge type={announcement.type} />

                      {isUnread ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 10px',
                          borderRadius: '16px',
                          fontSize: '11px',
                          fontWeight: '800',
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          letterSpacing: '0.4px',
                        }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: '#ef4444',
                            boxShadow: '0 0 6px rgba(239, 68, 68, 0.8)'
                          }} />
                          NEW / UNREAD
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 10px',
                          borderRadius: '16px',
                          fontSize: '11px',
                          fontWeight: '600',
                          color: 'var(--text-secondary)',
                          backgroundColor: 'var(--hover-bg)',
                          border: '1px solid var(--border-color)',
                        }}>
                          <FaCheck size={10} color="#10b981" /> Read
                        </span>
                      )}

                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                      }}>
                        <FaCalendarAlt size={11} /> {formatDate(announcement.published_at || announcement.created_at)}
                      </span>
                    </div>

                    {/* Quick action buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isUnread && (
                        <button
                          type="button"
                          className="dashboard-btn-outline btn-sm"
                          onClick={() => handleMarkAsRead(announcement)}
                          disabled={actionLoadingId === announcement.id}
                          style={{
                            padding: '4px 12px',
                            fontSize: '12px',
                            color: '#10b981',
                            borderColor: 'rgba(16, 185, 129, 0.4)',
                            backgroundColor: 'rgba(16, 185, 129, 0.08)',
                          }}
                        >
                          <FaCheck size={10} /> Mark Read
                        </button>
                      )}

                      <button
                        type="button"
                        className="dashboard-btn-outline btn-sm"
                        onClick={() => handleOpenDetail(announcement)}
                        style={{ padding: '4px 12px', fontSize: '12px' }}
                      >
                        <FaEye size={11} /> View Notice
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      margin: '14px 0 8px 0',
                      fontSize: '17px',
                      fontWeight: '800',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleOpenDetail(announcement)}
                  >
                    {announcement.title}
                  </h3>

                  {/* Message body */}
                  <p style={{
                    margin: '0 0 12px 0',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-line',
                  }}>
                    {announcement.message}
                  </p>

                  {/* Footer metadata */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-color)',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                  }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <FaUserShield size={12} color="var(--primary-color)" /> Posted by DeliverX Administration
                    </span>
                    {announcement.read_at && (
                      <span>Read on {formatDate(announcement.read_at)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionLoading>

      {/* ===== ANNOUNCEMENT DETAIL LIGHTBOX MODAL ===== */}
      {selectedAnnouncement && (
        <div
          className="courier-modal-backdrop"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div
            className="courier-modal-card"
            style={{ maxWidth: '620px', width: '100%', padding: '30px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedAnnouncement(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '6px',
              }}
            >
              <FaTimes size={16} />
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <AnnouncementTypeBadge type={selectedAnnouncement.type} />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {formatDate(selectedAnnouncement.published_at || selectedAnnouncement.created_at)}
              </span>
            </div>

            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>
              {selectedAnnouncement.title}
            </h2>

            <div style={{
              padding: '18px 20px',
              borderRadius: '12px',
              background: 'var(--hover-bg, #f8fafc)',
              border: '1px solid var(--border-color, #e2e8f0)',
              marginBottom: '20px',
              fontSize: '14px',
              lineHeight: 1.65,
              color: 'var(--text-primary)',
              whiteSpace: 'pre-line',
            }}>
              {selectedAnnouncement.message}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <FaShieldAlt size={13} color="var(--primary-color)" /> Official Broadcast
              </span>
              <span>Author: DeliverX Administration</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="dashboard-btn-primary"
                onClick={() => setSelectedAnnouncement(null)}
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default AnnouncementHistory;
