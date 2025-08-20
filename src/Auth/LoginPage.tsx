import { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
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
      // Si todo bien, el usuario queda logueado automáticamente
    } catch (err) {
      setError('Error al iniciar sesión. Revisa tus credenciales.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', paddingTop: 'auto' }}>
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
      <button onClick={handleLogin} style={{ width: '100%', padding: 10, marginBottom: 10 }}>
        Entrar
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="button" onClick={() => navigate('/register')}>
        Registrarse
      </button>

    </div>
  );
}
