// Converts term/definition pairs into MCQ questions.
// Picks distractors from other definitions in the same set.

export function makeMcqFromPairs(pairs, { distractorsPerQ = 3 } = {}) {
  if (!pairs || pairs.length === 0) return [];

  const questions = pairs.map((pair, i) => {
    const others = pairs.filter((_, j) => j !== i).map(p => p.def);

    if (pairs.length === 1) {
      // Only one pair: make a true/false-style question
      return {
        id: `q${i}`,
        prompt: `What is ${pair.term}?`,
        choices: [pair.def, 'None of the above'],
        correctIdx: 0,
      };
    }

    // Pick random distractors from other defs
    const shuffled = shuffle(others);
    const distractors = shuffled.slice(0, distractorsPerQ);

    const allChoices = [pair.def, ...distractors];
    const shuffledChoices = shuffle(allChoices);
    const correctIdx = shuffledChoices.indexOf(pair.def);

    return {
      id: `q${i}`,
      prompt: `What is ${pair.term}?`,
      choices: shuffledChoices,
      correctIdx,
    };
  });

  return questions;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
