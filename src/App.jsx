import { useState, useEffect, useCallback } from 'react';
import { useQGStore } from './store.js';
import { QGSidebar, QGTopbar } from './components/Shell.jsx';
import { QGLibraryScreen, QGUploadScreen, QGPreviewScreen, QGReadyScreen, QGFolderScreen } from './screens/Screens.jsx';
import { QGQuizScreen, QGResultsScreen } from './screens/Quiz.jsx';
import { QGAuthScreen } from './screens/Auth.jsx';

function QGSplashScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="qg-muted" style={{ fontSize: 14 }}>Loading…</div>
    </div>
  );
}

function QGMain({ state, actions, auth }) {
  const [route, setRoute] = useState({ name: 'library' });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [narrow, setNarrow] = useState(() => window.innerWidth < 760);
  const [sample, setSample] = useState(null);

  useEffect(() => {
    const fontClass = state.font && state.font !== 'sketch' ? ` font-${state.font}` : '';
    document.body.className = state.theme + fontClass;
  }, [state.theme, state.font]);

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 760);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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

  let screen;
  if (route.name === 'library') {
    screen = <QGLibraryScreen state={state} actions={actions} navigate={navigate} />;
  } else if (route.name === 'upload') {
    screen = <QGUploadScreen state={state} actions={actions} navigate={navigate} sample={sample} />;
  } else if (route.name === 'preview') {
    screen = <QGPreviewScreen state={state} actions={actions} navigate={navigate} quizId={route.quizId} pendingQuiz={route.pendingQuiz} />;
  } else if (route.name === 'ready') {
    screen = <QGReadyScreen state={state} actions={actions} navigate={navigate} quizId={route.quizId} />;
  } else if (route.name === 'quiz') {
    screen = <QGQuizScreen state={state} actions={actions} navigate={navigate} quizId={route.quizId} />;
  } else if (route.name === 'results') {
    screen = <QGResultsScreen state={state} actions={actions} navigate={navigate} quizId={route.quizId} />;
  } else if (route.name === 'folder') {
    screen = <QGFolderScreen state={state} actions={actions} navigate={navigate} folderId={route.folderId} />;
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
    else if (route.name === 'folder') { title = state.folders?.[route.folderId]?.name || 'Folder'; }

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
        <QGSidebar state={state} actions={actions} auth={auth} route={route} navigate={navigate} />
      )}
      {showDrawer && (
        <>
          <div className="qg-scrim" onClick={() => setDrawerOpen(false)} />
          <QGSidebar state={state} actions={actions} auth={auth} route={route} navigate={navigate} onClose={() => setDrawerOpen(false)} />
        </>
      )}
      <main className="qg-main">
        {topbar}
        {screen}
      </main>
    </div>
  );
}

export default function QGApp() {
  const [state, actions, auth] = useQGStore();

  if (auth.status === 'loading') return <QGSplashScreen />;
  if (auth.status === 'unauthenticated') return <QGAuthScreen />;
  return <QGMain state={state} actions={actions} auth={auth} />;
}
