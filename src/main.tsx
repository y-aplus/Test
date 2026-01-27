import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

console.log('Starting application...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('FATAL: Root element with id "root" not found in document.');
} else {
  console.log('Root element found. Mounting React app...');
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    console.log('React app mount command issued.');
  } catch (err) {
    console.error('FATAL: Failed to mount React app:', err);
  }
}
