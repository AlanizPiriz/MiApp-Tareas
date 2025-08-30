import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToUserLists } from '../Services/firestoreHelpers';
import ListCreator from './ListCreator';
import '../styles.css';
import { FaUsers, FaClipboardList } from 'react-icons/fa';


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
    <div>
      <h1>Mis Listas</h1>
      <h3>Hola, {user?.displayName}</h3>
      <button className="logout-button" onClick={logout}>
        Cerrar sesión
      </button>

      <div className="list-creator-wrapper">
        <ListCreator />
      </div>

      <section className="list-section">
        <h2 className="list-title">
          <FaClipboardList style={{ marginRight: 8 }} color="#3498db" />
          Mis listas
        </h2>

        {myLists.length === 0 ? (
          <p className="empty-text">No creaste ninguna lista aún.</p>
        ) : (
          <div className="list-grid">
            {myLists.map((list) => (
              <button
                key={list.id}
                onClick={() => handleGoToList(list.id)}
                className="list-button list-my"
              >
                {list.name}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="list-section">
        <h2 className="list-title">
          <FaUsers style={{ marginRight: 8 }} />
          Listas compartidas conmigo
        </h2>
        {sharedLists.length === 0 ? (
          <p className="empty-text">No hay listas compartidas con vos.</p>
        ) : (
          <div className="list-grid">
            {sharedLists.map((list) => (
              <button
                key={list.id}
                onClick={() => handleGoToList(list.id)}
                className="list-button list-shared"
              >
                {list.name}
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="historial-wrapper">
        <button className="historial-button" onClick={() => navigate('/historial')}>
          Ver historial
        </button>
      </div>
    </div>
  );
};

export default Home;
