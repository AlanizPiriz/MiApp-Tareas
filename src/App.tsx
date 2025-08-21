// App.tsx
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { db, messaging, getToken, onMessage } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import Home from './components/Home';
import TaskPage from './components/Task';
import HistorialPage from './components/HistorialPage';

import LoginPage from './Auth/LoginPage';
import RegisterPage from './Auth/RegisterPage';

import { AuthProvider, useAuth } from './components/AuthContext';

import PublicListPage from './components/PublicListPage';

const AppRouter = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/public/:publicId" element={<PublicListPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/areas" replace />} />
      <Route path="/areas" element={<Home />} />
      <Route path="/listas/:listId" element={<TaskPage />} />
      <Route path="/historial" element={<HistorialPage />} />
      <Route path="*" element={<Navigate to="/areas" replace />} />
    </Routes>
  );
};

const App = () => {
  useEffect(() => {
    const isIphone = /iPhone/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isIphone && !isStandalone) {
      alert('⚠️ Para recibir notificaciones, debes agregar esta app a tu pantalla de inicio desde Safari.');
    }

    if ('Notification' in window && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then(async (registration) => {
          console.log('✅ Service Worker registrado:', registration);

          if (Notification.permission === 'denied') {
            alert('🚫 Las notificaciones están bloqueadas. Activá permisos en Ajustes > Safari > Notificaciones.');
            return;
          }

          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            try {
              const token = await getToken(messaging, {
                vapidKey: 'BCJiJWTD4ue9P_FVzgOXd-9JanjJGqb3awfm9NYx1GuDgT41rJzS6TiIj4qIGAwp9j6IPfIveOw30PFD5AH7k3E',
                serviceWorkerRegistration: registration,
              });

              if (token) {
                console.log('🔐 Token obtenido:', token);

                const docRef = doc(db, 'tokens', token);
                const existing = await getDoc(docRef);

                if (!existing.exists()) {
                  await setDoc(docRef, {
                    token,
                    createdAt: new Date(),
                    platform: isIphone ? 'ios' : 'web',
                  });
                  console.log('✅ Token guardado en Firestore');
                } else {
                  console.log('ℹ️ Token ya existe en Firestore');
                }
              } else {
                console.warn('⚠️ No se pudo obtener token FCM');
              }
            } catch (err) {
              console.error('❌ Error obteniendo token:', err);
            }
          }

          onMessage(messaging, (payload) => {
            console.log('📩 Mensaje recibido:', payload);
            alert(`🔔 Notificación: ${payload.notification?.title}`);
          });
        })
        .catch((err) => {
          console.error('❌ Error al registrar SW:', err);
        });
    } else {
      console.warn('🔕 Service Worker o Notification API no soportada');
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppRouter />
      </Router>
    </AuthProvider>
  );
};

export default App;
