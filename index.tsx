import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/* The router sits above App, not inside it: App itself navigates on logout, and the
        shells below it each mount their own <Routes>. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);