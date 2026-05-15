import { useState } from 'react';
import { QGExport } from '../lib/export.js';

const PREFS_KEY = 'qg.exportPrefs';

const DEFAULTS = {
  style: 'sketch',
  feedback: 'submit',
  showExplanations: false,
  layout: 'all',
  randomizeQuestions: false,
  randomizeChoices: false,
};

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}'); }
  catch { return {}; }
}

export function DownloadQuizModal({ quiz, state, onClose }) {
  const hasExplanations = quiz.questions.some(q => q.explanation);
  const saved = loadSaved();

  const [prefs, setPrefs] = useState({
    ...DEFAULTS,
    ...saved,
    title: quiz.title,
    subtitle: quiz.course || '',
    author: saved.author ?? state?.user?.name ?? '',
  });

  const set = (key, val) => setPrefs(p => ({ ...p, [key]: val }));

  const handleDownload = () => {
    const { title, subtitle, ...rest } = prefs;
    localStorage.setItem(PREFS_KEY, JSON.stringify(rest));
    QGExport.downloadInteractiveQuiz(quiz, prefs);
    onClose();
  };

  return (
    <div className="qg-modal-scrim" onClick={onClose}>
      <div
        className="qg-modal"
        style={{ maxWidth: 460, width: '92vw' }}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="qg-h2" style={{ marginBottom: 18 }}>Download Quiz</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Style */}
          <Group label="Style">
            <Seg
              options={[
                { value: 'sketch', label: 'Sketch' },
                { value: 'clean', label: 'Clean' },
                { value: 'dark', label: 'Dark' },
                { value: 'print', label: 'Print' },
              ]}
              value={prefs.style}
              onChange={v => set('style', v)}
            />
          </Group>

          {/* Feedback */}
          <Group label="Feedback">
            <Seg
              options={[
                { value: 'submit', label: 'On submit' },
                { value: 'instant', label: 'Instant' },
              ]}
              value={prefs.feedback}
              onChange={v => set('feedback', v)}
            />
            {hasExplanations && (
              <Check
                label="Show explanations"
                checked={prefs.showExplanations}
                onChange={v => set('showExplanations', v)}
              />
            )}
          </Group>

          {/* Layout */}
          <Group label="Layout">
            <Seg
              options={[
                { value: 'all', label: 'Scrolling' },
                { value: 'one', label: 'One per page' },
              ]}
              value={prefs.layout}
              onChange={v => set('layout', v)}
            />
            <Check
              label="Randomize question order"
              checked={prefs.randomizeQuestions}
              onChange={v => set('randomizeQuestions', v)}
            />
            <Check
              label="Randomize choice order"
              checked={prefs.randomizeChoices}
              onChange={v => set('randomizeChoices', v)}
            />
          </Group>

          {/* Branding */}
          <Group label="Branding">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Field label="Title">
                <input
                  className="qg-input"
                  value={prefs.title}
                  onChange={e => set('title', e.target.value)}
                />
              </Field>
              <Field label="Course / subtitle">
                <input
                  className="qg-input"
                  value={prefs.subtitle}
                  onChange={e => set('subtitle', e.target.value)}
                  placeholder="optional"
                />
              </Field>
              <Field label="Author">
                <input
                  className="qg-input"
                  value={prefs.author}
                  onChange={e => set('author', e.target.value)}
                  placeholder="optional"
                />
              </Field>
            </div>
          </Group>

        </div>

        <div className="qg-row between" style={{ marginTop: 22 }}>
          <button className="qg-btn ghost" onClick={onClose}>Cancel</button>
          <button className="qg-btn primary" onClick={handleDownload}>Download</button>
        </div>
      </div>
    </div>
  );
}

function Group({ label, children }) {
  return (
    <div>
      <div
        className="qg-h3"
        style={{ marginBottom: 8, fontSize: 13, color: 'var(--ink-3)' }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function Seg({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: '5px 13px',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius)',
              boxShadow: active ? 'var(--shadow-marker-sm)' : 'none',
              background: active ? 'var(--accent)' : 'var(--surface)',
              color: active ? '#fff' : 'var(--ink)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: active ? 600 : 400,
              transition: 'box-shadow 0.1s, background 0.1s',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Check({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ accentColor: 'var(--accent)', width: 15, height: 15 }}
      />
      {label}
    </label>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}
