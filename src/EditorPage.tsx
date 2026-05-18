import { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Annotation, Review, ToolMode } from './types';
import { upsertReview } from './store';
import AnnotationCanvas from './AnnotationCanvas';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ffffff'];

interface Props {
  review?: Review;
  onSaved: (id: string) => void;
  onBack: () => void;
}

export default function EditorPage({ review: initial, onSaved, onBack }: Props) {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(initial?.imageDataUrl ?? null);
  const [imageName, setImageName] = useState(initial?.imageName ?? '');
  const [annotations, setAnnotations] = useState<Annotation[]>(initial?.annotations ?? []);
  const [tool, setTool] = useState<ToolMode>('select');
  const [color, setColor] = useState('#ef4444');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageDataUrl(e.target?.result as string);
      setImageName(file.name);
      setAnnotations([]);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handleFile(file);
  }

  function handleSave() {
    if (!imageDataUrl) return;
    const id = initial?.id ?? uuidv4();
    const rev: Review = {
      id,
      imageDataUrl,
      imageName,
      annotations,
      createdAt: initial?.createdAt ?? Date.now(),
      reviewerFeedback: initial?.reviewerFeedback ?? [],
    };
    upsertReview(rev);
    const url = `${window.location.origin}${window.location.pathname}?review=${id}`;
    setShareUrl(url);
    onSaved(id);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f172a', color: '#f1f5f9' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
        background: '#1e293b', borderBottom: '1px solid #334155', flexWrap: 'wrap',
      }}>
        <button onClick={onBack} style={btnStyle('#334155')}>← Back</button>
        <span style={{ fontWeight: 700, fontSize: 16 }}>Ideas — Visual Feedback</span>
        <div style={{ flex: 1 }} />

        <span style={{ fontSize: 12, color: '#94a3b8' }}>Tool:</span>
        {(['select', 'text', 'arrow'] as ToolMode[]).map((t) => (
          <button
            key={t}
            onClick={() => setTool(t)}
            style={btnStyle(tool === t ? '#3b82f6' : '#334155')}
          >
            {t === 'select' ? 'Select' : t === 'text' ? '+ Text' : '→ Arrow'}
          </button>
        ))}

        <span style={{ fontSize: 12, color: '#94a3b8' }}>Color:</span>
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{
              width: 24, height: 24, borderRadius: '50%', background: c,
              border: color === c ? '3px solid #f1f5f9' : '2px solid transparent',
              cursor: 'pointer',
            }}
          />
        ))}

        <button
          onClick={handleSave}
          disabled={!imageDataUrl}
          style={btnStyle('#22c55e')}
        >
          Save & Get Share Link
        </button>
      </div>

      {/* Canvas area */}
      <div
        style={{ flex: 1, overflow: 'auto', padding: 24, display: 'flex', justifyContent: 'center', alignItems: imageDataUrl ? 'flex-start' : 'center' }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {!imageDataUrl ? (
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: '2px dashed #475569', borderRadius: 12, padding: 60,
              textAlign: 'center', cursor: 'pointer', color: '#94a3b8',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>+</div>
            <div style={{ fontSize: 18, marginBottom: 6 }}>Drop a screenshot here</div>
            <div style={{ fontSize: 13 }}>or click to browse</div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              {tool === 'text' && 'Click anywhere on the image to add a text label'}
              {tool === 'arrow' && 'Click once to start an arrow, click again to finish it'}
              {tool === 'select' && 'Click an annotation to select it. Press Delete to remove it.'}
            </div>
            <AnnotationCanvas
              imageDataUrl={imageDataUrl}
              annotations={annotations}
              onChange={setAnnotations}
              tool={tool}
              selectedColor={color}
            />
          </div>
        )}
      </div>

      {/* Share link banner */}
      {shareUrl && (
        <div style={{
          background: '#1e293b', borderTop: '1px solid #334155',
          padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>Share this link with your reviewer:</span>
          <code style={{
            flex: 1, background: '#0f172a', padding: '4px 10px',
            borderRadius: 6, fontSize: 12, color: '#22c55e', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{shareUrl}</code>
          <button onClick={() => navigator.clipboard.writeText(shareUrl)} style={btnStyle('#3b82f6')}>
            Copy
          </button>
        </div>
      )}
    </div>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    background: bg, color: '#f1f5f9', border: 'none',
    borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13,
  };
}
