import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ShareButtons from './ShareButtons';

interface Props {
  userId: string;
  listId: string;
  isPublic: boolean;
  publicId: string;
}

export default function ShareToggle({ listId, isPublic, publicId }: Props) {
  const [sharing, setSharing] = useState(isPublic);
  const [copied, setCopied] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  const toggleSharing = async () => {
  const listRef = doc(db, 'lists', listId);
  const newSharingStatus = !sharing;

  await updateDoc(listRef, {
    isPublic: newSharingStatus,
    });
  
    setSharing(newSharingStatus);
    
    // Mostrar los botones si ahora está compartido
    if (newSharingStatus) {
      setShowButtons(true);
    } else {
      setShowButtons(false);
    }
  };
  

  const handleCopy = async () => {
    try {
      const url = `${window.location.origin}/compartir/${publicId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setShowButtons(true); // Mostrar botones al copiar
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Error al copiar el enlace');
    }
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <button onClick={toggleSharing}>
        {sharing ? '🔒 Ocultar Link' : '🔓 Ver Link'}
      </button>

      {sharing && (
        <div style={{ marginTop: 10 }}>
          <button
            onClick={handleCopy}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '10px',
            }}
          >
            📋 {copied ? '¡Link copiado!' : 'Copiar link público'}
          </button>

          {showButtons && (
            <div style={{ marginTop: 10 }}>
              <ShareButtons publicId={publicId} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
