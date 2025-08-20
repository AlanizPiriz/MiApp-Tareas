import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Registro() {
  const { register } = useAuth(); // Asegúrate de tener esta función en tu AuthContext
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await register(email, password);
      alert('Registro exitoso');
      navigate('/login'); // Redirige al login tras registro
    } catch {
      alert('Error al registrarse');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Registrarse</button>
      <button type="button" onClick={() => navigate('/login')}>
        Volver al login
      </button>
    </form>
  );
}
