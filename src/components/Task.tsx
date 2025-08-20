import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDoc
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import BackButton from './BackButton';

export default function TaskPage() {
  const { listId } = useParams<{ listId: string }>();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [listName, setListName] = useState<string | null>(null);

  useEffect(() => {
    // 1. Verificamos que tengamos user y listId antes de continuar
    if (!user || !listId) return;

    // 2. Obtenemos el nombre de la lista
    const fetchListName = async () => {
      const docRef = doc(db, 'users', user.uid, 'lists', listId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setListName((snap.data() as any).name);
      }
    };
    fetchListName();

    // 3. Escuchamos las tareas en tiempo real
    const tasksRef = collection(db, 'users', user.uid, 'lists', listId, 'tasks');
    const q = query(tasksRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const arr: any[] = [];
      snapshot.forEach(d => arr.push({ id: d.id, ...d.data() }));
      setTasks(arr);
    });

    // 4. Cleanup
    return () => unsubscribe();
  }, [user, listId]);

  const handleAdd = async () => {
    if (!input.trim() || !user || !listId) return;
    await addDoc(
      collection(db, 'users', user.uid, 'lists', listId, 'tasks'),
      {
        text: input,
        createdAt: new Date(),
      }
    );
    setInput('');
  };

  const handleDelete = async (taskId: string) => {
    if (!user || !listId) return;
    await deleteDoc(
      doc(db, 'users', user.uid, 'lists', listId, 'tasks', taskId)
    );
  };

  if (!user) return <p>Debés iniciar sesión.</p>;
  if (!listId) return <p>Lista inválida</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Tareas de la lista: {listName ?? listId}</h2>
      <input
        type="text"
        placeholder="Nueva tarea"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={handleAdd} style={{marginTop: 10, marginBottom: 20}}>Agregar tarea</button>

      <ul>
        {tasks.map(task => {
          const fechaFormateada = task.createdAt?.toDate
            ? new Intl.DateTimeFormat('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }).format(task.createdAt.toDate())
            : task.createdAt
            ? new Intl.DateTimeFormat('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }).format(new Date(task.createdAt))
            : 'Sin fecha';

          return (
            <li key={task.id}>
              {task.text} <small>({fechaFormateada})</small>{' '}
              <button onClick={() => handleDelete(task.id)}>Borrar</button>
            </li>
          );
        })}
      </ul>

      <BackButton />
    </div>
  );
}
