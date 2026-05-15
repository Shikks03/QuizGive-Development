# Quiz Card Flip — Design Spec
_Date: 2026-05-14_

## Overview

When a user clicks a quiz card in the Library, the card flips in-place (3D Y-axis rotation) to reveal a back face with two actions: **Start quiz** and **Download**. The library page stays unchanged — no navigation, no modal. Clicking outside any flipped card, or the "← back" link on the card back, flips it closed.

---

## Behaviour

### Flip trigger
- Clicking anywhere on a library card (except the "⋯" menu button) sets that card as the active card and triggers the flip animation.
- The "⋯" menu button stops click propagation — it continues to open the existing bookmark/delete menu without flipping the card.

### One card at a time
- `QGLibraryScreen` holds a single `activeCardId` state (string | null).
- When a card is clicked, `setActiveCardId(quiz.id)` is called. Any previously active card automatically un-flips because its `is-flipped` class is removed when `activeCardId` changes.

### Flip-back triggers
1. Clicking the "← back" link on the card back calls `setActiveCardId(null)`.
2. Clicking anywhere outside a card (on the grid background, the page, etc.) also calls `setActiveCardId(null)`. This is handled by an `onClick` on the grid container that checks `event.target` is the grid itself, combined with `stopPropagation()` on each card.

---

## Components

### `QGLibraryScreen` (qg-screens.jsx)
- Add `const [activeCardId, setActiveCardId] = React.useState(null);`
- Pass `activeCardId` and `setActiveCardId` to each `LibraryCard`.
- Add `onClick` on the `.qg-lib-grid` container: `() => setActiveCardId(null)` — clears active card when clicking the grid background.

### `LibraryCard` (qg-screens.jsx)
Restructured into a 3D flip shell:

```
.qg-flip-card                     ← outer shell, sets perspective
  .qg-flip-card-inner             ← rotates on .is-flipped
    .qg-flip-card-front           ← existing card content (unchanged)
    .qg-flip-card-back            ← new back face
```

**Front face** — identical to current `LibraryCard` content (title, meta, status, pills, ⋯ menu).

**Back face** contains:
- Small header: quiz title + question count (truncated if long)
- **Start quiz** button (primary style) → `navigate({ name: 'quiz', quizId: quiz.id })`
- **Download** button (secondary style) → `QGExport.downloadInteractiveQuiz(quiz)`
- **← back** text link → `setActiveCardId(null)` + `e.stopPropagation()`

The card's outer `onClick` calls `e.stopPropagation()` (so clicks inside a card don't bubble to the grid's clear-handler) and `setActiveCardId(quiz.id)`.

---

## CSS

New classes added (in `qg-shell.jsx` style block or a dedicated `<style>` section):

```css
.qg-flip-card {
  perspective: 900px;
  position: relative;   /* required so absolute-positioned faces are contained */
  min-height: 160px;    /* ensure back face has room for title + 2 buttons + link */
}
.qg-flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.42s cubic-bezier(.4,0,.2,1);
}
.qg-flip-card.is-flipped .qg-flip-card-inner {
  transform: rotateY(180deg);
}
.qg-flip-card-front,
.qg-flip-card-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: inherit;
}
.qg-flip-card-back {
  transform: rotateY(180deg);
}
```

The existing `.qg-lib-card` styles are kept on the front and back face divs directly so visual styling is unchanged.

---

## Interactive HTML Export

New function `QGExport.downloadInteractiveQuiz(quiz)` in `qg-export.js`.

**Output:** a single self-contained `.html` file, no external dependencies.

**Quiz format:**
- All questions displayed on one scrollable page, each in a card.
- Each question shows the prompt and A/B/C/D radio button choices.
- A **Submit** button at the bottom, disabled until every question has a selection.
- On submit: each question card updates inline to show correct (green) / wrong (red), with the correct answer highlighted. A score banner appears at the top showing `X / N correct (Y%)`.
- No retake button in the downloaded file (it's a static export).

**File naming:** `<safe-quiz-title>-quiz.html`

---

## What does NOT change

- The existing upload → preview → ready → quiz flow is untouched.
- The "⋯" menu (bookmark / delete) works exactly as before.
- Navigating to `{ name: 'quiz', quizId }` from the Start button respects the existing session layout (`one` or `all`) exactly as the current library card click does.
- The existing `downloadJSON` and `downloadHTML` (answer key) exports in `qg-export.js` are untouched.

---

## Files changed

| File | Change |
|------|--------|
| `qg-screens.jsx` | Add `activeCardId` state to `QGLibraryScreen`; restructure `LibraryCard` into flip shell |
| `qg-export.js` | Add `downloadInteractiveQuiz(quiz)` function |
| `qg-shell.jsx` | Add flip CSS classes |
