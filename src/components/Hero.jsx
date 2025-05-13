import React from "react";
import { Button } from "@mui/material";
import "./Hero.css";

const Hero = ({ searchText, setSearchText }) => {
  return (
    <div className="hero-container">
      <video autoPlay muted loop className="hero-video">
        <source src="/videoserviciosocial.mp4" type="video/mp4" />
        Tu navegador no soporta video.
      </video>
      <div className="hero-overlay">
        <h1>Explora proyectos solidarios</h1>
        <input
          className="hero-search"
          type="text"
          placeholder="¿A dónde quieres postularte?"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="hero-filters">
          {[
            "Servicio social comunitario",
            "Servicio social ambiental",
            "Servicio social en hospitales y centros de salud",
            "Servicio social digital",
          ].map((label, index) => (
            <Button
              key={index}
              sx={{
                borderRadius: "100px",
                padding: "6px 20px",
                textTransform: "none",
                fontWeight: "500",
                backgroundColor: "#0052CC",
                color: "white",
                '&:hover': {
                  backgroundColor: "#0747A6"
                }
              }}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
