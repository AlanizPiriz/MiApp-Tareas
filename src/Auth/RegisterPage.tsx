import { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const handleRegister = async () => {
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Error al crear usuario. Intenta con otro email.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', paddingTop: 'auto' }}>
      <h2>Crear cuenta</h2>
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
      <button onClick={handleRegister} style={{ width: '100%', padding: 10, marginBottom: 10 }}>
        Registrarse
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="button" onClick={() => navigate('/login')}>
        Login
      </button>

    </div>
  );
}
