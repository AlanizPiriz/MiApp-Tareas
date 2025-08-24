import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface Props {
  userId: string;
  listId: string;
  isPublic: boolean;
  publicId: string;
}

export default function ShareToggle({ listId, isPublic, publicId }: Props) {
  const [sharing, setSharing] = useState(isPublic);

  const toggleSharing = async () => {
    const listRef = doc(db, 'lists', listId); // <-- actualizada la ruta
    await updateDoc(listRef, {
      isPublic: !sharing,
    });
    setSharing(!sharing);
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <button onClick={toggleSharing}>
        {sharing ? '🔒 Dejar de compartir' : '🔓 Compartir públicamente'}
      </button>

      {sharing && (
        <div style={{ marginTop: 10 }}>
          <strong>Link público:</strong>{' '}
          <a
            href={`${window.location.origin}/compartir/${publicId}`}
            target="_blank"
            rel="noreferrer"
          >
            {window.location.origin}/compartir/{publicId}
          </a>
        </div>
      )}
    </div>
  );
}
