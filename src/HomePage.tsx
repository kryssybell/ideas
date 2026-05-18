import { useState } from 'react';
import type { Review } from './types';
import { loadReviews, deleteReview } from './store';

interface Props {
  onNew: () => void;
  onOpen: (review: Review) => void;
  onReview: (review: Review) => void;
  onSetupGuide: () => void;
}

export default function HomePage({ onNew, onOpen, onReview, onSetupGuide }: Props) {
  const [reviews, setReviews] = useState<Review[]>(() => loadReviews());

  function handleDelete(id: string) {
    deleteReview(id);
    setReviews(loadReviews());
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', padding: 32 }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Ideas</h1>
            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 14 }}>
              Upload screenshots, annotate issues, share for feedback
            </p>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onSetupGuide}
              style={{
                background: '#7c3aed', color: '#fff', border: 'none',
                borderRadius: 8, padding: '10px 20px', fontSize: 15, cursor: 'pointer', fontWeight: 600,
              }}
            >
              Setup Guide Review
            </button>
            <button
              onClick={onNew}
              style={{
                background: '#3b82f6', color: '#fff', border: 'none',
                borderRadius: 8, padding: '10px 20px', fontSize: 15, cursor: 'pointer', fontWeight: 600,
              }}
            >
              + New Review
            </button>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div style={{
            border: '2px dashed #334155', borderRadius: 12, padding: 60,
            textAlign: 'center', color: '#475569',
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>+</div>
            <div style={{ fontSize: 16 }}>No reviews yet. Create your first one.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.map((rev) => (
              <div key={rev.id} style={{
                background: '#1e293b', borderRadius: 10, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 16, border: '1px solid #334155',
              }}>
                <img
                  src={rev.imageDataUrl}
                  alt={rev.imageName}
                  style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {rev.imageName}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    {rev.annotations.length} annotation{rev.annotations.length !== 1 ? 's' : ''}
                    {' · '}
                    {rev.reviewerFeedback?.length ?? 0} comment{(rev.reviewerFeedback?.length ?? 0) !== 1 ? 's' : ''}
                    {' · '}
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button onClick={() => onOpen(rev)} style={btnStyle('#3b82f6')}>Edit</button>
                <button onClick={() => onReview(rev)} style={btnStyle('#6366f1')}>View Feedback</button>
                <button onClick={() => handleDelete(rev.id)} style={btnStyle('#ef4444')}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    background: bg, color: '#f1f5f9', border: 'none',
    borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13, flexShrink: 0,
  };
}
