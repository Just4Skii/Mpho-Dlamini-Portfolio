import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/base.css';

function getBasename(): string {
  if (typeof window === 'undefined') return '/';
  const pathname = window.location.pathname;
  const match = pathname.match(/^(\/[^\/]+)/);
  if (match && match[1] && !match[1].startsWith('/work')) {
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
