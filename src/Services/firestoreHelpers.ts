import { db } from '../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  onSnapshot,
  doc,
  deleteDoc,
  getDocs,
  updateDoc,
  where,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

// Crear una lista nueva (guardada en /lists con ownerId)
export async function createList(ownerId: string, name: string) {
  const docRef = await addDoc(collection(db, 'lists'), {
    name,
    ownerId,
    isPublic: false,
    publicId: uuidv4(),
    collaborators: {
      [ownerId]: true, // 👈 el creador también es colaborador
    },
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

// 🔁 Suscribirse a TODAS las listas (no recomendado en producción sin filtro)
export function subscribeToLists(callback: (lists: any[]) => void) {
  const listsRef = collection(db, 'lists');
  const q = query(listsRef);

  return onSnapshot(q, (snapshot) => {
    const lists = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(lists);
  });
}

// ✅ Suscribirse SOLO a las listas donde el usuario es colaborador
export function subscribeToUserLists(userId: string, callback: (lists: any[]) => void) {
  const listsRef = collection(db, 'lists');
  const q = query(listsRef, where(`collaborators.${userId}`, '==', true)); // 👈 colaborador

  return onSnapshot(q, (snapshot) => {
    const lists = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(lists);
  });
}

// Suscribirse a tareas de una lista
export function subscribeToTasks(listId: string, callback: (tasks: any[]) => void) {
  const tasksRef = collection(db, 'lists', listId, 'tasks');
  const q = query(tasksRef);

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(tasks);
  });
}

// Crear tarea en la lista
export async function addTask(listId: string, description: string) {
  try {
    const tasksRef = collection(db, 'lists', listId, 'tasks');

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

// Eliminar tarea
export async function deleteTask(listId: string, taskId: string) {
  const taskRef = doc(db, 'lists', listId, 'tasks', taskId);
  await deleteDoc(taskRef);
}

// Eliminar lista y sus tareas
export async function deleteListAndTasks(listId: string) {
  // 1. Borrar tareas
  const tasksRef = collection(db, 'lists', listId, 'tasks');
  const snapshot = await getDocs(tasksRef);
  const deletePromises = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
  await Promise.all(deletePromises);

  // 2. Borrar lista
  const listRef = doc(db, 'lists', listId);
  await deleteDoc(listRef);
}

// ✅ Cambiar visibilidad pública de la lista
export async function setListPublicStatus(listId: string, isPublic: boolean) {
  const listRef = doc(db, 'lists', listId);
  await updateDoc(listRef, {
    isPublic,
  });
}
