// Parses term/definition pairs in formats:
//   Term — Def  (em-dash or en-dash)
//   Term -- Def (double hyphen)
//   Term - Def  (hyphen with surrounding spaces)
//   Term: Def   (colon followed by space)
//   Term\tDef   (Quizlet copy-paste: term TAB def)

import { makeMcqFromPairs } from '../distractors.js';

// Matches the separator between term and definition
const SEP_RE = /\s+(?:—|–|--)\s+|\s+-\s+|\t|:\s+/;

export function parseTermDef(input) {
  const lines = input.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const pairs = [];

  for (const line of lines) {
    // Skip lines that look like HTML, markdown headers, or table rows
    if (/^[<#|]/.test(line)) continue;
    // Skip lines that start with a numbered list marker
    if (/^\d+[.)]\s/.test(line)) continue;
    // Skip Q/A style lines handled by qAndA parser
    if (/^Q(?:uestion)?\s*\d*\s*[:.]/i.test(line)) continue;
    // Skip lines that are too short to be a pair
    if (line.length < 4) continue;

    // Try to split on separator
    const idx = findSepIndex(line);
    if (idx < 0) continue;

    const term = line.slice(0, idx).trim();
    const rest = line.slice(idx);
    // Remove the separator itself from rest
    const sepMatch = rest.match(/^(\s+(?:—|–|--)\s+|\s+-\s+|\t|:\s+)/);
    if (!sepMatch) continue;
    const def = rest.slice(sepMatch[0].length).trim();

    if (term && def && term.length < 200 && def.length < 500) {
      pairs.push({ term, def });
    }
  }

  if (pairs.length < 2) return null;

  const nonEmptyLines = lines.filter(l => l.length > 3).length;
  const matchRatio = pairs.length / Math.max(nonEmptyLines, 1);
  const confidence = Math.min(0.5 + matchRatio * 0.42, 0.92);

  const questions = makeMcqFromPairs(pairs);
  if (!questions.length) return null;

  return {
    quiz: {
      id: 'quiz_' + Math.random().toString(36).slice(2, 10),
      title: 'Term/Definition Quiz',
      course: '',
      questions,
      createdAt: Date.now(),
      sourceFilename: '',
      parserName: 'termDef',
      confidence,
    },
    confidence,
    parserName: 'termDef',
  };
}

function findSepIndex(line) {
  // Find first occurrence of a recognised separator
  const patterns = [
    /\s+(?:—|–|--)\s+/,
    /\s+-\s+/,
    /\t/,
    /:\s+/,
  ];
  let earliest = -1;
  for (const p of patterns) {
    const m = line.match(p);
    if (m && m.index > 0) {
      if (earliest < 0 || m.index < earliest) earliest = m.index;
    }
  }
  return earliest;
}
