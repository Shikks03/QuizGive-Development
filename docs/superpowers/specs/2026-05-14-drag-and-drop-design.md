# Drag-and-Drop Design — QuizGive Library

**Date:** 2026-05-14  
**Status:** Approved

## Overview

Add drag-and-drop to the QuizGive library so users can:
1. Drag quiz cards onto folder cards to add them to that folder
2. Reorder quiz cards and folder cards within the library grid
3. Reorder quiz cards within a folder view

All ordering persists to localStorage. No external DnD library currently exists — we add `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities`.

## Data Model

Three new fields in `QG_DEFAULTS` (`src/store.js`):

```js
cardOrder: [],         // quizId[] — display order of ungrouped quizzes in library
folderOrder: [],       // folderId[] — display order of folders in library
folderCardOrder: {},   // { [folderId]: quizId[] } — order of quizzes inside each folder
```

Three new actions:

```js
setCardOrder: (ids) => update(s => ({ ...s, cardOrder: ids })),
setFolderOrder: (ids) => update(s => ({ ...s, folderOrder: ids })),
setFolderCardOrder: (folderId, ids) => update(s => ({
  ...s, folderCardOrder: { ...s.folderCardOrder, [folderId]: ids }
})),
```

**Order resolution rule:** When computing display order, start from the stored array, filter to IDs that still exist in state, then append any IDs not yet in the array. This ensures newly uploaded quizzes always appear and deletions never break the list.

## Packages

```
@dnd-kit/core
@dnd-kit/sortable
@dnd-kit/utilities
```

## Component Structure

### Library Screen (`QGLibraryScreen`)

Wrap the grid in a single `<DndContext>` with a `PointerSensor` configured with `activationConstraint: { distance: 8 }`. This threshold means a tap that doesn't move 8px fires `onClick` as normal (card flip still works), while any movement beyond 8px starts a drag.

Inside the context:
- One `<SortableContext>` with items = `[...resolvedFolderIds, ...resolvedUngroupedIds]`
- A `<DragOverlay>` that renders a floating copy of the dragged card (slight rotation, accent border, shadow)

Each `FolderCard` uses both `useSortable()` (to be reorderable) and `useDroppable()` (to accept dropped quiz cards).

Each `LibraryCard` (ungrouped) uses `useSortable()` only.

**`onDragEnd` handler:**
```
if (over.id is a folder and active.id is a quiz):
  → actions.addQuizToFolder(over.id, active.id)
  (no cardOrder update needed — ungrouped display already filters foldered quizzes)
else if position changed:
  → if active is a folder: actions.setFolderOrder(newOrder)
  → if active is a quiz:   actions.setCardOrder(newOrder)
```

### Folder Screen (`QGFolderScreen`)

Own `<DndContext>` + `<SortableContext>` for quizzes inside the folder. On `onDragEnd`, calls `actions.setFolderCardOrder(folderId, newOrder)`.

### Click vs Drag

The `PointerSensor` `distance: 8` constraint handles disambiguation naturally — existing card flip `onClick` handlers are untouched and fire on short taps.

## Visual States

| State | Visual |
|---|---|
| Card being dragged | Original card becomes a faded, dashed-border placeholder. A floating overlay (slight rotation, accent border, `box-shadow`) follows the cursor. |
| Hovering over a folder | Folder card shows accent background + glow ring + "Drop to add ↓" label. |
| Reordering between cards | Cards animate to make space (CSS transition via dnd-kit transform). A thin accent-colored insertion indicator appears between cards. |

All animations use CSS `transition: transform` — no janky repaints.

## Files Changed

| File | Change |
|---|---|
| `package.json` | Add `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| `src/store.js` | Add `cardOrder`, `folderOrder`, `folderCardOrder` defaults + 3 actions |
| `src/screens/Screens.jsx` | Wrap LibraryScreen grid and FolderScreen grid in DndContext; make cards sortable/droppable; add DragOverlay |

## Out of Scope

- Dragging quizzes **out** of a folder back to ungrouped via drag (still handled by the existing "Remove from folder" menu item)
- Touch-specific long-press delay (PointerSensor works on touch by default)
- Drag-to-delete (no drop zone for deletion)
