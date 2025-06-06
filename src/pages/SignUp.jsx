import React, { useState } from 'react';
import FormsAlumno from '../components/FormsAlumno';
import FormsOSF from '../components/FormsOsf';
import './SignUp.css';
import PixelCharacter from "../components/PixelCharacter";

const SignUp = () => {
  const [userType, setUserType] = useState("");
  const [hoveredType, setHoveredType] = useState("");


  return (
    <div className="signup-page-centered">
      <div className="signup-card-wide">
        {/* Agente pixelado a la izquierda */}
        <div className="signup-card-left">
  <img src="/sslogo_black.png" alt="Logo Servicio Social" className="signup-logo-left" />
  <PixelCharacter userType={userType} hoveredType={hoveredType} />
</div>


        {/* Formulario a la derecha */}
        <div className="signup-card-right">
        {!userType && (
  <>
    <h2>Registro</h2>
    <p>¿Quién eres?</p>
    <div className="signup-toggle-buttons">
      {/*
      <button
        className="glass-button"
        onMouseEnter={() => setHoveredType("alumno")}
        onMouseLeave={() => setHoveredType("")}
        onClick={() => setUserType("alumno")}
      >
        Alumno
      </button>
*/}


<button
  className="glass-button"
  onMouseEnter={() => setHoveredType("alumno")}
  onMouseLeave={() => setHoveredType("")}
  onClick={() => {
    setUserType("alumno");

    //Enfocar automáticamente el primer campo
    setTimeout(() => {
      const firstInput = document.querySelector(
        ".signup-card-right input, .signup-card-right select"
      );
      firstInput?.focus();
    }, 100); // esperar a que el formulario se renderice
  }}
>
  Alumno
</button>




      <button
        className="glass-button"
        onMouseEnter={() => setHoveredType("osf")}
        onMouseLeave={() => setHoveredType("")}
        onClick={() => setUserType("osf")}
      >
        Organización
      </button>

      <button
        className="glass-button"
        onMouseEnter={() => setHoveredType("limpiar")}
        onMouseLeave={() => setHoveredType("")}
        onClick={() => setUserType("")}
      >
        Limpiar
      </button>
    </div>
  </>
)}

{userType === "alumno" && <FormsAlumno />}
{userType === "osf" && <FormsOSF />}

        </div>
      </div>
    </div>
  );
};

export default SignUp;
