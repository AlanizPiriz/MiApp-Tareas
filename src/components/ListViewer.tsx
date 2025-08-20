import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToUserLists } from '../Services/firestoreHelpers';
import { useNavigate } from 'react-router-dom';
import { eliminarLista } from './eliminarLista';

export default function ListViewer() {
  const { user } = useAuth();
  const [lists, setLists] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserLists(user.uid, setLists);
    return () => unsubscribe();
  }, [user]);

  const handleClick = (listId: string) => {
    navigate(`/listas/${listId}`);
  };

  const handleEliminar = async (listId: string) => {
    await eliminarLista(listId);
    setLists(prev => prev.filter(list => list.id !== listId));
  };

  if (!user) return <p>Debes iniciar sesión para ver tus listas.</p>;
  if (lists.length === 0) return <p>No tenés listas creadas aún.</p>;

  return (
    <ul>
      {lists.map((list) => (
        <li key={list.id}>
          <button onClick={() => handleClick(list.id)}>
            {list.name}
          </button>
          <button onClick={() => handleEliminar(list.id)}>
            🗑 Eliminar
          </button>
        </li>
      ))}
    </ul>
  );
}
