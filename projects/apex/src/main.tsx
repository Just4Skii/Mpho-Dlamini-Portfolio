import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

function getAppBasename(): string {
  if (typeof window === 'undefined') return '/work/apex';
  const pathname = window.location.pathname;
  const match = pathname.match(/^(.*\/work\/apex)/i);
  if (match && match[1]) {
    return match[1];
  }
  return '/work/apex';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={getAppBasename()}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
