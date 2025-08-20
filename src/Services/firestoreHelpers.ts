import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onSnapshot, query} from 'firebase/firestore';
import { doc, deleteDoc } from 'firebase/firestore';


// Crear una lista nueva para un usuario
export async function createList(userId: string, name: string): Promise<string> {
  try {
    // Referencia a la colección 'lists' dentro del usuario
    const listsRef = collection(db, 'users', userId, 'lists');

    // Crear documento nuevo con id automático
    const docRef = await addDoc(listsRef, {
      name,
      createdAt: serverTimestamp(),
      sharedWith: [], // inicialmente vacía
    });

    return docRef.id; // Retornamos el id para usarlo luego
  } catch (error) {
    console.error('Error creando lista:', error);
    throw error;
  }
}

// Crear una tarea dentro de una lista específica
export async function addTask(userId: string, listId: string, description: string) {
  try {
    const tasksRef = collection(db, 'users', userId, 'lists', listId, 'tasks');

    await addDoc(tasksRef, {
      description,
      done: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creando tarea:', error);
    throw error;
  }
}




export function subscribeToUserLists(userId: string, callback: (lists: any[]) => void) {
  const listsRef = collection(db, 'users', userId, 'lists');
  const q = query(listsRef);

  return onSnapshot(q, (snapshot) => {
    const lists = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(lists);
  });
}


export function subscribeToTasks(userId: string, listId: string, callback: (tasks: any[]) => void) {
  const tasksRef = collection(db, 'users', userId, 'lists', listId, 'tasks');
  const q = query(tasksRef);

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(tasks);
  });
}


/**
 * Elimina una tarea de Firestore según su ID
 * @param userId - UID del usuario (opcional, si tu estructura lo requiere)
 * @param listId - ID de la lista donde está la tarea (opcional, si usás listId en filtros)
 * @param taskId - ID del documento de la tarea a eliminar
 */
export async function deleteTask(userId: string, listId: string, taskId: string) {
  try {
    const taskRef = doc(
      db,
      'users',
      userId,
      'lists',
      listId,
      'tasks',
      taskId
    );
    await deleteDoc(taskRef);
    console.log('Tarea eliminada:', taskId);
  } catch (error) {
    console.error('Error al eliminar la tarea:', error);
    throw error;
  }
}
