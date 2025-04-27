import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleNavigation = (text) => {
    switch (text) {
      case "Proyectos Overview":
        navigate("/");
        break;
      case "Respuestas Alumnos":
        navigate("/respuesta_alumnos");
        break;
      case "Proyectos a revisar":
        navigate("/proyectos_revisar");
        break;
      case "Exportar":
        navigate("/exportar");
        break;
      default:
        break;
    }
  };

  return (
    <div className="sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <img src="/logoservicio.png" alt="Logo" className="sidebar-logo" />
        <span className="sidebar-title">Servicio Social</span>
      </div>

      {/* Navigation List */}
      <ul className="sidebar-list">
        {["Proyectos Overview", "Respuestas Alumnos", "Proyectos a revisar", "Exportar"].map(
          (text) => (
            <li
              key={text}
              className="sidebar-item"
              onClick={() => handleNavigation(text)}
            >
              {text}
            </li>
          )
        )}
      </ul>

      {/* Decorative Element */}
      <div className="sidebar-decorator" />
    </div>
  );
};

export default Sidebar;
