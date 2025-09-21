import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import BackButton from './BackButton';
import ShareToggle from './ShareToggle';
import { useSwipeable } from 'react-swipeable';
import { FaTrash, FaRegClipboard } from 'react-icons/fa';

import {
  subscribeToTasks,
  addTask,
  deleteTask,
  deleteListAndTasks,
} from '../Services/firestoreHelpers';

// Componente para cada tarea
function TaskItem({ task, handleDelete }: { task: any; index: number; handleDelete: (id: string) => void }) {
  const [translateX, setTranslateX] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const fechaFormateada = task.createdAt?.toDate
    ? new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(task.createdAt.toDate())
    : 'Sin fecha';

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (eventData.dir === 'Right') {
        setSwiping(true);
        setTranslateX(Math.max(0, eventData.deltaX));
      }
    },
    onSwipedRight: (eventData) => {
      if (eventData.deltaX > 100) {
        handleDelete(task.id);
      }
      setTranslateX(0);
      setSwiping(false);
    },
    onSwipedLeft: () => {
      setTranslateX(0);
      setSwiping(false);
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  return (
    <div className={`task-wrapper ${translateX > 50 ? 'swiping' : ''}`}>
      <li
        {...handlers}
        className="task-item"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: swiping ? 'none' : 'transform 0.2s ease',
        }}
      >
        <div className="task-info">
          <div className="task-icon">
            <FaRegClipboard color="white" />
          </div>
          <div className="task-text">
            <span className="task-desc">{task.description}</span>
            <small className="task-date">({fechaFormateada})</small>
          </div>
        </div>

        <button onClick={() => handleDelete(task.id)}>
          <FaTrash color="red" />
        </button>
      </li>
    </div>
  );
}

export default function TaskPage() {
  const { listId } = useParams<{ listId: string }>();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [listName, setListName] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [ownerAlias, setOwnerAlias] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !listId) return;

    const fetchListData = async () => {
      const docRef = doc(db, 'lists', listId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as any;
        setListName(data.name);
        setPublicId(data.publicId || null);
        setIsPublic(data.isPublic || false);
        setOwnerId(data.ownerId || null);

        if (data.ownerId && data.ownerId !== user.uid) {
          const userRef = doc(db, 'users', data.ownerId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setOwnerAlias(userData.alias || null);
          }
        }
      } else {
        setListName(null);
      }
    };

    fetchListData();
    const unsubscribe = subscribeToTasks(listId, setTasks);
    return () => unsubscribe();
  }, [user, listId]);

  const handleAdd = async () => {
    if (!input.trim() || !listId) return;
    await addTask(listId, input);
    setInput('');
  };

  const handleDelete = async (taskId: string) => {
    if (!listId) return;
    await deleteTask(listId, taskId);
  };

  const handleDeleteLista = async () => {
    if (!listId) return;

    const confirmar = window.confirm(
      '¿Estás seguro de que querés eliminar esta lista y todas sus tareas?'
    );
    if (!confirmar) return;

    try {
      await deleteListAndTasks(listId);
      navigate('/areas');
    } catch (error) {
      console.error('Error al eliminar la lista:', error);
      alert('Ocurrió un error al eliminar la lista.');
    }
  };

  if (!user) return <p>Debés iniciar sesión.</p>;
  if (!listId) return <p>Lista inválida</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2 className='TareasDe'>Tareas de la lista: {listName ?? listId}</h2>

      {ownerId && (
        <p style={{ color: '#a9a8a8' }}>
          <strong>Creada por:</strong>{' '}
          {ownerId === user.uid ? 'Vos' : ownerAlias ?? ownerId}
        </p>
      )}

      {publicId && (
        <div style={{ marginTop: 30 }}>
          <strong style={{ display: 'block', marginBottom: 8 }} className='tooltipText'></strong>
          <ShareToggle
            userId={user.uid}
            listId={listId}
            isPublic={isPublic}
            publicId={publicId}
          />
        </div>
      )}

      <input
        type="text"
        placeholder="Nueva tarea"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ padding: 10, width: '100%', marginTop: 10, marginBottom: 10 }}
      />
      <button onClick={handleAdd} style={{ marginBottom: 20 }}>
        Agregar tarea
      </button>

      <ul style={{ padding: 0 }}>
        {tasks
          .slice()
          .sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
            return dateB - dateA; // más reciente primero
          })
          .map((task, index) => (
            <TaskItem key={task.id} task={task} index={index} handleDelete={handleDelete} />
          ))}
      </ul>

      <div className="BotonesBackEliminar" style={{ marginTop: 30, display: 'flex', gap: 10 }}>
        <button onClick={handleDeleteLista} className='EliminarLista'>
          Eliminar lista completa
        </button>
        <BackButton />
      </div>
    </div>
  );
}
