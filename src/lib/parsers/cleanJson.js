// Accepts the JSON shape produced by the Polish-First AI prompt.
// Returns confidence 1.0 on a valid match, short-circuiting other parsers.

export function parseCleanJson(input) {
  let obj;
  try {
    const trimmed = input.trim();
    // Strip markdown code fences if the user pasted anyway
    const stripped = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    obj = JSON.parse(stripped);
  } catch {
    return null;
  }

  if (!obj || typeof obj !== 'object') return null;
  if (!Array.isArray(obj.questions) || obj.questions.length === 0) return null;

  const questions = [];
  for (const q of obj.questions) {
    if (typeof q.prompt !== 'string' || !Array.isArray(q.choices)) return null;
    if (q.choices.length < 2) return null;
    const correctIdx = typeof q.correctIdx === 'number' ? q.correctIdx : 0;
    if (correctIdx < 0 || correctIdx >= q.choices.length) return null;
    questions.push({
      id: `q${questions.length}`,
      prompt: q.prompt.trim(),
      choices: q.choices.map(String),
      correctIdx,
    });
  }

  return {
    quiz: {
      id: 'quiz_' + Math.random().toString(36).slice(2, 10),
      title: (obj.title || 'Untitled quiz').trim(),
      course: (obj.course || '').trim(),
      questions,
      createdAt: Date.now(),
      sourceFilename: '',
      parserName: 'cleanJson',
      confidence: 1.0,
    },
    confidence: 1.0,
    parserName: 'cleanJson',
  };
}
