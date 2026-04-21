// Self-referential sample: verifai's own brief as "source" and a fake AI summary as "output"
window.SAMPLE_SOURCE = `verifai — Product Brief

Positioning: Whatever AI you use, verifai helps you check whether what it said actually matches your source documents.

Core value: We don't give you conclusions, we give you evidence. Every flag links back to the original passage so you can decide for yourself.

Target users (first wave): Independent consultants and freelance advisors. They deliver 2–3 client reports a month, lean heavily on ChatGPT to synthesise material, and their biggest fear is a client catching an error in the final draft. Second wave: law firms.

Core pain point: They used AI to draft the document, but they don't dare send it as-is — and they don't have time to re-read the whole thing.

MVP features (three): source-passage linking, three-colour risk markers (green = grounded / amber = verify manually / red = no source), and a credibility score from 0 to 100.

Design principles: Transparency first — every judgment must be clickable back to its source. If we're unsure, we say so; we don't force a conclusion. Help users decide in 10 seconds which parts to review — we don't decide for them.

Primary colour: #1D9E75 (green) stands for grounded and sourced.`;

window.SAMPLE_AI_OUTPUT = [
  {
    id: 's1',
    text: 'verifai is an AI verification tool built for independent consultants, helping them confirm whether AI-generated content aligns with their source documents.',
    status: 'green',
    sourceSpan: "Whatever AI you use, verifai helps you check whether what it said actually matches your source documents.",
    sourceIndex: 1,
    note: 'Positioning statement matches the source faithfully.'
  },
  {
    id: 's2',
    text: "The product's core value is providing a transparent chain of evidence, with every AI judgment backed by a citation the user can inspect.",
    status: 'green',
    sourceSpan: "We don't give you conclusions, we give you evidence. Every flag links back to the original passage so you can decide for yourself.",
    sourceIndex: 2,
    note: 'Key claim quoted in full.'
  },
  {
    id: 's3',
    text: 'The first target audience is independent consultants who deliver 2–3 reports per month, spending an average of 6 hours re-checking AI output.',
    status: 'ochre',
    sourceSpan: "Independent consultants and freelance advisors. They deliver 2–3 client reports a month, lean heavily on ChatGPT to synthesise material, and their biggest fear is a client catching an error in the final draft.",
    sourceIndex: 3,
    note: "'2–3 reports a month' is grounded; '6 hours of re-checking' is not in the source — verify manually or remove."
  },
  {
    id: 's4',
    text: 'The second wave targets law firms, with a contract-comparison module slated for launch in Q3 2026.',
    status: 'ochre',
    sourceSpan: "Second wave: law firms.",
    sourceIndex: 3,
    note: 'Law firms as the next segment is accurate; "Q3 2026" and "contract-comparison module" appear nowhere in the source.'
  },
  {
    id: 's5',
    text: 'The MVP ships with three features: source-passage linking, three-colour risk markers, and a 0–100 credibility score.',
    status: 'green',
    sourceSpan: "MVP features (three): source-passage linking, three-colour risk markers (green = grounded / amber = verify manually / red = no source), and a credibility score from 0 to 100.",
    sourceIndex: 5,
    note: 'Feature list is a near-verbatim match.'
  },
  {
    id: 's6',
    text: 'verifai uses a proprietary dual-layer verification algorithm; internal testing shows 94.7% accuracy.',
    status: 'red',
    sourceSpan: null,
    sourceIndex: null,
    note: 'The source makes no claims about an algorithm, any testing methodology, or an accuracy figure. Looks like a hallucination.'
  },
  {
    id: 's7',
    text: 'The design principle is "transparency first" — users should decide in about 10 seconds which sections need review, rather than having the tool decide for them.',
    status: 'green',
    sourceSpan: "Transparency first — every judgment must be clickable back to its source. If we're unsure, we say so; we don't force a conclusion. Help users decide in 10 seconds which parts to review — we don't decide for them.",
    sourceIndex: 6,
    note: 'Accurate paraphrase of the principle.'
  },
  {
    id: 's8',
    text: 'The brand colour #1D9E75 is a registered trademark and the preferred hue among law-firm clients.',
    status: 'red',
    sourceSpan: null,
    sourceIndex: null,
    note: 'The colour code is in the source; "registered trademark" and "preferred among law firms" are fabricated.'
  }
];

window.SAMPLE_SOURCE_PARAGRAPHS = window.SAMPLE_SOURCE.split('\n\n').map(p => p.trim()).filter(Boolean);
