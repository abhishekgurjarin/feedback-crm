import React, { useState } from 'react';
import { Bug, Sparkles, Layout, Zap, Heart, HelpCircle, Send, CheckCircle2 } from 'lucide-react';
import { FeedbackItem } from '../../types/index.js';

interface FeedbackFormProps {
  onSuccess: (newFeedback: FeedbackItem) => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  onSwitchToDashboard: () => void;
}

const CATEGORIES = [
  { id: 'Bug Report', label: 'Bug Report', icon: Bug, color: 'var(--color-danger)', desc: 'Report an issue or glitch' },
  { id: 'Feature Request', label: 'Feature Request', icon: Sparkles, color: 'var(--color-accent)', desc: 'Suggest a new capability' },
  { id: 'UI/UX', label: 'UI/UX', icon: Layout, color: 'var(--color-primary)', desc: 'Design & interface feedback' },
  { id: 'Performance', label: 'Performance', icon: Zap, color: 'var(--color-warning)', desc: 'Speed & responsiveness' },
  { id: 'Praise', label: 'Praise', icon: Heart, color: 'var(--color-success)', desc: 'Share what you love!' },
  { id: 'Other', label: 'Other', icon: HelpCircle, color: 'var(--color-cyan)', desc: 'General comments' },
];

const RATINGS = [
  { val: 1, emoji: '😡', label: 'Very Unhappy', color: '#f43f5e' },
  { val: 2, emoji: '😕', label: 'Dissatisfied', color: '#f97316' },
  { val: 3, emoji: '😐', label: 'Neutral', color: '#eab308' },
  { val: 4, emoji: '🙂', label: 'Satisfied', color: '#06b6d4' },
  { val: 5, emoji: '😍', label: 'Delighted', color: '#10b981' },
];

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSuccess, addToast, onSwitchToDashboard }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Feature Request');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 5) {
      addToast('error', 'Please enter at least 5 characters in your comment.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          rating,
          comment: comment.trim(),
          userEmail: userEmail.trim() || undefined,
          userName: userName.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
        addToast('success', 'Your feedback was submitted successfully! Thank you.');
        onSuccess(data.data);

        // Reset form fields after 3s or user click
        setTimeout(() => {
          setTitle('');
          setComment('');
          setSubmitted(false);
        }, 4000);
      } else {
        const errorMsg = data.error?.details
          ? data.error.details.map((d: { message: string }) => d.message).join(' | ')
          : data.error?.message || 'Failed to submit feedback.';
        addToast('error', errorMsg);
      }
    } catch {
      addToast('error', 'Network error. Could not connect to API server.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="glass-card" style={{ maxWidth: '650px', margin: '3rem auto', textAlign: 'center', padding: '3.5rem 2rem', animation: 'scaleUp 0.3s ease-out' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(16, 185, 129, 0.15)',
          color: 'var(--color-success)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto',
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)',
        }}>
          <CheckCircle2 size={48} />
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Thank You for Your Voice!</h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto 2rem auto' }}>
          Your feedback has been logged directly into Acowale Pulse CRM. Our engineering and product teams review submissions in real-time to shape our product roadmap.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSubmitted(false)}
            className="btn btn-secondary"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            Submit Another Feedback
          </button>
          <button
            onClick={onSwitchToDashboard}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            View Live Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span style={{
          display: 'inline-block',
          padding: '0.35rem 0.85rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(99, 102, 241, 0.15)',
          color: 'var(--color-primary)',
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '0.75rem',
          border: '1px solid rgba(99, 102, 241, 0.3)',
        }}>
          #TeamAcowale Public Portal
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
          Shape the Future of <span style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent), var(--color-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Acowale</span>
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto' }}>
          We build for you. Share your ideas, report bugs, or evaluate our engineering aesthetics. Every submission is analyzed in our live trend dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '2.5rem', borderTop: '4px solid var(--color-primary)' }}>
        {/* Step 1: Select Category */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            1. What kind of feedback are you sharing? *
          </label>
          <div className="grid-3" style={{ gap: '0.85rem' }}>
            {CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              const isSelected = category === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    boxShadow: isSelected ? '0 0 15px rgba(99, 102, 241, 0.25)' : 'none',
                    transform: isSelected ? 'translateY(-2px)' : 'none',
                  }}
                >
                  <div style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.05)',
                    color: isSelected ? '#fff' : cat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <IconComponent size={20} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {cat.label}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Emoji Rating */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            2. How satisfied are you with this experience? *
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            {RATINGS.map((item) => {
              const isSelected = rating === item.val;
              return (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setRating(item.val)}
                  style={{
                    flex: '1 1 100px',
                    padding: '1rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                    border: `2px solid ${isSelected ? item.color : 'var(--border-color)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transform: isSelected ? 'scale(1.05)' : 'none',
                    boxShadow: isSelected ? `0 0 20px ${item.color}40` : 'none',
                    transition: 'all var(--transition-normal)',
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>{item.emoji}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? item.color : 'var(--text-secondary)' }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Title & Comment */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
            3. Summary Headline *
          </label>
          <input
            type="text"
            required
            minLength={3}
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Dashboard filtering is lightning fast!"
            style={{ fontSize: '1rem', padding: '0.85rem 1rem' }}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              4. Detailed Comments *
            </label>
            <span style={{ fontSize: '0.75rem', color: comment.length > 900 ? 'var(--color-warning)' : 'var(--text-muted)' }}>
              {comment.length} / 1000 characters (min 5)
            </span>
          </div>
          <textarea
            required
            minLength={5}
            maxLength={1000}
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Please share specific details, steps to reproduce if reporting a bug, or ideas for UI enhancement..."
            style={{ resize: 'vertical', minHeight: '110px' }}
          />
        </div>

        {/* Step 4: Optional Contact Information */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            👤 Optional Contact Information (for follow-ups or beta testing invitations)
          </div>
          <div className="grid-2" style={{ gap: '1rem' }}>
            <div>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your Name (e.g., Sarah Jenkins)"
                maxLength={50}
              />
            </div>
            <div>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Your Email Address"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !title.trim() || comment.trim().length < 5}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1.05rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          {loading ? (
            <span>Sending Feedback...</span>
          ) : (
            <>
              <Send size={20} />
              <span>Submit Feedback to Acowale</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
