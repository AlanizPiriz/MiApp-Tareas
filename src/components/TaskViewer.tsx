import { useEffect, useState } from 'react';
import { subscribeToTasks } from '../Services/firestoreHelpers';
import { useAuth } from './AuthContext';

interface Props {
  listId: string;
}

export default function TaskViewer({ listId }: Props) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToTasks(listId, setTasks);
    return () => unsubscribe();
  }, [user, listId]);

  if (!user) return <p>Debes iniciar sesión para ver las tareas.</p>;

  if (tasks.length === 0) return <p>No hay tareas en esta lista.</p>;

  return (
    <ul>
      {tasks.map(task => (
        <li key={task.id}>
          <input type="checkbox" checked={task.done} readOnly />
          {task.description}
        </li>
      ))}
    </ul>
  );
}
