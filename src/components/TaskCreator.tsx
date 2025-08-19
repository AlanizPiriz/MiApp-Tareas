import { useState } from 'react';
import { addTask } from '../Services/firestoreHelpers';
import { useAuth } from './AuthContext';

interface Props {
  listId: string;
}

export default function TaskCreator({ listId }: Props) {
  const { user } = useAuth();
  const [taskDescription, setTaskDescription] = useState('');

  const handleAddTask = async () => {
    if (!user) {
      alert('Debes iniciar sesión para agregar tareas');
      return;
    }
    if (!taskDescription.trim()) {
      alert('La descripción no puede estar vacía');
      return;
    }
    try {
      await addTask(user.uid, listId, taskDescription);
      setTaskDescription('');
    } catch {
      alert('Error al agregar la tarea');
    }
  };

  return (
    <div>
      <input
        placeholder="Descripción de la tarea"
        value={taskDescription}
        onChange={e => setTaskDescription(e.target.value)}
      />
      <button onClick={handleAddTask}>Agregar tarea</button>
    </div>
  );
}
