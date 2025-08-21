// eliminarLista.ts
import { doc, getDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export async function eliminarLista(listId: string, userId?: string) {
  if (!userId) throw new Error('No userId provided for eliminarLista');

  // Verificamos que el usuario sea el dueño de la lista antes de eliminar
  const listRef = doc(db, 'lists', listId);
  const snap = await getDoc(listRef);

  if (!snap.exists()) throw new Error('La lista no existe');

  const data = snap.data();
  if (data.ownerId !== userId) {
    throw new Error('No tenés permisos para eliminar esta lista');
  }

  // Borrar tareas de la lista
  const tasksRef = collection(db, 'lists', listId, 'tasks');
  const snapshot = await getDocs(tasksRef);
  const deletePromises = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
  await Promise.all(deletePromises);

  // Borrar la lista
  await deleteDoc(listRef);
}
