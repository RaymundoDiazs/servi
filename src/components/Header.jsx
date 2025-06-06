import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import appleLogo from "/logoservicio.png";
import lupi2 from "/lupi2.png";
import jetpackIcon from "/jetpackx3.png";
import { FaBars } from "react-icons/fa";

const Header = ({
  onMenuClick,
  toggleCharacter,
  toggleAI,
  onRightMenuClick,
  className = ""
}) => {
  const buttons = [
    { text: "Perfil de usuario", link: "/perfil_usuario" },
    { text: "Acerca de", link: "/acerca_de" },
    { text: "FAQ", link: "/Faq" },
    { text: "Referencias" },
  ];

  return (
    <header className={`apple-header ${className}`}>
      {/* Boton izquierdo original */}
      <button className="menu-toggle" onClick={onMenuClick}>☰</button>

      <img src={appleLogo} alt="Logo" className="apple-logo" />

      <nav className="nav-buttons">
        {buttons.map((btn, index) =>
          btn.link ? (
            <Link to={btn.link} key={index}>
              <button className="nav-button">{btn.text}</button>
            </Link>
          ) : (
            <button key={index} className="nav-button">{btn.text}</button>
          )
        )}
      </nav>

      {/* Botones de personaje + botón de RightBar */}
      <div
        className="sprite-buttons"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
          marginRight: "2.5rem"
        }}
      >
        <button
          className="sprite-toggle-button"
          title="Abrir menú derecho"
          onClick={onRightMenuClick}
        >
          <FaBars />
        </button>

        {
        <button
          className="sprite-toggle-button"
          title="Activar Lupi"
          onClick={toggleCharacter}
        >
          <img src={lupi2} alt="Lupi" />
        </button>

/*
        <button
          className="sprite-toggle-button"
          title="Activar Jetpack IA"
          onClick={toggleAI}
        >
          <img src={jetpackIcon} alt="Jetpack" />
        </button>
        */}
      </div>
    </header>
  );
};

export default Header;
