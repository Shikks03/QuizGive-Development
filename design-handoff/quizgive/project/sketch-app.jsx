// QuizGive Sketch — main app + routing + tweaks

const SA_R = React;
const { useState: useStateApp, useEffect: useEffectApp, useCallback: useCallbackApp } = SA_R;

function QGApp() {
  const [state, setState] = useStateApp(window.SketchData.INITIAL_STATE);
  const [route, setRoute] = useStateApp({ name: 'library' });
  const [narrow, setNarrow] = useStateApp(() => window.innerWidth < 820);
  const [drawerOpen, setDrawerOpen] = useStateApp(false);

  // Tweaks
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "sketchIntensity": "polished",
    "tiltCards": true,
    "stickyArrows": true,
    "uppercaseHeadings": false
  }/*EDITMODE-END*/;
  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  useEffectApp(() => {
    document.body.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  useEffectApp(() => {
    const onResize = () => setNarrow(window.innerWidth < 820);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffectApp(() => {
    // Apply intensity-driven tweaks
    const root = document.documentElement;
    if (t.sketchIntensity === 'loose') {
      root.style.setProperty('--shadow-marker', '4px 4px 0 0 var(--ink)');
      root.style.setProperty('--shadow-marker-sm', '3px 3px 0 0 var(--ink)');
    } else if (t.sketchIntensity === 'polished') {
      root.style.setProperty('--shadow-marker', '3px 3px 0 0 var(--ink)');
      root.style.setProperty('--shadow-marker-sm', '2px 2px 0 0 var(--ink)');
    } else if (t.sketchIntensity === 'subtle') {
      root.style.setProperty('--shadow-marker', '2px 2px 0 0 var(--ink)');
      root.style.setProperty('--shadow-marker-sm', '1.5px 1.5px 0 0 var(--ink)');
    }
    document.body.classList.toggle('no-tilt', !t.tiltCards);
    document.body.classList.toggle('no-arrows', !t.stickyArrows);
    document.body.classList.toggle('caps-headings', !!t.uppercaseHeadings);
  }, [t]);

  // Action helpers (memoized so children don't re-render needlessly)
  const actions = {
    setTheme: (theme) => setState(s => ({ ...s, theme })),
    toggleBookmark: (id) => setState(s => ({
      ...s,
      bookmarks: s.bookmarks.includes(id)
        ? s.bookmarks.filter(b => b !== id)
        : [...s.bookmarks, id],
    })),
    saveSession: (qid, session) => setState(s => ({
      ...s, sessions: { ...s.sessions, [qid]: session },
    })),
    saveResult: (qid, result) => setState(s => ({
      ...s, results: { ...s.results, [qid]: result },
    })),
    clearResult: (qid) => setState(s => {
      const r = { ...s.results }; delete r[qid];
      const ss = { ...s.sessions }; delete ss[qid];
      return { ...s, results: r, sessions: ss };
    }),
    toggleQuestionBookmark: (qid, qOrig) => setState(s => {
      const bm = s.questionBookmarks[qid] || [];
      const next = bm.includes(qOrig) ? bm.filter(x => x !== qOrig) : [...bm, qOrig];
      return { ...s, questionBookmarks: { ...s.questionBookmarks, [qid]: next } };
    }),
    createFolder: (name) => setState(s => {
      const id = 'f_' + Math.random().toString(36).slice(2, 8);
      return {
        ...s,
        folders: { ...s.folders, [id]: { id, name, quizIds: [] } },
        folderOrder: [...(s.folderOrder || []), id],
      };
    }),
    addQuizToFolder: (folderId, quizId) => setState(s => {
      const f = s.folders[folderId];
      if (!f) return s;
      if (f.quizIds.includes(quizId)) return s;
      return { ...s, folders: { ...s.folders, [folderId]: { ...f, quizIds: [...f.quizIds, quizId] } } };
    }),
    removeQuizFromFolder: (folderId, quizId) => setState(s => {
      const f = s.folders[folderId];
      if (!f) return s;
      return { ...s, folders: { ...s.folders, [folderId]: { ...f, quizIds: f.quizIds.filter(id => id !== quizId) } } };
    }),
    deleteQuiz: (id) => setState(s => {
      const qz = { ...s.quizzes }; delete qz[id];
      return { ...s, quizzes: qz };
    }),
  };

  const navigate = useCallbackApp((next) => {
    setRoute(next);
    setDrawerOpen(false);
    window.scrollTo({ top: 0 });
  }, []);
  navigate.onMenu = narrow ? () => setDrawerOpen(true) : null;

  // Render active screen
  let screen;
  if (route.name === 'library') {
    screen = <window.SketchLib.QGLibraryScreen state={state} actions={actions} navigate={navigate} />;
  } else if (route.name === 'upload') {
    screen = <window.SketchScreens.QGUploadScreen state={state} actions={actions} navigate={navigate} />;
  } else if (route.name === 'preview') {
    screen = <window.SketchScreens.QGPreviewScreen state={state} actions={actions} navigate={navigate} quizId={route.quizId} />;
  } else if (route.name === 'ready') {
    screen = <window.SketchScreens.QGReadyScreen state={state} actions={actions} navigate={navigate} quizId={route.quizId} />;
  } else if (route.name === 'quiz') {
    screen = <window.SketchQuiz.QGQuizScreen state={state} actions={actions} navigate={navigate} quizId={route.quizId} />;
  } else if (route.name === 'results') {
    screen = <window.SketchQuiz.QGResultsScreen state={state} actions={actions} navigate={navigate} quizId={route.quizId} />;
  } else if (route.name === 'folder') {
    screen = <window.SketchLib.QGFolderScreen state={state} actions={actions} navigate={navigate} folderId={route.folderId} />;
  } else {
    screen = <div className="qg-empty">Unknown route.</div>;
  }

  const hasOwnTopbar = route.name === 'quiz' || route.name === 'results';
  // All other screens have their own hero — skip the redundant topbar.
  const skipTopbar = !hasOwnTopbar;
  const showSidebar = !narrow;
  const showDrawer = narrow && drawerOpen;

  let topbar = null;
  if (!hasOwnTopbar && narrow) {
    // Mobile-only thin chrome for the menu button.
    topbar = (
      <window.SketchShell.QGTopbar
        onMenu={() => setDrawerOpen(true)}
        title=""
        subtitle=""
      />
    );
  }

  const Tweaks = <SketchTweaks t={t} setTweak={setTweak} />;

  return (
    <>
      <div className={`qg-app ${showSidebar ? '' : 'no-sidebar'}`}>
        {showSidebar && (
          <window.SketchShell.QGSidebar state={state} actions={actions} route={route} navigate={navigate} />
        )}
        {showDrawer && (
          <>
            <div className="qg-scrim" onClick={() => setDrawerOpen(false)} />
            <window.SketchShell.QGSidebar state={state} actions={actions} route={route} navigate={navigate} onClose={() => setDrawerOpen(false)} />
          </>
        )}
        <main className="qg-main">
          {topbar}
          {screen}
        </main>
      </div>
      {Tweaks}
    </>
  );
}

function SketchTweaks({ t, setTweak }) {
  const { TweaksPanel, TweakSection, TweakRadio, TweakToggle } = window;
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Sketch intensity">
        <TweakRadio
          label="Intensity"
          value={t.sketchIntensity}
          onChange={(v) => setTweak('sketchIntensity', v)}
          options={[
            { label: 'Subtle', value: 'subtle' },
            { label: 'Polished', value: 'polished' },
            { label: 'Loose', value: 'loose' },
          ]}
        />
      </TweakSection>
      <TweakSection label="Decoration">
        <TweakToggle label="Tilt cards" value={t.tiltCards} onChange={(v) => setTweak('tiltCards', v)} />
        <TweakToggle label="Hand-drawn arrows" value={t.stickyArrows} onChange={(v) => setTweak('stickyArrows', v)} />
        <TweakToggle label="UPPERCASE headings" value={t.uppercaseHeadings} onChange={(v) => setTweak('uppercaseHeadings', v)} />
      </TweakSection>
    </TweaksPanel>
  );
}

window.QGSketchApp = QGApp;
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<QGApp />);
