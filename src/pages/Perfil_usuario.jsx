import React, { useContext, useEffect, useState } from "react";
import {
  FiMapPin,
  FiClock,
  FiUser,
  FiCalendar,
  FiHeart,
  FiStar,
  FiUsers
} from "react-icons/fi";
import { SessionContext } from "../Contexts/SessionContext";
import "./Perfil_usuario.css";

const Perfil_usuario = () => {
  const { sessionType, sessionId, sessionName } = useContext(SessionContext);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    if (!sessionType || !sessionId) return;

    const endpoint =
      sessionType === "alumno"
        ? `http://localhost:8000/alumnos/${sessionId}`
        : `http://localhost:8000/osf/${sessionId}`;

    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => setUsuario(data))
      .catch((err) => console.error("Error al cargar perfil:", err));
  }, [sessionType, sessionId]);

  return (
    <div className="perfil-container">
      <h1 className="perfil-title">Perfil</h1>
      <p className="perfil-subtitle">Resumen de tu información</p>

      <div className="perfil-card">
        <div className="perfil-header">
          <div className="perfil-avatar">
            <FiUser size={40} />
          </div>
          <div>
            <h2 className="perfil-nombre">{usuario?.nombre || sessionName || "Nombre"}</h2>
            <p className="perfil-rol">{usuario?.rol || "Estudiante/OSF"}</p>
          </div>
        </div>

        <div className="perfil-info-grid">
          <div className="perfil-info-item">
            <FiMapPin />
            <span>{usuario?.ubicacion || "Ubicacion no disponible"}</span>
          </div>
          <div className="perfil-info-item">
            <FiClock />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
          <div className="perfil-info-item">
            <FiCalendar />
            <span>Miembro desde: {usuario?.fecha_registro || "Fecha desconocida"}</span>
          </div>
          <div className="perfil-info-item">
            <FiHeart />
            <span>{usuario?.recomendaciones || 0} postulaciones</span>
          </div>
        </div>

        <p className="perfil-descripcion">
          {usuario?.descripcion ||
            "Aun no se ha agregado una descripcion personalizada."}
        </p>

        <div className="perfil-skills">
          {(usuario?.skills || ["Tag1", "Tag2", "Tag3"]).map((skill, i) => (
            <span key={i} className="perfil-skill-tag">
              <FiStar size={12} /> {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Perfil_usuario;
