import React, { useState, useEffect } from "react";
// import { Link } from "react-router"
import { FaUserGraduate, FaChalkboardTeacher, FaHeart } from "react-icons/fa";

import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    Select,
    MenuItem,
    Avatar,
    AvatarGroup,
    Fade,
  } from "@mui/material";
export function ProjectCard({ project }) {
  const [carreras, setCarreras] = useState([{}]);
  useEffect(() => {
    fetch(`http://localhost:5000/proyecto_carrera/` + project.proyecto_id)
      .then((res) => res.json())
      .then((data) => {
        setCarreras(data);
      });
  }, [project.proyecto_id]);

  return (
    <div className="card fade-in">
      <div className="card-content">
        <div className="image-container">
          <img
            src="./public/logo.jpg"
            alt={project.title}
            className="project-image"
          />
        </div>

        <div className="card-body">
          <div className="modalidad-info">
            <div className="avatar">
              {project.modalidad === "Presencial" ? (
                <FaPerson />
              ) : (
                <FaChalkboardTeacher />
              )}
            </div>
            <p className="modalidad-text">{project.modalidad}</p>
          </div>

          <h3 className="project-title">{project.nombre_proyecto}</h3>

          <div className="carreras-list">
            {carreras.map((carrera, index) => (
              <div className="carrera-pill" key={index}>
                <FaUserGraduate size={11} />
                {carrera.nombre}
              </div>
            ))}
          </div>

          <div className="card-footer">{/* EN CASO DE QUE SE NECESITE*/}</div>
        </div>
      </div>
    </div>
  );
}
  
export function CardList({ entries }) {
  const cards = entries.map((entry) => (
    <ProjectCard project={entry} key={entry.id_post}></ProjectCard>
  ));
  return (
    <div className="cardList">
      <div className="card-grid">{cards}</div>
    </div>
  );
}