import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToUserLists } from '../Services/firestoreHelpers';

export default function ListViewer() {
  const { user } = useAuth();
  const [lists, setLists] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserLists(user.uid, setLists);
    return () => unsubscribe();
  }, [user]);

  if (!user) return <p>Debes iniciar sesión para ver tus listas.</p>;

  if (lists.length === 0) return <p>No tenés listas creadas aún.</p>;

  return (
    <ul>
      {lists.map(list => (
        <li key={list.id}>
          <strong>{list.name}</strong> — creada el {list.createdAt?.toDate().toLocaleString() || 'fecha no disponible'}
        </li>
      ))}
    </ul>
  );
}
