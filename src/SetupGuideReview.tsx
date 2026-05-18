import { useState, useEffect, useRef, useCallback } from 'react';
import screenshots from './setup-guide-screenshots.json';
import { supabase } from './lib/supabase';

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

// ── Speech ──────────────────────────────────────────────────────────────────

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


// ── Main ─────────────────────────────────────────────────────────────────────

export default function SetupGuideReview() {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [reviewerNotes, setReviewerNotes] = useState<Record<string, string>>({});
  const [syncState, setSyncState] = useState<Record<string, 'saving' | 'saved' | null>>({});
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pages = screenshots as ScreenshotEntry[];

  useEffect(() => {
    async function loadAndMigrate() {
      // Load existing notes from Supabase
      const { data } = await supabase.from('notes').select('step_id, content, reviewer_content');
      const n: Record<string, string> = {};
      const r: Record<string, string> = {};
      (data ?? []).forEach((row: { step_id: string; content: string; reviewer_content: string }) => {
        n[row.step_id] = row.content;
        r[row.step_id] = row.reviewer_content;
      });

      // Migrate any notes still in localStorage
      const LEGACY_KEY = 'setup-guide-notes';
      try {
        const raw = localStorage.getItem(LEGACY_KEY);
        if (raw) {
          const local: Record<string, string> = JSON.parse(raw);
          const toUpsert = Object.entries(local)
            .filter(([id, content]) => content.trim() && !n[id])
            .map(([step_id, content]) => ({ step_id, content, reviewer_content: '' }));
          if (toUpsert.length > 0) {
            await supabase.from('notes').upsert(toUpsert, { onConflict: 'step_id' });
            toUpsert.forEach(({ step_id, content }) => { n[step_id] = content; });
          }
          localStorage.removeItem(LEGACY_KEY);
        }
      } catch { /* ignore */ }

      setNotes(n);
      setReviewerNotes(r);
    }
    loadAndMigrate();
  }, []);

  const saveNote = useCallback(async (id: string, content: string, field: 'content' | 'reviewer_content') => {
    setSyncState(prev => ({ ...prev, [`${id}-${field}`]: 'saving' }));
    await supabase.from('notes').upsert({ step_id: id, [field]: content, updated_at: new Date().toISOString() }, { onConflict: 'step_id' });
    setSyncState(prev => ({ ...prev, [`${id}-${field}`]: 'saved' }));
    setTimeout(() => setSyncState(prev => ({ ...prev, [`${id}-${field}`]: null })), 2000);
  }, []);

  function handleChange(id: string, text: string, field: 'content' | 'reviewer_content') {
    if (field === 'content') setNotes(prev => ({ ...prev, [id]: text }));
    else setReviewerNotes(prev => ({ ...prev, [id]: text }));
    const key = `${id}-${field}`;
    clearTimeout(saveTimers.current[key]);
    saveTimers.current[key] = setTimeout(() => saveNote(id, text, field), 800);
  }

  function handleTranscript(id: string, field: 'content' | 'reviewer_content', transcript: string) {
    const current = (field === 'content' ? notes[id] : reviewerNotes[id]) ?? '';
    handleChange(id, current ? `${current} ${transcript}` : transcript, field);
  }

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
                <span style={{ fontWeight: 800, fontSize: 17, color: '#9d174d', letterSpacing: '-0.2px' }}>{stage.name}</span>
                <div style={{ flex: 1, height: 1, background: '#fbcfe8' }} />
                <span style={{ fontSize: 12, color: '#db2777', fontWeight: 700, opacity: 0.6 }}>{stage.steps.length} steps</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {stage.steps.map((step, stepIdx) => (
                  <div key={step.id} style={{
                    display: 'flex', background: '#fff', borderRadius: 16,
                    border: '2px solid #fbcfe8', overflow: 'hidden',
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

                    {/* Notes columns */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                      {/* Person 1 — dark purple */}
                      <BareNoteField
                        value={notes[step.id] ?? ''}
                        onChange={t => handleChange(step.id, t, 'content')}
                        onTranscript={t => handleTranscript(step.id, 'content', t)}
                        syncState={syncState[`${step.id}-content`] ?? null}
                        textColor="#3b0764"
                        accentColor="#7e22ce"
                      />

                      {/* Person 2 — dark blue */}
                      <div style={{ borderTop: '2px solid #e0e7ff' }}>
                        <BareNoteField
                          value={reviewerNotes[step.id] ?? ''}
                          onChange={t => handleChange(step.id, t, 'reviewer_content')}
                          onTranscript={t => handleTranscript(step.id, 'reviewer_content', t)}
                          syncState={syncState[`${step.id}-reviewer_content`] ?? null}
                          textColor="#1e3a8a"
                          accentColor="#2563eb"
                        />
                      </div>
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

// ── Bare note field (no chrome, just text + mic) ─────────────────────────────

function BareNoteField({ value, onChange, onTranscript, syncState, textColor, accentColor }: {
  value: string;
  onChange: (t: string) => void;
  onTranscript: (t: string) => void;
  syncState: 'saving' | 'saved' | null;
  textColor: string;
  accentColor: string;
}) {
  const { listening, start, stop } = useSpeech(onTranscript);

  return (
    <div style={{ position: 'relative' }}>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Type or speak…"
        style={{
          border: 'none', outline: 'none',
          color: textColor, fontSize: 14, lineHeight: 1.7,
          padding: '14px 44px 14px 14px',
          resize: 'none', fontFamily: FONT,
          background: 'transparent', minHeight: 120,
          width: '100%', boxSizing: 'border-box',
        }}
      />
      {/* Mic + saved indicator — floating top-right */}
      <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
        {syncState === 'saved' && (
          <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 700 }}>✓</span>
        )}
        <button
          onClick={listening ? stop : start}
          title={listening ? 'Stop' : 'Speak'}
          style={{
            background: listening ? accentColor : 'transparent',
            border: `1.5px solid ${listening ? accentColor : accentColor + '55'}`,
            borderRadius: '50%', width: 26, height: 26,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.15s',
            boxShadow: listening ? `0 0 0 3px ${accentColor}33` : 'none',
          }}
        >
          {listening ? (
            <svg width="9" height="9" viewBox="0 0 12 12" fill="#fff"><rect x="1" y="1" width="10" height="10" rx="2" /></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="9" y1="22" x2="15" y2="22" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
