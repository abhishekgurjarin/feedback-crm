import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, RefreshCw, MessageSquare, Star, TrendingUp, AlertCircle, Shield, CheckCircle, Clock, Edit3 } from 'lucide-react';
import { FeedbackItem, AnalyticsSummary, AdminUser } from '../../types/index.js';
import { Modal } from '../common/Modal.js';

interface AdminConsoleProps {
  user: AdminUser | null;
  token: string | null;
  onOpenLogin: () => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  user,
  token,
  onOpenLogin,
  addToast,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'createdAt' | 'rating'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal State for updating status/notes
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [newStatus, setNewStatus] = useState<string>('NEW');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (categoryFilter !== 'ALL') queryParams.append('category', categoryFilter);
      if (statusFilter !== 'ALL') queryParams.append('status', statusFilter);
      if (search.trim()) queryParams.append('search', search.trim());
      queryParams.append('sortBy', sortBy);
      queryParams.append('sortOrder', sortOrder);
      queryParams.append('limit', '50');

      const [analyticsRes, feedbackRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch(`/api/feedback?${queryParams.toString()}`),
      ]);

      const analyticsJson = await analyticsRes.json();
      const feedbackJson = await feedbackRes.json();

      if (analyticsJson.success) setAnalytics(analyticsJson.data);
      if (feedbackJson.success) setFeedbacks(feedbackJson.data);
    } catch {
      addToast('error', 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, statusFilter, search, sortBy, sortOrder, addToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleOpenEditModal = (item: FeedbackItem) => {
    if (!user || !token) {
      addToast('info', 'Please log in to the Admin Console to update status or add notes.');
      onOpenLogin();
      return;
    }
    setSelectedFeedback(item);
    setNewStatus(item.status);
    setAdminNotes(item.adminNotes || '');
  };

  const handleUpdateStatus = async () => {
    if (!selectedFeedback || !token) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/feedback/${selectedFeedback.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: adminNotes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        addToast('success', 'Feedback status updated successfully!');
        setSelectedFeedback(null);
        fetchDashboardData();
      } else {
        addToast('error', data.error?.message || 'Failed to update status.');
      }
    } catch {
      addToast('error', 'Network error while updating feedback.');
    } finally {
      setUpdating(false);
    }
  };

  const renderRatingStars = (val: number) => {
    const emojis: Record<number, string> = { 1: '😡', 2: '😕', 3: '😐', 4: '🙂', 5: '😍' };
    return (
      <span style={{ fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <span>{emojis[val] || '⭐️'}</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: val >= 4 ? 'var(--color-success)' : val === 3 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
          {val}/5
        </span>
      </span>
    );
  };

  return (
    <div>
      {/* Top Console Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>
            Trend Intelligence Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Real-time customer feedback analytics, sentiment distribution, and workflow management.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.8rem' }}>
              <Shield size={16} />
              <span>Read-Only Mode (Click Admin Login to manage)</span>
            </div>
          )}
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Analytics</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      {analytics && (
        <div className="grid-4" style={{ marginBottom: '2.5rem', gap: '1.25rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--color-primary)' }}>
            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--color-primary)' }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Submissions</span>
              <strong style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{analytics.total}</strong>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--color-success)' }}>
            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' }}>
              <Star size={24} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Average Rating</span>
              <strong style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{analytics.averageRating} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>/ 5.0</span></strong>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--color-accent)' }}>
            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--color-accent)' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>NPS Trend Score</span>
              <strong style={{ fontSize: '1.75rem', fontWeight: 800, color: analytics.npsScore >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {analytics.npsScore >= 0 ? `+${analytics.npsScore}` : analytics.npsScore}%
              </strong>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--color-warning)' }}>
            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)' }}>
              <AlertCircle size={24} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Open Action Items</span>
              <strong style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {analytics.statusDistribution.NEW + analytics.statusDistribution.IN_PROGRESS}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Charts & Visualizations */}
      {analytics && analytics.total > 0 && (
        <div className="grid-2" style={{ marginBottom: '2.5rem', gap: '1.5rem' }}>
          {/* Category Distribution Bar Chart */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} style={{ color: 'var(--color-primary)' }} />
              <span>Category Distribution</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analytics.categoryDistribution.map((item) => (
                <div key={item.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{item.category}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.count} ({item.percentage}%)</span>
                  </div>
                  <div style={{ height: '10px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${item.percentage}%`,
                        background: item.category === 'Bug Report' ? 'var(--color-danger)' :
                                    item.category === 'Feature Request' ? 'var(--color-accent)' :
                                    item.category === 'UI/UX' ? 'var(--color-primary)' :
                                    item.category === 'Performance' ? 'var(--color-warning)' :
                                    item.category === 'Praise' ? 'var(--color-success)' : 'var(--color-cyan)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.8s ease-out',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sentiment Breakdown */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} style={{ color: 'var(--color-success)' }} />
                <span>Customer Sentiment Analysis</span>
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Breakdown of Promoters (4-5★), Passives (3★), and Detractors (1-2★).
              </p>

              <div style={{ display: 'flex', height: '24px', width: '100%', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '1.5rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }}>
                <div
                  title={`Promoters: ${analytics.sentimentBreakdown.positive}`}
                  style={{
                    width: `${(analytics.sentimentBreakdown.positive / analytics.total) * 100}%`,
                    background: 'var(--color-success)',
                    transition: 'width 0.8s ease-out',
                  }}
                />
                <div
                  title={`Passives: ${analytics.sentimentBreakdown.neutral}`}
                  style={{
                    width: `${(analytics.sentimentBreakdown.neutral / analytics.total) * 100}%`,
                    background: 'var(--color-warning)',
                    transition: 'width 0.8s ease-out',
                  }}
                />
                <div
                  title={`Detractors: ${analytics.sentimentBreakdown.negative}`}
                  style={{
                    width: `${(analytics.sentimentBreakdown.negative / analytics.total) * 100}%`,
                    background: 'var(--color-danger)',
                    transition: 'width 0.8s ease-out',
                  }}
                />
              </div>

              <div className="grid-3" style={{ gap: '0.75rem', textAlign: 'center' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-success)' }}>{analytics.sentimentBreakdown.positive}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>😍 Promoters</span>
                </div>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-warning)' }}>{analytics.sentimentBreakdown.neutral}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>😐 Passives</span>
                </div>
                <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                  <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-danger)' }}>{analytics.sentimentBreakdown.negative}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>😡 Detractors</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ⚡ NPS is calculated as % Promoters minus % Detractors.
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords, titles, or authors..."
            style={{ paddingLeft: '2.5rem', fontSize: '0.9rem' }}
          />
        </div>

        {/* Category Dropdown */}
        <div style={{ flex: '0 1 180px' }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ fontSize: '0.9rem' }}
          >
            <option value="ALL">All Categories</option>
            <option value="Bug Report">Bug Report</option>
            <option value="Feature Request">Feature Request</option>
            <option value="UI/UX">UI/UX</option>
            <option value="Performance">Performance</option>
            <option value="Praise">Praise</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['ALL', 'NEW', 'REVIEWED', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.45rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: statusFilter === st ? 'var(--color-primary)' : 'rgba(255,255,255,0.03)',
                color: statusFilter === st ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${statusFilter === st ? 'var(--color-primary)' : 'var(--border-color)'}`,
              }}
            >
              {st === 'IN_PROGRESS' ? 'IN PROGRESS' : st}
            </button>
          ))}
        </div>

        {/* Sort Order */}
        <div style={{ flex: '0 1 160px' }}>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [f, o] = e.target.value.split('-') as ['createdAt' | 'rating', 'asc' | 'desc'];
              setSortBy(f);
              setSortOrder(o);
            }}
            style={{ fontSize: '0.9rem' }}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="rating-desc">Highest Rated</option>
            <option value="rating-asc">Lowest Rated</option>
          </select>
        </div>
      </div>

      {/* Feedback Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {feedbacks.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <MessageSquare size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-secondary)' }}>No feedback matching your filters</h3>
            <p style={{ margin: 0 }}>Try clearing your search query or selecting a different category/status.</p>
          </div>
        ) : (
          feedbacks.map((item) => {
            const badgeClass =
              item.status === 'NEW' ? 'badge-new' :
              item.status === 'REVIEWED' ? 'badge-reviewed' :
              item.status === 'IN_PROGRESS' ? 'badge-in-progress' : 'badge-resolved';

            return (
              <div
                key={item.id}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  borderLeft: item.status === 'NEW' ? '4px solid var(--color-danger)' :
                              item.status === 'RESOLVED' ? '4px solid var(--color-success)' :
                              item.status === 'IN_PROGRESS' ? '4px solid var(--color-cyan)' : '4px solid var(--color-warning)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <span className={`badge ${badgeClass}`}>
                        {item.status === 'IN_PROGRESS' ? 'IN PROGRESS' : item.status}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-secondary)',
                      }}>
                        {item.category}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      {item.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {renderRatingStars(item.rating)}
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="btn btn-secondary"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                    >
                      <Edit3 size={14} />
                      <span>{user ? 'Manage Workflow' : 'View / Update'}</span>
                    </button>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  {item.comment}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div>
                    Submitted by: <strong style={{ color: 'var(--text-secondary)' }}>{item.userName || 'Anonymous Submitter'}</strong>
                    {item.userEmail && <span> ({item.userEmail})</span>}
                  </div>

                  {item.adminNotes && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-cyan)', fontWeight: 500 }}>
                      <CheckCircle size={14} />
                      <span>Internal Note: <em>"{item.adminNotes}"</em></span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Status Management Modal */}
      <Modal
        isOpen={selectedFeedback !== null}
        onClose={() => setSelectedFeedback(null)}
        title="Manage Feedback Workflow"
      >
        {selectedFeedback && (
          <div>
            <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                {selectedFeedback.title}
              </strong>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {selectedFeedback.comment}
              </p>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Update Workflow Status
              </label>
              <div className="grid-4" style={{ gap: '0.5rem' }}>
                {['NEW', 'REVIEWED', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setNewStatus(st)}
                    style={{
                      padding: '0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: newStatus === st ? 'var(--color-primary)' : 'rgba(255,255,255,0.03)',
                      color: newStatus === st ? '#fff' : 'var(--text-secondary)',
                      border: `1px solid ${newStatus === st ? 'var(--color-primary)' : 'var(--border-color)'}`,
                    }}
                  >
                    {st === 'IN_PROGRESS' ? 'IN PROGRESS' : st}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Internal Team Collaboration Note (Optional)
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g., Assigned to sprint backlog / Verified bug fix in staging v1.0.4..."
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={updating}
                className="btn btn-primary"
              >
                {updating ? 'Saving Changes...' : 'Save Workflow Status'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
