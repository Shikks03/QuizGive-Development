// Parses numbered list MCQ format:
//   1. Question text
//   a) Choice A
//   b) Choice B
//   Answer: b

export function parseNumberedList(input) {
  const lines = input.split(/\r?\n/).map(l => l.trim());
  const questions = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const qMatch = line.match(/^(\d+)[.)]\s+(.+)$/);
    if (!qMatch) { i++; continue; }

    const prompt = qMatch[2].trim();
    i++;

    const choices = [];
    let correctIdx = -1;

    while (i < lines.length) {
      const cl = lines[i].trim();
      if (!cl) { i++; break; }
      // Next numbered question
      if (/^\d+[.)]\s/.test(cl)) break;

      const choiceMatch = cl.match(/^([A-Ea-e])[).]\s+(.+)$/);
      if (choiceMatch) {
        choices.push(choiceMatch[2].trim());
        i++;
        continue;
      }

      const ansMatch = cl.match(/^(?:Ans(?:wer)?|Correct)\s*[:.]\s*(.+)$/i);
      if (ansMatch) {
        const ans = ansMatch[1].trim();
        const letterMatch = ans.match(/^([A-Ea-e])$/);
        if (letterMatch && choices.length > 0) {
          correctIdx = letterMatch[1].toLowerCase().charCodeAt(0) - 97;
        } else {
          const idx = choices.findIndex(c => c.toLowerCase() === ans.toLowerCase());
          correctIdx = idx >= 0 ? idx : 0;
        }
        i++;
        break;
      }

      i++;
    }

    if (!prompt || choices.length < 2) continue;
    if (correctIdx < 0 || correctIdx >= choices.length) correctIdx = 0;

    questions.push({ id: `q${questions.length}`, prompt, choices, correctIdx });
  }

  if (questions.length < 1) return null;

  // Require at least some questions with multiple choices to be confident
  const withChoices = questions.filter(q => q.choices.length >= 2).length;
  if (withChoices === 0) return null;

  const confidence = Math.min(0.5 + (withChoices / questions.length) * 0.35, 0.85);

  return {
    quiz: {
      id: 'quiz_' + Math.random().toString(36).slice(2, 10),
      title: 'Quiz',
      course: '',
      questions,
      createdAt: Date.now(),
      sourceFilename: '',
      parserName: 'numberedList',
      confidence,
    },
    confidence,
    parserName: 'numberedList',
  };
}
