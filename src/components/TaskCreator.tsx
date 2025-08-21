import { useState } from 'react';
import { addTask, deleteTask } from '../Services/firestoreHelpers';
import { useAuth } from './AuthContext';

interface Props {
  listId: string;
}

export default function TaskCreator({ listId }: Props) {
  const { user } = useAuth();
  const [taskDescription, setTaskDescription] = useState('');

  const handleAddTask = async () => {
    if (!user) {
      alert('Debés iniciar sesión para agregar tareas');
      return;
    }
    if (!taskDescription.trim()) {
      alert('La descripción no puede estar vacía');
      return;
    }
    try {
      await addTask(listId, taskDescription);
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
        onChange={(e) => setTaskDescription(e.target.value)}
      />
      <button onClick={handleAddTask} style={{marginTop: 20}}>Agregar tarea</button>
    </div>
  );
}

interface TaskItemProps {
  id: string;
  text: string;
  createdAt: any;
  listId: string;
}

export const TaskItem = ({ id, text, createdAt, listId }: TaskItemProps) => {
  const { user } = useAuth();

  const fechaFormateada = createdAt?.toDate
    ? new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(createdAt.toDate())
    : createdAt
    ? new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(createdAt))
    : 'Sin fecha';

  const handleDelete = async () => {
    if (!user) {
      alert('Debés iniciar sesión para eliminar tareas');
      return;
    }
    try {
      await deleteTask(listId, id);
    } catch {
      alert('Error al borrar la tarea');
    }
  };

  return (
    <li className="task">
      {text} <small>({fechaFormateada})</small>
      <button onClick={handleDelete}>Borrar</button>
    </li>
  );
};
