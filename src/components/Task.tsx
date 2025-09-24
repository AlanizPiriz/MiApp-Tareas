import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import BackButton from './BackButton';
import ShareToggle from './ShareToggle';
import { useSwipeable } from 'react-swipeable';
import { FaTrash, FaRegClipboard, FaMicrophone, FaMicrophoneAlt } from 'react-icons/fa';

import {
  subscribeToTasks,
  addTask,
  deleteTask,
  deleteListAndTasks,
} from '../Services/firestoreHelpers';

// ====== Funciones de prioridad ======
type Priority = 'alta' | 'media' | 'baja';

function detectarPrioridad(texto: string): Priority {
  const lower = texto.toLowerCase();
  if (lower.includes('urgente') || lower.includes('importante') || lower.includes('prioridad alta')) return 'alta';
  if (lower.includes('hoy') || lower.includes('mañana') || lower.includes('esta semana')) return 'media';
  return 'baja';
}

function ordenarTareas(tasks: any[]) {
  const prioridadOrden: Record<Priority, number> = { alta: 1, media: 2, baja: 3 };

// dentro de ordenarTareas
return [...tasks].sort((a, b) => {
  const pA = (a.priority as Priority) || 'baja';
  const pB = (b.priority as Priority) || 'baja';

  if (prioridadOrden[pA] !== prioridadOrden[pB]) return prioridadOrden[pA] - prioridadOrden[pB];

  const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : a.createdAt?.getTime() || 0;
  const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : b.createdAt?.getTime() || 0;
  return timeB - timeA;
});

}

// ====== Componente TaskItem ======
function TaskItem({ task, handleDelete }: { task: any; index?: number; handleDelete: (id: string) => void }) {
  const [translateX, setTranslateX] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const fechaFormateada = task.createdAt?.toDate
    ? new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(task.createdAt.toDate())
    : task.createdAt
    ? new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(task.createdAt)
    : 'Sin fecha';

  const colores: Record<Priority, string> = {
  alta: "2px solid red",
  media: "2px solid orange",
  baja: "2px solid green",
};

// Dentro del render de TaskItem:
const borderColor = colores[(task.priority as Priority) || 'baja'];


  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (eventData.dir === 'Right') {
        setSwiping(true);
        setTranslateX(Math.max(0, eventData.deltaX));
      }
    },
    onSwipedRight: (eventData) => {
      if (eventData.deltaX > 100) handleDelete(task.id);
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
          border: borderColor,
          borderRadius: 16,
          background: 'rgba(255,255,255,0.4)',
          padding: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'grab',
        }}
      >
        <div className="task-info" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <FaRegClipboard color="white" />
          <div className='task-item-div'>
            <span>{task.description}</span>
            <small style={{color: '#ccc' }}>({fechaFormateada})</small>
          </div>
        </div>

        <button onClick={() => handleDelete(task.id)} style={{ border: 'none', background: 'transparent' }}>
          <FaTrash color="red" />
        </button>
      </li>
    </div>
  );
}

// ====== Componente principal TaskPage ======
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
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  // ====== Suscripción a Firestore y prioridad ======
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

    const unsubscribe = subscribeToTasks(listId, (fetchedTasks) => {
      const tasksWithPriority = fetchedTasks.map(task => ({
        ...task,
        priority: detectarPrioridad(task.description),
      }));
      setTasks(ordenarTareas(tasksWithPriority));
    });

    return () => unsubscribe();
  }, [user, listId]);

  // ====== Agregar tareas ======
  const handleAdd = async () => {
    if (!input.trim() || !listId) return;

    const prioridad = detectarPrioridad(input);
    await addTask(listId, input, prioridad);

    setTasks(prev =>
      ordenarTareas([...prev, { id: Date.now().toString(), description: input, createdAt: new Date(), prioridad }])
    );
    setInput('');
  };

  const handleAddVoice = async (text: string) => {
    if (!text.trim() || !listId) return;

    const prioridad = detectarPrioridad(text);
    await addTask(listId, text, prioridad);

    setTasks(prev =>
      ordenarTareas([...prev, { id: Date.now().toString(), description: text, createdAt: new Date(), prioridad }])
    );
    setInput('');
  };

  const handleDelete = async (taskId: string) => {
    if (!listId) return;
    await deleteTask(listId, taskId);
  };

  const handleDeleteLista = async () => {
    if (!listId) return;
    if (!window.confirm('¿Estás seguro de que querés eliminar esta lista y todas sus tareas?')) return;
    try {
      await deleteListAndTasks(listId);
      navigate('/areas');
    } catch (error) {
      console.error('Error al eliminar la lista:', error);
      alert('Ocurrió un error al eliminar la lista.');
    }
  };

  // ====== Reconocimiento de voz ======
  const startVoiceInput = () => {
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-AR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleAddVoice(transcript);

      recognition.stop();
      setListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Error en reconocimiento de voz:', event.error);
      setListening(false);
    };

    recognition.onend = () => setListening(false);
  };

  if (!user) return <p>Debés iniciar sesión.</p>;
  if (!listId) return <p>Lista inválida</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2 className='TareasDe'>Tareas de la lista: {listName ?? listId}</h2>

      {ownerId && (
        <p style={{ color: '#a9a8a8' }}>
          <strong>Creada por:</strong> {ownerId === user.uid ? 'Vos' : ownerAlias ?? ownerId}
        </p>
      )}

      {publicId && (
        <div style={{ marginTop: 30 }}>
          <ShareToggle userId={user.uid} listId={listId} isPublic={isPublic} publicId={publicId} />
        </div>
      )}

      {/* Input con botón de voz adentro */}
    <div style={{ position: "relative", marginBottom: 10 }}>
     <input
       type="text"
       placeholder={listening ? " Escuchando..." : "Nueva tarea"}
       value={input}
       onChange={(e) => setInput(e.target.value)}
       className={`task-input ${listening ? "listening-placeholder" : ""}`}
       style={{
         width: "100%",
         padding: "10px 40px 10px 10px", // espacio a la derecha para el botón
       }}
     />

      {/* Botón de voz dentro del input */}
      <button
        className="voice-button"
        onClick={startVoiceInput}
        style={{
          position: "absolute",
          right: "10px",
          top: "35%",
          transform: "translateY(-50%)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        {listening ? <FaMicrophoneAlt color="red" /> : <FaMicrophone />}
      </button>
      
      {/* Animación onda */}
      {listening && (
        <div
          className="voice-wave"
        ><FaMicrophoneAlt className='voice-microphone' />
        </div>
      )}
    </div>
    

      <button onClick={handleAdd} style={{ marginBottom: 20 }}>
        Agregar tarea
      </button>

      <ul style={{ padding: 0 }}>
        {tasks.map((task, index) => (
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
