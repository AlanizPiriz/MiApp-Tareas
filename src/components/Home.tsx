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
  const { user } = useAuth();
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
      <h1>
        <svg xmlns="http://www.w3.org/2000/svg" width="250" height="60" viewBox="0 0 250 60">

          <text 
            x="40%" 
            y="45" 
            fontFamily="Arial, sans-serif" 
            fontSize="48" 
            fontWeight="bold" 
            fill="#28a745" 
            textAnchor="middle"
          >
            LIST
          </text>

          
          <g transform="translate(180, -8.25)">
            <circle cx="0" cy="35" r="20" stroke="#28a745" strokeWidth="6" fill="none"/>
            <path d="M-8 35 l6 6 l10 -12" stroke="#28a745" strokeWidth="6" fill="none"/>
          </g>
        </svg>

      </h1>

      <h3 className='Bienvenida'><span>Hola, </span>{user?.displayName}</h3>

      <div className="list-creator-wrapper">
        <ListCreator />
      </div>
      <div style={{display: 'flex', justifyContent: 'center'}}>
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
      </div>
      <div style={{display: 'flex', justifyContent: 'center'}}>
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
      </div>
    </div>
  );
};

export default Home;
