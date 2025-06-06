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
  const [carreras, setCarreras] = useState([]); // CARRERAS

  // Logs de depuración para ver el ciclo de vida y los datos
  console.log("Perfil_usuario montado");
  console.log("sessionType:", sessionType, "sessionId:", sessionId);

  useEffect(() => {
    if (!sessionType || !sessionId) return;

    const endpoint =
      sessionType === "alumno"
        ? `http://localhost:8000/alumnos/user/${sessionId}` // El sessionId es el user_id
        : `http://localhost:8000/osf/${sessionId}`;

    console.log("LLAMANDO ENDPOINT: ", endpoint);

    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        console.log("usuario recibido:", data);
        setUsuario(data);
      })
      .catch((err) => console.error("Error al cargar perfil:", err));
  }, [sessionType, sessionId]);

  // 👇 NUEVO: FETCHEA LAS CARRERAS UNA SOLA VEZ
  useEffect(() => {
    fetch("http://localhost:8000/carreras")
      .then((res) => res.json())
      .then(setCarreras)
      .catch((err) => console.error("Error al cargar carreras:", err));
  }, []);

  // 👇 NUEVO: BUSCA LA CARRERA DEL USUARIO
  const carrera = carreras.find((c) => c.carrera_id === usuario?.carrera_id);

  return (
    <div className="perfil-container">
      <h1 className="perfil-title">Perfil</h1>
      <p className="perfil-subtitle">Resumen de tu información</p>

      <div className="perfil-card glass">
        <div className="perfil-header">
          <div className="perfil-avatar">
            <img src="/default-avatar.png" alt="Perfil" className="perfil-avatar-img" />
          </div>
          <div>
            <h2 className="perfil-nombre">
              {usuario ? usuario.nombre : "Nombre"}
            </h2>
            <p className="perfil-rol">
              {sessionType === "alumno" ? "Estudiante" : "OSF"}
            </p>
          </div>
        </div>

        <div className="perfil-info-grid">
          <div className="perfil-info-item">
            <strong>Matrícula:</strong> {usuario?.alumno_id || "Desconocida"}
          </div>
          <div className="perfil-info-item">
            <strong>Teléfono:</strong> {usuario?.telefono || "No disponible"}
          </div>
          <div className="perfil-info-item">
            <strong>Carrera:</strong>{" "}
            {carrera
              ? `${carrera.nombre} (${carrera.nombre_completo})`
              : usuario?.carrera_id
                ? `ID ${usuario.carrera_id}`
                : "No asignada"}
          </div>
        </div>

       

        <hr className="perfil-divider" />

         <div className="perfil-info-grid">
          <div className="perfil-info-item">Ubicación no disponible</div>
          <div className="perfil-info-item">10:53:03 p.m.</div>
          <div className="perfil-info-item">Miembro desde: Fecha desconocida</div>
          <div className="perfil-info-item">0 postulaciones</div>
        </div>

        <div className="perfil-skills">
          <div className="perfil-skill-tag">Tag1</div>
          <div className="perfil-skill-tag">Tag2</div>
          <div className="perfil-skill-tag">Tag3</div>
        </div>
      </div>
    </div>
  );
};

export default Perfil_usuario;
