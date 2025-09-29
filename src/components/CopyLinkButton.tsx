// src/components/CopyLinkButton.tsx
import { useState } from 'react';

interface Props {
  publicId: string;
}

export default function CopyLinkButton({ publicId }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const link = `${window.location.origin}/compartir/${publicId}`;

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error al copiar el link:', error);
    }
  };

  return (
    <div style={{ marginTop: 10 }}>
      <button
        onClick={handleCopy}
        style={{
          backgroundColor: '#0072C6',
          color: 'white',
          padding: '3px 9px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
        }}
      >
        📋
      </button>

      {copied && (
        <span style={{ marginLeft: 10, color: 'green', fontWeight: 'bold' }}>
          ✅ Link copiado
        </span>
      )}
    </div>
  );
}
