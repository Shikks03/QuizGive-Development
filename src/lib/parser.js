// QuizGive — multi-format parser registry.
// Each named parser returns { quiz, confidence, parserName } or null.
// runAllParsers tries all applicable parsers and returns the highest-confidence result.

import { parseCleanJson } from './parsers/cleanJson.js';
import { parseTermDef } from './parsers/termDef.js';
import { parseQAndA } from './parsers/qAndA.js';
import { parseMarkdownTable } from './parsers/markdownTable.js';
import { parseNumberedList } from './parsers/numberedList.js';

// ── Inline node extractor ─────────────────────────────────────────
// Returns [{ t: 'text'|'strong'|'em', v: string }] preserving only
// bold/italic runs; all other tags are flattened to their text.

function extractInlineNodes(el) {
  const nodes = [];
  const EMPHASIS = { strong: 'strong', b: 'strong', em: 'em', i: 'em' };
  function walk(node) {
    if (node.nodeType === 3) {
      const v = (node.nodeValue || '').replace(/[""]/g, '"').replace(/['']/g, "'");
      if (v) nodes.push({ t: 'text', v });
    } else if (node.nodeType === 1) {
      const tag = EMPHASIS[node.tagName.toLowerCase()];
      if (tag) {
        const v = (node.textContent || '').replace(/[""]/g, '"').replace(/['']/g, "'");
        if (v) nodes.push({ t: tag, v });
      } else {
        node.childNodes.forEach(walk);
      }
    }
  }
  el.childNodes.forEach(walk);
  return nodes;
}

// ── quizfetch HTML parser (original) ──────────────────────────────

function parseQuizfetchHtml(input) {
  const doc = new DOMParser().parseFromString(input, 'text/html');

  const header = doc.querySelector('.report-header') || doc.body;
  let title = (header.querySelector('h1')?.textContent || doc.title || 'Untitled quiz').trim();
  title = title.replace(/\s+/g, ' ');

  let course = '';
  const courseStrong = Array.from(header.querySelectorAll('strong'))
    .find((s) => /course/i.test(s.textContent || ''));
  if (courseStrong) {
    const span = courseStrong.closest('span') || courseStrong.parentElement;
    course = (span?.textContent || '').replace(/^\s*course\s*:?\s*/i, '').trim();
  }
  if (!course) {
    const m = (header.textContent || '').match(/course\s*:?\s*([A-Z0-9_\-]+)/i);
    if (m) course = m[1];
  }

  const cards = Array.from(doc.querySelectorAll('.question-card'));
  if (cards.length === 0) return null;

  const questions = cards.map((card, i) => {
    const h3 = card.querySelector('h3, .question-text, .prompt');
    let prompt = h3 ? extractInlineNodes(h3) : [];
    // strip leading "N." from first text node
    if (prompt.length && prompt[0].t === 'text') {
      prompt[0] = { ...prompt[0], v: prompt[0].v.replace(/^\s*\d+\.\s*/, '') };
      if (!prompt[0].v) prompt.shift();
    }

    const chEls = Array.from(card.querySelectorAll('.answer-choice'));
    const raw = chEls.map((ch) => {
      const src = ch.querySelector('.choice-text') || ch;
      const nodes = extractInlineNodes(src);
      const plainText = nodes.map((n) => n.v).join('');
      const isPlaceholder = /no answer text provided/i.test(plainText);
      return { nodes, plainText, correct: ch.getAttribute('data-was-correct') === 'true', keep: !!plainText.trim() && !isPlaceholder };
    });

    const kept = raw.filter((r) => r.keep);
    const choices = kept.map((r) => r.nodes);
    const correctIdx = kept.findIndex((r) => r.correct);

    return { id: `q${i}`, prompt, choices, correctIdx };
  }).filter((q) => q.prompt && q.choices.length >= 2 && q.correctIdx >= 0);

  if (questions.length === 0) return null;

  const confidence = Math.min(0.7 + questions.length * 0.02, 0.99);
  const quiz = {
    id: 'quiz_' + Math.random().toString(36).slice(2, 10),
    title, course, questions,
    createdAt: Date.now(),
    sourceFilename: '',
    parserName: 'quizfetchHtml',
    confidence,
  };
  return { quiz, confidence, parserName: 'quizfetchHtml' };
}

// ── Registry ──────────────────────────────────────────────────────

const TEXT_PARSERS = [parseCleanJson, parseMarkdownTable, parseQAndA, parseTermDef, parseNumberedList];

export function runAllParsers(rawInput, hint) {
  const results = [];

  if (hint === 'html' || hint === undefined) {
    const r = parseQuizfetchHtml(rawInput);
    if (r) results.push(r);
    // If cleanJson matches an html-hinted input, still try it
    const j = parseCleanJson(rawInput);
    if (j) results.push(j);
  }

  if (hint === 'text' || hint === undefined) {
    for (const fn of TEXT_PARSERS) {
      try {
        const r = fn(rawInput);
        if (r && r.confidence >= 0) results.push(r);
      } catch {}
    }
  }

  if (results.length === 0) return { best: null, all: [] };

  results.sort((a, b) => b.confidence - a.confidence);
  const best = results[0].confidence >= 0.4 ? results[0] : null;
  return { best, all: results };
}

// ── Legacy export (keeps existing callers working) ────────────────

export function parseQuizfetch(htmlString) {
  const r = parseQuizfetchHtml(htmlString);
  if (!r) {
    return {
      id: 'quiz_' + Math.random().toString(36).slice(2, 10),
      title: 'Untitled quiz', course: '',
      questions: [],
      createdAt: Date.now(),
      sourceFilename: '',
    };
  }
  return r.quiz;
}
