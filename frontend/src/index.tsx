import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log('index.tsx: Script loaded');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('index.tsx: Could not find root element to mount to');
  throw new Error("Could not find root element to mount to");
}

console.log('index.tsx: Found root element, creating React root.');
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
console.log('index.tsx: React app rendered.');