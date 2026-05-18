import { useState, useEffect, useRef, useCallback } from 'react';
import screenshots from './setup-guide-screenshots.json';
import { supabase } from './lib/supabase';
import type { FeedbackRow } from './lib/supabase';

interface ScreenshotEntry {
  id: string;
  title: string;
  stage: string;
  dataUrl: string;
}

const FONT = "'Nunito', sans-serif";

const STAGE_COLORS: Record<string, string> = {
  'Foundation — Local Setup':     '#f9a8d4',
  'Save Your Work to GitHub':     '#93c5fd',
  'Create Your First App':        '#86efac',
  "Set Up Your App's Storage":    '#fdba74',
  'Put Your App on the Internet': '#c4b5fd',
  'Keeping Going':                '#fca5a5',
};

// ── Speech recognition ──────────────────────────────────────────────────────

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

function useSpeech(onTranscript: (text: string) => void) {
  const recRef = useRef<SpeechRecognitionInstance | null>(null);
  const [listening, setListening] = useState(false);
  function start() {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported. Try Chrome or Safari.'); return; }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'en-US';
    rec.onresult = (e: SpeechRecognitionEvent) => {
      onTranscript(Array.from(e.results).map(r => r[0].transcript).join(' '));
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    recRef.current = rec;
    setListening(true);
  }
  function stop() { recRef.current?.stop(); setListening(false); }
  return { listening, start, stop };
}

function MicButton({ onTranscript }: { onTranscript: (t: string) => void }) {
  const { listening, start, stop } = useSpeech(onTranscript);
  return (
    <button onClick={listening ? stop : start} title={listening ? 'Stop' : 'Speak'} style={{
      background: listening ? '#ec4899' : '#fce7f3',
      border: `2px solid ${listening ? '#be185d' : '#fbcfe8'}`,
      borderRadius: '50%', width: 32, height: 32,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s',
      boxShadow: listening ? '0 0 0 4px rgba(236,72,153,0.2)' : 'none',
    }}>
      {listening ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="#fff"><rect x="1" y="1" width="10" height="10" rx="2" /></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#be185d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="9" y1="22" x2="15" y2="22" />
        </svg>
      )}
    </button>
  );
}

// ── Feedback panel ──────────────────────────────────────────────────────────

function FeedbackPanel({ stepId }: { stepId: string }) {
  const [items, setItems] = useState<FeedbackRow[]>([]);
  const [draft, setDraft] = useState('');
  const [author, setAuthor] = useState(() => localStorage.getItem('feedback-author') ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('feedback')
      .select('*')
      .eq('step_id', stepId)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setItems(data as FeedbackRow[]); });

    const channel = supabase
      .channel(`feedback-${stepId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feedback', filter: `step_id=eq.${stepId}` },
        (payload) => setItems(prev => [...prev, payload.new as FeedbackRow]))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [stepId]);

  async function submit() {
    if (!draft.trim() || !author.trim()) return;
    setSaving(true);
    localStorage.setItem('feedback-author', author);
    await supabase.from('feedback').insert({ step_id: stepId, author: author.trim(), content: draft.trim() });
    setDraft('');
    setSaving(false);
  }

  return (
    <div style={{ borderTop: '2px dashed #fbcfe8', marginTop: 8 }}>
      <div style={{ padding: '8px 14px 4px', fontSize: 12, fontWeight: 800, color: '#db2777', opacity: 0.7 }}>
        FEEDBACK
      </div>

      {items.length > 0 && (
        <div style={{ padding: '0 14px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map(item => (
            <div key={item.id} style={{
              background: '#fdf2f8', borderRadius: 10, padding: '8px 12px',
              border: '1px solid #fce7f3',
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#be185d', marginBottom: 2 }}>{item.author}</div>
              <div style={{ fontSize: 13, color: '#6b21a8', lineHeight: 1.5 }}>{item.content}</div>
              <div style={{ fontSize: 10, color: '#db2777', opacity: 0.5, marginTop: 4 }}>
                {new Date(item.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '4px 14px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <input
          value={author}
          onChange={e => setAuthor(e.target.value)}
          placeholder="Your name"
          style={{
            border: '1px solid #fbcfe8', borderRadius: 8, padding: '6px 10px',
            fontSize: 13, fontFamily: FONT, color: '#4a1942', outline: 'none',
            background: '#fff',
          }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Leave feedback on this step…"
            rows={2}
            style={{
              flex: 1, border: '1px solid #fbcfe8', borderRadius: 8,
              padding: '6px 10px', fontSize: 13, fontFamily: FONT,
              color: '#4a1942', outline: 'none', resize: 'none', background: '#fff',
            }}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(); }}
          />
          <button
            onClick={submit}
            disabled={saving || !draft.trim() || !author.trim()}
            style={{
              background: '#ec4899', color: '#fff', border: 'none',
              borderRadius: 8, padding: '0 14px', cursor: 'pointer',
              fontFamily: FONT, fontWeight: 700, fontSize: 13,
              opacity: saving || !draft.trim() || !author.trim() ? 0.5 : 1,
              flexShrink: 0,
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function SetupGuideReview() {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [syncState, setSyncState] = useState<Record<string, 'saved' | 'saving' | null>>({});
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pages = screenshots as ScreenshotEntry[];

  // Load all notes from Supabase on mount
  useEffect(() => {
    supabase.from('notes').select('step_id, content').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r: { step_id: string; content: string }) => { map[r.step_id] = r.content; });
        setNotes(map);
      }
    });
  }, []);

  const saveNote = useCallback(async (id: string, content: string) => {
    setSyncState(prev => ({ ...prev, [id]: 'saving' }));
    await supabase.from('notes').upsert({ step_id: id, content, updated_at: new Date().toISOString() });
    setSyncState(prev => ({ ...prev, [id]: 'saved' }));
    setTimeout(() => setSyncState(prev => ({ ...prev, [id]: null })), 2000);
  }, []);

  function handleNoteChange(id: string, text: string) {
    setNotes(prev => ({ ...prev, [id]: text }));
    clearTimeout(saveTimers.current[id]);
    saveTimers.current[id] = setTimeout(() => saveNote(id, text), 800);
  }

  function handleTranscript(id: string, transcript: string) {
    const current = notes[id] ?? '';
    handleNoteChange(id, current ? `${current} ${transcript}` : transcript);
  }

  // Group by stage
  const stages: { name: string; steps: ScreenshotEntry[] }[] = [];
  for (const page of pages) {
    const last = stages[stages.length - 1];
    if (last && last.name === page.stage) last.steps.push(page);
    else stages.push({ name: page.stage, steps: [page] });
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fdf2f8', fontFamily: FONT, color: '#4a1942' }}>

      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 28px',
        background: 'rgba(253, 242, 248, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '2px solid #fbcfe8',
        boxShadow: '0 2px 12px rgba(236, 72, 153, 0.08)',
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#be185d' }}>Setup Guide Review</div>
          <div style={{ fontSize: 12, color: '#db2777', opacity: 0.75 }}>
            {pages.length} steps · {stages.length} stages · Notes sync live · Click 🎤 to speak
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, padding: '28px 24px 48px' }}>
        {stages.map((stage) => {
          const accent = STAGE_COLORS[stage.name] ?? '#f9a8d4';
          return (
            <div key={stage.name}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ height: 4, width: 32, borderRadius: 4, background: accent, flexShrink: 0 }} />
                <span style={{ fontWeight: 800, fontSize: 17, color: '#9d174d', letterSpacing: '-0.2px' }}>
                  {stage.name}
                </span>
                <div style={{ flex: 1, height: 1, background: '#fbcfe8' }} />
                <span style={{ fontSize: 12, color: '#db2777', fontWeight: 700, opacity: 0.6 }}>
                  {stage.steps.length} steps
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {stage.steps.map((step, stepIdx) => (
                  <div key={step.id} style={{
                    display: 'flex',
                    background: '#fff',
                    borderRadius: 16,
                    border: '2px solid #fbcfe8',
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(236, 72, 153, 0.06)',
                  }}>
                    {/* Screenshot */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '2px solid #fbcfe8' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', background: '#fdf2f8',
                        borderBottom: '1px solid #fce7f3',
                      }}>
                        <span style={{
                          background: accent, color: '#fff', borderRadius: '50%',
                          width: 24, height: 24, display: 'inline-flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 800, flexShrink: 0,
                        }}>{stepIdx + 1}</span>
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#be185d' }}>
                          {step.id} — {step.title}
                        </span>
                      </div>
                      <img src={step.dataUrl} alt={step.title} style={{ width: '100%', display: 'block' }} />
                    </div>

                    {/* Notes + Feedback */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Notes header */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', borderBottom: '1px solid #fce7f3',
                        background: '#fdf2f8', gap: 8,
                      }}>
                        <span style={{ fontWeight: 800, fontSize: 13, color: '#be185d' }}>Notes</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {syncState[step.id] === 'saving' && (
                            <span style={{ fontSize: 11, color: '#db2777', opacity: 0.6 }}>Saving…</span>
                          )}
                          {syncState[step.id] === 'saved' && (
                            <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>Saved!</span>
                          )}
                          <MicButton onTranscript={(t) => handleTranscript(step.id, t)} />
                        </div>
                      </div>

                      {/* Notes textarea */}
                      <textarea
                        value={notes[step.id] ?? ''}
                        onChange={e => handleNoteChange(step.id, e.target.value)}
                        placeholder="Type or speak your notes…"
                        style={{
                          border: 'none', outline: 'none', color: '#6b21a8',
                          fontSize: 14, lineHeight: 1.7, padding: '14px',
                          resize: 'none', fontFamily: FONT, background: 'transparent',
                          minHeight: 140, width: '100%', boxSizing: 'border-box',
                        }}
                      />

                      {/* Feedback from reviewer */}
                      <FeedbackPanel stepId={step.id} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
