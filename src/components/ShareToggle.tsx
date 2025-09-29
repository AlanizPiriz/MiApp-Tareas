import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import ShareButtons from "./ShareButtons";
import { FaLock, FaLockOpen } from "react-icons/fa";

interface Props {
  userId?: string;
  listId: string;
  isPublic: boolean;
  publicId: string;
}

export default function ShareToggle({listId, isPublic, publicId }: Props) {
  const [sharing, setSharing] = useState(isPublic);
  const [copied, setCopied] = useState(false);

  // Alterna el estado de sharing y actualiza en Firebase
  const toggleSharing = async () => {
    const listRef = doc(db, "lists", listId);
    const newSharingStatus = !sharing;

    try {
      await updateDoc(listRef, { isPublic: newSharingStatus });
      setSharing(newSharingStatus);
    } catch (err) {
      console.error("Error actualizando la lista:", err);
      alert("No se pudo cambiar el estado de compartir");
    }
  };

  // Copiar al portapapeles
  const handleCopy = async () => {
    try {
      const url = `${window.location.origin}/compartir/${publicId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      alert("Error al copiar el enlace");
    }
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div className="ShareButtonWrapper">
        <button onClick={toggleSharing} className="ShareButton">
          {sharing ? <FaLockOpen color="white" /> : <FaLock color="white" />}
          {sharing ? " No compartir lista" : " Compartir lista"}
        </button>
        <span className="tooltipText">
          <span>Divide</span> y triunfarás
        </span>
      </div>

      {sharing && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "relative", display: "inline-block" }}>
            <button
              onClick={handleCopy}
              aria-label="Copiar enlace al portapapeles"
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
              }}
            >
              📋
            </button>

            {/* Tooltip encima del botón */}
            {copied && (
              <div
                style={{
                  position: "absolute",
                  bottom: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  marginBottom: "6px",
                  background: "rgba(0, 0, 0, 0.8)",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                  zIndex: 100,
                  lineHeight: "1.2",
                  display: "flex",
                  alignItems: "center",
                  textAlign: "center",
                  opacity: copied ? 1 : 0,
                  transition: "opacity 0.3s ease",
                }}
              >
                ¡Link copiado!
              </div>
            )}
          </div>
          <ShareButtons publicId={publicId} />
        </div>
      )}
    </div>
  );
}
