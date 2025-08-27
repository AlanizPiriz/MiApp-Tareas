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
          padding: '8px 12px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        📋 Copiar link
      </button>

      {copied && (
        <span style={{ marginLeft: 10, color: 'green', fontWeight: 'bold' }}>
          ✅ Link copiado
        </span>
      )}
    </div>
  );
}
