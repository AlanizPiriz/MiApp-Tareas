import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function PublicListPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const [list, setList] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicId) return;

    const fetchListAndTasks = async () => {
      const listsRef = collection(db, 'lists');
      const q = query(listsRef, where('publicId', '==', publicId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setList(null);
        setLoading(false);
        return;
      }

      const listDoc = querySnapshot.docs[0];
      setList({ id: listDoc.id, ...listDoc.data() });

      // Suscripción en tiempo real a tareas
      const tasksRef = collection(db, 'lists', listDoc.id, 'tasks');
      const unsubscribe = onSnapshot(tasksRef, snapshot => {
        const arr: any[] = [];
        snapshot.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
        setTasks(arr);
        setLoading(false);
      });

      return unsubscribe;
    };

    fetchListAndTasks();
  }, [publicId]);

  if (loading) return <p>Cargando...</p>;
  if (!list) return <p>Lista no encontrada.</p>;

  return (
    <div>
      <h2>Lista pública: {list.name}</h2>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>{task.description}</li>
        ))}
      </ul>
    </div>
  );
}
