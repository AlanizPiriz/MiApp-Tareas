import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { addTask, deleteTask } from '../Services/firestoreHelpers';
import BackButton from './BackButton';
import '../styles.css';

export default function PublicListPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const [list, setList] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ownerAlias, setOwnerAlias] = useState<string | null>(null);

  // Estado para controlar si mostramos los botones extra
  const [showShareOptions, setShowShareOptions] = useState(false);

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

      if (listData.ownerId) {
        const ownerDocRef = doc(db, 'users', listData.ownerId);
        const ownerDocSnap = await getDoc(ownerDocRef);
        if (ownerDocSnap.exists()) {
          const ownerData = ownerDocSnap.data();
          setOwnerAlias(ownerData.alias || null);
        } else {
          setOwnerAlias(null);
        }
      }

      if (user && !listData.collaborators?.[user.uid]) {
        const docRef = doc(db, 'lists', listId);
        await updateDoc(docRef, {
          [`collaborators.${user.uid}`]: true,
        });
      }

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

  const handleCopyClick = () => {
    setShowShareOptions(!showShareOptions);
  };

  if (loading) return <p>Cargando...</p>;
  if (!list) return <p>Lista no encontrada.</p>;

  return (
    <div className="task-page-container">
      <h2 className="list-title">📢 Lista pública: {list.name}</h2>

      {list.ownerId && (
        <p>
          <strong>Creada por:</strong>{' '}
          {list.ownerId === user!.uid ? 'Vos' : ownerAlias ?? list.ownerId}
        </p>
      )}

      {/* Botón para mostrar u ocultar botones de compartir */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={handleCopyClick}>
          {showShareOptions ? '🔽 Ocultar opciones de compartir' : '🔗 Copiar link'}
        </button>

        {showShareOptions && (
          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/compartir/${publicId}`);
                alert('Link copiado al portapapeles');
              }}
            >
              Copiar al portapapeles
            </button>
          </div>
        )}
      </div>

      <div className="task-input-group">
        <input
          type="text"
          placeholder="Nueva tarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="task-input"
        />
        <button className="add-button" onClick={handleAdd}>
          Agregar tarea
        </button>
      </div>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className="task-item">
            {task.description}
            <button
              className="delete-button"
              onClick={() => handleDelete(task.id)}
            >
              Borrar
            </button>
          </li>
        ))}
      </ul>

      <div className="bottom-actions">
        <BackButton />
      </div>
    </div>
  );
}
