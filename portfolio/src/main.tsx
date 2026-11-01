import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/base.css';

function getBasename(): string {
  if (typeof window === 'undefined') return '/';
  const pathname = window.location.pathname;
  // Only the first segment can be a repository prefix (GitHub project pages).
  // Known in-app routes are never prefixes — otherwise a deep link such as
  // /avatar-preview would render the homepage at base "/avatar-preview".
  const APP_ROUTES = new Set(['work', 'avatar-preview']);
  const match = pathname.match(/^(\/[^\/]+)/);
  if (match && match[1] && !APP_ROUTES.has(match[1].slice(1))) {
    return match[1];
  }
  return '/';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={getBasename()}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
