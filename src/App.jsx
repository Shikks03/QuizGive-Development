import { useState, useEffect, useCallback } from 'react';
import { useQGStore } from './store.js';
import { QGSidebar, QGTopbar } from './components/Shell.jsx';
import { QGLibraryScreen, QGUploadScreen, QGPreviewScreen, QGReadyScreen } from './screens/Screens.jsx';
import { QGQuizScreen, QGResultsScreen } from './screens/Quiz.jsx';

export default function QGApp() {
  const [state, actions] = useQGStore();
  const [route, setRoute] = useState({ name: 'library' });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [narrow, setNarrow] = useState(() => window.innerWidth < 760);
  const [sample, setSample] = useState(null);

  // apply dark mode to body
  useEffect(() => {
    document.body.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 760);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // fetch sample quiz on startup
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/sample-quizfetch.html');
        if (r.ok) {
          const html = await r.text();
          setSample({ name: 'sample-quizfetch.html', html });
        }
      } catch {}
    })();
  }, []);

  const navigate = useCallback((next) => {
    setRoute(next);
    setDrawerOpen(false);
    window.scrollTo({ top: 0 });
  }, []);
  navigate.onMenu = narrow ? () => setDrawerOpen(true) : null;

  // ── render the active screen ────────────────────────────────────
  let screen;
  if (route.name === 'library') {
    screen = <QGLibraryScreen state={state} actions={actions} navigate={navigate} />;
  } else if (route.name === 'upload') {
    screen = <QGUploadScreen state={state} actions={actions} navigate={navigate} sample={sample} />;
  } else if (route.name === 'preview') {
    screen = <QGPreviewScreen state={state} actions={actions} navigate={navigate} quizId={route.quizId} />;
  } else if (route.name === 'ready') {
    screen = <QGReadyScreen state={state} actions={actions} navigate={navigate} quizId={route.quizId} />;
  } else if (route.name === 'quiz') {
    screen = <QGQuizScreen state={state} actions={actions} navigate={navigate} quizId={route.quizId} />;
  } else if (route.name === 'results') {
    screen = <QGResultsScreen state={state} actions={actions} navigate={navigate} quizId={route.quizId} />;
  } else {
    screen = <div className="qg-empty">Unknown route.</div>;
  }

  const hasOwnTopbar = route.name === 'quiz' || route.name === 'results';

  const showSidebar = !narrow;
  const showDrawer = narrow && drawerOpen;

  let topbar = null;
  if (!hasOwnTopbar) {
    let title = '', subtitle = '';
    if (route.name === 'library') { title = 'Library'; }
    else if (route.name === 'upload') { title = 'New quiz'; subtitle = 'Upload your quizfetch file'; }
    else if (route.name === 'preview') { title = 'Preview & configure'; }
    else if (route.name === 'ready') { title = 'Quiz ready'; }

    topbar = (
      <QGTopbar
        onMenu={narrow ? () => setDrawerOpen(true) : null}
        title={title}
        subtitle={subtitle}
      />
    );
  }

  return (
    <div className={`qg-app ${showSidebar ? '' : 'no-sidebar'}`}>
      {showSidebar && (
        <QGSidebar state={state} actions={actions} route={route} navigate={navigate} />
      )}

      {showDrawer && (
        <>
          <div className="qg-scrim" onClick={() => setDrawerOpen(false)} />
          <QGSidebar state={state} actions={actions} route={route} navigate={navigate} onClose={() => setDrawerOpen(false)} />
        </>
      )}

      <main className="qg-main">
        {topbar}
        {screen}
      </main>
    </div>
  );
}
