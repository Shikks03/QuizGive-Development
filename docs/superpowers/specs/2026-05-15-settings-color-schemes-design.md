# Settings Panel + Color Schemes Design

**Date:** 2026-05-15
**Status:** Approved

## Overview

Replace the current Account modal and sidebar dark/light toggle with a unified **Settings modal** that includes a color scheme picker and account info. Users can choose from 8 named color schemes that immediately apply as a live preview and sync to Supabase.

---

## What Changes

### Removed
- `Moon`/`Sun` toggle button in `SideFooter` (Shell.jsx)
- `AccountModal` component — replaced by `SettingsModal`

### Changed
- Clicking the account area (avatar + username row) in `SideFooter` opens `SettingsModal`
- `state.theme` expands from `'light' | 'dark'` to one of 8 scheme IDs
- `QG_DEFAULTS.theme` changes from `'light'` to `'sketch-light'`
- `App.jsx` applies theme as a body class name instead of toggling `'dark'`

---

## Color Schemes

8 schemes, each with a unique body class and full CSS variable overrides:

| ID | Label | Character |
|----|-------|-----------|
| `sketch-light` | ☀️ Sketch | Current `:root` — warm paper, coral accent |
| `sketch-dark` | 🌙 Sketch Dark | Current `body.dark` — same warm tones, dark |
| `ocean` | 🌊 Ocean | Cool blue-white, steel accent |
| `ocean-dark` | 🌑 Ocean Dark | Deep navy, electric blue accent |
| `forest` | 🌿 Forest | Soft green-white, sage accent |
| `forest-dark` | 🌲 Forest Dark | Deep forest, bright green accent |
| `rose` | 🌸 Rose | Blush white, deep rose accent |
| `midnight` | ✨ Midnight | Near-black with purple accent |

CSS implementation: `:root` defines `sketch-light` variables (unchanged). Each other scheme gets a `body.<id>` block overriding only the variables that differ. The existing `body.dark` block is renamed to `body.sketch-dark` for consistency.

### Migration

On load, if `prefs.theme` from Supabase is `'light'`, map it to `'sketch-light'`. If `'dark'`, map to `'sketch-dark'`. This happens in `loadUserData` in `store.js`.

---

## Settings Modal

Triggered by clicking the account row in `SideFooter`. Centered overlay (same pattern as current modal scrim).

### Layout

```
⚙ Settings
──────────────────────────────────
Appearance

  [Sketch] [Sketch Dark] [Ocean] [Ocean Dark]
  [Forest] [Forest Dark] [Rose]  [Midnight]

  (active scheme highlighted with accent border)

──────────────────────────────────
Account

  Username  [ username ] (read-only input)

[Close]                        [Log out]
```

### Behavior
- Clicking a scheme swatch immediately calls `actions.setTheme(id)` — live preview, no separate save
- `actions.setTheme` already debounces the Supabase write (500ms), so no new sync logic needed
- Scheme swatches show bg + accent color as visual dots, scheme name as label below
- Active scheme has an accent-colored outline
- Username field is read-only (same as current Account modal)
- "Log out" calls `auth.signOut()` and closes modal
- "Close" or clicking the scrim dismisses modal

---

## File Changes

| File | Change |
|------|--------|
| `src/qg.css` | Add 6 new `body.<scheme>` blocks; rename `body.dark` → `body.sketch-dark`; add variables for all new palettes |
| `src/store.js` | `QG_DEFAULTS.theme: 'sketch-light'`; add migration in `loadUserData` |
| `src/App.jsx` | Replace `body.classList.toggle('dark', ...)` with `document.body.className = state.theme` |
| `src/components/Shell.jsx` | Remove sun/moon toggle; replace `AccountModal` with `SettingsModal`; rename state var |

---

## Out of Scope
- Custom/user-defined color schemes
- Per-quiz theme overrides
- Font or layout settings in the modal
