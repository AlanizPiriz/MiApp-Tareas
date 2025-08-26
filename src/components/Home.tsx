import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToUserLists } from '../Services/firestoreHelpers'; // ✅ USAR ESTA FUNCIÓN
import ListCreator from './ListCreator';

interface List {
  id: string;
  name: string;
}

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // ✅ unificado en una sola línea
  const [lists, setLists] = useState<List[]>([]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserLists(user.uid, setLists); // ✅ esta es la función correcta
    return () => unsubscribe();
  }, [user]);

  const handleGoToList = (listId: string) => {
    navigate(`/listas/${listId}`);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Mis Listas</h1>
      <h3>Hola, {user?.displayName}</h3>
      <button onClick={logout}>Cerrar sesión</button>

      <ListCreator />

      {lists.length === 0 ? (
        <p>No tenés listas creadas aún.</p>
      ) : (
        lists.map((list) => (
          <button
            key={list.id}
            onClick={() => handleGoToList(list.id)}
            style={{ margin: '10px' }}
          >
            {list.name}
          </button>
        ))
      )}

      <div style={{ marginTop: 40 }}>
        <button onClick={() => navigate('/historial')}>Ver historial</button>
      </div>
    </div>
  );
};

export default Home;
