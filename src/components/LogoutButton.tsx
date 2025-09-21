import React from "react";
import { useAuth } from "./AuthContext"; // ajusta la ruta según tu estructura
//import { FaSignOutAlt } from "react-icons/fa";

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
    <button
      onClick={handleLogout}
      style={{
        position: "fixed",
        top: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        cursor: "pointer",
      }}
      className="logout-button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="logout-icon"
      >
        <g id="sign-out">
          <path d="M9,20.75H6a2.64,2.64,0,0,1-2.75-2.53V5.78A2.64,2.64,0,0,1,6,3.25H9a.75.75,0,0,1,0,1.5H6a1.16,1.16,0,0,0-1.25,1V18.22a1.16,1.16,0,0,0,1.25,1H9a.75.75,0,0,1,0,1.5Z"/>
          <path d="M16,16.75a.74.74,0,0,1-.53-.22.75.75,0,0,1,0-1.06L18.94,12,15.47,8.53a.75.75,0,1,1,1.06-1.06l4,4a.75.75,0,0,1,0,1.06l-4,4A.74.74,0,0,1,16,16.75Z"/>
          <path d="M20,12.75H9a.75.75,0,0,1,0-1.5H20a.75.75,0,0,1,0,1.5Z"/>
        </g>
      </svg>
    </button>


  );
};

export default LogoutButton;
