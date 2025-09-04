import React from "react";
import { useAuth } from "./AuthContext"; // ajusta la ruta según tu estructura
import { FaSignOutAlt } from "react-icons/fa";

const LogoutButton: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      console.log("Sesión cerrada ✅");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <button onClick={handleLogout} style={{ position: 'fixed', top: 10, right: 80, }}>
      <FaSignOutAlt />
    </button>
  );
};

export default LogoutButton;
