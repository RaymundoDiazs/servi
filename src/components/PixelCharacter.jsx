import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { BallContext } from "../Contexts/BallContext";

import { useContext } from "react";





// SPRITES
const walkFramesRight = ["walk1_right.png", "walk2_right.png", "walk3_right.png", "walk4_right.png", "walk5_right.png"];
const walkFramesLeft = ["walk1_left.png", "walk2_left.png", "walk3_left.png", "walk4_left.png", "walk5_left.png"];
const lupiFramesRight = ["lupi1.png", "lupi2.png", "lupi3.png", "lupi4.png", "lupi5.png", "lupi6.png"];
const lupiFramesLeft = ["lupi1l.png", "lupi2l.png", "lupi3l.png", "lupi4l.png", "lupi5l.png", "lupi6l.png"];
const lianaFrames = ["climblong1.png", "climb3g.png", "climb4g.png"];
const jetpackFrames = ["jetpackx1.png", "jetpackx2.png", "jetpackx3.png", "jetpackx4.png", "jetpackx5.png", "jetpackx6.png"];

const PixelCharacter = () => {
  const { ballPos, depositPoint, entregando, setBallPos, setDepositPoint, setEntregando,ballLanded,
    setBallLanded, } = useContext(BallContext);


  const location = useLocation();

  //Posicion
  const [position, setPosition] = useState({ x: window.innerWidth / 2 });
  const [targetX, setTargetX] = useState(window.innerWidth / 2);
  const [frame, setFrame] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [groundY, setGroundY] = useState(window.innerHeight * 0.894);
  const [direction, setDirection] = useState("right");
  const [isInspecting, setIsInspecting] = useState(false);
  const [staticInspectFrame, setStaticInspectFrame] = useState(0);

  //Estados 
  const characterRef = useRef(null);
  const isJumpingRef = useRef(false);
  const isGoingUpRef = useRef(false);
  const isDescendingRef = useRef(false);
  const initialYRef = useRef(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const targetStep = 420; //317 cards pevias //Var de valor de bajada



  



  // =============================== //
// OTRA RUTA: (Plantilla)
// =============================== //
useEffect(() => {
  if (location.pathname !== "/tu-ruta") return;
  //logica
}, [location]);

// =============================== //
// RESPUESTA ALUMNOS: movimiento hacia pelota y depósito
// =============================== //
useEffect(() => {
  if (location.pathname !== "/respuesta_alumnos") return;
  if (!ballPos || !ballLanded || depositPoint || entregando) return;


  let interval = null;

  //si hay pelota y aan no hay deposito, ir hacia ella
  if (ballPos && ballLanded && !depositPoint && !entregando)
    {
    interval = setInterval(() => {
      setPosition((prev) => {
        const dx = ballPos.x - prev.x;
        if (Math.abs(dx) < 4) {
          clearInterval(interval);
  
          // Esperar un poqco antes de empezar a entregar  (efecto de recoger)
          setTimeout(() => {
            const tabla = document.querySelector(".respuestas-tabla table");
            if (tabla) {
              const rect = tabla.getBoundingClientRect();
              const x = rect.right - 40;
              const y = rect.top + window.scrollY - 40;
              setDepositPoint({ x, y });
              setEntregando(true);
            }
          }, 300); // pequeño retraso tras llegar
  
          return prev;
        }
  
        // Sigue caminando hacia la pelota
        const dir = dx > 0 ? 1 : -1;
        setIsMoving(true);
        setDirection(dir > 0 ? "right" : "left");
        return { x: prev.x + dir * 4 };
      });
    }, 30);
  }
  
  

  //Si ya tiene que ir a depositar
  // Movimiento hacia el deposito (cuando entregando es true y depositPoint está definido)
if (depositPoint && entregando) {
  interval = setInterval(() => {
    setPosition((prev) => {
      const dx = depositPoint.x - prev.x;
      if (Math.abs(dx) < 4) {
        clearInterval(interval);

        // Llego al punto de entrega, reiniciar todo
        setEntregando(false);
        setDepositPoint(null);
        //setBallPos(null); //desaparece la pelota original

        return prev;
      }

      // Sigue caminando hacia el deposito
      setIsMoving(true);
      const dir = dx > 0 ? 1 : -1;
      setDirection(dir > 0 ? "right" : "left");
      return { x: prev.x + dir * 4 };
    });
  }, 30);
}

  

  return () => clearInterval(interval);
}, [location.pathname, ballPos, depositPoint, entregando]);


  // =============================== //
  // PROYECTOS: comportamiento interactivo
  // =============================== //
  useEffect(() => {
    if (location.pathname !== "/") return;

    const handleMouseMove = (e) => {
      setTargetX(e.clientX);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [location]);

  useEffect(() => {
    if (location.pathname !== "/") return;

    const interval = setInterval(() => {
      setPosition((prev) => {
        const dx = targetX - prev.x;
        const speed = 3;
        if (Math.abs(dx) < 3) {
          setIsMoving(false);
          return prev;
        }
        setIsMoving(true);
        const dir = dx > 0 ? 1 : -1;
        setDirection(dir > 0 ? "right" : "left");
        return { x: prev.x + dir * speed };
      });
    }, 30);

    return () => clearInterval(interval);
  }, [targetX, location]);

  useEffect(() => {
    if (location.pathname !== "/") return;

    const handleScroll = () => {
      const header = document.querySelector("header");
      if (!characterRef.current || !header) return;

      const characterTop = characterRef.current.getBoundingClientRect().top;
      const headerBottom = header.getBoundingClientRect().bottom;
      const isHeaderCovering = characterTop <= headerBottom;
      const canScrollDownMore = window.innerHeight + window.scrollY < document.body.scrollHeight;

      if (isHeaderCovering && !isDescendingRef.current && canScrollDownMore) {
        isGoingUpRef.current = false;
        isDescendingRef.current = true;

        setCurrentLevel((prev) => {
          const newLevel = prev + 1;
          const newY = initialYRef.current + newLevel * targetStep;
          animateGroundYTo(newY, () => { isDescendingRef.current = false; });
          return newLevel;
        });
      }

      const scrollThresholdToReturn = initialYRef.current + (currentLevel - 1) * targetStep;
      if (window.scrollY < scrollThresholdToReturn - 50 && currentLevel > 0 && !isDescendingRef.current) {
        isGoingUpRef.current = true;
        isDescendingRef.current = true;
        setCurrentLevel((prev) => {
          const newLevel = prev - 1;
          const newY = initialYRef.current + newLevel * targetStep;
          animateGroundYTo(newY, () => {
            isDescendingRef.current = false;
            isGoingUpRef.current = false;
          });
          return newLevel;
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [location, currentLevel]);

  useEffect(() => {
    if (location.pathname !== "/") return;
    const projectCard = document.querySelector(".card");
    if (projectCard) {
      const rect = projectCard.getBoundingClientRect();
      const scrollTop = window.scrollY || window.pageYOffset;
      const initialY = rect.top + scrollTop - 25; //Inicio del personaje
      setGroundY(initialY);
      initialYRef.current = initialY;
    }
  }, [location]);

  useEffect(() => {
    if (location.pathname !== "/") return;

    const cards = document.querySelectorAll(".card");

    const handleMouseEnter = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const isRight = centerX > window.innerWidth / 2;
      setDirection(isRight ? "right" : "left");
      setIsInspecting(true);
      if (!isMoving) {
        const frameSet = isRight ? lupiFramesRight : lupiFramesLeft;
        const randomIndex = Math.floor(Math.random() * frameSet.length);
        setStaticInspectFrame(randomIndex);
      }
    };

    const handleMouseLeave = () => {
      setIsInspecting(false);
      setFrame(0);
    };

    cards.forEach((card) => {
      card.addEventListener("mouseenter", handleMouseEnter);
      card.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      cards.forEach((card) => {
        card.removeEventListener("mouseenter", handleMouseEnter);
        card.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, [isMoving, location]);

 // =============================== //
// DASHBOARD: seguir tarjetas y moverse entre filas (jetpac)
// =============================== //
useEffect(() => {
  if (location.pathname !== "/dashboard") return;

  const cards = Array.from(document.querySelectorAll(".dashboard-card"));
  if (!cards.length) return;

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + window.scrollY + rect.height / 2;

    const characterOffset = 8;
    const characterHeight = 64;

    //const targetY = rect.top + window.scrollY + characterOffset;
    const targetY = rect.top + window.scrollY - characterHeight;


    const diffY = targetY - groundY;
    if (Math.abs(diffY) > 12) {
      isJumpingRef.current = true;
      animateGroundYTo(targetY, () => {
        isJumpingRef.current = false;
      });
    } else {
      animateGroundYTo(targetY);
    }

    setTargetX(centerX);
  };

  const handleMouseLeave = () => {
    setIsMoving(false); //Deja de moverse
  };

  cards.forEach((card) => {
    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);
  });

  return () => {
    cards.forEach((card) => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
    });
  };
}, [location, groundY]);


// =============================== //
// DASHBOARD: movimiento horizontal
// =============================== //
useEffect(() => {
  if (location.pathname !== "/dashboard") return;

  const interval = setInterval(() => {
    setPosition((prev) => {
      const dx = targetX - prev.x;
      const speed = 3;
      if (Math.abs(dx) < 3) {
        setIsMoving(false);
        return prev;
      }
      setIsMoving(true);
      const dir = dx > 0 ? 1 : -1;
      setDirection(dir > 0 ? "right" : "left");
      return { x: prev.x + dir * speed };
    });
  }, 30);

  return () => clearInterval(interval);
}, [targetX, location]);



  // =============================== //
  // Animacion general
  // =============================== //
  useEffect(() => {
    const frames =
      isJumpingRef.current
        ? jetpackFrames
        : isInspecting
        ? direction === "right"
          ? lupiFramesRight
          : lupiFramesLeft
        : direction === "right"
        ? walkFramesRight
        : walkFramesLeft;

    if (!isMoving && !isInspecting && !isJumpingRef.current) {
      setFrame(0);
      return;
    }

    const animInterval = setInterval(() => {
      setFrame((prev) => (prev + 1) % frames.length);
    }, 150); //Cambiar velocidad

    return () => clearInterval(animInterval);
  }, [isMoving, isInspecting, direction, location]);

  // =============================== //
  // SPRITE ACTUAL
  // =============================== //
  const currentFrames = isInspecting
    ? direction === "right"
      ? lupiFramesRight
      : lupiFramesLeft
    : direction === "right"
    ? walkFramesRight
    : walkFramesLeft;

  const currentSprite =
    location.pathname === "/dashboard" && isJumpingRef.current
      ? jetpackFrames[frame % jetpackFrames.length]
      : isGoingUpRef.current
      ? jetpackFrames[frame % jetpackFrames.length]
      : isDescendingRef.current
      ? lianaFrames[frame % lianaFrames.length]
      : isInspecting && !isMoving
      ? currentFrames[staticInspectFrame]
      : currentFrames[frame];

  // =============================== //
  // Movimiento vertical suave
  // =============================== //
  const animateGroundYTo = (targetY, onFinish) => {
    const interval = setInterval(() => {
      setGroundY((prev) => {
        const diff = targetY - prev;
        if (Math.abs(diff) < 3) {
          clearInterval(interval);
          onFinish?.();
          return targetY;
        }
        return prev + Math.sign(diff) * 3;
      });
    }, 20);
  };

  return (
    <>
    <img
      ref={characterRef}
      src={currentSprite}
      alt="pixel character"
      style={{
        position: "absolute",
        left: position.x,
        top: groundY,
        transform:   isGoingUpRef.current
        ? "translateX(-50%) scale(1.1)" //escala pequeña para jetpack
        : isDescendingRef.current
        ? "translateX(-50%) scale(6)" //escala grande para liana
        : "translateX(-50%)",
        
        width: 64,
        height: 64,
        objectFit: "contain",
        imageRendering: "pixelated",
        pointerEvents: "none",
        zIndex: 10,
      }}
    />
    {entregando && (
      <img
        src="/ball.png"
        alt="ball"
        style={{
          position: "absolute",
          left: position.x + 10, //posicion relativa al personaje
          top: groundY - 12,      //un poco arriba
          width: 20,
          height: 20,
          transform: "translateX(-50%)",
          imageRendering: "pixelated",
          pointerEvents: "none",
          zIndex: 9,
        }}
      />
    )}
  </>
  
  );
};

export default PixelCharacter;
