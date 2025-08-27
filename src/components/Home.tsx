import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToUserLists } from '../Services/firestoreHelpers';
import ListCreator from './ListCreator';

interface List {
  id: string;
  name: string;
  ownerId: string;
  collaborators?: Record<string, boolean>;
}

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [lists, setLists] = useState<List[]>([]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserLists(user.uid, setLists);
    return () => unsubscribe();
  }, [user]);

  const handleGoToList = (listId: string) => {
    navigate(`/listas/${listId}`);
  };

  const myLists = user
  ? lists.filter((list) => list.ownerId === user.uid)
  : [];

  const sharedLists = user
    ? lists.filter(
        (list) => list.ownerId !== user.uid && list.collaborators?.[user.uid]
      )
    : [];
    

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Mis Listas</h1>
      <h3>Hola, {user?.displayName}</h3>
      <button onClick={logout}>Cerrar sesión</button>

      <ListCreator />

      {/* Listas creadas por mí */}
      <div style={{ marginTop: 30 }}>
        <h2>Listas creadas por mí</h2>
        {myLists.length === 0 ? (
          <p>No creaste ninguna lista aún.</p>
        ) : (
          myLists.map((list) => (
            <button
              key={list.id}
              onClick={() => handleGoToList(list.id)}
              style={{ margin: '10px' }}
            >
              {list.name}
            </button>
          ))
        )}
      </div>

      {/* Listas compartidas conmigo */}
      <div style={{ marginTop: 30 }}>
        <h2>Listas compartidas conmigo</h2>
        {sharedLists.length === 0 ? (
          <p>No hay listas compartidas con vos.</p>
        ) : (
          sharedLists.map((list) => (
            <button
              key={list.id}
              onClick={() => handleGoToList(list.id)}
              style={{ margin: '10px' }}
            >
              {list.name}
            </button>
          ))
        )}
      </div>

      <div style={{ marginTop: 40 }}>
        <button onClick={() => navigate('/historial')}>Ver historial</button>
      </div>
    </div>
  );
};

export default Home;
