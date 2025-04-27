import React, { useState, useEffect, useContext } from "react";

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
import { useNavigate } from "react-router-dom";
// import { projects } from "../data/projects";
import { CardList } from "../components/ProjectCard";
import { FaUserGraduate, FaChalkboardTeacher, FaHeart } from "react-icons/fa";
import { FaPerson } from "react-icons/fa6";
import { SessionContext } from "../Contexts/SessionContext";
import './Projects.css';

const Projects = () => {
  const [modalidadFilter, setModalidadFilter] = useState("Todos");
  const [carreraFilter, setCarreraFilter] = useState("");
  const [hoveredId, setHoveredId] = useState(null);
  const [imageIndexes, setImageIndexes] = useState({});
  const [projects, setProjects] = useState([{proyecto_id:0, nombre_proyecto:""}])
  const navigate = useNavigate();
  const { sessionType } = useContext(SessionContext)

  useEffect(() => {
    fetch("http://localhost:5000/proyectos")
    .then((res)=> res.json())
    .then((proyectos) => setProjects(proyectos))
  }, []);
    
  const handleModalidadChange = (event) => {
    setModalidadFilter(event.target.value);
  };

  const handleCarreraClick = (carrera) => {
    setCarreraFilter(carrera === carreraFilter ? "" : carrera);
  };

  const filteredProjects = projects.filter((project) => {
    const matchModalidad =
      modalidadFilter === "Todos" || project.modalidad === modalidadFilter;
    const matchCarrera =
      carreraFilter === "" || project.carreras.includes(carreraFilter);
    return matchModalidad && matchCarrera;
  });

  useEffect(() => {
    let interval;
    if (hoveredId !== null) {
      interval = setInterval(() => {
        setImageIndexes((prev) => {
          const currentProject = projects.find((p) => p.id === hoveredId);
          if (!currentProject) return prev;
          const currentIndex = prev[hoveredId] || 0;
          const nextIndex = (currentIndex + 1) % currentProject.images.length;
          return { ...prev, [hoveredId]: nextIndex };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [hoveredId]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 4,
        fontFamily: "Inter, sans-serif",
        background: "linear-gradient(135deg, #f0f4f8 0%, #e0e7ff 100%)",
        minHeight: "100vh",
      }}

      
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 700, color: "#1e293b", mb: 3 }}
      >
        Proyectos Solidarios - {"Vista de: "+sessionType}
      </Typography>

      {/* Filtros */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 5 }}>
  <Box
    className="notch-elevated"
    sx={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 2,
      px: 3,
      py: 2,
    }}
  >
   <Button
  className={`glass-button ${modalidadFilter === "Todos" ? "active" : ""}`}
  onClick={() => setModalidadFilter("Todos")}
>
  TODOS
</Button>


<Select
  value={modalidadFilter}
  onChange={handleModalidadChange}
  displayEmpty
  className={`glass-select ${modalidadFilter !== "Todos" ? "active" : ""}`}
>
  <MenuItem value="Todos">Todos</MenuItem>
  <MenuItem value="Presencial">Presencial</MenuItem>
  <MenuItem value="En línea">En línea</MenuItem>
</Select>


    {["ARQ", "LAD", "ISC", "MKT", "DER", "PSI"].map((carrera, idx) => (
  <Button
    key={carrera}
    className={`glass-button ${carreraFilter === carrera ? "active" : ""}`}
    onClick={() => handleCarreraClick(carrera)}
    sx={{ "--hue": idx * 45 }}
  >
    {carrera}
  </Button>
))}


  </Box>
</Box>
      {/* contenedor de las tarjetas */}
      {/* {console.log(projects)} */}
        <CardList entries={projects}></CardList>
    </Box>
  );
};

export default Projects;
