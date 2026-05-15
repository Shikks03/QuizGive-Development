// Parses markdown tables: | term | definition |
// Skips the | --- | --- | separator row.

import { makeMcqFromPairs } from '../distractors.js';

export function parseMarkdownTable(input) {
  const lines = input.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const pairs = [];

  let headerCols = null;
  let termCol = -1;
  let defCol = -1;

  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    // Separator row
    if (/^\|[\s|:-]+\|$/.test(line)) continue;

    const cells = line.split('|').slice(1, -1).map(c => c.trim());
    if (cells.length < 2) continue;

    if (headerCols === null) {
      headerCols = cells;
      // Try to identify which col is "term" and which is "definition"
      const lower = cells.map(c => c.toLowerCase());
      const termIdx = lower.findIndex(c => /term|word|vocab|concept|name/i.test(c));
      const defIdx = lower.findIndex(c => /def|meaning|description|answer|explanation/i.test(c));
      termCol = termIdx >= 0 ? termIdx : 0;
      defCol = defIdx >= 0 ? defIdx : 1;
      continue;
    }

    if (cells.length <= Math.max(termCol, defCol)) continue;
    const term = cells[termCol];
    const def = cells[defCol];
    if (term && def) pairs.push({ term, def });
  }

  if (pairs.length < 2) return null;

  const confidence = Math.min(0.6 + pairs.length * 0.03, 0.9);
  const questions = makeMcqFromPairs(pairs);
  if (!questions.length) return null;

  return {
    quiz: {
      id: 'quiz_' + Math.random().toString(36).slice(2, 10),
      title: 'Table Quiz',
      course: '',
      questions,
      createdAt: Date.now(),
      sourceFilename: '',
      parserName: 'markdownTable',
      confidence,
    },
    confidence,
    parserName: 'markdownTable',
  };
}
