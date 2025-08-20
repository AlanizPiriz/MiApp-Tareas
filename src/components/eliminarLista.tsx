import { db } from '../firebase'; // ajusta la ruta a tu archivo firebase.ts
import {
  doc,
  deleteDoc,
  collection,
  getDocs
} from "firebase/firestore";

/**
 * Elimina una lista y todas sus tareas relacionadas de Firestore
 * @param listaId - ID del documento de la lista a eliminar
 */
export const eliminarLista = async (listaId: string): Promise<void> => {
  const confirmar = window.confirm("¿Estás seguro de que deseas eliminar esta lista y todas sus tareas?");
  if (!confirmar) return;

  try {
    // 1. Borrar tareas de la subcolección
    const tareasRef = collection(db, `listas/${listaId}/tareas`);
    const tareasSnapshot = await getDocs(tareasRef);

    const deletePromises = tareasSnapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);

    // 2. Borrar el documento de la lista
    await deleteDoc(doc(db, "listas", listaId));

    console.log("✅ Lista y tareas eliminadas correctamente.");
  } catch (error) {
    console.error("❌ Error al eliminar la lista:", error);
  }
};
