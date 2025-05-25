import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

// SPRITES
const walkRight = ["walk1_right.png", "walk2_right.png", "walk3_right.png"];
const walkLeft = ["walk1_left.png", "walk2_left.png", "walk3_left.png"];
const lupiRight = ["lupi1.png", "lupi2.png", "lupi3.png"];
const lupiLeft = ["lupi1l.png", "lupi2l.png", "lupi3l.png"];
const jetpack = ["jetpackx1.png", "jetpackx2.png", "jetpackx3.png"];
const liana = ["climblong1.png", "climb3g.png", "climb4g.png"];

const PixelCharacterAI = () => {
  const location = useLocation();
  const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight * 0.88 });
  const [frame, setFrame] = useState(0);
  const [direction, setDirection] = useState("right");
  const [isInspecting, setIsInspecting] = useState(false);
  const [isGoingUp, setIsGoingUp] = useState(false);
  const [isGoingDown, setIsGoingDown] = useState(false);
  const [targets, setTargets] = useState([]);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const characterRef = useRef();

  //Estados texto
  const [showSpeech, setShowSpeech] = useState(false);
const [speechText, setSpeechText] = useState("");

const frases = [
  "Estoy examinando cada detalle del proyecto detenidamente...",
  "Analizando posibles mejoras y áreas de oportunidad en esta propuesta.",
  "Recopilando información valiosa para optimizar el flujo de trabajo.",
  "Detectando patrones y posibles innovaciones que podríamos implementar.",
  "Este proyecto tiene un gran potencial, seguiré investigando más a fondo.",
  "Estudiando el impacto que este proyecto podría tener a largo plazo.",
  "Reuniendo datos para una mejor toma de decisiones estratégicas.",
  "Explorando soluciones creativas para los desafíos planteados aquí.",
  "Evaluando la viabilidad y los beneficios de esta iniciativa.",
  "Observando cada aspecto técnico y creativo de esta propuesta..."
];



  // === Buscar objetivos en la pagina (distintas clases, por añadir mas) ===
  useEffect(() => {
    const allTargets = [
      ...document.querySelectorAll(".main-card"),
      ...document.querySelectorAll(".related-card"),
      ...document.querySelectorAll(".MuiGrid-item"), //si en / también hay tarjetas
      ...document.querySelectorAll(".dashboard-card"), // i en dashboard también
    ];

    const sorted = allTargets.sort((a, b) => {
      const rectA = a.getBoundingClientRect();
      const rectB = b.getBoundingClientRect();
      return rectA.top - rectB.top || rectA.left - rectB.left;
    });

    setTargets(sorted);
  }, [location]);

  // ===movimiento automatico hacia ciertos objetivos ===
  useEffect(() => {
    if (targets.length === 0) return;

    const interval = setInterval(() => {
      const target = targets[currentTargetIndex];
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + window.scrollY - 20;

      const dx = targetX - position.x;
      const dy = targetY - position.y;

      const dist = Math.hypot(dx, dy);


      //Si inspecciona (es un estado), hablar y otras funciones
      if (dist < 10 && !isInspecting) {
        setIsInspecting(true);
setSpeechText(frases[Math.floor(Math.random() * frases.length)]);
setShowSpeech(true);

setTimeout(() => {
  setIsInspecting(false);
  setShowSpeech(false);
  setCurrentTargetIndex((prev) => (prev + 1) % targets.length);
}, 1500);


        return;
      }

      const dir = dx > 0 ? 1 : -1;
      setDirection(dir > 0 ? "right" : "left");

      if (Math.abs(dy) > 20) {
        setIsGoingUp(dy < 0);
        setIsGoingDown(dy > 0);
      } else {
        setIsGoingUp(false);
        setIsGoingDown(false);
      }

      setPosition((prev) => ({
        x: prev.x + dir * 2,
        y: prev.y + Math.sign(dy) * 2,
      }));
    }, 40);

    return () => clearInterval(interval);
  }, [targets, currentTargetIndex, position, isInspecting]);

  // === Animacion de sprite ===
  useEffect(() => {
    const frames = isGoingUp
      ? jetpack
      : isGoingDown
      ? liana
      : isInspecting
      ? direction === "right"
        ? lupiRight
        : lupiLeft
      : direction === "right"
      ? walkRight
      : walkLeft;

    const anim = setInterval(() => {
      setFrame((f) => (f + 1) % frames.length);
    }, 150);

    return () => clearInterval(anim);
  }, [direction, isInspecting, isGoingUp, isGoingDown]);

  // === Sprite actual ===
  const sprite =
    isGoingUp
      ? `/${jetpack[frame]}`
      : isGoingDown
      ? `/${liana[frame]}`
      : isInspecting
      ? `/${direction === "right" ? lupiRight[frame] : lupiLeft[frame]}`
      : `/${direction === "right" ? walkRight[frame] : walkLeft[frame]}`;

      return (
        <>
          <img
            ref={characterRef}
            src={sprite}
            alt="PixelCharacter"
            style={{
              position: "absolute",
              left: position.x,
              top: position.y,
              transform: isGoingUp
                ? "translateX(-50%) scale(1.1)"
                : isGoingDown
                ? "translateX(-50%) scale(6)"
                : "translateX(-50%)",
              width: 64,
              height: 64,
              objectFit: "contain",
              imageRendering: "pixelated",
              pointerEvents: "none",
              zIndex: 999,
            }}
          />
      
          {showSpeech && (
            <div
              style={{
                position: "absolute",
                top: position.y - 40,
                left: position.x + 30,
                padding: "6px 10px",
                background: "white",
                color: "#1e293b",
                borderRadius: "10px",
                fontSize: "12px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                pointerEvents: "none",
                zIndex: 1000,
                whiteSpace: "nowrap",
                fontWeight: 600,
              }}
            >
              {speechText}
            </div>
          )}
        </>
      );
      
      
};

export default PixelCharacterAI;
