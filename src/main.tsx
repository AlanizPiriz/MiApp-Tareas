//import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App';
import './styles.css'
import { AuthProvider } from './components/AuthContext';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
    <App></App>
    </AuthProvider>
  </StrictMode>,
)
   

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(function(registration) {
      console.log('Service Worker registrado con éxito:', registration);
    }).catch(function(err) {
      console.log('Error al registrar el Service Worker:', err);
    });
}
