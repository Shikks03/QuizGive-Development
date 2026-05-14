/* global React, ReactDOM */
// QuizGive — App root + routing.

function QGApp() {
  const [state, actions] = window.useQGStore();
  const [route, setRoute] = React.useState({ name: 'library' });
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [narrow, setNarrow] = React.useState(() => window.innerWidth < 760);

  // apply dark mode + theme color to body
  React.useEffect(() => {
    document.body.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  React.useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 760);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const navigate = React.useCallback((next) => {
    setRoute(next);
    setDrawerOpen(false);
    window.scrollTo({ top: 0 });
  }, []);
  // attach drawer-open hook so child screens can put a menu button in their topbar
  navigate.onMenu = narrow ? () => setDrawerOpen(true) : null;

  // ── sample quiz lookup (preloaded by index.html if available) ───
  const sample = window.__QG_SAMPLE__;

  // ── render the active screen ────────────────────────────────────
  let screen;
  if (route.name === 'library') {
    screen = <window.QGLibraryScreen state={state} actions={actions} navigate={navigate} />;
  } else if (route.name === 'upload') {
    screen = <window.QGUploadScreen state={state} actions={actions} navigate={navigate} sample={sample} />;
  } else if (route.name === 'preview') {
    screen = <window.QGPreviewScreen state={state} actions={actions} navigate={navigate} quizId={route.quizId} />;
  } else if (route.name === 'ready') {
    screen = <window.QGReadyScreen state={state} actions={actions} navigate={navigate} quizId={route.quizId} />;
  } else if (route.name === 'quiz') {
    screen = <window.QGQuizScreen state={state} actions={actions} navigate={navigate} quizId={route.quizId} />;
  } else if (route.name === 'results') {
    screen = <window.QGResultsScreen state={state} actions={actions} navigate={navigate} quizId={route.quizId} />;
  } else {
    screen = <div className="qg-empty">Unknown route.</div>;
  }

  // Quiz + results have their own topbar. Other screens get a default one.
  const hasOwnTopbar = route.name === 'quiz' || route.name === 'results';

  const showSidebar = !narrow;
  const showDrawer = narrow && drawerOpen;

  // ── topbar (for non-quiz screens) ───────────────────────────────
  let topbar = null;
  if (!hasOwnTopbar) {
    let title = '', subtitle = '';
    if (route.name === 'library') { title = 'Library'; }
    else if (route.name === 'upload') { title = 'New quiz'; subtitle = 'Upload your quizfetch file'; }
    else if (route.name === 'preview') { title = 'Preview & configure'; }
    else if (route.name === 'ready') { title = 'Quiz ready'; }

    topbar = (
      <window.QGTopbar
        onMenu={narrow ? () => setDrawerOpen(true) : null}
        title={title}
        subtitle={subtitle}
      />
    );
  }

  return (
    <div className={`qg-app ${showSidebar ? '' : 'no-sidebar'}`}>
      {showSidebar && (
        <window.QGSidebar state={state} actions={actions} route={route} navigate={navigate} />
      )}

      {showDrawer && (
        <>
          <div className="qg-scrim" onClick={() => setDrawerOpen(false)} />
          <window.QGSidebar state={state} actions={actions} route={route} navigate={navigate} onClose={() => setDrawerOpen(false)} />
        </>
      )}

      <main className="qg-main">
        {topbar}
        {screen}
      </main>
    </div>
  );
}

window.QGApp = QGApp;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<QGApp />);
