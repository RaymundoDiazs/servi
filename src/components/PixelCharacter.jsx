import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { BallContext } from "../Contexts/BallContext";

import "./sparkle.css";


import { useContext } from "react";



//Numero de proyectos (DummyData)
//import { projects } from "../data/projects";





const noFlipSprites = ["jetpack", "fall", "climb", "lupi"]; 


// SPRITES
const walkFramesRight = ["walk1_right.png", "walk2_right.png", "walk3_right.png", "walk4_right.png", "walk5_right.png"];
const walkFramesLeft = ["walk1_left.png", "walk2_left.png", "walk3_left.png", "walk4_left.png", "walk5_left.png"];
const lupiFramesRight = ["lupi1.png", "lupi2.png", "lupi3.png", "lupi4.png", "lupi5.png", "lupi6.png"];
const lupiFramesLeft = ["lupi1l.png", "lupi2l.png", "lupi3l.png", "lupi4l.png", "lupi5l.png", "lupi6l.png"];
const lianaFrames = ["climblong1.png", "climb3g.png", "climb4g.png"];
const jetpackFrames = ["jetpackx1.png", "jetpackx2.png", "jetpackx3.png", "jetpackx4.png", "jetpackx5.png", "jetpackx6.png"];
const fallFrames = [
  "fall1.png","fall2.png","fall3.png","fall4.png","fall5.png"];

  const PixelCharacter = ({ userType, hoveredType }) => {
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
  const targetStep = 495; //317 cards pevias //Var de valor de bajada


  //Estado para detectar scrolls y evitar bugs
  const isScrollingRef = useRef(false);

  //Detecta movimineto vertical
  const isAnimatingVerticalRef = useRef(false);



  //Hablar
  const [showSpeech, setShowSpeech] = useState(false);
const [speechText, setSpeechText] = useState("");

//Se cae xd
const [falling, setFalling] = useState(false);
const [fallFrame, setFallFrame] = useState(0);
const [lastMouseX, setLastMouseX] = useState(null);
const [zigzagCounter, setZigzagCounter] = useState(0);
//cae y va bajando su posicion
const [fallOffset, setFallOffset] = useState(0);





//sparkles (darle low priority, aver si se ve bonito)
const [sparkles, setSparkles] = useState([]);

const createSparkle = () => {
  const id = Math.random().toString(36).substring(7);

  setSparkles((prev) => [
    ...prev,
    { 
      id, 
      x: Math.random() * window.innerWidth, 
      y: Math.random() * window.innerHeight 
    }
  ]);

  setTimeout(() => {
    setSparkles((prev) => prev.filter((s) => s.id !== id));
  }, 3000);
};

const [numProyectos, setNumProyectos] = useState(0);


//Obtener numero de pryectos
// Obtiene el numero real de proyectos desde el backend
useEffect(() => {
  const fetchProyectos = async () => {
    try {
      const res = await fetch("http://localhost:8000/proyectos", { credentials: "include" });
      const data = await res.json();
      setNumProyectos(data.length); // supondremos que te regresa un array de proyectos
    } catch (error) {
      console.error("Error al obtener proyectos:", error);
      setNumProyectos(0);
    }
  };

  fetchProyectos();
}, []);



//General (En todas las rutas)
//Se cae xd
useEffect(() => {
  const handleMouseMove = (e) => {
    if (lastMouseX !== null) {
      const deltaX = Math.abs(e.clientX - lastMouseX);

      if (deltaX > 100) { // 🔥
        setZigzagCounter(prev => prev + 1);
      }
      
    }
    setLastMouseX(e.clientX);
  };

  window.addEventListener("mousemove", handleMouseMove);

  return () => {
    window.removeEventListener("mousemove", handleMouseMove);
  };
}, [lastMouseX]);

useEffect(() => {
  if (zigzagCounter >= 10 && !falling) { // después de 5 zigzags se caera el teus
    iniciarCaida();
  }
}, [zigzagCounter]);

const iniciarCaida = () => {
  setFalling(true);
  setZigzagCounter(0);
  setFallOffset(0); // empieza desde 0

  let frame = 0;
  let offset = 0;

  const interval = setInterval(() => {
    setFallFrame(frame);
    setFallOffset(offset);

    frame++;
    offset += 8; // baja 8px cuando se cae (para que no flotexd)

    if (frame >= fallFrames.length) {
      clearInterval(interval);
      setFalling(false);
      setFallFrame(0);
      setFallOffset(0); // vuelve a su posicion original
    }
  }, 150); // velocidad de frames
};







const frasesProyectos = [
  <>¡Actualmente hay <span style={{ color: "red" }}>{numProyectos}</span> proyectos para explorar!</>,
  <>¿Te gustaría postularte a uno de estos proyectos? </>,
  <>¡Oportunidades solidarias para ti! </>,
  <>¡<span style={{ color: "red" }}>{numProyectos}</span> opciones increíbles para ti!</>,
];


const frasesFormularios = [
  "¡Varios alumnos han completado sus formularios! ",
  "Recuerda revisar las nuevas respuestas. ",
  "¡Formularios enviados recientemente! ",
];

const frasesAtencion = [
  "Algunos alumnos necesitan orientación especial. ",
  "¡No los dejes esperando! Ayudémoslos. ",
  "Estos alumnos requieren tu apoyo para avanzar. ",
];




  // =============================== //
// OTRA RUTA: (Plantilla)
// =============================== //
useEffect(() => {
  if (location.pathname !== "/tu-ruta") return;
  //logica
}, [location]);


 // =============================== //
// SIGNUP: hover frases y animación
// =============================== //
useEffect(() => {
  if (location.pathname !== "/signup") return;

  if (hoveredType === "alumno") {
    setSpeechText("¿Listo para registrar proyectos y hacer un cambio? ");
    setShowSpeech(true);
  } else if (hoveredType === "osf") {
    setSpeechText("¡Gracias por apoyar! ");
    setShowSpeech(true);
  } else if (hoveredType === "limpiar") {
    setSpeechText("¿Cambiaste de opinión? ");
    setShowSpeech(true);
  } else {
    setShowSpeech(false);
  }
}, [hoveredType, location]);

// =============================== //
// SIGNUP: jetpack junto a campo activo
// =============================== //
useEffect(() => {
  if (location.pathname !== "/signup" || !userType) return;

  const inputs = Array.from(document.querySelectorAll(".signup-card-right input, .signup-card-right select, .signup-card-right textarea"));
  if (!inputs.length) return;

  const handleFocus = (e) => {
    const rect = e.target.getBoundingClientRect();
    const fieldX = rect.left - 40; // izquierda del input
    const fieldY = rect.top + window.scrollY - 32;

    setTargetX(fieldX);
    const diffY = fieldY - groundY;

    if (Math.abs(diffY) > 10) {
      isJumpingRef.current = true;
      animateGroundYTo(fieldY, () => {
        isJumpingRef.current = false;
      });
    } else {
      animateGroundYTo(fieldY);
    }

    // Mostrar texto del campo
    const label = e.target.closest("div")?.querySelector("label")?.innerText;
    if (label) {
      setSpeechText(`Campo: ${label}`);
      setShowSpeech(true);
    }
  };

  const handleBlur = () => setShowSpeech(false);

  inputs.forEach((input) => {
    input.addEventListener("focus", handleFocus);
    input.addEventListener("blur", handleBlur);
  });

  return () => {
    inputs.forEach((input) => {
      input.removeEventListener("focus", handleFocus);
      input.removeEventListener("blur", handleBlur);
    });
  };
}, [location, userType, groundY]);



//console.log("🚀 Texto:", speechText, "| Mostrar:", showSpeech);




// =============================== //
// IA: movimiento desde PyTorch (vista proyectos)
// =============================== //
useEffect(() => {
  if (!location.pathname.startsWith("/projects/")) return;

  console.log("IA activada en vista de detalle");

  const interval = setInterval(async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/predict-direction"
, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cursor_x: targetX,
          char_x: position.x,
        }),
      });

      const data = await res.json();
      const dir = data.direction === "right" ? 1 : -1;

      setIsMoving(true);
      setDirection(dir > 0 ? "right" : "left");
      setPosition((prev) => ({ x: prev.x + dir * 3 }));
    } catch (err) {
      console.error("Error al contactar IA:", err);
    }
  }, 100);

  return () => clearInterval(interval);
}, [location.pathname, targetX, position.x]);




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
  //Es el responsable de hacer que el personaje siga al Mouse
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
    const projectCard = document.querySelector(".MuiGrid-item");
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

    const cards = document.querySelectorAll(".MuiGrid-item");

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

  const handleScroll = () => {
    const header = document.querySelector("header");
    if (!characterRef.current || !header) return;

    const characterTop = characterRef.current.getBoundingClientRect().top;
    const headerBottom = header.getBoundingClientRect().bottom;
    const isHeaderCovering = characterTop <= headerBottom;
    const canScrollDownMore = window.innerHeight + window.scrollY < document.body.scrollHeight;

    // 🔒 Evitar múltiples triggers conflictivos
    if (isScrollingRef.current || isDescendingRef.current || isGoingUpRef.current || isJumpingRef.current) return;

    if (isHeaderCovering && canScrollDownMore) {
      isScrollingRef.current = true;
      isDescendingRef.current = true;

      setCurrentLevel((prev) => {
        const newLevel = prev + 1;
        const newY = initialYRef.current + newLevel * targetStep;
        animateGroundYTo(newY, () => {
          isScrollingRef.current = false;
          isDescendingRef.current = false;
        });
        return newLevel;
      });
    }

    const scrollThresholdToReturn = initialYRef.current + (currentLevel - 1) * targetStep;

    if (window.scrollY < scrollThresholdToReturn - 50 && currentLevel > 0) {
      isScrollingRef.current = true;
      isGoingUpRef.current = true;

      setCurrentLevel((prev) => {
        const newLevel = prev - 1;
        const newY = initialYRef.current + newLevel * targetStep;
        animateGroundYTo(newY, () => {
          isScrollingRef.current = false;
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
  if (location.pathname !== "/dashboard") return;

  const cards = Array.from(document.querySelectorAll(".dashboard-card"));
  if (!cards.length) return;

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + window.scrollY + rect.height / 2;
  
    const characterOffset = 8;
    const characterHeight = 64;
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
  
    // 📢 Mostrar globos dinámicos
    const text = e.currentTarget.innerText.toLowerCase(); // <-- Convertimos a minúsculas para comparar
  
    if (text.includes("proyecto")) {
      setSpeechText(frasesProyectos[Math.floor(Math.random() * frasesProyectos.length)]);
      setShowSpeech(true);
      //createSparkle();
    } else if (text.includes("formulario")) {
      setSpeechText(frasesFormularios[Math.floor(Math.random() * frasesFormularios.length)]);
      setShowSpeech(true);
    } else if (text.includes("atención")) {
      setSpeechText(frasesAtencion[Math.floor(Math.random() * frasesAtencion.length)]);
      setShowSpeech(true);
    } else {
      setShowSpeech(false);
    }
    
  };
  
  
  
  const handleMouseLeave = () => {
    setIsMoving(false);
    setShowSpeech(false); // Ocultar globo cuando deja la tarjeta
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

/*
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

        */

  // =============================== //
  useEffect(() => {
    const isSignupJetpack = location.pathname === "/signup" && userType;
  
    const frames =
      isJumpingRef.current || isSignupJetpack
        ? jetpackFrames
        : isInspecting
        ? direction === "right"
          ? lupiFramesRight
          : lupiFramesLeft
        : direction === "right"
        ? walkFramesRight
        : walkFramesLeft;
  
    const shouldAnimate =
      isMoving ||
      isInspecting ||
      isJumpingRef.current ||
      isSignupJetpack;
  
    if (!shouldAnimate) {
      if (location.pathname.startsWith("/projects/")) return;
      setFrame(0);
      return;
    }
  
    const animInterval = setInterval(() => {
      setFrame((prev) => (prev + 1) % frames.length);
    }, 150); // puedes ajustar la velocidad aquí
  
    return () => clearInterval(animInterval);
  }, [isMoving, isInspecting, direction, location, userType]); // ✅ ESTA ES LA ÚNICA CIERRE QUE NECESITAS
  

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
    (location.pathname === "/dashboard" && (isJumpingRef.current || isAnimatingVerticalRef.current)) ||
    (location.pathname === "/signup" && userType) ||
    isGoingUpRef.current
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
    isAnimatingVerticalRef.current = true; // ← 🔒 indicar que está animando
  
    const interval = setInterval(() => {
      setGroundY((prev) => {
        const diff = targetY - prev;
        if (Math.abs(diff) < 3) {
          clearInterval(interval);
          isAnimatingVerticalRef.current = false; // ← 🔓 terminó animación
          onFinish?.();
          return targetY;
        }
        return prev + Math.sign(diff) * 3;
      });
    }, 20);
  };
  
  

  const shouldFlip = (sprite) => {
    if (!sprite) return false;
  
    // Sprites que SIEMPRE queremos voltear si dirección === left
    const flipAlways = ["jetpack", "climb"];
  
    // sprites que NUNCA debemos voltear porque ya están hechos para left
    const noFlipSprites = ["_left", "lupi", "fall"];
  
    if (flipAlways.some(keyword => sprite.includes(keyword))) {
      return true; // Siempre voltear jetpack y climb
    }
  
    if (noFlipSprites.some(keyword => sprite.includes(keyword))) {
      return false; // NO voltear walk_left, lupi, fall
    }
  
    return true; // voltear walk normal (walk1_right.png) si vamos a la izquierda
  };
  
  
  
  const isFlipped = direction === "left" && shouldFlip(currentSprite);

  //Si se esta en signup y hay un userType, regresar a globos pequeños
  const isSignup = location.pathname === "/signup";
const isBigSignup = isSignup && !userType;

  

  return (

    
    <>
 <img
  ref={characterRef}
  src={falling ? `${fallFrames[fallFrame]}` : currentSprite}
  alt="pixel character"
  style={{
    position: "absolute",
    left: position.x,
    top: falling ? groundY + fallOffset : groundY,
    transform: `
      translateX(-50%)
      ${isFlipped ? " scaleX(-1)" : ""}
      ${
        location.pathname === "/signup"
          ? " scale(2.3)" // 👉 SOLO en /signup lo agrandamos
          : falling
          ? ""
          : location.pathname.startsWith("/projects/")
          ? ""
          : isGoingUpRef.current
          ? " scale(1.1)"
          : isDescendingRef.current
          ? " scale(6)"
          : ""
      }
    `,
    //Si ta se escogio un usertype, volvera  a su tamaño original
    width:
  location.pathname === "/signup"
    ? userType
      ? 32  // ✅ pequeño si ya eligió
      : 180 // ✅ grande si no ha elegido
    : 64,   // ✅ tamaño normal en dashboard y otras rutas

height:
  location.pathname === "/signup"
    ? userType
      ? 32
      : 180
    : 64,

  
  
  
    objectFit: "contain",
    imageRendering: "pixelated",
    pointerEvents: "none",
    zIndex: 10,
  }}
/>




  


  
  {/* Globo de texto */}
  {showSpeech && (
  <div
    className="lupi-speech"
    style={{
      position: "absolute",
      top: isSignup ? groundY - (isBigSignup ? 150 : 50) : groundY - 50,
      left: isSignup ? position.x - (isBigSignup ? 260 : -30) : position.x + 30,
      padding: isBigSignup ? "12px 20px" : "6px 10px",
      background: "white",
      color: "#1e293b",
      borderRadius: "14px",
      fontSize: isBigSignup ? "16px" : "12px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
      pointerEvents: "none",
      zIndex: 1000,
      maxWidth: "260px",
      lineHeight: "1.3",
      fontWeight: 700,
      whiteSpace: "normal",
      wordWrap: "break-word",
      textAlign: "right",
    }}
  >
    {speechText}
  </div>
)}






  

  {/*sparkle */}
  {sparkles.map((sparkle) => (
  <div
    key={sparkle.id}
    className="sparkle"
    style={{
      left: `${sparkle.x}px`,
      top: `${sparkle.y}px`,
      position: "absolute",
    }}
  />
))}






  {/*bola si está entregando */}
  {entregando && (
    <img
      src="/ball.png"
      alt="ball"
      style={{
        position: "absolute",
        left: position.x + 10,
        top: groundY - 12,
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