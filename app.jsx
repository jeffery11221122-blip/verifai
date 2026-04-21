// verifai App — interactive prototype
const { useState, useEffect, useRef, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "greenHue": 158,
  "typePairing": "serif-sans",
  "markerStyle": "underline",
  "scoreStyle": "ring"
}/*EDITMODE-END*/;

const STATUS = {
  green:  { label: 'Cite it',    short: 'Cite',   color: 'var(--green)',  ink: 'var(--green-ink)',  wash: 'var(--green-wash)'  },
  ochre:  { label: 'Verify',     short: 'Verify', color: 'var(--ochre)',  ink: 'var(--ochre-ink)',  wash: 'var(--ochre-wash)'  },
  red:    { label: "Don't use",  short: 'Cut',    color: 'var(--brick)',  ink: 'var(--brick-ink)',  wash: 'var(--brick-wash)'  },
};

function computeScore(sents) {
  if (!sents.length) return 0;
  const sum = sents.reduce((acc, s) => acc + (s.status === 'green' ? 1 : s.status === 'ochre' ? 0.5 : 0), 0);
  return Math.round((sum / sents.length) * 100);
}

function App() {
  const [stage, setStage] = useState('intake');
  const [sourceText, setSourceText] = useState('');
  const [aiText, setAiText] = useState('');
  const [sourceFileName, setSourceFileName] = useState('');
  const [sentences, setSentences] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);
  const [tweaksOpen, setTweaksOpen] = useState(false);

  useEffect(() => {
    const onMsg = (e) => {
      const d = e.data || {};
      if (d.type === '__activate_edit_mode') setTweaksOpen(true);
      if (d.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  function updateTweak(patch) {
    setTweaks(t => ({ ...t, ...patch }));
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: patch }, '*');
  }

  useEffect(() => {
    const root = document.documentElement;
    const h = tweaks.greenHue;
    root.style.setProperty('--green',     `hsl(${h} 70% 37%)`);
    root.style.setProperty('--green-ink', `hsl(${h} 75% 24%)`);
    root.style.setProperty('--green-wash',`hsl(${h} 35% 92%)`);
    if (tweaks.typePairing === 'fraunces') {
      root.style.setProperty('--serif', "'Fraunces', Georgia, serif");
      root.style.setProperty('--sans', "'DM Sans', system-ui, sans-serif");
    } else if (tweaks.typePairing === 'sans-only') {
      root.style.setProperty('--serif', "'DM Sans', system-ui, sans-serif");
      root.style.setProperty('--sans', "'DM Sans', system-ui, sans-serif");
    } else {
      root.style.setProperty('--serif', "'DM Serif Display', Georgia, serif");
      root.style.setProperty('--sans', "'DM Sans', system-ui, sans-serif");
    }
  }, [tweaks]);

  function loadSample() {
    setSourceText(window.SAMPLE_SOURCE);
    setSourceFileName('verifai-product-brief.md');
    setAiText(window.SAMPLE_AI_OUTPUT.map(s => s.text).join(' '));
  }

  function runAnalysis() {
    if (!sourceText.trim() || !aiText.trim()) return;
    setStage('analyzing');
    const all = window.SAMPLE_AI_OUTPUT;
    setSentences(all.map(s => ({ ...s, revealed: false })));
    for (let i = 0; i < all.length; i++) {
      setTimeout(() => {
        setSentences(all.map((s, idx) => ({ ...s, revealed: idx <= i })));
        if (i === all.length - 1) setTimeout(() => setStage('result'), 300);
      }, 600 + i * 280);
    }
  }

  function reset() {
    setStage('intake'); setSentences([]); setSelectedId(null); setFilter('all');
  }

  return (
    <div className="app">
      <TopBar stage={stage} onReset={reset} onTweaks={() => setTweaksOpen(v => !v)} />
      {stage === 'intake' && (
        <IntakeView
          sourceText={sourceText} setSourceText={setSourceText}
          sourceFileName={sourceFileName} setSourceFileName={setSourceFileName}
          aiText={aiText} setAiText={setAiText}
          onLoadSample={loadSample} onRun={runAnalysis}/>
      )}
      {(stage === 'analyzing' || stage === 'result') && (
        <ResultView
          sourceText={sourceText} sourceFileName={sourceFileName}
          sentences={sentences} selectedId={selectedId} setSelectedId={setSelectedId}
          filter={filter} setFilter={setFilter} tweaks={tweaks}
          analyzing={stage === 'analyzing'}/>
      )}
      {tweaksOpen && <TweaksPanel tweaks={tweaks} onChange={updateTweak} onClose={() => setTweaksOpen(false)} />}
    </div>
  );
}

function TopBar({ stage, onReset }) {
  return (
    <header className="topbar">
      <div className="brand">
        <Logo />
        <span className="brand-text">verifai</span>
      </div>
      <nav className="topnav">
        <Crumb active={stage === 'intake'} n="01">Input</Crumb>
        <CrumbDivider />
        <Crumb active={stage === 'analyzing'} n="02">Compare</Crumb>
        <CrumbDivider />
        <Crumb active={stage === 'result'} n="03">Result</Crumb>
      </nav>
      <div className="topbar-actions">
        {stage !== 'intake' && (
          <button className="btn-ghost" onClick={onReset}>← Start over</button>
        )}
        <a className="btn-ghost" href="Landing.html">Landing</a>
      </div>
    </header>
  );
}

function Crumb({ active, n, children }) {
  return (
    <span className={`crumb ${active ? 'is-active' : ''}`}>
      <span className="crumb-n">{n}</span>
      <span className="crumb-label">{children}</span>
    </span>
  );
}
function CrumbDivider() { return <span className="crumb-div">—</span>; }

function Logo() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <circle cx="13" cy="13" r="12" stroke="var(--ink)" strokeWidth="1.2"/>
      <path d="M7 13.5 L11 17 L19 9" stroke="var(--green)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IntakeView({ sourceText, setSourceText, sourceFileName, setSourceFileName, aiText, setAiText, onLoadSample, onRun }) {
  const fileRef = useRef();
  const [dragOver, setDragOver] = useState(false);

  function handleFile(file) {
    if (!file) return;
    setSourceFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setSourceText(String(e.target.result || ''));
    reader.readAsText(file);
  }

  const canRun = sourceText.trim().length > 20 && aiText.trim().length > 20;

  return (
    <main className="intake">
      <div className="intake-lead">
        <div className="eyebrow">STEP 01 · Two inputs</div>
        <h1 className="display">
          Drop your <em>source</em> on the left,<br/>
          paste the <em>AI answer</em> on the right.
        </h1>
        <p className="lede">
          Nothing goes to a third-party model. The comparison runs locally — we just want to know where the AI drifted from your source.
        </p>
      </div>

      <div className="intake-grid">
        <section
          className={`pane pane-source ${dragOver ? 'is-drag' : ''} ${sourceText ? 'has-content' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        >
          <header className="pane-head">
            <span className="pane-num">A</span>
            <div>
              <div className="pane-title">Source document</div>
              <div className="pane-sub">source of truth</div>
            </div>
          </header>

          {!sourceText ? (
            <div className="dropzone">
              <div className="dropzone-icon">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                  <rect x="10" y="6" width="24" height="32" rx="1" stroke="var(--ink-2)" strokeWidth="1.2"/>
                  <line x1="15" y1="14" x2="29" y2="14" stroke="var(--muted)" strokeWidth="1"/>
                  <line x1="15" y1="19" x2="29" y2="19" stroke="var(--muted)" strokeWidth="1"/>
                  <line x1="15" y1="24" x2="24" y2="24" stroke="var(--muted)" strokeWidth="1"/>
                </svg>
              </div>
              <div className="dropzone-title">Drop a file here</div>
              <div className="dropzone-sub">.txt · .md · .docx — or paste below</div>
              <div className="dropzone-actions">
                <button className="btn-primary" onClick={() => fileRef.current?.click()}>Choose file</button>
                <button className="btn-ghost" onClick={onLoadSample}>Try the sample</button>
              </div>
              <input ref={fileRef} type="file" accept=".txt,.md,.docx" hidden onChange={e => handleFile(e.target.files[0])} />
              <textarea
                className="paste-inline"
                placeholder="…or paste the source here"
                value={sourceText}
                onChange={e => { setSourceText(e.target.value); if (!sourceFileName) setSourceFileName('pasted-text.txt'); }}
              />
            </div>
          ) : (
            <div className="file-loaded">
              <div className="file-chip">
                <FileIcon />
                <div>
                  <div className="file-name">{sourceFileName}</div>
                  <div className="file-meta">{sourceText.length.toLocaleString()} chars · {sourceText.split('\n\n').length} paragraphs</div>
                </div>
                <button className="chip-x" onClick={() => { setSourceText(''); setSourceFileName(''); }}>×</button>
              </div>
              <div className="file-preview">{sourceText}</div>
            </div>
          )}
        </section>

        <section className={`pane pane-ai ${aiText ? 'has-content' : ''}`}>
          <header className="pane-head">
            <span className="pane-num">B</span>
            <div>
              <div className="pane-title">AI answer</div>
              <div className="pane-sub">claim to verify</div>
            </div>
          </header>
          <textarea
            className="ai-paste"
            placeholder={`Paste what ChatGPT, Claude, Gemini — or any AI — handed you.\n\nWe don't care which model. We compare words.`}
            value={aiText}
            onChange={e => setAiText(e.target.value)}
          />
          <div className="ai-meta">
            <span>{aiText.length.toLocaleString()} chars</span>
            <span>·</span>
            <span>{aiText.split(/[.!?。!?]/).filter(s => s.trim()).length} sentences</span>
          </div>
        </section>
      </div>

      <footer className="intake-foot">
        <div className="foot-trust">
          <Dot/> Runs locally · Never sent to a third-party model · Your source never leaves your machine
        </div>
        <div className="foot-actions">
          <button className="btn-ghost" onClick={onLoadSample}>Load sample</button>
          <button className="btn-primary btn-lg" disabled={!canRun} onClick={onRun}>
            Run comparison <span className="arrow">→</span>
          </button>
        </div>
      </footer>
    </main>
  );
}

function Dot() { return <span className="dot-live" />; }
function FileIcon() {
  return (
    <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
      <path d="M1 1h10l6 6v14H1z" stroke="var(--ink)" strokeWidth="1.2"/>
      <path d="M11 1v6h6" stroke="var(--ink)" strokeWidth="1.2" fill="none"/>
    </svg>
  );
}

function ResultView({ sourceText, sourceFileName, sentences, selectedId, setSelectedId, filter, setFilter, tweaks, analyzing }) {
  const counts = {
    green: sentences.filter(s => s.status === 'green').length,
    ochre: sentences.filter(s => s.status === 'ochre').length,
    red:   sentences.filter(s => s.status === 'red').length,
  };
  const score = computeScore(sentences);
  const selected = sentences.find(s => s.id === selectedId);

  return (
    <main className="result">
      <ResultHeader counts={counts} score={score} filter={filter} setFilter={setFilter} analyzing={analyzing} tweaks={tweaks} />

      <div className="result-grid">
        <section className="col-output">
          <div className="col-head">
            <span className="col-num">B</span>
            <div>
              <div className="col-title">AI answer · annotated</div>
              <div className="col-sub">{sentences.length} sentences · click any to see its source</div>
            </div>
          </div>
          <article className="marked-body">
            {sentences.map((s) => (
              <MarkedSentence
                key={s.id} s={s}
                dim={filter !== 'all' && s.status !== filter}
                active={selectedId === s.id}
                markerStyle={tweaks.markerStyle}
                onClick={() => setSelectedId(selectedId === s.id ? null : s.id)}
              />
            ))}
          </article>
        </section>

        <aside className="col-source">
          <div className="col-head">
            <span className="col-num">A</span>
            <div>
              <div className="col-title">Source · {sourceFileName || 'source.txt'}</div>
              <div className="col-sub">
                {selected
                  ? (selected.sourceSpan ? 'Jumped to matching passage' : 'No matching passage found')
                  : 'Click any sentence on the left to locate its source'}
              </div>
            </div>
          </div>
          <div className="source-body">
            <SourceView text={sourceText} highlight={selected?.sourceSpan} selected={selected} />
          </div>
          {selected && <EvidenceCard s={selected} />}
        </aside>
      </div>
    </main>
  );
}

function ResultHeader({ counts, score, filter, setFilter, analyzing, tweaks }) {
  return (
    <div className="result-header">
      <div className="result-header-left">
        <div className="eyebrow">STEP 03 · Result</div>
        <h2 className="result-title">
          {analyzing ? 'Comparing…' : <>Found <em>{counts.ochre + counts.red}</em> passages that need your eyes.</>}
        </h2>
        <p className="result-sub">We don't draw conclusions. Evidence is flagged — the judgment is still yours.</p>
      </div>
      <div className="result-header-right">
        <ScoreWidget score={score} counts={counts} style={tweaks.scoreStyle} />
        <FilterStrip counts={counts} filter={filter} setFilter={setFilter} />
      </div>
    </div>
  );
}

function ScoreWidget({ score, counts, style }) {
  if (style === 'number') {
    return (
      <div className="score-card score-number">
        <div className="score-big">{score}</div>
        <div className="score-unit">/ 100</div>
        <div className="score-label">Credibility</div>
      </div>
    );
  }
  if (style === 'bar') {
    const total = counts.green + counts.ochre + counts.red || 1;
    return (
      <div className="score-card score-bar">
        <div className="score-row">
          <div className="score-big-sm">{score}</div>
          <div className="score-label-sm">Credibility · {counts.green + counts.ochre + counts.red} sentences analysed</div>
        </div>
        <div className="bar">
          <div className="bar-seg seg-g" style={{width: `${counts.green/total*100}%`}}/>
          <div className="bar-seg seg-o" style={{width: `${counts.ochre/total*100}%`}}/>
          <div className="bar-seg seg-r" style={{width: `${counts.red/total*100}%`}}/>
        </div>
      </div>
    );
  }
  const r = 28, c = 2 * Math.PI * r, off = c - (score/100) * c;
  return (
    <div className="score-card score-ring">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--rule)" strokeWidth="5"/>
        <circle cx="36" cy="36" r={r} fill="none"
                stroke="var(--green)" strokeWidth="5"
                strokeDasharray={c} strokeDashoffset={off}
                strokeLinecap="round"
                transform="rotate(-90 36 36)" style={{transition: 'stroke-dashoffset 0.8s ease'}}/>
      </svg>
      <div className="ring-center">
        <div className="ring-n">{score}</div>
        <div className="ring-u">/100</div>
      </div>
      <div className="score-label">Credibility</div>
    </div>
  );
}

function FilterStrip({ counts, filter, setFilter }) {
  const total = counts.ochre + counts.red;
  return (
    <div className="filter-strip">
      <FilterPill n={total}   label="All"    active={filter === 'all'}   onClick={() => setFilter('all')}/>
      <FilterPill n={counts.ochre} label="Verify" active={filter === 'ochre'} onClick={() => setFilter(filter === 'ochre' ? 'all' : 'ochre')} color="ochre"/>
      <FilterPill n={counts.red}   label="Cut"    active={filter === 'red'}   onClick={() => setFilter(filter === 'red' ? 'all' : 'red')} color="red"/>
    </div>
  );
}
function FilterPill({ n, label, active, onClick, color }) {
  return (
    <button className={`fpill ${active ? 'is-active' : ''} ${color ? 'fp-' + color : ''}`} onClick={onClick}>
      <span className="fpill-n">{n}</span>
      <span className="fpill-l">{label}</span>
    </button>
  );
}

function MarkedSentence({ s, dim, active, onClick, markerStyle }) {
  if (!s.revealed) return <span className="sent sent-hidden">{s.text} </span>;
  if (s.status === 'green') {
    return <span className="sent">{s.text}{' '}</span>;
  }
  const cls = `sent sent-${s.status} ms-${markerStyle} ${dim ? 'is-dim' : ''} ${active ? 'is-active' : ''}`;
  return (
    <span className={cls} onClick={onClick} data-status={s.status}>
      {s.text}
      <span className="sent-tag">{STATUS[s.status].short}</span>
      {' '}
    </span>
  );
}

function SourceView({ text, highlight, selected }) {
  if (!highlight) {
    return (
      <div className="source-text">
        {text.split('\n\n').map((p, i) => (
          <p key={i} className={selected && !selected.sourceSpan ? 'p-dim' : ''}>{p}</p>
        ))}
        {selected && !selected.sourceSpan && (
          <div className="source-nomatch">
            <strong>No matching passage found.</strong> This sentence appears to have no grounding in the source.
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="source-text">
      {text.split('\n\n').map((p, i) => {
        const idx = p.indexOf(highlight);
        if (idx === -1) return <p key={i} className="p-dim">{p}</p>;
        const before = p.slice(0, idx);
        const match = p.slice(idx, idx + highlight.length);
        const after = p.slice(idx + highlight.length);
        return (
          <p key={i} className="p-hit">
            {before}
            <mark className={`src-hl src-hl-${selected?.status || 'green'}`}>{match}</mark>
            {after}
          </p>
        );
      })}
    </div>
  );
}

function EvidenceCard({ s }) {
  return (
    <div className={`evidence evidence-${s.status}`}>
      <div className="evidence-head">
        <span className="evidence-dot" style={{background: STATUS[s.status].color}}/>
        <span className="evidence-status">{STATUS[s.status].label}</span>
        <span className="evidence-rule" />
        <span className="evidence-meta">{s.sourceSpan ? `In paragraph ${s.sourceIndex}` : 'No match'}</span>
      </div>
      <div className="evidence-note">{s.note}</div>
      {s.sourceSpan && (
        <blockquote className="evidence-quote">
          “{s.sourceSpan}”
        </blockquote>
      )}
    </div>
  );
}

function TweaksPanel({ tweaks, onChange, onClose }) {
  return (
    <div className="tweaks">
      <div className="tweaks-head">
        <span className="tweaks-title">Tweaks</span>
        <button className="tweaks-x" onClick={onClose}>×</button>
      </div>

      <div className="tweak-row">
        <label className="tweak-label">Primary green hue</label>
        <div className="tweak-control">
          <input type="range" min="120" max="175" step="1"
                 value={tweaks.greenHue} onChange={e => onChange({ greenHue: +e.target.value })}/>
          <div className="tweak-val">
            <span className="swatch" style={{background: `hsl(${tweaks.greenHue} 70% 37%)`}}/>
            {tweaks.greenHue}°
          </div>
        </div>
      </div>

      <div className="tweak-row">
        <label className="tweak-label">Type pairing</label>
        <SegControl
          value={tweaks.typePairing}
          onChange={v => onChange({ typePairing: v })}
          options={[
            ['serif-sans', 'DM Serif + Sans'],
            ['fraunces',   'Fraunces + Sans'],
            ['sans-only',  'Sans only'],
          ]}
        />
      </div>

      <div className="tweak-row">
        <label className="tweak-label">Marker style</label>
        <SegControl
          value={tweaks.markerStyle}
          onChange={v => onChange({ markerStyle: v })}
          options={[
            ['underline', 'Underline'],
            ['wash',      'Wash'],
            ['side',      'Side bar'],
          ]}
        />
      </div>

      <div className="tweak-row">
        <label className="tweak-label">Score display</label>
        <SegControl
          value={tweaks.scoreStyle}
          onChange={v => onChange({ scoreStyle: v })}
          options={[
            ['ring',   'Ring'],
            ['number', 'Number'],
            ['bar',    'Bar'],
          ]}
        />
      </div>
    </div>
  );
}

function SegControl({ value, onChange, options }) {
  return (
    <div className="seg">
      {options.map(([v, label]) => (
        <button key={v} className={`seg-opt ${value === v ? 'is-on' : ''}`} onClick={() => onChange(v)}>{label}</button>
      ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
