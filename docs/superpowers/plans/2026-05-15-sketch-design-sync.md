# Sketch Design Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply five targeted decorative changes to make the React app match the `QuizGive_Sketch.html` design — SVG logo restyle, library header annotation, bookmark star badge, question number circle, and sketchy donut chart.

**Architecture:** Pure JSX/SVG edits across four files. No new files. No state changes. No layout changes. Decorative additions only — each change is self-contained and visually verifiable by running the dev server.

**Tech Stack:** React 18, Vite, inline SVG (no SVG libraries), CSS custom properties (`var(--ink)`, `var(--accent)`, `var(--bg)`, `var(--hand-display)`)

> **Note on testing:** This project has no automated test infrastructure. Each task is verified visually via `npm run dev`. The dev server must be running (`npm run dev` in the project root) for the visual checks to work.

---

## File Map

| File | What changes |
|---|---|
| `src/icons.jsx` | Add `export const CircledNum` after `HandSquiggle` |
| `src/components/Shell.jsx` | Replace `QGLogo` SVG (lines 7–18) |
| `src/screens/Screens.jsx` | (1) Library header row (line 144) — add HandArrow + saved note; (2) LibraryCard front face (line 389) — add HandStar badge when `isFav` |
| `src/screens/Quiz.jsx` | (1) `OneAtATime` question row (line 110) — wrap with CircledNum; (2) `QGResultsScreen` donut SVG (lines 408–417) — replace with `HandDonut` component |

---

### Task 1: Export CircledNum from icons.jsx

**Files:**
- Modify: `src/icons.jsx` — append after `HandSquiggle` (currently the last export, ends at line 76)

- [ ] **Step 1: Open icons.jsx and locate the end of the file (after HandSquiggle, line 76)**

The file currently ends after `HandSquiggle`. We will append `CircledNum` directly after it.

- [ ] **Step 2: Add the CircledNum export**

In `src/icons.jsx`, after the closing `);` of `HandSquiggle` (line 76), append:

```jsx
export const CircledNum = ({ n, size = 36, color = 'var(--accent)' }) => (
  <span style={{
    display: 'inline-grid', placeItems: 'center',
    width: size, height: size, position: 'relative',
    fontFamily: 'var(--hand-display)', fontWeight: 700, fontSize: size * 0.55,
    color,
  }}>
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ position: 'absolute', inset: 0 }}
      fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <path d="M20 4 C 31 4, 36 12, 36 20 C 36 30, 28 36, 20 36 C 10 36, 4 28, 4 20 C 4 11, 11 4, 20 4 Z" />
    </svg>
    <span style={{ position: 'relative' }}>{n}</span>
  </span>
);
```

- [ ] **Step 3: Verify it compiles**

Run: `npm run dev` (or check that the running dev server reloads without errors in the terminal)

Expected: No TypeScript/JSX errors in console. Browser loads.

- [ ] **Step 4: Commit**

```bash
git add src/icons.jsx
git commit -m "feat: export CircledNum icon from icons.jsx"
```

---

### Task 2: Update QGLogo SVG to stroke-based sketch style

**Files:**
- Modify: `src/components/Shell.jsx` lines 7–18 (`QGLogo` function)

**Current code (lines 7–19):**
```jsx
export function QGLogo({ size = 30 }) {
  return (
    <span className="qg-logo" style={{ fontSize: size }}>
      <svg width={size + 5} height={size + 5} viewBox="0 0 32 32">
        <rect x="3" y="5" width="26" height="22" rx="4" fill="currentColor" />
        <path d="M9 12 L15 12 M9 16 L15 16 M9 20 L13 20" stroke="var(--surface)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <circle cx="22" cy="20" r="3.5" fill="none" stroke="var(--surface)" strokeWidth="1.8" />
        <path d="M24 22 L26 24" stroke="var(--surface)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      QuizGive
    </span>
  );
}
```

- [ ] **Step 1: Replace QGLogo with stroke-based sketch version**

Replace lines 7–19 in `src/components/Shell.jsx` with:

```jsx
export function QGLogo({ size = 30 }) {
  return (
    <span className="qg-logo" style={{ fontSize: size }}>
      <svg width={size + 5} height={size + 5} viewBox="0 0 40 40"
        fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round">
        <path d="M6 8 C6 6 8 5 10 5 L30 5 C32 5 34 6 34 8 L34 32 C34 34 32 35 30 35 L10 35 C8 35 6 34 6 32 Z"
          fill="var(--accent)" stroke="var(--ink)" strokeWidth="2.5" />
        <path d="M12 14 L20 14 M12 19 L20 19 M12 24 L17 24"
          stroke="var(--bg)" strokeWidth="1.8" />
        <circle cx="28" cy="27" r="5.5" fill="var(--bg)" stroke="var(--ink)" strokeWidth="2.5" />
        <path d="M32 31 L36 35" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      QuizGive
    </span>
  );
}
```

- [ ] **Step 2: Visually verify in browser**

Check the sidebar header logo at `http://localhost:5173`. The logo should show:
- A book shape with accent-colored fill and ink outline
- Three text-line strokes in the background color
- A magnifier circle (hollow) with a handle stroke extending down-right

- [ ] **Step 3: Commit**

```bash
git add src/components/Shell.jsx
git commit -m "feat: update QGLogo to stroke-based sketch style"
```

---

### Task 3: Library header — HandArrow + "X saved!" annotation

**Files:**
- Modify: `src/screens/Screens.jsx`
  - Line 2: add `HandArrow` to import
  - Lines 143–146: update the heading div

**Current import (line 2):**
```jsx
import { QGIcon } from '../icons.jsx';
```

**Current heading block (lines 143–146):**
```jsx
          <div>
            <h1 className="qg-h1"><span className="hl">Library</span></h1>
            <div className="qg-muted" style={{ marginTop: 4 }}>{quizzes.length} quiz{quizzes.length === 1 ? '' : 'zes'} saved on this device</div>
          </div>
```

- [ ] **Step 1: Add HandArrow to imports in Screens.jsx**

After line 2 (`import { QGIcon } from '../icons.jsx';`), add:

```jsx
import { HandArrow } from '../icons.jsx';
```

- [ ] **Step 2: Replace the heading div with the decorated version**

Replace the heading `<div>` block (lines 143–146) with:

```jsx
          <div>
            <div className="qg-row" style={{ alignItems: 'flex-end', gap: 8 }}>
              <h1 className="qg-h1" style={{ margin: 0 }}><span className="hl">Library</span></h1>
              <HandArrow dir="down-left" size={50} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span style={{
                display: 'inline-block',
                fontFamily: 'var(--hand-display)',
                fontSize: 20,
                color: 'var(--accent)',
                transform: 'rotate(-4deg)',
                lineHeight: 1,
                paddingBottom: 6,
              }}>
                {quizzes.length} saved!
              </span>
            </div>
          </div>
```

- [ ] **Step 3: Remove the now-redundant muted subtitle**

The old line `<div className="qg-muted" ...>{quizzes.length} quiz... saved on this device</div>` is replaced — it should be gone after Step 2. Confirm it is not duplicated.

- [ ] **Step 4: Visually verify**

Navigate to the Library screen in the browser. Confirm:
- "Library" heading with highlight
- A down-left arrow in accent color to the right of it
- An "X saved!" handwritten annotation rotated slightly

- [ ] **Step 5: Commit**

```bash
git add src/screens/Screens.jsx
git commit -m "feat: add HandArrow + saved count annotation to library header"
```

---

### Task 4: LibraryCard — HandStar badge for bookmarked cards

**Files:**
- Modify: `src/screens/Screens.jsx`
  - Add `HandStar` to icon import (same import line as Task 3 already added HandArrow)
  - `LibraryCard` front face (currently line 389 — the `<div className="qg-lib-card qg-flip-card-front">`)

**Current front face open tag (around line 389 after Task 3 edits):**
```jsx
        <div className="qg-lib-card qg-flip-card-front">
          <div className="qg-row between" style={{ alignItems: 'flex-start' }}>
```

- [ ] **Step 1: Add HandStar to the icons import in Screens.jsx**

Update the icons import to include `HandStar`:

```jsx
import { HandArrow, HandStar } from '../icons.jsx';
```

- [ ] **Step 2: Add HandStar badge inside the front face**

Wrap the front face content with a `position: relative` wrapper and add the HandStar absolutely positioned. Replace:

```jsx
        <div className="qg-lib-card qg-flip-card-front">
          <div className="qg-row between" style={{ alignItems: 'flex-start' }}>
```

With:

```jsx
        <div className="qg-lib-card qg-flip-card-front" style={{ position: 'relative' }}>
          {isFav && (
            <HandStar
              size={28}
              style={{
                position: 'absolute',
                top: -10,
                left: -10,
                transform: 'rotate(-12deg)',
                color: 'var(--accent)',
                pointerEvents: 'none',
              }}
            />
          )}
          <div className="qg-row between" style={{ alignItems: 'flex-start' }}>
```

- [ ] **Step 3: Visually verify**

In the browser Library screen, bookmark a quiz (via its menu → Bookmark). Confirm:
- A star icon appears at the top-left of the card, slightly rotated, in accent color
- Non-bookmarked cards show no star
- The card layout is not broken

- [ ] **Step 4: Commit**

```bash
git add src/screens/Screens.jsx
git commit -m "feat: add HandStar badge to bookmarked library cards"
```

---

### Task 5: OneAtATime — CircledNum question number

**Files:**
- Modify: `src/screens/Quiz.jsx`
  - Line 1: add `CircledNum` to imports from icons
  - Line 110: wrap the `<h1 className="prompt">` in a row with `CircledNum`

**Current import (line 1):**
```jsx
import { QGIcon } from '../icons.jsx';
```

**Current question heading (line 110):**
```jsx
          <h1 className="prompt"><RichText nodes={q.prompt} /></h1>
```

- [ ] **Step 1: Add CircledNum to imports in Quiz.jsx**

After line 1, add:

```jsx
import { CircledNum } from '../icons.jsx';
```

- [ ] **Step 2: Wrap question h1 with CircledNum row**

Replace line 110:

```jsx
          <h1 className="prompt"><RichText nodes={q.prompt} /></h1>
```

With:

```jsx
          <div className="qg-row" style={{ gap: 14, alignItems: 'flex-start' }}>
            <CircledNum n={idx + 1} size={44} color="var(--accent)" />
            <h1 className="prompt" style={{ flex: 1 }}><RichText nodes={q.prompt} /></h1>
          </div>
```

- [ ] **Step 3: Visually verify**

Start a quiz and go to any question. Confirm:
- A hand-drawn circle with the question number (1, 2, 3…) appears to the left of the prompt
- The prompt text wraps correctly with `flex: 1`
- The number uses the accent color

- [ ] **Step 4: Commit**

```bash
git add src/screens/Quiz.jsx
git commit -m "feat: add CircledNum question number to quiz one-at-a-time view"
```

---

### Task 6: QGResultsScreen — HandDonut sketchy chart

**Files:**
- Modify: `src/screens/Quiz.jsx`
  - Add `HandDonut` local component (before `QGResultsScreen`)
  - Replace the `<svg className="qg-donut" ...>` block (lines 408–417) with `<HandDonut ... />`
  - Remove the redundant score row below the SVG (lines 418–422)

**Current donut SVG block (lines 408–417):**
```jsx
              <svg className="qg-donut" width="180" height="180" viewBox="0 0 100 100" style={{ display: 'block', margin: '0 auto' }}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--surface-2)" strokeWidth="9" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--accent)" strokeWidth="9"
                  strokeDasharray={`${42 * 2 * Math.PI}`}
                  strokeDashoffset={`${42 * 2 * Math.PI * (1 - result.pct)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)" />
                <text x="50" y="48" textAnchor="middle" fontSize="20" fill="var(--ink)" fontWeight="600">{result.right}/{result.total}</text>
                <text x="50" y="62" textAnchor="middle" fontSize="8" fill="var(--ink-3)">{pctRound}% correct</text>
              </svg>
              <div className="qg-row" style={{ justifyContent: 'center', gap: 18, marginTop: 8, flexWrap: 'wrap' }}>
                <span style={{ whiteSpace: 'nowrap' }}><b style={{ color: 'var(--ok)' }}>{result.right}</b> <span className="qg-muted">right</span></span>
                <span style={{ whiteSpace: 'nowrap' }}><b style={{ color: 'var(--bad)' }}>{result.wrong}</b> <span className="qg-muted">wrong</span></span>
                {result.skipped > 0 && <span style={{ whiteSpace: 'nowrap' }}><b className="qg-muted">{result.skipped}</b> <span className="qg-muted">skipped</span></span>}
              </div>
```

- [ ] **Step 1: Add HandDonut component before QGResultsScreen**

Find `function QGResultsScreen` in Quiz.jsx. Immediately before it, insert:

```jsx
function HandDonut({ pct, right, total, size = 200 }) {
  const r = 70, c = 2 * Math.PI * r;
  return (
    <svg className="qg-donut" width={size} height={size} viewBox="0 0 200 200">
      <circle cx="100" cy="100" r={r} fill="none" stroke="var(--ink)" strokeWidth="2"
        strokeDasharray="4 5" opacity="0.4" />
      <circle cx="100" cy="100" r={r + 6} fill="none" stroke="var(--ink)" strokeWidth="2.5" />
      <circle cx="100" cy="100" r={r - 6} fill="none" stroke="var(--ink)" strokeWidth="2.5" />
      <circle cx="100" cy="100" r={r} fill="none" stroke="var(--accent)" strokeWidth="14"
        strokeDasharray={`${c * pct} ${c}`} strokeLinecap="round"
        transform="rotate(-90 100 100)" />
      <text x="100" y="96" textAnchor="middle" fontSize="38" fill="var(--ink)" fontWeight="700">{right}/{total}</text>
      <text x="100" y="125" textAnchor="middle" fontSize="18" fill="var(--ink-3)">{Math.round(pct * 100)}% right</text>
    </svg>
  );
}
```

- [ ] **Step 2: Replace the old SVG + score row with HandDonut**

Replace the entire block (old `<svg className="qg-donut" ...>` through the closing `</div>` of the score row) with:

```jsx
              <HandDonut pct={result.pct} right={result.right} total={result.total} size={200} />
```

The three-stat row (`right / wrong / skipped`) below it is removed because `HandDonut` already shows `right/total` and `pct% right` inside the SVG.

- [ ] **Step 3: Keep the skipped stat visible (important edge case)**

The old row showed skipped count. Since HandDonut only shows `right/total`, skipped is implied by the difference. This is acceptable per the spec — skipped is shown in the question grid below. No additional change needed.

- [ ] **Step 4: Visually verify**

Complete a quiz and go to the results screen. Confirm:
- The donut uses a dashed track ring, hand-drawn inner + outer outline circles, and a solid accent arc
- Text inside the SVG shows `right/total` (large) and `X% right` (smaller, muted)
- The old score row below the donut is gone
- The rest of the results card (question grid, review answers) is unaffected

- [ ] **Step 5: Commit**

```bash
git add src/screens/Quiz.jsx
git commit -m "feat: replace plain donut with HandDonut sketchy chart in results screen"
```

---

## Self-Review Checklist

- [x] **Change 1 (QGLogo)** → Task 2
- [x] **Change 2 (HandArrow + saved note)** → Task 3
- [x] **Change 3 (HandStar badge)** → Task 4
- [x] **Change 4 (CircledNum)** → Tasks 1 + 5 (export first, then use)
- [x] **Change 5 (HandDonut)** → Task 6
- [x] No placeholders — all steps contain exact code
- [x] Type consistency — `CircledNum` exported in Task 1 and imported using the same name in Task 5; `HandArrow`/`HandStar` imported in Task 3/4 from same path; `HandDonut` is local to Quiz.jsx
- [x] Import dedup — Tasks 3 and 4 both touch the `icons.jsx` import in Screens.jsx; Task 4 supersedes Task 3's import line (Task 4 shows the final combined import to use)
