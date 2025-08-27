// ShareButtons.tsx
import { FaWhatsapp } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

interface ShareButtonsProps {
  publicId: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ publicId }) => {
  const baseUrl = 'https://mi-app-tareas.vercel.app/compartir/';
  const fullUrl = `${baseUrl}${publicId}`;

  const handleShareByWhatsApp = () => {
    const message = `¡Mirá esta lista de tareas! ${fullUrl}`;
    const encodedMessage = encodeURIComponent(message);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const whatsappUrl = isMobile
      ? `whatsapp://send?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  const handleShareByEmail = () => {
    const subject = encodeURIComponent('¡Mirá esta lista de tareas!');
    const body = encodeURIComponent(`Hola,\n\nTe comparto esta lista de tareas:\n${fullUrl}`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
  };

  return (
    <div style={{ marginTop: 10, marginBottom: 20, display: 'flex', gap: '12px' }}>
      <button
        onClick={handleShareByWhatsApp}
        aria-label="Compartir por WhatsApp"
        style={{
          backgroundColor: '#25D366',
          color: 'white',
          padding: '10px 15px',
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
        <FaWhatsapp size={20} />
      </button>

      <button
        onClick={handleShareByEmail}
        aria-label="Compartir por Email"
        style={{
          backgroundColor: '#0072C6',
          color: 'white',
          padding: '10px 15px',
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
        <MdEmail size={20} />
      </button>
    </div>
  );
};

export default ShareButtons;
