import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

function getAppBasename(): string {
  if (typeof window === 'undefined') return '/work/klarrow';
  const pathname = window.location.pathname;
  const match = pathname.match(/^(.*\/work\/klarrow)/i);
  if (match && match[1]) {
    return match[1];
  }
  return '/work/klarrow';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={getAppBasename()}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
