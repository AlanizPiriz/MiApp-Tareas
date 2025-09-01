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
  const [sharing, setSharing] = useState(isPublic); // Estado en Firebase
  const [copied, setCopied] = useState(false);
  const [showLink, setShowLink] = useState(false); // Controla visibilidad de botones

  // Alterna el estado de sharing y actualiza en Firebase
  const toggleSharing = async () => {
    const listRef = doc(db, 'lists', listId);
    const newSharingStatus = !sharing;

    await updateDoc(listRef, { isPublic: newSharingStatus });
    setSharing(newSharingStatus);

    // Mostrar los botones de link al activar sharing
    setShowLink(newSharingStatus);
  };

  // Copiar al portapapeles
  const handleCopy = async () => {
    try {
      const url = `${window.location.origin}/compartir/${publicId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Error al copiar el enlace');
    }
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div className="ShareButtonWrapper">
        <button onClick={toggleSharing} className="ShareButton">
          {sharing ? '🔒 No compartir lista ' : '🔓 Compartir lista'}
        </button>
        <span className="tooltipText">
          <span>Divide</span> y triunfarás
        </span>
      </div>
      
      {showLink && (
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={handleCopy}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '3px 9px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px',
            }}
          >
            📋 {copied ? '¡Link copiado!' : 'Copiar link'}
          </button>
          
          {/* Botones de compartir */}
          <ShareButtons publicId={publicId} />
        </div>
      )}
    </div>

  );
}
