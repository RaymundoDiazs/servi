import React, { useState, useEffect, useContext } from "react";
import {
  Box, Card, CardContent, Typography, Grid, Button, Select, MenuItem,
  Avatar, Fade, Drawer, TextField, FormControl, InputLabel, Slider, Checkbox, ListItemText
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FaUserGraduate, FaChalkboardTeacher, FaHeart, FaClock, FaStar, FaUserFriends } from "react-icons/fa";
import { FaPerson } from "react-icons/fa6";
import { FilterList } from "@mui/icons-material";
import { SessionContext } from "../Contexts/SessionContext";
import "./Projects.css";
import ProjectModal from "../pages/ProjectModal"; // ajusta la ruta si es necesario
import Hero from "../components/Hero"; // ajusta la ruta si es necesario





const Projects = () => {
  const [projectsDb, setProjectsDb] = useState([]);
  const [modalidadFilter, setModalidadFilter] = useState("Todos");
  const [carreraFilter, setCarreraFilter] = useState("");
  const [hoveredId, setHoveredId] = useState(null);
  const [imageIndexes, setImageIndexes] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [horasMin, setHorasMin] = useState("");
  const [horasMax, setHorasMax] = useState("");
  const [edadRange, setEdadRange] = useState([0, 100]);
  const [valoresSeleccionados, setValoresSeleccionados] = useState([]);
  const { sessionType } = useContext(SessionContext);
  //const navigate = useNavigate(); //Sin navegacion ahora solo abre un modal

  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null); //Para el model dependiendo el proyect
  const [searchText, setSearchText] = useState(""); //Dar funcionamiento a el campo de busqueda de HERO



  useEffect(() => {
    const handler = (e) => {
      setProyectoSeleccionado(e.detail); // Abrir nuevo proyecto desde rpoyectos relacinoados
    };
    window.addEventListener("abrir-proyecto", handler);
    return () => window.removeEventListener("abrir-proyecto", handler);
  }, []);
  



  useEffect(() => {
    fetch("http://localhost:8000/proyectos")
      .then((res) => res.json())
      .then((proyectos) => {
        const adaptados = proyectos.map((p) => ({
          id: p.proyecto_id,
          title: p.nombre_proyecto,
          modalidad: p.modalidad,
          valor_promueve: p.valor_promueve?.trim() || "Sin valor",
          rango_edad: p.rango_edad.replace(/\[|\)/g, "").split(",")[1] || "100",
          horas: p.cantidad,
          images: ["/logo.jpg"],
          carreras: ["ARQ", "ISC", "MKT"],
        }));
        setProjectsDb(adaptados);
      });
  }, []);

 

  const handleModalidadChange = (e) => setModalidadFilter(e.target.value);
  const handleCarreraClick = (carrera) => setCarreraFilter(carrera === carreraFilter ? "" : carrera);

  const filteredProjects = projectsDb.filter((project) => {

    const matchTitle = project.title.toLowerCase().includes(searchText.toLowerCase());
    const horas = parseInt(project.horas);
    const edad = parseInt(project.rango_edad);
    const matchHorasMin = horasMin === "" || horas >= parseInt(horasMin);
    const matchHorasMax = horasMax === "" || horas <= parseInt(horasMax);
    const matchEdad = !isNaN(edad) && edad >= edadRange[0] && edad <= edadRange[1];
    const matchModalidad = modalidadFilter === "Todos" || project.modalidad === modalidadFilter;
    const matchValores = valoresSeleccionados.length === 0 || valoresSeleccionados.includes(project.valor_promueve);
    return matchTitle && matchHorasMin && matchHorasMax && matchEdad && matchModalidad && matchValores;
  });
  

  useEffect(() => {
    let interval;
    if (hoveredId !== null) {
      interval = setInterval(() => {
        setImageIndexes((prev) => {
          const currentProject = projectsDb.find((p) => p.id === hoveredId);
          if (!currentProject) return prev;
          const currentIndex = prev[hoveredId] || 0;
          const nextIndex = (currentIndex + 1) % currentProject.images.length;
          return { ...prev, [hoveredId]: nextIndex };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [hoveredId, projectsDb]);

  return (
    <Box className="projects-page">

{ sessionType === "alumno" && <Hero searchText={searchText} setSearchText={setSearchText} /> }


      
      <Box className="projects-header">
        <Typography variant="h4">Proyectos Solidarios - {sessionType}</Typography>
        <Button variant="outlined" startIcon={<FilterList />} onClick={() => setDrawerOpen(true)}>Filtros Avanzados</Button>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 5 }}>
  <Box
    className="notch-elevated" // Clase para filtros bonitos
    sx={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 2,
      px: 3,
      py: 2,
      borderRadius: 4, // 
      backgroundColor: "rgba(255,255,255,0.5)", // glassy
      backdropFilter: "blur(12px)", // 🔵 Blur
      border: "1px solid rgba(255,255,255,0.3)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.1)", // Elevación bonita
      
    }}
    
  >
<Button className={`glass-button-projects ${modalidadFilter === "Todos" ? "active" : ""}`}>
Todos
    </Button>
    <Select value={modalidadFilter} onChange={handleModalidadChange} displayEmpty className="glass-select">
      <MenuItem value="Todos">Todos</MenuItem>
      <MenuItem value="Presencial">Presencial</MenuItem>
      <MenuItem value="En línea">En línea</MenuItem>
    </Select>
    {["ARQ", "LAD", "ISC", "MKT", "DER", "PSI"].map((carrera, idx) => (
      <Button
      key={carrera}
      className={`glass-buttonProjects ${carreraFilter === carrera ? "active" : ""}`}
      onClick={() => handleCarreraClick(carrera)}
      sx={{ "--hue": idx * 45 }}
    >
      {carrera}
    </Button>

      
    ))}

  </Box>
</Box>


      <Box className="cardList">
        <Grid container spacing={4}>
          {filteredProjects.map((project, index) => (
            <Fade in={true} timeout={500 + index * 100} key={project.id}>
              <Grid item xs={12} sm={6} md={4} lg={3}>
              <Card
              //Desde ACA EMPIEZA TODA EL elemento CARD, no es posible realizar algo similar desde un CSS
          //onClick={() => navigate(`/projects/${project.id}`)} //Quitamos navigate para usar el modal
          onClick={() => setProyectoSeleccionado(project)}

          onMouseEnter={() => setHoveredId(project.id)}
          onMouseLeave={() => setHoveredId(null)}
          sx={{
            borderRadius: 5,
            overflow: "hidden",
            cursor: "pointer",
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(8px)",
            transition: "all 0.4s ease",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            position: "relative",
            boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "-70%",
              width: "50%",
              height: "100%",
              background: "linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0) 100%)",
              transform: "skewX(-20deg)",
              opacity: 0,
              zIndex: 1,
              transition: "left 1.5s ease, opacity 0.3s ease",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "-90%",
              width: "50%",
              height: "100%",
              transform: "skewX(-20deg)",
              opacity: 0,
              zIndex: 1,
              transition: "left 2.2s ease, opacity 0.3s ease",
            },
            "&:hover::before": {
              left: "120%",
              opacity: 1,
              transition: "left 1.8s ease, opacity 0.3s ease",
            },
            "&:hover::after": {
              left: "150%",
              opacity: 1,
              transition: "left 2.8s ease 0.4s, opacity 0.3s ease",
            },
            "&:hover": {
  transform: "scale(1.02) rotateX(1deg) rotateY(1deg)",
  boxShadow: "0 12px 30px rgba(0,0,0,0.15), 0 0 12px rgba(255,255,255,0.7)",
  animation: "glowPulse 2.5s ease-in-out infinite",
},
"@keyframes glowPulse": {
  "0%, 100%": { boxShadow: "0 0 0 rgba(255,255,255,0)" },
  "50%": { boxShadow: "0 0 15px rgba(255,255,255,0.7)" },
},

            "& > *": {
              position: "relative",
              zIndex: 2,
            },
          }}
          
          
          
        >
                  <Box sx={{ position: "relative" }}>
                    <img
                      src={
                        hoveredId === project.id
                          ? project.images[imageIndexes[project.id] || 0]
                          : project.images[0]
                      }
                      alt={project.title}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                      }}
                    />
                    {project.nuevo && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          backgroundColor: "#ff3b83",
                          color: "#fff",
                          px: 1.4,
                          py: "3px",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          borderRadius: "999px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        }}
                      >
                        Nuevo
                      </Box>
                    )}
                  </Box>


<CardContent>
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
  <Avatar
  sx={{
    width: 32,
    height: 32,
    backgroundColor: "#e0f2fe",
    color: "#0284c7",
    fontSize: "14px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 0.3, // pequeño espacio entre íconos
  }}
>
  {project.modalidad.toLowerCase() === "presencial" && <FaPerson />}
  {project.modalidad.toLowerCase() === "en linea" && <FaChalkboardTeacher />}
  {project.modalidad.toLowerCase() === "mixto" && (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.2 }}>
      <FaPerson size={10} />
      <FaChalkboardTeacher size={10} />
    </Box>
  )}
</Avatar>



    <Typography variant="body2" sx={{ color: "#64748b" }}>
      {project.modalidad}
    </Typography>
  </Box>

  <Typography
  variant="h6"
  sx={{
    fontWeight: 700,
    fontSize: "1rem",
    mb: 1,
    color: "#1e293b",
    display: "inline-block",
    "& span": {
      display: "inline-block",
      transition: "transform 0.3s ease",
    },
    "&:hover span": {
      animation: "bounceUp 0.6s ease forwards",
    },
    "&:hover span:nth-of-type(1)": { animationDelay: "0s" },
    "&:hover span:nth-of-type(2)": { animationDelay: "0.04s" },
    "&:hover span:nth-of-type(3)": { animationDelay: "0.08s" },
    "&:hover span:nth-of-type(4)": { animationDelay: "0.12s" },
    "&:hover span:nth-of-type(5)": { animationDelay: "0.16s" },
    "&:hover span:nth-of-type(6)": { animationDelay: "0.2s" },
    "&:hover span:nth-of-type(7)": { animationDelay: "0.24s" },
    "&:hover span:nth-of-type(8)": { animationDelay: "0.28s" },
    "&:hover span:nth-of-type(9)": { animationDelay: "0.32s" },
    "&:hover span:nth-of-type(10)": { animationDelay: "0.36s" },
    "&:hover span:nth-of-type(11)": { animationDelay: "0.4s" },
  }}
>
{project.title.split("").map((char, i) => (
  <span key={i}>{char === " " ? "\u00A0" : char}</span>
))}

</Typography>



    {/* Color tags carreras y efecto hover */}
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
  {project.carreras.map((carrera, idx) => (
    <Box
      key={carrera}
      sx={{
        fontSize: "0.65rem",
        px: 1.6,
        py: "4px",
        borderRadius: "999px",
        fontWeight: 600,
        background: `linear-gradient(135deg, hsl(${(idx * 97) % 360}, 80%, 85%), hsl(${(idx * 97 + 30) % 360}, 80%, 75%))`,
        color: "#334155",
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          background: `linear-gradient(135deg, hsl(${(idx * 97 + 20) % 360}, 90%, 88%), hsl(${(idx * 97 + 50) % 360}, 90%, 78%))`,
        },

        //Jump letras
        "@keyframes bounceUp": {
  "0%": { transform: "translateY(0)" },
  "30%": { transform: "translateY(-6px)" },
  "60%": { transform: "translateY(2px)" },
  "100%": { transform: "translateY(0)" },
},

      }}
    >
      <FaUserGraduate size={10} />
      {carrera}
    </Box>
  ))}
</Box>



  {/* Informacion de horas requeridas, edad, valores*/}
<Box
  sx={{
    display: "grid",
    gap: 1,
    mb: 2,
    p: 1,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 3,
  }}
>
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <FaClock size={14} style={{ color: "#475569" }} />
    <Typography variant="caption" sx={{ fontWeight: 500, color: "#475569" }}>
      {project.horas} horas requeridas
    </Typography>
  </Box>
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <FaUserFriends size={14} style={{ color: "#475569" }} />
    <Typography variant="caption" sx={{ fontWeight: 500, color: "#475569" }}>
      {project.rango_edad} años
    </Typography>
  </Box>
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <FaStar size={14} style={{ color: "#475569" }} />
    <Typography variant="caption" sx={{ fontWeight: 500, color: "#475569" }}>
      {project.valor_promueve}
    </Typography>
  </Box>
</Box>

</CardContent>


                </Card>
              </Grid>
            </Fade>
          ))}
        </Grid>
      </Box>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
      <Box

  sx={{
    //Css de filtros
    borderRadius: 4,
    p: 3,
    backgroundColor: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 6px 12px rgba(0,0,0,0.08)",
    border: "1px solid rgba(255,255,255,0.3)",
  }}
>

    
    
  
    <Box>
      <Typography variant="h6" fontWeight="bold" mb={3} sx={{ color: "#1e293b" }}>
        Filtros Avanzados
      </Typography>

      <TextField
        label="Horas mínimas"
        type="number"
        fullWidth
        value={horasMin}
        onChange={(e) => setHorasMin(e.target.value)}
        sx={{
          mb: 2,
          "& .MuiInputBase-root": {
            borderRadius: 3,
            backgroundColor: "rgba(255,255,255,0.6)",
          },
        }}
      />

      <TextField
        label="Horas máximas"
        type="number"
        fullWidth
        value={horasMax}
        onChange={(e) => setHorasMax(e.target.value)}
        sx={{
          mb: 3,
          "& .MuiInputBase-root": {
            borderRadius: 3,
            backgroundColor: "rgba(255,255,255,0.6)",
          },
        }}
      />

      {/* Slider de Edad */}
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#1e293b" }}>
        Rango de Edad
      </Typography>
      <Slider
        value={edadRange}
        onChange={(_, newValue) => setEdadRange(newValue)}
        valueLabelDisplay="auto"
        min={0}
        max={100}
        sx={{
          mb: 3,
          color: "#6366f1",
        }}
      />

      {/* Select multiple de Valor que promueve */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Valor que promueve</InputLabel>
        <Select
          multiple
          value={valoresSeleccionados}
          onChange={(e) => setValoresSeleccionados(e.target.value)}
          renderValue={(selected) => selected.join(", ")}
          sx={{
            borderRadius: 3,
            backgroundColor: "rgba(255,255,255,0.6)",
          }}
        >
          {["Empatía", "Compromiso", "Tolerancia", "Participación ciudadana"].map((valor) => (
            <MenuItem key={valor} value={valor}>
              <Checkbox checked={valoresSeleccionados.includes(valor)} />
              <ListItemText primary={valor} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>

    <Button
      variant="contained"
      onClick={() => {
        setDrawerOpen(false);
        window.scrollTo({ top: 0, behavior: "smooth" }); // opcional: volver arriba
      }}
      fullWidth
      sx={{
        borderRadius: 3,
        py: 1.3,
        background: "linear-gradient(to right, #4f46e5, #6366f1)",
        color: "white",
        fontWeight: 600,
        boxShadow: "none",

        "&:hover": {
          background: "linear-gradient(to right, #4338ca, #4f46e5)",
          animation: "glowPulse 2.5s ease-in-out infinite",

        },
      }}
    >
      Aplicar Filtros
    </Button>
  </Box>
</Drawer>

      {/*Modal para Proyectos
            <ProjectModal proyecto={proyectoSeleccionado} onClose={() => setProyectoSeleccionado(null)} />

      */}
{proyectoSeleccionado && (
  <ProjectModal
    proyecto={proyectoSeleccionado}
    onClose={() => setProyectoSeleccionado(null)}
    proyectosDisponibles={projectsDb} // ✅ Este sí es el array completo de proyectos
  />
)}






    </Box>
  );
};
     //Desde ACA TERMINA TODA EL elemento CARD, no es posible realizar algo similar desde un CSS


export default Projects;