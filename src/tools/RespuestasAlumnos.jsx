import React, { useState, useEffect, useRef, useContext } from "react";
import "./RespuestasAlumnos.css";
import { FiArrowLeft, FiCheck, FiX } from "react-icons/fi";
import { BallContext } from "../Contexts/BallContext";

const dummyData = [
  { carrera: "IMT", matricula: "A01736813", telefono: "2311535986", dispuesto: false },
  { carrera: "ITC", matricula: "A01736813", telefono: "2311535986", dispuesto: true },
  { carrera: "ITC", matricula: "A01736813", telefono: "2311535986", dispuesto: true },
  { carrera: "IMT", matricula: "A01736813", telefono: "2311535986", dispuesto: false },
  { carrera: "ITC", matricula: "A01736813", telefono: "2311535986", dispuesto: true },
  { carrera: "IMT", matricula: "A01736813", telefono: "2311535986", dispuesto: false },
];

const RespuestasAlumnos = () => {
  const [filtroCarrera, setFiltroCarrera] = useState("Todas");
  const [filtroDispuesto, setFiltroDispuesto] = useState("Todos");

  const {
    ballPos,
    setBallPos,
    ballStartY,
    setBallStartY,
    depositPoint,
    setDepositPoint,
    setEntregando,
    setBallLanded,
  } = useContext(BallContext);

  const ballRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  const carreras = ["Todas", ...Array.from(new Set(dummyData.map((a) => a.carrera)))];

  const dataFiltrada = dummyData.filter((alumno) => {
    const coincideCarrera = filtroCarrera === "Todas" || alumno.carrera === filtroCarrera;
    const coincideDispuesto =
      filtroDispuesto === "Todos" ||
      (filtroDispuesto === "Sí" && alumno.dispuesto) ||
      (filtroDispuesto === "No" && !alumno.dispuesto);
    return coincideCarrera && coincideDispuesto;
  });

  // logica pelota
  useEffect(() => {
    if (!ballRef.current) return;

    setBallLanded(false); //si no cae aun

    let y = ballStartY;
    let velocity = 0;
    const gravity = 1;
    const bounce = 0.7;

    const tableTop = document.querySelector(".respuestas-tabla table").getBoundingClientRect().top;
    const containerTop = containerRef.current.getBoundingClientRect().top;
    const maxY = tableTop - containerTop - 24;

    const animate = () => {
      velocity += gravity;
      y += velocity;

      if (y >= maxY) {
        y = maxY;
        velocity *= -bounce;
        if (Math.abs(velocity) < 1.5) {
          velocity = 0;
          setBallLanded(true); //si cayo
        }
      }

      if (ballRef.current) {
        ballRef.current.style.top = `${y}px`;
      }

      if (velocity !== 0 || y < maxY) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();
  }, [ballStartY]);

  const handleClick = (e) => {
    const x = e.clientX;
    const y = e.clientY - containerRef.current.getBoundingClientRect().top;
    setBallPos({ x });
    setBallStartY(y);
  };

  return (
    <div className="respuestas-container" onClick={handleClick} ref={containerRef}>
      <div className="respuestas-header">
        <FiArrowLeft />
        <h1>Respuestas Alumnos</h1>
      </div>

      <div className="respuestas-filtros">
        <label>
          Carrera:
          <select value={filtroCarrera} onChange={(e) => setFiltroCarrera(e.target.value)}>
            {carreras.map((carrera) => (
              <option key={carrera} value={carrera}>{carrera}</option>
            ))}
          </select>
        </label>

        <label>
          Dispuesto:
          <select value={filtroDispuesto} onChange={(e) => setFiltroDispuesto(e.target.value)}>
            <option value="Todos">Todos</option>
            <option value="Sí">Sí</option>
            <option value="No">No</option>
          </select>
        </label>

        <div className="deposito" />
        <div className="respuestas-contador">
          Mostrando <strong>{dataFiltrada.length}</strong> resultados
        </div>
      </div>

      <div className="respuestas-tabla">
        <table>
          <thead>
            <tr>
              <th>Carrera</th>
              <th>Matrícula</th>
              <th>Teléfono</th>
              <th>Dispuesto</th>
            </tr>
          </thead>
          <tbody>
            {dataFiltrada.map((alumno, idx) => (
              <tr key={idx}>
                <td>{alumno.carrera}</td>
                <td>{alumno.matricula}</td>
                <td>{alumno.telefono}</td>
                <td className="icon">
                  {alumno.dispuesto ? <FiCheck className="check" /> : <FiX className="cross" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ballPos && (
        <img
          ref={ballRef}
          src="/ball.png"
          alt="ball"
          style={{
            left: ballPos.x,
            top: ballStartY,
            position: "absolute",
            width: 24,
            height: 24,
            transform: "translateX(-50%)",
            imageRendering: "pixelated",
            pointerEvents: "none",
            zIndex: 20,
          }}
        />
      )}
    </div>
  );
};

export default RespuestasAlumnos;
