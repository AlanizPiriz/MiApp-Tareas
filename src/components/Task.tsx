import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import BackButton from './BackButton';
import ShareToggle from './ShareToggle';

import {
  subscribeToTasks,
  addTask,
  deleteTask,
  deleteListAndTasks,
} from '../Services/firestoreHelpers';

export default function TaskPage() {
  const { listId } = useParams<{ listId: string }>();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [listName, setListName] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [ownerAlias, setOwnerAlias] = useState<string | null>(null); // 👈 nuevo
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

        // 👇 buscar alias del owner
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
      <h2>Tareas de la lista: {listName ?? listId}</h2>

      {ownerId && (
        <p>
          <strong>Creada por:</strong>{' '}
          {ownerId === user.uid ? 'Vos' : ownerAlias ?? ownerId}
        </p>
      )}

      {/* Componente para compartir */}
      {publicId && (
        <>
          <ShareToggle
            userId={user.uid}
            listId={listId}
            isPublic={isPublic}
            publicId={publicId}
          />

          <div style={{ marginTop: 10, marginBottom: 20 }}>
            <button
              onClick={() => {
                const baseUrl = 'https://mi-app-tareas.vercel.app/compartir/';
                const fullUrl = `${baseUrl}${publicId}`;
                const message = `¡Mirá esta lista de tareas! ${fullUrl}`;
                const encodedMessage = encodeURIComponent(message);
                const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
                const whatsappUrl = isMobile
                  ? `whatsapp://send?text=${encodedMessage}`
                  : `https://wa.me/?text=${encodedMessage}`;

                window.open(whatsappUrl, '_blank');
              }}
              style={{
                backgroundColor: '#25D366',
                color: 'white',
                padding: '10px 15px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              📲 Compartir por WhatsApp
            </button>
          </div>
        </>
      )}

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
        {tasks.map((task) => {
          const fechaFormateada = task.createdAt?.toDate
            ? new Intl.DateTimeFormat('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }).format(task.createdAt.toDate())
            : 'Sin fecha';

          return (
            <li key={task.id}>
              {task.description} <small>({fechaFormateada})</small>{' '}
              <button onClick={() => handleDelete(task.id)}>Borrar</button>
            </li>
          );
        })}
      </ul>

      <div
        className="BotonesBackEliminar"
        style={{ marginTop: 30, display: 'flex', gap: 10 }}
      >
        <button
          onClick={handleDeleteLista}
          style={{
            color: 'white',
            backgroundColor: 'red',
            padding: '10px 15px',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
          }}
        >
          Eliminar lista completa
        </button>
        <BackButton />
      </div>
    </div>
  );
}
