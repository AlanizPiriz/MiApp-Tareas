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
      navigate('/'); // Redirige al home
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
      navigate('/');
    } catch (error) {
      console.error(error);
      setError('Error al iniciar sesión con Google.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', paddingTop: '2rem' }}>
      <h1>
        <svg xmlns="http://www.w3.org/2000/svg" width="250" height="60" viewBox="0 0 250 60">
          <text x="0" y="45" fontFamily="Arial, sans-serif" fontSize="48" fontWeight="bold" fill="#28a745">LIST</text>
          <g transform="translate(130, -8.25)">
            <circle cx="-2" cy="35" r="20" stroke="#28a745" strokeWidth="6" fill="none"/>
            <path d="M-10 35 l6 6 l10 -12" stroke="#28a745" strokeWidth="6" fill="none"/>
          </g>
        </svg>
      </h1>

      
    {/* Bloque de correo */}
    <div style={{ marginBottom: 12 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6
      }}>
        <label htmlFor="email" style={{ fontWeight: 600, paddingLeft: 5 }}>
          Correo
        </label>
      </div>
    
      <input
        id="email"
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ padding: 10, width: '100%', boxSizing: 'border-box' }}
      />
    </div>
    
    {/* Bloque de contraseña con link a la derecha */}
    <div style={{ marginBottom: 12 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6
      }}>
        <label htmlFor="password" style={{ fontWeight: 600, paddingLeft: 5 }}>
          Contraseña
        </label>
    
        <button
          type="button"
          onClick={handlePasswordReset}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          <span style={{ color: '#28a745' }}>¿Olvidaste tu contraseña?</span>
        </button>
      </div>
        
      <input
        id="password"
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ padding: 10, width: '100%', boxSizing: 'border-box' }}
      />
    </div>

      {/* Botón de login */}
      <button
        onClick={handleLogin}
        style={{ width: '100%', padding: 10, marginBottom: 10 }}
      >
        Entrar
      </button>

      {/* Separador */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        margin: '10px 0',
        color: '#666',
        fontSize: 14,
        marginBottom: 20,
      }}>
        <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #ccc' }} />
        <span style={{ margin: '0 10px' }}>o</span>
        <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #ccc' }} />
      </div>
    

      {/* Botón Google */}
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
          color: 'black'
        }}
      >
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google"
          width="20"
        />
        Continuar con Google
      </button>

      {/* Mensaje de error */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Botón de registro */}
      <span style={{fontSize: '13px'}}>Nuevo en Listo? </span>
      <button
        type="button"
        onClick={() => navigate('/register')}
        style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontSize: 13,
              color: '#28a745' ,
            }}
      >
         Crear cuenta
      </button>
    </div>
  );
}
