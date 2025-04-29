import React, { useState, useEffect } from "react";
import "./RightBar.css";

const lupiFramesRight = [
  "lupi1.png",
  "lupi2.png",
  "lupi3.png",
  "lupi4.png",
  "lupi5.png",
  "lupi6.png",
];

const piezasRandom = ["puzzleg1.png","puzzleg2.png","puzzleg3.png","puzzleg4.png"];

const RightBar = ({ isOpen, onClose, setShowCharacter, setShowAICharacter, setShowPetMode }) => {
  const [frameIndex, setFrameIndex] = useState(0);
  const [modo, setModo] = useState("Seguir Cursor");
  const [modeloIA, setModeloIA] = useState("Base");
  const [curiosidad, setCuriosidad] = useState(47);

  //Lista de piezas con sus posiciones 
  const [piezas, setPiezas] = useState([
    { id: 1, x: 50, y: 50, image: "puzzleg1.png" },
    { id: 2, x: 150, y: 80, image: "puzzleg2.png" },
    { id: 3, x: 100, y: 150, image: "puzzleg3.png" },

  ]);
  const [draggingId, setDraggingId] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const addNewPiece = () => {
    const numa = Math.floor(Math.random() * 4);
  
    const newPiece = {
      id: Date.now(),
      x: Math.random() * 250 + 50,
      y: Math.random() * 250 + 50,
      numa: numa,
      image: piezasRandom[numa] 
    };
  
    setPiezas((prev) => [...prev, newPiece]);
  };
  

  // Resetear posiciones de las piezas
  const resetPieces = () => {
    setPiezas([
      { id: 1, x: 50, y: 50, image: "puzzleg1.png" },
      { id: 2, x: 150, y: 80, image: "puzzleg2.png" },
      { id: 3, x: 100, y: 150, image: "puzzleg3.png" },
    ]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % lupiFramesRight.length);
    }, 130);
    return () => clearInterval(interval);
  }, []);

  // Logica de arrastre de piezas
  const handleMouseDown = (e, id) => {
    e.preventDefault();
    setDraggingId(id);
    const pieza = piezas.find((p) => p.id === id);
    setOffset({ x: e.clientX - pieza.x, y: e.clientY - pieza.y });
  };

  const handleMouseMove = (e) => {
    if (draggingId !== null) {
      setPiezas((prev) =>
        prev.map((p) =>
          p.id === draggingId
            ? { ...p, x: e.clientX - offset.x, y: e.clientY - offset.y }
            : p
        )
      );
    }
  };

  const handleMouseUp = () => {
    if (draggingId !== null) {
      const draggedPiece = piezas.find(p => p.id === draggingId);

      // Calcular que las piezas se junten (como efecto iman())
      setPiezas(prev =>
        prev.map(p => {
          if (p.id === draggingId) {
            const snapX = Math.round(draggedPiece.x / 50) * 50; // Ajustamos el tamaño de la atraccion a 50px
            const snapY = Math.round(draggedPiece.y / 50) * 50;
            return { ...p, x: snapX, y: snapY }; // Ajusta la pieza 
          }
          return p;
        })
      );
    }
    setDraggingId(null);
  };

  const aplicarCambios = () => {
    if (modo === "Seguir Cursor") {
      setShowCharacter(true);
      setShowAICharacter(false);
      setShowPetMode(false);
    } else if (modo === "Asistente") {
      setShowCharacter(false);
      setShowAICharacter(true);
      setShowPetMode(false);
    } else if (modo === "Mascota virtual") {
      setShowCharacter(false);
      setShowAICharacter(false);
      setShowPetMode(true);
    }
    onClose();
  };

  return (
    <div
      className={`rightbar-overlay ${isOpen ? "visible" : ""}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="rightbar-panel">
        <button className="rightbar-close" onClick={onClose}>✕</button>

        <h2 className="rightbar-title">Menú Teus</h2>

        <div className="lupi-container">
          <img
            src={lupiFramesRight[frameIndex]}
            alt="Lupi animado"
            className="lupi-sprite"
          />
        </div>

        <ul className="rightbar-options">
          {['Seguir Cursor', 'Asistente', 'Mascota virtual'].map((op) => (
            <li
              key={op}
              style={{
                color: modo === op ? '#fff' : '#ccc',
                fontWeight: modo === op ? 600 : 400,
                cursor: 'pointer',
              }}
              onClick={() => setModo(op)}
            >
              {op}
            </li>
          ))}
        </ul>

        {/*Contenido dinamico variando que se escoga */}
        <div style={{ marginTop: "2rem", width: "100%" }}>
          {modo === "Seguir Cursor" && (
            <>
              <div style={{ color: "white", marginBottom: "1rem", textAlign: "center" }}>
                Mascota TEC.<br />Teus feliz. 
              </div>
            </>
          )}

          {modo === "Asistente" && (
            <>
              <label style={{ color: "white", fontWeight: "bold" }}>Modelo IA</label>
              <select
                value={modeloIA}
                onChange={(e) => setModeloIA(e.target.value)}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "10px", marginTop: "0.5rem" }}
              >
                <option>Base</option>
                <option>Explorador</option>
                <option>Analítico</option>
              </select>

              {/* Canvas de piezas */}
              <h4 style={{ color: "white", marginTop: "1.5rem" }}>Arma tu IA</h4>
              <div
                style={{
                  width: "100%",
                  height: "300px",
                  background: "#e5e7eb",
                  borderRadius: "12px",
                  marginTop: "1rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {piezas.map((pieza) => (
                  <div
                    key={pieza.id}
                    onMouseDown={(e) => handleMouseDown(e, pieza.id)}
                    style={{
                      width: "150px", // tam piezas
                      height: "150px",
                      backgroundImage: `url(${pieza.image})`, //imagen para la pieza
                      position: "absolute",
                      left: pieza.x,
                      top: pieza.y,
                      borderRadius: "8px",
                      cursor: "grab",
                      userSelect: "none",
                      backgroundSize: "cover",
                    }}
                  />
                ))}
              </div>
              <div style={{ color: "gray", fontSize: "12px", marginTop: "0.5rem" }}>
                Arrastra y acomoda las piezas.
              </div>

              {/* slider (aun sin uso=) */}
              <label style={{ color: "white", fontWeight: "bold", marginTop: "2rem", display: "block" }}>Nivel de exploración</label>
              <input
                type="range"
                value={curiosidad}
                onChange={(e) => setCuriosidad(Number(e.target.value))}
                min={0}
                max={100}
                style={{ width: "100%" }}
              />
              <div style={{ color: "white", marginTop: "0.3rem" }}>{curiosidad}% de curiosidad</div>

              {/*Botones de Reset y Agregar nueva pieza */}
              <div style={{ marginTop: "1rem", textAlign: "center" }}>
  <button
    onClick={resetPieces}
    className="rightbar-button3" // estilo boton clase
  >
    Reset Piezas
  </button>
  <button
    onClick={addNewPiece}
    className="rightbar-button3" 
  >
    Agregar Nueva Pieza
  </button>
</div>

            </>
          )}

          {modo === "Mascota virtual" && (
            <>
              <div style={{ color: "white", marginBottom: "1rem", textAlign: "center" }}>
                Mascota modo.<br />Random stuff
              </div>
            </>
          )}
        </div>

        <button
          onClick={aplicarCambios}
          style={{
            marginTop: "2rem",
            padding: "0.7rem",
            borderRadius: "12px",
            width: "100%",
            fontWeight: 600,
            background: "#6366f1",
            color: "white",
            border: "none",
            cursor: "pointer"
          }}
        >
          Aplicar cambios
        </button>
      </div>
    </div>
  );
};

export default RightBar;
