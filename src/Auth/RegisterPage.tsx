import { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alias, setAlias] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError('');
    if (!alias.trim()) {
      setError('El alias no puede estar vacío.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Guardar alias en el perfil de Firebase Auth
      await updateProfile(user, {
        displayName: alias.trim(),
      });

      // ✅ Guardar en Firestore (colección "users")
      await setDoc(doc(db, 'users', user.uid), {
        alias: alias.trim(),
        email: user.email,
        createdAt: new Date(),
      });

      navigate('/areas'); // o a donde quieras redirigir
    } catch (err) {
      console.error(err);
      setError('Error al crear usuario. Intenta con otro email.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', paddingTop: 'auto' }}>
      <h2>Crear cuenta</h2>

      <input
        type="text"
        placeholder="Alias"
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 10 }}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 10 }}
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 10 }}
      />

      <button
        onClick={handleRegister}
        style={{ width: '100%', padding: 10, marginBottom: 10 }}
        disabled={!email || !password || !alias}
      >
        Registrarse
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="button" onClick={() => navigate('/login')}>
        Ir a login
      </button>
    </div>
  );
}
