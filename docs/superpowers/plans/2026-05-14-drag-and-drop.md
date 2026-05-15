# Drag-and-Drop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add drag-and-drop to the QuizGive library so quiz cards can be dragged onto folders (to add them) and reordered within the grid and inside folder views, with order persisted to localStorage.

**Architecture:** Use `@dnd-kit/core` + `@dnd-kit/sortable` for sortable grids with a `PointerSensor` (`distance: 8` threshold) so clicks still fire normally. The library grid wraps both folder cards and quiz cards in a single `DndContext` + `SortableContext`; folder cards are also droppable targets. The folder screen gets its own `DndContext`. Order state lives in three new store fields.

**Tech Stack:** React 18, Vite 5, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities — no other new dependencies.

---

## File Map

| File | What changes |
|---|---|
| `package.json` | Add `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| `src/store.js` | Add `cardOrder`, `folderOrder`, `folderCardOrder` defaults; add 3 actions; export `resolveOrder` helper |
| `src/screens/Screens.jsx` | Replace sorted arrays with `resolveOrder`; add `DndContext`/`SortableContext` to library grid; add `useSortable` to `LibraryCard` and `FolderCard`; add `DragOverlay`; add `DndContext`/`SortableContext` to folder screen |

---

## Task 1: Install @dnd-kit packages

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the packages**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Step 2: Verify the build still passes**

```bash
npm run build
```

Expected: exits 0, no errors. If you see peer dependency warnings about React version, they are safe to ignore — dnd-kit supports React 18.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add @dnd-kit dependencies for drag-and-drop"
```

---

## Task 2: Add store state, actions, and resolveOrder helper

**Files:**
- Modify: `src/store.js`

### Background

`resolveOrder(order, availableIds)` is the core utility. It takes a stored array of IDs (possibly stale) and a current array of valid IDs, and returns a merged array: stored IDs that still exist come first in their stored order, then any new IDs not yet in the stored array are appended. This ensures newly added quizzes always appear and deletions never break the list.

- [ ] **Step 1: Add `resolveOrder` export above `useQGStore`**

In `src/store.js`, insert this function before the `export function useQGStore()` line:

```js
export function resolveOrder(order, availableIds) {
  const idSet = new Set(availableIds);
  const known = order.filter(id => idSet.has(id));
  const knownSet = new Set(known);
  const novel = availableIds.filter(id => !knownSet.has(id));
  return [...known, ...novel];
}
```

- [ ] **Step 2: Add new fields to `QG_DEFAULTS`**

In `src/store.js`, the `QG_DEFAULTS` object currently ends with `folders: {}`. Add three fields after it:

```js
const QG_DEFAULTS = {
  user: { name: 'You', initials: 'YO' },
  theme: 'light',
  quizzes: {},
  sessions: {},
  results: {},
  bookmarks: [],
  questionBookmarks: {},
  recentQuizId: null,
  ranOnboarding: false,
  folders: {},
  cardOrder: [],
  folderOrder: [],
  folderCardOrder: {},
};
```

- [ ] **Step 3: Add three new actions inside `useMemo`**

In `src/store.js`, the `actions` useMemo ends with the `removeQuizFromFolder` action. Add three more actions after it, before the closing `}), [update])`:

```js
    setCardOrder: (ids) => update(s => ({ ...s, cardOrder: ids })),
    setFolderOrder: (ids) => update(s => ({ ...s, folderOrder: ids })),
    setFolderCardOrder: (folderId, ids) => update(s => ({
      ...s, folderCardOrder: { ...s.folderCardOrder, [folderId]: ids },
    })),
```

- [ ] **Step 4: Verify the dev server starts without errors**

```bash
npm run dev
```

Open `http://localhost:5173`. The library should display exactly as before. Open DevTools console — no errors. If you already had quizzes saved, they should still appear.

- [ ] **Step 5: Commit**

```bash
git add src/store.js
git commit -m "feat: add cardOrder/folderOrder/folderCardOrder state and resolveOrder helper"
```

---

## Task 3: Use resolveOrder for library display order

**Files:**
- Modify: `src/screens/Screens.jsx`

This task wires `resolveOrder` into the library display so folder and quiz cards appear in the stored order. No drag-and-drop yet — the UI should look identical to before. This is a safe checkpoint.

- [ ] **Step 1: Import `resolveOrder` at the top of Screens.jsx**

At the top of `src/screens/Screens.jsx`, the store import currently reads:

```js
import { QGHelpers } from '../store.js';
```

Change it to:

```js
import { QGHelpers, resolveOrder } from '../store.js';
```

- [ ] **Step 2: Replace the folder/ungrouped computation in `QGLibraryScreen`**

In `QGLibraryScreen`, find this block (around line 30):

```js
  const folders = Object.values(state.folders || {}).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const folderedIds = new Set(folders.flatMap(f => f.quizIds));
  const ungrouped = sorted.filter(q => !folderedIds.has(q.id));
```

Replace it with:

```js
  const folderedIds = new Set(
    Object.values(state.folders || {}).flatMap(f => f.quizIds)
  );
  const allFolderIds = Object.keys(state.folders || {});
  const folderIds = resolveOrder(state.folderOrder, allFolderIds);
  const folders = folderIds.map(id => state.folders[id]).filter(Boolean);

  const allUngroupedIds = Object.values(state.quizzes)
    .filter(q => !folderedIds.has(q.id))
    .map(q => q.id);
  const ungroupedIds = resolveOrder(state.cardOrder, allUngroupedIds);
  const ungrouped = ungroupedIds.map(id => state.quizzes[id]).filter(Boolean);
```

- [ ] **Step 3: Update the grid render to use the new arrays**

In `QGLibraryScreen`'s return, find the grid section:

```jsx
        <div className="qg-lib-grid">
          {folders.map(f => (
            <FolderCard key={f.id} folder={f} state={state} actions={actions} navigate={navigate} />
          ))}
          {ungrouped.map((q) => (
            <LibraryCard
              key={q.id}
              quiz={q}
              state={state}
              actions={actions}
              navigate={navigate}
              activeCardId={activeCardId}
              setActiveCardId={setActiveCardId}
            />
          ))}
```

This already uses `folders` and `ungrouped` — no change needed here. The arrays are just computed differently now.

- [ ] **Step 4: Verify display is unchanged**

```bash
npm run dev
```

Open `http://localhost:5173`. The library should look exactly the same as before. If you have quizzes/folders, they appear. No console errors.

- [ ] **Step 5: Commit**

```bash
git add src/screens/Screens.jsx
git commit -m "feat: use resolveOrder for library grid display order"
```

---

## Task 4: Add DnD to the library grid

**Files:**
- Modify: `src/screens/Screens.jsx`

This task adds full drag-and-drop to the library: quiz cards and folder cards are sortable, and folder cards are drop targets. A `DragOverlay` shows a polished floating copy while dragging.

### How it works

- `DndContext` wraps the whole grid. It owns the sensors and event handlers.
- `SortableContext` receives a flat ordered list of all IDs (folders first, then ungrouped quizzes).
- `FolderCard` and `LibraryCard` each call `useSortable({ id })` to get drag/drop props.
- `onDragEnd`: if the dropped target is a folder and the dragged item is a quiz → `addQuizToFolder`. Otherwise → update the appropriate order array via `arrayMove`.
- `DragOverlay` renders outside the normal DOM flow — it shows a floating copy of the dragged card.

- [ ] **Step 1: Add dnd-kit imports at the top of Screens.jsx**

At the top of `src/screens/Screens.jsx`, after the existing imports, add:

```js
import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors, closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable,
  rectSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
```

- [ ] **Step 2: Add `DragCard` component (floating overlay)**

Add this new component anywhere in `Screens.jsx` before `QGLibraryScreen`:

```jsx
function DragCard({ id, state }) {
  const quiz = state.quizzes?.[id];
  const folder = state.folders?.[id];
  const style = {
    transform: 'rotate(1.5deg)',
    boxShadow: '0 8px 24px rgba(108,99,255,0.25)',
    border: '2px solid var(--accent)',
    opacity: 0.95,
    pointerEvents: 'none',
  };
  if (folder) {
    return (
      <div className="qg-lib-card" style={style}>
        <div className="title"><Folder size={14} style={{ display: 'inline', marginRight: 6 }} />{folder.name}</div>
        <div className="meta">{(folder.quizIds || []).length} quiz{(folder.quizIds || []).length !== 1 ? 'zes' : ''}</div>
      </div>
    );
  }
  if (quiz) {
    return (
      <div className="qg-lib-card" style={style}>
        <div className="title">{quiz.title.replace(/^\[.+?\]\s*/, '')}</div>
        <div className="meta">{quiz.questions.length} questions</div>
      </div>
    );
  }
  return null;
}
```

- [ ] **Step 3: Update `QGLibraryScreen` — add activeId state and sensors**

Inside `QGLibraryScreen`, after the existing `useState` declarations, add:

```jsx
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );
```

- [ ] **Step 4: Add `handleDragStart` and `handleDragEnd` in `QGLibraryScreen`**

Add these two functions inside `QGLibraryScreen`, after the `handleCreateFolder` function:

```jsx
  const sortableIds = [...folderIds, ...ungroupedIds];

  function handleDragStart({ active }) {
    setActiveId(active.id);
  }

  function handleDragEnd({ active, over }) {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const isFolderItem = id => (state.folders || {})[id] !== undefined;

    if (isFolderItem(over.id) && !isFolderItem(active.id)) {
      actions.addQuizToFolder(over.id, active.id);
      return;
    }

    const oldIndex = sortableIds.indexOf(active.id);
    const newIndex = sortableIds.indexOf(over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(sortableIds, oldIndex, newIndex);

    actions.setFolderOrder(newOrder.filter(id => isFolderItem(id)));
    actions.setCardOrder(newOrder.filter(id => !isFolderItem(id)));
  }
```

- [ ] **Step 5: Wrap the library grid in `DndContext` + `SortableContext`**

In `QGLibraryScreen`'s return, find the `<div className="qg-lib-grid">` section. Replace the entire grid block (from the outer `<div className="qg-lib-grid">` to its closing `</div>`) with:

```jsx
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
            <div className="qg-lib-grid">
              {folders.map(f => (
                <FolderCard
                  key={f.id}
                  folder={f}
                  state={state}
                  actions={actions}
                  navigate={navigate}
                  activeId={activeId}
                />
              ))}
              {ungrouped.map((q) => (
                <LibraryCard
                  key={q.id}
                  quiz={q}
                  state={state}
                  actions={actions}
                  navigate={navigate}
                  activeCardId={activeCardId}
                  setActiveCardId={setActiveCardId}
                />
              ))}
              <div className="qg-lib-card empty" onClick={(e) => { e.stopPropagation(); navigate({ name: 'upload' }); }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}><Plus size={22} /></div>
                <div className="qg-muted">Upload or paste another</div>
              </div>
            </div>
          </SortableContext>
          <DragOverlay>
            {activeId ? <DragCard id={activeId} state={state} /> : null}
          </DragOverlay>
        </DndContext>
```

- [ ] **Step 6: Add `useSortable` to `LibraryCard`**

In `LibraryCard`, add `useSortable` at the top of the function body (after the existing `useState`/`useRef`/`useEffect` hooks):

```jsx
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: quiz.id });

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 0 : undefined,
  };
```

Then update the outermost `<div>` of `LibraryCard`'s return to attach the ref, style, and listeners:

```jsx
    <div
      ref={setNodeRef}
      style={dragStyle}
      {...attributes}
      {...listeners}
      className={`qg-flip-card${isFlipped ? ' is-flipped' : ''}`}
      onClick={(e) => { e.stopPropagation(); setActiveCardId(quiz.id); }}
    >
```

- [ ] **Step 7: Add `useSortable` and drop-highlight to `FolderCard`**

`FolderCard` now accepts an `activeId` prop so it can tell when a quiz (not a folder) is hovering over it.

At the top of `FolderCard`'s function body, add:

```jsx
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging, isOver,
  } = useSortable({ id: folder.id });

  const isQuizHovering = isOver && activeId && !(state.folders || {})[activeId];

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };
```

Update `FolderCard`'s outermost `<div>` (the `.qg-folder-stack`) to attach ref, style, listeners:

```jsx
    <div
      ref={setNodeRef}
      style={dragStyle}
      {...attributes}
      {...listeners}
      className="qg-folder-stack"
      onClick={() => { if (!menuOpen && !renaming) navigate({ name: 'folder', folderId: folder.id }); }}
    >
```

Update the `.qg-folder-main` div inside `FolderCard` to show the drop highlight when `isQuizHovering`:

```jsx
      <div
        className="qg-lib-card qg-folder-main"
        style={isQuizHovering ? {
          background: 'var(--accent-tint, #ece9ff)',
          borderColor: 'var(--accent)',
          boxShadow: '0 0 0 3px rgba(108,99,255,0.18)',
        } : undefined}
      >
        {isQuizHovering && (
          <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>
            Drop to add ↓
          </div>
        )}
```

The `isQuizHovering` label goes at the very top of `.qg-folder-main`'s content, before the existing row with the folder icon and name.

- [ ] **Step 8: Verify library drag-and-drop works**

```bash
npm run dev
```

Open `http://localhost:5173`, go to Library. With at least 2 quizzes and 1 folder:

1. Drag a quiz card to a new position — cards shift, order updates, refresh the page and the order persists.
2. Drag a quiz card onto a folder card — folder highlights with "Drop to add ↓", releasing moves the quiz into the folder (it disappears from the main grid).
3. Drag a folder card to a new position — folders reorder.
4. Click a card (without dragging) — the flip animation still works.
5. Click the ··· menu on a card — menu opens normally.

- [ ] **Step 9: Commit**

```bash
git add src/screens/Screens.jsx
git commit -m "feat: add drag-and-drop to library grid with folder drop targets"
```

---

## Task 5: Add DnD to the folder screen

**Files:**
- Modify: `src/screens/Screens.jsx`

This task makes cards reorderable inside a folder view (`QGFolderScreen`). Order persists per-folder in `folderCardOrder`.

- [ ] **Step 1: Update `QGFolderScreen` to compute ordered quiz list**

In `QGFolderScreen`, find the current quiz list computation:

```js
  const quizzes = (folder.quizIds || []).map(id => state.quizzes[id]).filter(Boolean);
```

Replace it with:

```js
  const availableQuizIds = (folder.quizIds || []).filter(id => state.quizzes[id]);
  const orderedQuizIds = resolveOrder(state.folderCardOrder?.[folderId] || [], availableQuizIds);
  const quizzes = orderedQuizIds.map(id => state.quizzes[id]).filter(Boolean);
```

- [ ] **Step 2: Add state and sensors inside `QGFolderScreen`**

At the top of `QGFolderScreen`'s function body, before the early return, add:

```jsx
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragEnd({ active, over }) {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = orderedQuizIds.indexOf(active.id);
    const newIndex = orderedQuizIds.indexOf(over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    actions.setFolderCardOrder(folderId, arrayMove(orderedQuizIds, oldIndex, newIndex));
  }
```

- [ ] **Step 3: Wrap the folder grid in `DndContext` + `SortableContext`**

In `QGFolderScreen`'s return, find the grid inside the non-empty branch:

```jsx
          <div className="qg-lib-grid">
            {quizzes.map((q) => (
              <LibraryCard key={q.id} quiz={q} state={state} actions={actions} navigate={navigate}
                activeCardId={activeCardId} setActiveCardId={setActiveCardId} folderId={folderId} />
            ))}
          </div>
```

Replace it with:

```jsx
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={({ active }) => setActiveId(active.id)}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={orderedQuizIds} strategy={rectSortingStrategy}>
              <div className="qg-lib-grid">
                {quizzes.map((q) => (
                  <LibraryCard
                    key={q.id}
                    quiz={q}
                    state={state}
                    actions={actions}
                    navigate={navigate}
                    activeCardId={activeCardId}
                    setActiveCardId={setActiveCardId}
                    folderId={folderId}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeId ? <DragCard id={activeId} state={state} /> : null}
            </DragOverlay>
          </DndContext>
```

- [ ] **Step 4: Verify folder screen drag-and-drop works**

```bash
npm run dev
```

Open a folder with at least 2 quizzes. Drag a quiz card to a new position — the cards shift and the order persists after refreshing the page. Clicking cards still flips them.

- [ ] **Step 5: Commit**

```bash
git add src/screens/Screens.jsx
git commit -m "feat: add drag-to-reorder inside folder view"
```

---

## Self-Review Notes

- **resolveOrder** is exported from store.js (Task 2) and imported in Screens.jsx (Task 3) — consistent.
- **arrayMove** is from `@dnd-kit/sortable` — imported in Task 4 Step 1 and used in Tasks 4 & 5 — consistent.
- **activeId** prop is passed from `QGLibraryScreen` → `FolderCard` (Task 4 Step 5 & 7) — `FolderCard` signature updated to accept it (Task 4 Step 7).
- **DragCard** uses `state.quizzes?.[id]` and `state.folders?.[id]` — both are present in state throughout.
- **`orderedQuizIds`** is declared in Task 5 Step 1 and used in `handleDragEnd` (Step 2) and `SortableContext items` (Step 3) — all within the same component scope.
- Spec requirement "drag quiz onto folder" → covered by Task 4.
- Spec requirement "reorder library grid" → covered by Task 4.
- Spec requirement "reorder inside folder" → covered by Task 5.
- Spec requirement "order persists to localStorage" → covered by Task 2 (store fields) + Task 3 (resolveOrder).
- Spec requirement "`distance: 8` so clicks still work" → covered by Task 4 Step 3 and Task 5 Step 2.
- Spec requirement "DragOverlay floating copy" → covered by Task 4 Step 2 (`DragCard`) and wired in Tasks 4 & 5.
- Spec requirement "folder drop highlight + Drop to add label" → covered by Task 4 Step 7.
