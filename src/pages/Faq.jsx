import React, { useState } from "react";
import "./FAQ.css";
import { FiChevronDown, FiChevronUp, FiSearch } from "react-icons/fi";

const preguntas = [
  {
    pregunta: "¿Cómo me registro en la plataforma?",
    respuesta: "Puedes registrarte haciendo clic en el botón 'Registro' y completando tus datos personales y académicos.",
  },
  {
    pregunta: "¿Cómo postulo a un proyecto de servicio social?",
    respuesta: "Una vez registrado, accede al listado de proyectos, selecciona uno que te interese y haz clic en 'Postularme'.",
  },
  {
    pregunta: "¿Puedo editar mi perfil después de registrarme?",
    respuesta: "Sí, puedes actualizar tu información desde la sección 'Perfil de usuario' en cualquier momento.",
  },
  {
    pregunta: "¿Cuántas postulaciones puedo hacer?",
    respuesta: "Puedes postularte a varios proyectos, pero solo participar activamente en uno a la vez.",
  },
  {
    pregunta: "¿Qué pasa si abandono un proyecto?",
    respuesta: "Debes notificar a la institución correspondiente. El abandono sin justificación puede afectar futuras postulaciones.",
  },
];

const FAQ = () => {
  const [activo, setActivo] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const toggle = (index) => {
    setActivo(index === activo ? null : index);
  };

  const resaltar = (texto, termino) => {
    if (!termino) return texto;
    const regex = new RegExp(`(${termino})`, "gi");
    const partes = texto.split(regex);
    return partes.map((parte, index) =>
      parte.toLowerCase() === termino.toLowerCase() ? (
        <mark key={index}>{parte}</mark>
      ) : (
        parte
      )
    );
  };

  const preguntasFiltradas = preguntas.filter(
    (item) =>
      item.pregunta.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.respuesta.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="faq-container">
      <h1 className="faq-title">Preguntas Frecuentes</h1>
      <p className="faq-subtitle">Encuentra respuestas a las dudas más comunes</p>

      <div className="faq-buscador">
        <FiSearch className="faq-buscador-icon" />
        <input
          type="text"
          placeholder="Buscar pregunta..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="faq-list">
        {preguntasFiltradas.length > 0 ? (
          preguntasFiltradas.map((item, index) => (
            <div
              key={index}
              className={`faq-item glass ${activo === index ? "activo" : ""}`}
              onClick={() => toggle(index)}
            >
              <div className="faq-pregunta">
                {activo === index ? (
                  <FiChevronUp className="faq-icon" />
                ) : (
                  <FiChevronDown className="faq-icon" />
                )}
                <h3>{resaltar(item.pregunta, busqueda)}</h3>
              </div>
              <div
                className="faq-respuesta"
                style={{
                  maxHeight: activo === index ? "500px" : "0px",
                  opacity: activo === index ? 1 : 0,
                }}
              >
                <p>{resaltar(item.respuesta, busqueda)}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="faq-no-results">No se encontraron preguntas con ese término.</p>
        )}
      </div>
    </div>
  );
};

export default FAQ;
