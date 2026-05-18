import { useState, useEffect, useRef } from 'react';
import screenshots from './setup-guide-screenshots.json';

interface ScreenshotEntry {
  id: string;
  title: string;
  stage: string;
  dataUrl: string;
}

const NOTES_KEY = 'setup-guide-notes';
const FONT = "'Nunito', sans-serif";

function loadNotes(): Record<string, string> {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveNotes(notes: Record<string, string>) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

const STAGE_COLORS: Record<string, string> = {
  'Foundation — Local Setup':       '#f9a8d4',
  'Save Your Work to GitHub':       '#93c5fd',
  'Create Your First App':          '#86efac',
  "Set Up Your App's Storage":      '#fdba74',
  'Put Your App on the Internet':   '#c4b5fd',
  'Keeping Going':                  '#fca5a5',
};

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

function useSpeech(onTranscript: (text: string) => void) {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [listening, setListening] = useState(false);

  function start() {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition is not supported in this browser. Try Chrome or Safari.'); return; }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'en-US';
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join(' ');
      onTranscript(transcript);
    };
    rec.onerror = () => { setListening(false); };
    rec.onend = () => { setListening(false); };
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  }

  function stop() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  return { listening, start, stop };
}

function MicButton({ onTranscript }: { onTranscript: (t: string) => void }) {
  const { listening, start, stop } = useSpeech(onTranscript);

  return (
    <button
      onClick={listening ? stop : start}
      title={listening ? 'Stop recording' : 'Speak your note'}
      style={{
        background: listening ? '#ec4899' : '#fce7f3',
        border: `2px solid ${listening ? '#be185d' : '#fbcfe8'}`,
        borderRadius: '50%',
        width: 32, height: 32,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'all 0.15s',
        boxShadow: listening ? '0 0 0 4px rgba(236,72,153,0.2)' : 'none',
      }}
    >
      {listening ? (
        // Stop icon
        <svg width="12" height="12" viewBox="0 0 12 12" fill="#fff">
          <rect x="1" y="1" width="10" height="10" rx="2" />
        </svg>
      ) : (
        // Mic icon
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

export default function SetupGuideReview() {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const pages = screenshots as ScreenshotEntry[];

  useEffect(() => { setNotes(loadNotes()); }, []);

  function handleNoteChange(id: string, text: string) {
    const updated = { ...notes, [id]: text };
    setNotes(updated);
    saveNotes(updated);
    setSaved(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setSaved(prev => ({ ...prev, [id]: false })), 1500);
  }

  function handleTranscript(id: string, transcript: string) {
    const current = notes[id] ?? '';
    const joined = current ? `${current} ${transcript}` : transcript;
    handleNoteChange(id, joined);
  }

  // Group steps by stage
  const stages: { name: string; steps: ScreenshotEntry[] }[] = [];
  for (const page of pages) {
    const last = stages[stages.length - 1];
    if (last && last.name === page.stage) {
      last.steps.push(page);
    } else {
      stages.push({ name: page.stage, steps: [page] });
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fdf2f8', fontFamily: FONT, color: '#4a1942' }}>

      {/* Header */}
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
            {pages.length} steps · {stages.length} stages · Click 🎤 to speak a note
          </div>
        </div>
      </div>

      {/* Stages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, padding: '28px 24px 48px' }}>
        {stages.map((stage) => {
          const accent = STAGE_COLORS[stage.name] ?? '#f9a8d4';
          return (
            <div key={stage.name}>
              {/* Stage heading */}
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

              {/* Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {stage.steps.map((step, stepIdx) => (
                  <div
                    key={step.id}
                    style={{
                      display: 'flex',
                      background: '#fff',
                      borderRadius: 16,
                      border: '2px solid #fbcfe8',
                      overflow: 'hidden',
                      boxShadow: '0 2px 12px rgba(236, 72, 153, 0.06)',
                    }}
                  >
                    {/* Screenshot — 50% */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '2px solid #fbcfe8' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px',
                        background: '#fdf2f8',
                        borderBottom: '1px solid #fce7f3',
                      }}>
                        <span style={{
                          background: accent, color: '#fff',
                          borderRadius: '50%', width: 24, height: 24,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 800, flexShrink: 0,
                        }}>
                          {stepIdx + 1}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#be185d' }}>
                          {step.id} — {step.title}
                        </span>
                      </div>
                      <img
                        src={step.dataUrl}
                        alt={step.title}
                        style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                      />
                    </div>

                    {/* Notes — 50% */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderBottom: '1px solid #fce7f3',
                        background: '#fdf2f8',
                        gap: 8,
                      }}>
                        <span style={{ fontWeight: 800, fontSize: 13, color: '#be185d' }}>Notes</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {saved[step.id] && (
                            <span style={{ fontSize: 12, color: '#ec4899', fontWeight: 700 }}>Saved!</span>
                          )}
                          <MicButton onTranscript={(t) => handleTranscript(step.id, t)} />
                        </div>
                      </div>
                      <textarea
                        value={notes[step.id] ?? ''}
                        onChange={e => handleNoteChange(step.id, e.target.value)}
                        placeholder="Type, or click the mic to speak your note…"
                        style={{
                          flex: 1,
                          border: 'none',
                          outline: 'none',
                          color: '#6b21a8',
                          fontSize: 14,
                          lineHeight: 1.7,
                          padding: '14px',
                          resize: 'none',
                          fontFamily: FONT,
                          background: 'transparent',
                          minHeight: 180,
                          width: '100%',
                          boxSizing: 'border-box',
                        }}
                      />
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
