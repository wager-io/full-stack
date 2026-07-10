import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// Deployment Verification
const BUILD_TIMESTAMP = new Date().toISOString();
console.log(`%c Frontend Build: ${BUILD_TIMESTAMP}`, 'background: #222; color: #bada55; padding: 4px; border-radius: 4px;');
window.FRONTEND_VERSION = BUILD_TIMESTAMP;

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);

