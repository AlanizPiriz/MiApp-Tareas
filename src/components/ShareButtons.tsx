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
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;

    window.open(gmailUrl, '_blank'); // Abre Gmail directamente
  };



 return (
  <div
    style={{
      marginTop: 0,
      marginBottom: 0,
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: '12px',
      alignItems: 'center',
    }}
  >
    <button
      onClick={handleShareByWhatsApp}
      aria-label="Compartir por WhatsApp"
      style={{
        backgroundColor: '#25D366',
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
      <FaWhatsapp size={20} />
      <span>WhatsApp</span>
    </button>

    <button
      onClick={handleShareByEmail}
      aria-label="Compartir por Email"
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
        fontSize: '16px',
      }}
    >
      <MdEmail size={20} />
          <span>Email</span>
        </button>
    </div>
  );
    
};

export default ShareButtons;
