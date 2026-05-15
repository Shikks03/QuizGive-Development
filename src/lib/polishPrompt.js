export const POLISH_PROMPT = `You are converting study material into a clean quiz JSON.
Return ONLY valid JSON, no prose, no markdown fences.

Schema:
{
  "title": "string",
  "course": "string (optional)",
  "questions": [
    { "prompt": "string", "choices": ["string", ...], "correctIdx": 0 }
  ]
}

Rules:
- If the source is term/definition pairs, make each term the prompt
  ("What is <term>?") with the definition as the correct choice
  and 3 plausible wrong choices drawn from OTHER definitions in the set.
- Strip numbering ("1.", "Q1:") from prompts.
- correctIdx is 0-based.
- Minimum 2 choices per question.

Here is the source:
<<PASTE YOUR REVIEWER TEXT HERE>>`;
