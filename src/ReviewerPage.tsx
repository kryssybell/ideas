import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Review, ReviewerComment } from './types';
import { upsertReview } from './store';
import AnnotationCanvas from './AnnotationCanvas';

interface Props {
  review: Review;
  onBack: () => void;
}

export default function ReviewerPage({ review, onBack }: Props) {
  const [comments, setComments] = useState<ReviewerComment[]>(review.reviewerFeedback ?? []);
  const [draft, setDraft] = useState('');
  const [saved, setSaved] = useState(false);

  function submitComment() {
    if (!draft.trim()) return;
    const comment: ReviewerComment = {
      id: uuidv4(),
      text: draft.trim(),
      createdAt: Date.now(),
    };
    const updated = [...comments, comment];
    setComments(updated);
    setDraft('');
    upsertReview({ ...review, reviewerFeedback: updated });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f172a', color: '#f1f5f9', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
        background: '#1e293b', borderBottom: '1px solid #334155',
      }}>
        <button onClick={onBack} style={btnStyle('#334155')}>← Back</button>
        <span style={{ fontWeight: 700, fontSize: 16 }}>Reviewing: {review.imageName}</span>
        <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 8 }}>
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Canvas - read only */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <AnnotationCanvas
            imageDataUrl={review.imageDataUrl}
            annotations={review.annotations}
            onChange={() => {}}
            tool="select"
            selectedColor="#ef4444"
            readOnly
          />
        </div>

        {/* Feedback sidebar */}
        <div style={{
          width: 320, borderLeft: '1px solid #334155', display: 'flex',
          flexDirection: 'column', background: '#1e293b',
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #334155', fontWeight: 600 }}>
            Feedback
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {comments.length === 0 && (
              <div style={{ color: '#64748b', fontSize: 13, textAlign: 'center', marginTop: 20 }}>
                No feedback yet. Add a comment below.
              </div>
            )}
            {comments.map((c) => (
              <div key={c.id} style={{
                background: '#0f172a', borderRadius: 8, padding: '10px 12px',
                fontSize: 14, lineHeight: 1.5,
              }}>
                <div>{c.text}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  {new Date(c.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: 16, borderTop: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add your feedback..."
              rows={4}
              style={{
                background: '#0f172a', color: '#f1f5f9', border: '1px solid #334155',
                borderRadius: 6, padding: '8px 10px', fontSize: 14, resize: 'vertical',
                fontFamily: 'inherit',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitComment();
              }}
            />
            <button onClick={submitComment} style={{ ...btnStyle('#3b82f6'), alignSelf: 'flex-end' }}>
              {saved ? 'Saved!' : 'Submit feedback'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    background: bg, color: '#f1f5f9', border: 'none',
    borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13,
  };
}
