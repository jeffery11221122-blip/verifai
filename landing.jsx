// verifai Landing page
const { useState, useEffect, useRef, useMemo } = React;

// Loop animation for hero: types AI answer, then reveals 3-color markers in waves
function HeroDemo() {
  const sentences = [
    { t: 'verifai is an evidence-check tool built for independent consultants.', s: 'green' },
    { t: 'It helps you confirm that AI output actually matches your source files.', s: 'green' },
    { t: 'Internal testing shows 94.7% accuracy across benchmark documents.', s: 'red' },
    { t: 'The first audience is consultants shipping 2–3 reports per month.', s: 'ochre' },
    { t: 'The primary color #1D9E75 signals grounded, evidence-based work.', s: 'green' },
  ];

  const [phase, setPhase] = useState('typing'); // typing → marking → resting
  const [typedCount, setTypedCount] = useState(0); // chars typed across all sentences
  const [marked, setMarked] = useState([]); // indices marked so far

  const fullText = sentences.map(s => s.t).join('');
  const tick = useRef(null);

  useEffect(() => {
    let mounted = true;
    let t;
    function loop() {
      if (!mounted) return;
      // reset
      setPhase('typing'); setTypedCount(0); setMarked([]);
      // type
      let i = 0;
      const typeStep = () => {
        if (!mounted) return;
        if (i >= fullText.length) {
          t = setTimeout(() => {
            setPhase('marking');
            let m = 0;
            const markStep = () => {
              if (!mounted) return;
              if (m >= sentences.length) {
                t = setTimeout(() => { setPhase('resting'); t = setTimeout(loop, 2400); }, 400);
                return;
              }
              setMarked(prev => [...prev, m]);
              m += 1;
              t = setTimeout(markStep, 360);
            };
            t = setTimeout(markStep, 300);
          }, 500);
          return;
        }
        i += 1;
        setTypedCount(i);
        t = setTimeout(typeStep, 14);
      };
      t = setTimeout(typeStep, 500);
    }
    loop();
    return () => { mounted = false; if (t) clearTimeout(t); };
  }, []);

  // Split typed text across sentences
  let remaining = typedCount;
  const rendered = sentences.map((s, i) => {
    const n = Math.min(remaining, s.t.length);
    remaining -= n;
    return { shown: s.t.slice(0, n), full: s.t, status: s.s, done: n === s.t.length };
  });

  const counts = {
    green: sentences.filter((s, i) => marked.includes(i) && s.s === 'green').length,
    ochre: sentences.filter((s, i) => marked.includes(i) && s.s === 'ochre').length,
    red:   sentences.filter((s, i) => marked.includes(i) && s.s === 'red').length,
  };
  const totalMarked = marked.length;
  const score = totalMarked
    ? Math.round(sentences.reduce((a, s, i) => a + (marked.includes(i) ? (s.s === 'green' ? 1 : s.s === 'ochre' ? 0.5 : 0) : 0), 0) / sentences.length * 100)
    : 0;

  return (
    <div className="hero-demo">
      <div className="hd-window">
        <div className="hd-chrome">
          <span className="hd-dot"/><span className="hd-dot"/><span className="hd-dot"/>
          <span className="hd-title">AI answer · live check</span>
          <span className="hd-status">{phase === 'typing' ? 'pasting' : phase === 'marking' ? 'checking' : 'done'}</span>
        </div>
        <div className="hd-body">
          <div className="hd-text">
            {rendered.map((r, i) => {
              const isMarked = marked.includes(i);
              const cls = `hd-sent ${isMarked ? `hd-${r.status}` : ''}`;
              return (
                <span key={i} className={cls}>
                  {r.shown}
                  {phase === 'typing' && r.shown.length > 0 && r.shown.length < r.full.length && <span className="hd-caret"/>}
                  {' '}
                </span>
              );
            })}
          </div>
        </div>
        <div className="hd-foot">
          <div className="hd-score">
            <span className="hd-score-n">{score || '—'}</span>
            <span className="hd-score-u">/100</span>
          </div>
          <div className="hd-legend">
            <span className="lg lg-g">{counts.green} cite</span>
            <span className="lg lg-o">{counts.ochre} review</span>
            <span className="lg lg-r">{counts.red} drop</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Landing() {
  return (
    <div className="landing">
      {/* Top bar */}
      <header className="land-top">
        <div className="brand">
          <Logo/>
          <span className="brand-text">verifai</span>
        </div>
        <nav className="land-nav">
          <a href="#how">How it works</a>
          <a href="#who">Who it's for</a>
          <a href="#trust">Why trust it</a>
        </nav>
        <div className="land-top-actions">
          <a className="btn-ghost" href="App.html">Try it</a>
          <a className="btn-primary" href="App.html">Get started →</a>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-col-text">
          <div className="eyebrow">FOR INDEPENDENT CONSULTANTS</div>
          <h1 className="hero-h1">
            Whichever AI you use,<br/>
            we <em>check the evidence</em>.
          </h1>
          <p className="hero-lede">
            verifai compares every sentence of your AI output against your source files and tells you what to cite, what to review, and what to drop. You stay in charge.
          </p>
          <div className="hero-cta">
            <a className="btn-primary btn-lg" href="App.html">Start checking <span className="arrow">→</span></a>
            <a className="btn-ghost" href="#how">See how it works</a>
          </div>
          <div className="hero-meta">
            <span className="dot-live"/> Files never leave your device · local comparison
          </div>
        </div>
        <div className="hero-col-demo">
          <HeroDemo/>
          <div className="hero-caption">
            <span className="cap-num">Live preview</span>
            Paste → compare → mark. Every sentence links to its source.
          </div>
        </div>
      </section>

      {/* Quote strip */}
      <section className="pull-quote">
        <div className="pq-rule"/>
        <p className="pq-text">
          We don't give you conclusions. <em>We give you evidence.</em>
        </p>
        <div className="pq-cite">verifai · design principle</div>
      </section>

      {/* HOW */}
      <section className="how" id="how">
        <div className="sec-head">
          <div className="eyebrow">Three steps · about 10 seconds</div>
          <h2 className="sec-h2">Shorter to use than to explain.</h2>
        </div>
        <div className="how-grid">
          <HowStep n="01" title="Drop in your source" body="The real document you're working from — research report, interview transcript, contract draft. Drag it in."/>
          <HowStep n="02" title="Paste the AI answer" body="Whatever ChatGPT, Claude, or Gemini handed back. Model-agnostic; we just compare the words."/>
          <HowStep n="03" title="Know where to review" body="Green to cite, amber to double-check, red with no source found. Every sentence is one click from its evidence."/>
        </div>
      </section>

      {/* WHO */}
      <section className="who" id="who">
        <div className="who-grid">
          <div className="who-lead">
            <div className="eyebrow">Who it's for</div>
            <h2 className="sec-h2">For people who ship reports every month.</h2>
            <p className="sec-sub">
              You fed 30 pages of interview transcripts into an AI and got back a tidy 3-page summary. Now it's going to a client — but you don't have time to re-read every paragraph. verifai finds the spots that need hand-editing in 60 seconds.
            </p>
          </div>
          <ul className="who-list">
            <li><span className="who-chk">✓</span>Independent and freelance consultants</li>
            <li><span className="who-chk">✓</span>Shipping 2–3 client deliverables a month</li>
            <li><span className="who-chk">✓</span>Heavy users of ChatGPT for synthesis</li>
            <li><span className="who-chk">✓</span>Afraid of errors slipping into final reports</li>
            <li className="who-next"><span className="who-chk">→</span>Next up: law firms</li>
          </ul>
        </div>
      </section>

      {/* Marker explanation */}
      <section className="markers" id="trust">
        <div className="sec-head">
          <div className="eyebrow">Three colors · action-oriented</div>
          <h2 className="sec-h2">Each color tells you <em>what to do next</em>.</h2>
          <p className="sec-sub">Not a fuzzy "risk level" — a specific action.</p>
        </div>
        <div className="marker-grid">
          <MarkerCard status="green"  title="Cite"    desc="This sentence has a clear match in your source. Paste it straight into the report."
            example="The MVP ships three features: source attribution, three-color risk markers, and a 0–100 trust score."
            ev="Source: 'Product scope (MVP, three items): inline source attribution, three-color risk markers… trust score 0–100.'"/>
          <MarkerCard status="ochre"  title="Review"  desc="Keywords match, but the AI added numbers or dates the source never mentioned. Read it before you use it."
            example="The target users are independent consultants shipping 2–3 reports per month, each spending 6 hours proofing AI output."
            ev="'2–3 per month' is sourced; '6 hours proofing' is not in the document. Remove or add a citation."/>
          <MarkerCard status="red"    title="Drop"    desc="No matching passage anywhere in the source. Likely hallucination — don't cite it."
            example="verifai uses a rigorous two-layer verification algorithm and internal tests show 94.7% accuracy."
            ev="Source contains no mention of any algorithm design, testing protocol, or accuracy figure."/>
        </div>
      </section>

      {/* Trust */}
      <section className="trust">
        <div className="trust-grid">
          <div className="trust-cell">
            <div className="trust-num">01</div>
            <h3>You don't have to trust our AI.</h3>
            <p>We don't make judgments. We only point to which sentences appear in your source and which don't. The decision is always yours.</p>
          </div>
          <div className="trust-cell">
            <div className="trust-num">02</div>
            <h3>If we're unsure, we say so.</h3>
            <p>Keywords match but not a perfect alignment? That's amber. We tell you where it's solid and where we're hedging — not a fake-confident answer.</p>
          </div>
          <div className="trust-cell">
            <div className="trust-num">03</div>
            <h3>Your files never leave your machine.</h3>
            <p>Comparison runs locally. Nothing is sent to a third-party model. Where your source lives is your decision.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta">
        <div className="fc-inner">
          <h2 className="fc-h">
            Send the next report <em>with confidence</em>.
          </h2>
          <p className="fc-sub">Don't take our word for it. Run one check and decide for yourself.</p>
          <a className="btn-primary btn-xl" href="App.html">
            Start checking <span className="arrow">→</span>
          </a>
        </div>
      </section>

      <footer className="land-foot">
        <div className="land-foot-brand">
          <Logo/> <span className="brand-text">verifai</span>
        </div>
        <div className="land-foot-meta">
          <span>Peace of mind for professionals.</span>
          <span>·</span>
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  );
}

function HowStep({ n, title, body }) {
  return (
    <div className="how-step">
      <div className="how-num">{n}</div>
      <h3 className="how-t">{title}</h3>
      <p className="how-b">{body}</p>
    </div>
  );
}

function MarkerCard({ status, title, desc, example, ev }) {
  const dotColor = status === 'green' ? 'var(--green)' : status === 'ochre' ? 'var(--ochre)' : 'var(--brick)';
  return (
    <div className={`mcard mcard-${status}`}>
      <div className="mcard-head">
        <span className="mcard-dot" style={{background: dotColor}}/>
        <span className="mcard-title">{title}</span>
        <span className="mcard-rule"/>
      </div>
      <p className="mcard-desc">{desc}</p>
      <div className="mcard-example">
        <div className="mcard-lbl">AI answer</div>
        <div className={`mcard-sent mcard-sent-${status}`}>{example}</div>
      </div>
      <div className="mcard-example">
        <div className="mcard-lbl">verifai's verdict</div>
        <div className="mcard-ev">{ev}</div>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <circle cx="13" cy="13" r="12" stroke="var(--ink)" strokeWidth="1.2"/>
      <path d="M7 13.5 L11 17 L19 9" stroke="var(--green)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Landing/>);
