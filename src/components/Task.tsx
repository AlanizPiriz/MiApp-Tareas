import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs
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
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !listId) return;

    const fetchListName = async () => {
      const docRef = doc(db, 'users', user.uid, 'lists', listId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setListName((snap.data() as any).name);
      } else {
        setListName(null);
      }
    };
    fetchListName();

    const tasksRef = collection(db, 'users', user.uid, 'lists', listId, 'tasks');
    const q = query(tasksRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const arr: any[] = [];
      snapshot.forEach(d => arr.push({ id: d.id, ...d.data() }));
      setTasks(arr);
    });

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

  // NUEVO: Eliminar toda la lista y sus tareas
  const handleDeleteLista = async () => {
    if (!user || !listId) return;

    const confirmar = window.confirm("¿Estás seguro de que querés eliminar esta lista y todas sus tareas?");
    if (!confirmar) return;

    try {
      console.log("Iniciando eliminación de lista y tareas...");

      // 1. Borrar todas las tareas
      const tareasRef = collection(db, 'users', user.uid, 'lists', listId, 'tasks');
      const snapshot = await getDocs(tareasRef);
      const deletePromises = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);

      console.log("Tareas eliminadas.");

      // 2. Borrar la lista
      const listaRef = doc(db, 'users', user.uid, 'lists', listId);
      await deleteDoc(listaRef);

      console.log("Lista eliminada.");

      // 3. Redirigir
      navigate('/listas');
    } catch (error) {
      console.error("Error al eliminar la lista:", error);
      alert("Ocurrió un error al eliminar la lista.");
    }
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
      <button onClick={handleAdd} style={{ marginTop: 10, marginBottom: 20 }}>
        Agregar tarea
      </button>
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

      <div className='BotonesBackEliminar' style={{ marginTop: 30 }}>
        <button
          onClick={handleDeleteLista}
          style={{
            color: 'white',
            backgroundColor: 'red',
            padding: '10px 15px',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer'
          }}
          type="button"
        >
          Eliminar lista completa
        </button>

        <BackButton />
      </div>
    </div>
  );
}
