import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { addTask, deleteTask } from '../Services/firestoreHelpers';
import BackButton from './BackButton';


export default function PublicListPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const [list, setList] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  

  useEffect(() => {
    if (!publicId) return;

    if (!user) {
      navigate('/login');
      return;
    }

    const fetchListAndTasks = async () => {
      const listsRef = collection(db, 'lists');
      const q = query(
        listsRef,
        where('publicId', '==', publicId),
        where('isPublic', '==', true)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setList(null);
        setLoading(false);
        return;
      }

      const listDoc = querySnapshot.docs[0];
      const listData = listDoc.data();
      const listId = listDoc.id;
      

      setList({ id: listId, ...listData });

      // ✅ Agregar al usuario como colaborador si no lo es aún
      if (user && !listData.collaborators?.[user.uid]) {
        const docRef = doc(db, 'lists', listId);
        await updateDoc(docRef, {
          [`collaborators.${user.uid}`]: true
        });
      }

      // 👁 Escuchar en tiempo real las tareas
      const tasksRef = collection(db, 'lists', listId, 'tasks');
      const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
        const arr: any[] = [];
        snapshot.forEach((doc) => arr.push({ id: doc.id, ...doc.data() }));
        setTasks(arr);
        setLoading(false);
      });

      return unsubscribe;
    };

    const unsubscribePromise = fetchListAndTasks();

    return () => {
      // Cleanup de snapshot si está disponible
      unsubscribePromise.then((unsub) => unsub && unsub());
    };
  }, [publicId, user, navigate]);

  const handleAdd = async () => {
    if (!input.trim() || !list?.id) return;
    await addTask(list.id, input);
    setInput('');
  };

  const handleDelete = async (taskId: string) => {
    if (!list?.id) return;
    await deleteTask(list.id, taskId);
  };

  if (loading) return <p>Cargando...</p>;
  if (!list) return <p>Lista no encontrada.</p>;

  return (
    <div>
      <h2>Lista pública: {list.name}</h2>
      {list.ownerId && (
      <p>
        <strong>Creada por:</strong>{' '}
        {list.ownerId === user!.uid ? 'Vos' : list.ownerId}
      </p>
      )}    
      <input
        type="text"
        placeholder="Nueva tarea"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={handleAdd}>Agregar tarea</button>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.description}
            <button onClick={() => handleDelete(task.id)}>Borrar</button>
          </li>
        ))}
      </ul>

      <BackButton />
    </div>
  );
}
