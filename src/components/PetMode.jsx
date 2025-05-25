// src/components/PetMode.jsx
import React, { useRef, useState, useEffect } from "react";
import lupiQuieto from "/lupi1.png"; //unico frame atm
import "./PetMode.css";

const PetMode = () => {
  const petRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  //const [position, setPosition] = useState({ x: 100, y: 100 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [showSpeech, setShowSpeech] = useState(false);
  const [speechText, setSpeechText] = useState("");

  const mensajes = [
    "¡Gracias por llevarme!",
    "¡Eres el mejor!",
    "¡Wiii!",
    "¡Me gusta pasear!",
    "¡Más aventuras!",
    "¡Qué divertido!",
  ];

  const [position, setPosition] = useState({
    x: 100, // coord
    y: window.innerHeight - 150 //y
  });
  

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, offset]);

  const startDrag = (e) => {
    const rect = petRef.current.getBoundingClientRect();
    setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsDragging(true);
  };

  const endDrag = () => {
    setIsDragging(false);
    const mensajeRandom = mensajes[Math.floor(Math.random() * mensajes.length)];
    setSpeechText(mensajeRandom);
    setShowSpeech(true);
    setTimeout(() => setShowSpeech(false), 2000); // ocultar tras 2 segundos
  };

  return (
    <>
      <img
        ref={petRef}
        src={lupiQuieto}
        alt="Lupi mascota"
        onMouseDown={startDrag}
        onMouseUp={endDrag}
        className={`pet-mode ${isDragging ? "dragging" : ""}`}
        style={{
            top: position.y || window.innerHeight - 150,
            left: position.x || 100,
            position: "fixed",
            zIndex: 9999,
          width: "60px",
          height: "60px",
          cursor: "grab",
    
          userSelect: "none",
        }}
      />

      {showSpeech && (
        <div
          className="lupi-speech"
          style={{ top: position.y - 40, left: position.x + 30 }}
        >
          {speechText}
        </div>
      )}
    </>
  );
};

export default PetMode;
