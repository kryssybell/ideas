import { useState, useEffect, useRef, useCallback } from 'react';
import screenshots from './setup-guide-screenshots.json';
import { supabase } from './lib/supabase';

interface ScreenshotEntry { id: string; title: string; stage: string; dataUrl: string; }
interface Message { id: string; step_id: string; author: 'purple' | 'blue'; content: string; created_at: string; }

const FONT = "'Nunito', sans-serif";
const PURPLE = '#3b0764';
const BLUE   = '#1e3a8a';
const STAGE_COLORS: Record<string, string> = {
  'Foundation — Local Setup':     '#f9a8d4',
  'Save Your Work to GitHub':     '#93c5fd',
  'Create Your First App':        '#86efac',
  "Set Up Your App's Storage":    '#fdba74',
  'Put Your App on the Internet': '#c4b5fd',
  'Keeping Going':                '#fca5a5',
};

// ── Speech ───────────────────────────────────────────────────────────────────
interface SpeechRecognitionEvent extends Event { results: SpeechRecognitionResultList; }
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean; interimResults: boolean; lang: string;
  start(): void; stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null; onend: (() => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}
function useSpeech(onTranscript: (t: string) => void) {
  const recRef = useRef<SpeechRecognitionInstance | null>(null);
  const [listening, setListening] = useState(false);
  function start() {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported. Try Chrome or Safari.'); return; }
    const rec = new SR();
    rec.continuous = true; rec.interimResults = false; rec.lang = 'en-US';
    rec.onresult = (e: SpeechRecognitionEvent) =>
      onTranscript(Array.from(e.results).map(r => r[0].transcript).join(' '));
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start(); recRef.current = rec; setListening(true);
  }
  function stop() { recRef.current?.stop(); setListening(false); }
  return { listening, start, stop };
}

// ── Mobile detection ─────────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return mobile;
}

// ── Chat panel ───────────────────────────────────────────────────────────────
function ChatPanel({
  stepId, messages, myColor, onSend, fullScreen, onExpand, onClose,
}: {
  stepId: string;
  messages: Message[];
  myColor: 'purple' | 'blue';
  onSend: (stepId: string, content: string) => void;
  fullScreen?: boolean;
  onExpand?: () => void;
  onClose?: () => void;
}) {
  const [draft, setDraft] = useState('');
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const justSent = useRef(false);
  const stepMessages = messages.filter(m => m.step_id === stepId);
  const isMobile = useIsMobile();

  const { listening, start, stop } = useSpeech((t) => {
    setDraft(prev => prev ? `${prev} ${t}` : t);
  });

  // Scroll to top when opening, scroll to bottom only after sending
  useEffect(() => {
    if (!fullScreen) return;
    if (justSent.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      justSent.current = false;
    } else {
      topRef.current?.scrollIntoView({ behavior: 'instant' });
    }
  }, [messages, fullScreen]);

  function send() {
    if (!draft.trim()) return;
    justSent.current = true;
    onSend(stepId, draft.trim());
    setDraft('');
  }

  const collapsed = isMobile && !fullScreen;

  if (collapsed) {
    const last = stepMessages[stepMessages.length - 1];
    return (
      <button
        onClick={onExpand}
        style={{
          width: '100%', textAlign: 'left', background: 'none', border: 'none',
          borderTop: '2px solid #fbcfe8', padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          fontFamily: FONT,
        }}
      >
        <span style={{ fontSize: 18 }}>💬</span>
        <span style={{ fontSize: 13, color: last ? (last.author === 'purple' ? PURPLE : BLUE) : '#be185d', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {last ? last.content : 'Tap to add notes…'}
        </span>
        <span style={{ fontSize: 12, color: '#be185d', opacity: 0.5, flexShrink: 0 }}>
          {stepMessages.length > 0 ? `${stepMessages.length} msg${stepMessages.length !== 1 ? 's' : ''}` : ''}  ›
        </span>
      </button>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      flex: 1, minHeight: 0,
      height: fullScreen ? undefined : '100%',
    }}>
      {/* Messages */}
      <div style={{
        flex: 1, minHeight: 0, overflowY: 'auto', padding: '10px 14px',
        display: 'flex', flexDirection: 'column', gap: 8,
        maxHeight: fullScreen ? undefined : 260,
      }}>
        <div ref={topRef} />
        {stepMessages.length === 0 && (
          <div style={{ color: '#be185d', opacity: 0.35, fontSize: 13, textAlign: 'center', marginTop: 16 }}>
            No notes yet — type or speak below
          </div>
        )}
        {stepMessages.map(msg => (
          <div key={msg.id} style={{
            fontSize: 14, lineHeight: 1.6,
            color: msg.author === 'purple' ? PURPLE : BLUE,
            fontWeight: 500,
          }}>
            {msg.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        borderTop: '1px solid #fbcfe8', padding: '8px 10px',
        display: 'flex', gap: 8, alignItems: 'flex-end',
        background: '#fdf2f8',
      }}>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Type or speak…"
          rows={2}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          style={{
            flex: 1, border: '1.5px solid #fbcfe8', borderRadius: 10,
            padding: '8px 10px', fontSize: 14, fontFamily: FONT,
            color: myColor === 'purple' ? PURPLE : BLUE,
            outline: 'none', resize: 'none', background: '#fff',
            lineHeight: 1.5,
          }}
        />
        {/* Mic */}
        <button onClick={listening ? stop : start} style={{
          background: listening ? (myColor === 'purple' ? '#7e22ce' : '#2563eb') : '#fff',
          border: `1.5px solid ${myColor === 'purple' ? '#c4b5fd' : '#bfdbfe'}`,
          borderRadius: '50%', width: 36, height: 36, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.15s',
          boxShadow: listening ? `0 0 0 3px ${myColor === 'purple' ? '#c4b5fd' : '#bfdbfe'}` : 'none',
        }}>
          {listening
            ? <svg width="10" height="10" viewBox="0 0 12 12" fill="#fff"><rect x="1" y="1" width="10" height="10" rx="2" /></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={myColor === 'purple' ? '#7e22ce' : '#2563eb'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0" />
                <line x1="12" y1="19" x2="12" y2="22" />
                <line x1="9" y1="22" x2="15" y2="22" />
              </svg>
          }
        </button>
        {/* Send */}
        <button onClick={send} disabled={!draft.trim()} style={{
          background: myColor === 'purple' ? '#7e22ce' : '#2563eb',
          color: '#fff', border: 'none', borderRadius: 10,
          padding: '0 14px', height: 36, flexShrink: 0,
          fontFamily: FONT, fontWeight: 700, fontSize: 13,
          cursor: draft.trim() ? 'pointer' : 'default',
          opacity: draft.trim() ? 1 : 0.4,
        }}>Send</button>
      </div>

      {onClose && (
        <button onClick={onClose} style={{
          background: 'none', border: 'none', padding: '6px',
          color: '#be185d', fontFamily: FONT, fontSize: 13,
          cursor: 'pointer', textAlign: 'center',
        }}>✕ Close</button>
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function SetupGuideReview() {
  const pages = screenshots as ScreenshotEntry[];
  const isMobile = useIsMobile();

  const [myColor, setMyColor] = useState<'purple' | 'blue' | null>(
    () => (localStorage.getItem('my-color') as 'purple' | 'blue' | null)
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  // Load messages + migrate old notes
  useEffect(() => {
    async function load() {
      const { data: msgs } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: true });
      const existing = (msgs ?? []) as Message[];
      const existingStepIds = new Set(existing.map(m => m.step_id));

      // Migrate old notes table → feedback (one-time)
      if (!localStorage.getItem('notes-migrated-v2')) {
        const { data: notesData } = await supabase
          .from('notes')
          .select('step_id, content, reviewer_content');
        const toInsert: Omit<Message, 'id'>[] = [];
        (notesData ?? []).forEach((row: { step_id: string; content: string; reviewer_content: string }) => {
          if (row.content?.trim() && !existingStepIds.has(row.step_id)) {
            toInsert.push({ step_id: row.step_id, author: 'purple', content: row.content.trim(), created_at: new Date().toISOString() });
          }
          if (row.reviewer_content?.trim()) {
            toInsert.push({ step_id: row.step_id, author: 'blue', content: row.reviewer_content.trim(), created_at: new Date().toISOString() });
          }
        });
        if (toInsert.length > 0) {
          const { data: inserted } = await supabase.from('feedback').insert(toInsert).select();
          if (inserted) existing.push(...(inserted as Message[]));
        }
        localStorage.setItem('notes-migrated-v2', 'true');
      }

      setMessages(existing);
    }
    load();

    // Real-time: one channel for all new messages
    const channel = supabase.channel('all-feedback')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feedback' },
        (payload) => setMessages(prev => [...prev, payload.new as Message]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendMessage = useCallback(async (stepId: string, content: string) => {
    if (!myColor) return;
    await supabase.from('feedback').insert({ step_id: stepId, author: myColor, content });
  }, [myColor]);

  function pickColor(c: 'purple' | 'blue') {
    localStorage.setItem('my-color', c);
    setMyColor(c);
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

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
        padding: '12px 20px',
        background: 'rgba(253,242,248,0.92)', backdropFilter: 'blur(10px)',
        borderBottom: '2px solid #fbcfe8',
        boxShadow: '0 2px 12px rgba(236,72,153,0.08)',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 17, color: '#be185d' }}>Setup Guide Review</div>
          <div style={{ fontSize: 11, color: '#db2777', opacity: 0.7 }}>{pages.length} steps · {stages.length} stages</div>
        </div>

        {/* Color picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#be185d', fontWeight: 700 }}>You are:</span>
          {(['purple', 'blue'] as const).map(c => (
            <button key={c} onClick={() => pickColor(c)} style={{
              width: 28, height: 28, borderRadius: '50%', cursor: 'pointer',
              background: c === 'purple' ? PURPLE : BLUE,
              border: myColor === c ? '3px solid #be185d' : '3px solid transparent',
              boxShadow: myColor === c ? '0 0 0 2px #fbcfe8' : 'none',
              transition: 'all 0.15s',
            }} />
          ))}
        </div>
      </div>

      {!myColor && (
        <div style={{
          background: '#fce7f3', borderBottom: '2px solid #fbcfe8',
          padding: '10px 20px', fontSize: 13, color: '#be185d', fontWeight: 700, textAlign: 'center',
        }}>
          👆 Pick your colour above before adding notes
        </div>
      )}

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, padding: '24px 16px 48px' }}>
        {stages.map(stage => {
          const accent = STAGE_COLORS[stage.name] ?? '#f9a8d4';
          return (
            <div key={stage.name}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ height: 4, width: 28, borderRadius: 4, background: accent, flexShrink: 0 }} />
                <span style={{ fontWeight: 800, fontSize: 15, color: '#9d174d' }}>{stage.name}</span>
                <div style={{ flex: 1, height: 1, background: '#fbcfe8' }} />
                <span style={{ fontSize: 11, color: '#db2777', fontWeight: 700, opacity: 0.6 }}>{stage.steps.length} steps</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stage.steps.map((step, stepIdx) => (
                  <div key={step.id} style={{
                    background: '#fff', borderRadius: 14,
                    border: '2px solid #fbcfe8',
                    boxShadow: '0 2px 10px rgba(236,72,153,0.05)',
                    overflow: 'hidden',
                    display: 'flex', flexDirection: isMobile ? 'column' : 'row',
                  }}>
                    {/* Screenshot */}
                    <div style={{ flex: 1, borderRight: isMobile ? 'none' : '2px solid #fbcfe8', borderBottom: isMobile ? '2px solid #fbcfe8' : 'none', display: 'flex', flexDirection: 'column' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 12px', background: '#fdf2f8',
                        borderBottom: '1px solid #fce7f3',
                      }}>
                        <span style={{
                          background: accent, color: '#fff', borderRadius: '50%',
                          width: 22, height: 22, display: 'inline-flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 800, flexShrink: 0,
                        }}>{stepIdx + 1}</span>
                        <span style={{ fontWeight: 700, fontSize: 12, color: '#be185d' }}>
                          {step.id} — {step.title}
                        </span>
                      </div>
                      <img src={step.dataUrl} alt={step.title} style={{ width: '100%', display: 'block' }} />
                    </div>

                    {/* Chat */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {isMobile ? (
                        <ChatPanel
                          stepId={step.id}
                          messages={messages}
                          myColor={myColor ?? 'purple'}
                          onSend={sendMessage}
                          fullScreen={false}
                          onExpand={() => setExpandedStep(step.id)}
                        />
                      ) : (
                        <ChatPanel
                          stepId={step.id}
                          messages={messages}
                          myColor={myColor ?? 'purple'}
                          onSend={sendMessage}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile full-screen chat overlay */}
      {expandedStep && (() => {
        const step = pages.find(p => p.id === expandedStep);
        if (!step) return null;
        return (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: '#fff', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              padding: '12px 16px', background: '#fdf2f8',
              borderBottom: '2px solid #fbcfe8',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#be185d', flex: 1 }}>
                {step.id} — {step.title}
              </span>
              <button onClick={() => setExpandedStep(null)} style={{
                background: 'none', border: 'none', fontSize: 20,
                cursor: 'pointer', color: '#be185d', lineHeight: 1,
              }}>✕</button>
            </div>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <ChatPanel
                stepId={expandedStep}
                messages={messages}
                myColor={myColor ?? 'purple'}
                onSend={sendMessage}
                fullScreen
              />
            </div>
          </div>
        );
      })()}
    </div>
  );
}
