import { useState } from 'react';
import { useAuth } from './AuthContext';
import { createList } from '../Services/firestoreHelpers';

export default function ListCreator() {
  const { user } = useAuth();
  const [listName, setListName] = useState('');

  const handleCreate = async () => {
    if (!user) {
      alert('Debes iniciar sesión para crear una lista');
      return;
    }

    if (!listName.trim()) {
      alert('El nombre de la lista no puede estar vacío');
      return;
    }

    try {
      const listId = await createList(user.uid, listName);
      alert(`Lista creada con id: ${listId}`);
      setListName('');
    } catch (error) {
      alert('Error al crear la lista');
    }
  };

  return (
    <div style={{ margin: '20px 0' }}>
      <input
        type="text"
        placeholder="Nombre de la lista"
        value={listName}
        onChange={(e) => setListName(e.target.value)}
      />
      <button onClick={handleCreate} style={{ marginLeft: '10px' }}>
        Crear Lista
      </button>
    </div>
  );
}
