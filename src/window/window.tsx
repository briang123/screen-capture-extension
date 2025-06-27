import React from 'react';
import { createRoot } from 'react-dom/client';
import Editor from './Editor';
import './window.css';

// TODO: Add error boundary for better error handling
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Editor />
    </React.StrictMode>
  );
}
