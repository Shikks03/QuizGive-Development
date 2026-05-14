import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './qg.css';
import QGApp from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QGApp />
  </StrictMode>
);
