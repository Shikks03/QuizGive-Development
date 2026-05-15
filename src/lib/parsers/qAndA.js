// Parses Q: ... A: ... style text.
// Also handles: "Question 1: ...", "Answer:", numbered choice lines A) B) C) D)

export function parseQAndA(input) {
  const lines = input.split(/\r?\n/).map(l => l.trim());
  const questions = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Match question line: "Q:", "Q1:", "Question 1:", "Question:"
    const qMatch = line.match(/^(?:Q(?:uestion)?(?:\s*\d+)?)\s*[:.]\s*(.+)$/i);
    if (!qMatch) { i++; continue; }

    const prompt = qMatch[1].trim();
    i++;

    // Collect optional A/B/C/D choice lines
    const choices = [];
    let correctIdx = -1;

    while (i < lines.length) {
      const cl = lines[i].trim();
      // Stop if we hit another question or an answer marker
      if (/^(?:Q(?:uestion)?(?:\s*\d+)?)\s*[:.]/i.test(cl)) break;

      const choiceMatch = cl.match(/^([A-Da-d])[).]\s*(.+)$/);
      if (choiceMatch) {
        choices.push(choiceMatch[2].trim());
        i++;
        continue;
      }

      // Answer line: "A: Paris", "Answer: Paris", "Answer: b"
      const ansMatch = cl.match(/^(?:Ans(?:wer)?)\s*[:.]\s*(.+)$/i);
      if (ansMatch) {
        const ans = ansMatch[1].trim();
        if (choices.length > 0) {
          // Could be a letter like "b" or "B"
          const letterMatch = ans.match(/^([A-Da-d])$/);
          if (letterMatch) {
            correctIdx = letterMatch[1].toLowerCase().charCodeAt(0) - 97;
          } else {
            // Try to find which choice matches
            const idx = choices.findIndex(c => c.toLowerCase() === ans.toLowerCase());
            if (idx >= 0) correctIdx = idx;
            else {
              // No choices yet — treat as the answer text itself
              choices.push(ans);
              correctIdx = 0;
            }
          }
        } else {
          choices.push(ans);
          correctIdx = 0;
        }
        i++;
        break;
      }

      // If blank line after choices, stop
      if (!cl) { i++; break; }
      i++;
    }

    if (!prompt) continue;

    // Need at least the answer
    if (correctIdx < 0 && choices.length > 0) correctIdx = 0;
    if (choices.length < 1) continue;
    if (correctIdx < 0 || correctIdx >= choices.length) correctIdx = 0;

    // Pad with placeholder choices if only one answer
    if (choices.length === 1) {
      choices.push('None of the above');
    }

    questions.push({
      id: `q${questions.length}`,
      prompt,
      choices,
      correctIdx,
    });
  }

  if (questions.length < 1) return null;

  const confidence = Math.min(0.55 + questions.length * 0.04, 0.88);

  return {
    quiz: {
      id: 'quiz_' + Math.random().toString(36).slice(2, 10),
      title: 'Q&A Quiz',
      course: '',
      questions,
      createdAt: Date.now(),
      sourceFilename: '',
      parserName: 'qAndA',
      confidence,
    },
    confidence,
    parserName: 'qAndA',
  };
}
