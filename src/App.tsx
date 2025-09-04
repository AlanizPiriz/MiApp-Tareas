// App.tsx
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { db, messaging, getToken, onMessage } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import Home from './components/Home';
import TaskPage from './components/Task';
import HistorialPage from './components/HistorialPage';

import LoginPage from './Auth/LoginPage';
import RegisterPage from './Auth/RegisterPage';

import { AuthProvider, useAuth } from './components/AuthContext';
import PublicListPage from './components/PublicListPage';
import ThemeToggle from './components/ThemeToggle';
import LogoutButton from './components/LogoutButton';

const RedirectCompartir = () => {
  const location = useLocation();
  const publicId = location.pathname.split('/').pop();
  return <Navigate to={`/public/${publicId}`} replace />;
};

const AppRouter = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Cargando autenticación...</p>;
  }

  return (
    <Routes>
      {/* Redirección de /compartir/:publicId hacia /public/:publicId */}
      <Route path="/compartir/:publicId" element={<RedirectCompartir />} />

      {/* Rutas públicas (sin login) */}
      {!user ? (
        <>
          <Route path="/public/:publicId" element={<PublicListPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        // Rutas protegidas (con usuario logueado)
        <>
          <Route path="/" element={<Navigate to="/areas" replace />} />
          <Route path="/areas" element={<Home />} />
          <Route path="/listas/:listId" element={<TaskPage />} />
          <Route path="/historial" element={<HistorialPage />} />
          <Route path="/public/:publicId" element={<PublicListPage />} />
          <Route path="*" element={<Navigate to="/areas" replace />} />
        </>
      )}
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
                vapidKey: 'BMUOJzg321RJBVial4BaBgdAInbPcJijwap24wQZtY8BYTaloBIJ3qj2p61f6eNZ5fM6Vw4q8Axh3ZnHODqvWVE',
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
        <LogoutButton />
        <ThemeToggle />
        <AppRouter />
      </Router>
    </AuthProvider>
  );
};

export default App;
