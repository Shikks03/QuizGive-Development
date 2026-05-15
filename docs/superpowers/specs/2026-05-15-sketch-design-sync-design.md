# Sketch Design Sync — Design Spec
_Date: 2026-05-15_

## Goal
Make the QuizGive React app match the `QuizGive_Sketch.html` design (exported from claude.ai/design). The CSS variables, layout, and component structure are already synced from the previous "sketch/marker redesign" commit. This spec covers the remaining delta: decorative SVG elements that exist in `src/icons.jsx` but are not rendered in the screen components, plus two component-level mismatches (QGLogo, donut chart).

## Scope (Approach 1 — Targeted Accent Additions)
Five focused changes, highest visual impact only. No layout or font-size changes.

---

## Change 1 — QGLogo SVG

**File:** `src/components/Shell.jsx`, `QGLogo` function (lines 7–19)

**Current:** Filled `<rect>` book with solid background, magnifier overlaid.

**Design target:** Stroke-based sketch book with accent-colored fill, text lines in `var(--bg)`, separate magnifier circle + handle in `var(--ink)`.

```
viewBox="0 0 40 40", stroke="var(--ink)", strokeWidth="2.5"
- path: book/page shape filled with var(--accent), text lines stroke var(--bg) strokeWidth 1.8
- circle cx=28 cy=27 r=5.5, fill var(--bg), stroke var(--ink)
- path: magnifier handle M32 31 L36 35, stroke var(--ink) strokeWidth 3
```

---

## Change 2 — Library header: HandArrow + "X saved!" annotation

**File:** `src/screens/Screens.jsx`, `QGLibraryScreen`, heading section (~line 168)

**Current:** `<h1 className="qg-h1"><span className="hl">Library</span></h1>` with no decoration.

**Design target:** `HandArrow` (dir="down-left", size=50, color=var(--accent)) placed inline after the h1, followed by a `<span>` styled with `font-family: var(--hand-display), fontSize: 20, color: var(--accent), transform: rotate(-4deg)` showing `{quizzes.length} saved!`

Import `HandArrow` from `../icons.jsx` (already exported there).

The "X saved!" span needs class `qg-handnote` — add to CSS or use inline style with `display: inline-block`.

---

## Change 3 — LibraryCard: HandStar for bookmarks

**File:** `src/screens/Screens.jsx`, `LibraryCard` component (~line 251 in design-handoff reference, current app equivalent)

**Current:** No bookmark indicator on the card face (bookmark is only shown as a pill at the bottom).

**Design target:** When `isFav` is true, render a `HandStar` absolutely positioned at `top: -10px, left: -10px, transform: rotate(-12deg)`, `size=28`, `color="var(--accent)"`.

Import `HandStar` from `../icons.jsx` (already exported there).

---

## Change 4 — Quiz screen: CircledNum for question number

**File:** `src/screens/Quiz.jsx`, `OneAtATime` component (~line 110)

**Current:** Question prompt rendered as `<h1 className="prompt"><RichText nodes={q.prompt} /></h1>` with no number indicator.

**Design target:** Wrap in a row: `CircledNum` (n={idx+1}, size=44, color="var(--accent)") + `<h1 className="prompt" style={{ flex: 1 }}>`.

`CircledNum` must be added to `src/icons.jsx` — it's a component, not currently exported:
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

The row wrapper uses `className="qg-row"` with `gap: 14, alignItems: "flex-start"`.

---

## Change 5 — Results screen: HandDonut chart

**File:** `src/screens/Quiz.jsx`, `QGResultsScreen` (~line 408)

**Current:** Plain SVG with two `<circle>` elements (fill track + accent progress arc) and plain `<text>`.

**Design target:** Sketchy donut with:
- Dashed track circle: `r=70, strokeDasharray="4 5", opacity=0.4`
- Hand-drawn outer ring: `r=76, strokeWidth=2.5`
- Hand-drawn inner ring: `r=64, strokeWidth=2.5`
- Progress arc: `r=70, strokeWidth=14, strokeDasharray={c*pct + " " + c}, strokeLinecap="round", rotate(-90)`
- Text: `{right}/{total}` at fontSize=38, `{pctRound}% right` at fontSize=18

Use a local `HandDonut` component inside `Quiz.jsx` (no need to export):
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

Replace the `<svg className="qg-donut" ...>` block in `QGResultsScreen` with `<HandDonut pct={result.pct} right={result.right} total={result.total} size={200} />`. Remove the old `<div className="qg-row">` score text below it since the donut now contains that info.

---

## Files Changed
| File | Changes |
|---|---|
| `src/icons.jsx` | Export `CircledNum` component |
| `src/components/Shell.jsx` | Update `QGLogo` SVG |
| `src/screens/Screens.jsx` | Library header (HandArrow + saved note), LibraryCard (HandStar) |
| `src/screens/Quiz.jsx` | CircledNum in OneAtATime, HandDonut in QGResultsScreen |

## What's NOT changed
- Font sizes (body 20px, sidebar items 19px) — minor and not visually jarring
- Sidebar width (310px vs 280px in design) — fine at current size
- AccountModal behavior — design prototype omitted it, but it's useful feature to keep
- AllOnOnePage quiz layout — design doesn't show this screen
- Upload screen HandArrow decoration — lower priority, upload is transient
