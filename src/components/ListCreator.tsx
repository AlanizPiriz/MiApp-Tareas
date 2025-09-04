import { useState } from 'react';
import { useAuth } from './AuthContext';
import { createList } from '../Services/firestoreHelpers';
import { useNavigate } from 'react-router-dom';
import { FaPlusCircle  } from 'react-icons/fa'

export default function ListCreator() {
  const { user } = useAuth();
  const [listName, setListName] = useState('');
  const navigate = useNavigate();

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
      const listId = await createList(user.uid, listName.trim());
      setListName('');
      navigate(`/listas/${listId}`); // Redirige a la nueva lista
    } catch (error) {
      alert('Error al crear la lista');
      console.error(error);
    }
  };

  return (
    <div style={{ margin: '20px 0'}}>
      <input
        type="text"
        placeholder="Ej: Compras del super"
        value={listName}
        onChange={(e) => setListName(e.target.value)}
      />
      <button 
        onClick={handleCreate} 
        disabled={!listName.trim()}
        className='crearListaBtn'
      >
        <FaPlusCircle  /> Crear Lista
      </button>
    </div>
  );
}
