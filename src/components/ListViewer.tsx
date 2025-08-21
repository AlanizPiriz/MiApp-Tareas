import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToLists } from '../Services/firestoreHelpers';
import { useNavigate } from 'react-router-dom';
import { eliminarLista } from './eliminarLista';

export default function ListViewer() {
  const { user } = useAuth();
  const [lists, setLists] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToLists((allLists) => {
      // Filtramos listas que el usuario posee o comparte
      const myLists = allLists.filter(list =>
        list.ownerId === user.uid || (list.sharedWith && list.sharedWith.includes(user.uid))
      );
      setLists(myLists);
    });

    return () => unsubscribe();
  }, [user]);

  const handleClick = (listId: string) => {
    navigate(`/listas/${listId}`);
  };

  const handleEliminar = async (listId: string) => {
    // Opcional: pasar user.uid para validar en eliminarLista
    await eliminarLista(listId, user?.uid);
    setLists(prev => prev.filter(list => list.id !== listId));
  };

  if (!user) return <p>Debes iniciar sesión para ver tus listas.</p>;
  if (lists.length === 0) return <p>No tenés listas creadas aún.</p>;

  return (
    <ul>
      {lists.map((list) => (
        <li key={list.id} style={{ marginBottom: 10 }}>
          <button onClick={() => handleClick(list.id)} style={{ marginRight: 10 }}>
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
