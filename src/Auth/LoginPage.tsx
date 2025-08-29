import { useState } from 'react';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirige al home (o donde quieras)
    } catch (err) {
      console.error(err);
      setError('Error al iniciar sesión. Revisa tus credenciales.');
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Por favor ingresa tu email para recuperar la contraseña.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setError('Correo de recuperación enviado. Revisa tu bandeja de entrada.');
    } catch (err) {
      console.error(err);
      setError('Error al enviar el correo de recuperación.');
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Usuario logueado con Google:', result.user);
      navigate('/'); // Redirige al home o dashboard
    } catch (error) {
      console.error(error);
      setError('Error al iniciar sesión con Google.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', paddingTop: '2rem' }}>
      <h2>Iniciar sesión</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 10 }}
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 10 }}
      />

      <button
        onClick={handleLogin}
        style={{ width: '100%', padding: 10, marginBottom: 10 }}
      >
        Entrar
      </button>

      <button
        onClick={handlePasswordReset}
        style={{ width: '100%', padding: 10, marginBottom: 10 }}
      >
        ¿Olvidaste tu contraseña?
      </button>

      <button
        onClick={handleGoogleLogin}
        style={{
          width: '100%',
          padding: 10,
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          cursor: 'pointer',
          color:  'black'
        }}
      >
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google"
          width="20"
        />
        Continuar con Google
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button
        type="button"
        onClick={() => navigate('/register')}
        style={{ width: '100%', padding: 10 }}
      >
        Registrarse
      </button>
    </div>
  );
}
