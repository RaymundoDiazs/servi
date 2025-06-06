import React, { useState, useEffect, useContext } from "react";
import {
  Box, Card, CardContent, Typography, Grid, Button, Select, MenuItem,
  Avatar, Fade, Drawer, TextField, FormControl, InputLabel, Slider, Checkbox, ListItemText
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUserGraduate, FaChalkboardTeacher, FaHeart, FaClock, FaStar, FaUserFriends } from "react-icons/fa";
import { FaPerson } from "react-icons/fa6";
import { FilterList } from "@mui/icons-material";
import { SessionContext } from "../Contexts/SessionContext";
import { UserIdContext } from "../Contexts/UserIdContext";
import "./Projects.css";
import ProjectModal from "../pages/ProjectModal"; // ajusta la ruta si es necesario
import Hero from "../components/Hero"; // ajusta la ruta si es necesario

import {
  FiUser,
  FiMapPin,
  FiUsers,
  FiBox,
  FiTarget,
  FiActivity
} from "react-icons/fi";

//Filtros de areas diccionario
const mapaDeAreas = {
  "Negocios": ["BGB","LAE", "LCPF","LDE","LAF","LIT"], //(EN la BD esta como BGB, pero es LIN = Lic en Negocios internacionales)
  //Falta (LDO = Licenciatura en desarrollo y talento y cultura organizacional) //Falta (LEM = Lic en Mercadotecnia)

  "Salud": [],
  //Faltan todas xd

  "Ingeniería y Ciencias": ["ITC","IC" ,"IMT","IM", "IIS", "IRS", "IBT", "IQ"], //Falta (IMD = Ingenieria biomedica), Falta (IE = Ingenieria electronica)
  //Falta (IID = Ingenieria en innovacion y desarrollo), Falta (ITD = Ingenieria en transformacion  digital de negocios)
  //Falta (IAL = Ingenieria en alimentos), falta IAG (Ingenieria en Biosistemas Agroalimentarios), Falta (IDS = Ing en desarrollo sustentable)
  //Falta (IDM = Ingenieria en ciencia de datos y maticamtics), Falta (IFI = Ing Fisica industrial), Falta (INA = Ing nanotecnologia)

  "Estudios Creativos": ["ARQ", "LAD", "LC", "LDI", "LTM"], //Falta (LEI = Licenciatura en innovacion educativa), 
  // Falta (LLE = Licenciatura en letras hispanicas)

  "Derecho, Economía y Relaciones Internacionales": [, "LED", "LRI", "LEC"], //Falta (LTP = Licenciatura en gobierno y transformacion publica)
  "Ambiente Construido": ["ARQ", "IC"], //Falta (LUB = Licenciatura en urbanismo)
};



const getSrcFromIframe = (iframeHtml) => {
  const match = iframeHtml.match(/src=["']([^"']+)["']/);
  return match ? match[1] : null;
};




const getCoordsFromIframe = (iframeHtml) => {
  const regex = /!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/;
  const match = iframeHtml.match(regex);
  if (match) {
    const [, lng, lat] = match;
    return `${lat},${lng}`;
  }
  return null;
};





const Projects = ( {vP = false} ) => {

//Carreras random
const getCarrerasRandom = () => {
  if (todasCarreras.length === 0) return [];
  const barajadas = [...todasCarreras].sort(() => 0.5 - Math.random());
  const cantidad = Math.floor(Math.random() * 2) + 2; // 2 o 3
  return barajadas.slice(0, cantidad);
};

  //Carreras random cards temporal
  const [todasCarreras, setTodasCarreras] = useState([]);

  
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
  const [postulaciones, setPostulaciones] = useState({})
  const { sessionType } = useContext(SessionContext);
  const { userId } = useContext(UserIdContext)
  //const navigate = useNavigate(); //Sin navegacion ahora solo abre un modal

  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null); //Para el model dependiendo el proyect
  const [searchText, setSearchText] = useState(""); //Dar funcionamiento a el campo de busqueda de HERO
  const [vistaPendientes, setVistaPendientes] = useState(vP)

  const location = useLocation();

  // Sincroniza vistaPendientes con el prop vP cuando cambia la ruta
  useEffect(() => {
    setVistaPendientes(vP);
  }, [vP, location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      setProyectoSeleccionado(e.detail); // Abrir nuevo proyecto desde rpoyectos relacinoados
    };
    window.addEventListener("abrir-proyecto", handler);
    return () => window.removeEventListener("abrir-proyecto", handler);
  }, []);
  
/*
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

*/



useEffect(() => {
  if (sessionType === "alumno" && userId.special_id) {
  console.log(userId)
  fetch("http://localhost:8000/proyectos/alumnos/"+userId.special_id)
    .then((res) => res.json())
    .then((proyectos) => {
      console.log(userId)
      const adaptados = proyectos.map((p) => ({
        id: p.proyecto_id,
        osf_id: p.osf_id,
        // periodo_id: p.periodo_id,
        nombre_coordinador: p.nombre_coordinador,
        numero_coordinador: p.numero_coordinador,
        title: p.nombre_proyecto,
        problema_social: p.problema_social,
        tipo_vulnerabilidad: p.tipo_vulnerabilidad,
        rango_edad: p.rango_edad?.replace(/\[|\)/g, "").split(",")[1] || "100",
        zona: p.zona,
        numero_beneficiarios: p.numero_beneficiarios,
        lista_actividades_alumno: p.lista_actividades_alumno,
        producto_a_entregar: p.producto_a_entregar,
        medida_impacto_social: p.medida_impacto_social,
        modalidad: p.modalidad,
        modalidad_desc: p.modalidad_desc,
        competencias: p.competencias,
        direccion: p.direccion,
        enlace_maps: p.enlace_maps,
        valor_promueve: p.valor_promueve?.trim() || "Sin valor",
        surgio_unidad_formacion: p.surgio_unidad_formacion,
        necesita_entrevista: p.necesita_entrevista,
        notificaciones: p.notificaciones,
        horas: p.horas,
        images: ["/logo.jpg"], // puedes cambiar esto si usaSs una columna de imagen real
        carreras: p.carreras, // cambia esto si tienes relación real con carreras
        cupo: p.cantidad,
        logo: p.logo,
        pregunta_id: p.id_pregunta || null,
        pregunta: p.pregunta || null ,
        estado_proyecto: p.estado,
        num_postulaciones: p.num,
        periodo_nombre: p.periodo_nombre,
        momento: p.momento
      }));
      setProjectsDb(adaptados);
    });
  }

  if (sessionType === "osf" && userId) {
  fetch("http://localhost:8000/proyectos/"+userId.special_id)
    .then((res) => res.json())
    .then((proyectos) => {
      const adaptados = proyectos.map((p) => ({
        id: p.proyecto_id,
        osf_id: p.osf_id,
        // periodo_id: p.periodo_id,
        nombre_coordinador: p.nombre_coordinador,
        numero_coordinador: p.numero_coordinador,
        title: p.nombre_proyecto,
        problema_social: p.problema_social,
        tipo_vulnerabilidad: p.tipo_vulnerabilidad,
        rango_edad: p.rango_edad?.replace(/\[|\)/g, "").split(",")[1] || "100",
        zona: p.zona,
        numero_beneficiarios: p.numero_beneficiarios,
        lista_actividades_alumno: p.lista_actividades_alumno,
        producto_a_entregar: p.producto_a_entregar,
        medida_impacto_social: p.medida_impacto_social,
        modalidad: p.modalidad,
        modalidad_desc: p.modalidad_desc,
        competencias: p.competencias,
        direccion: p.direccion,
        enlace_maps: p.enlace_maps,
        valor_promueve: p.valor_promueve?.trim() || "Sin valor",
        surgio_unidad_formacion: p.surgio_unidad_formacion,
        necesita_entrevista: p.necesita_entrevista,
        notificaciones: p.notificaciones,
        horas: p.horas,
        images: ["/logo.jpg"], // puedes cambiar esto si usaSs una columna de imagen real
        carreras: p.carreras, // cambia esto si tienes relación real con carreras
        cupo: p.cantidad,
        logo: p.logo,
        pregunta_id: p.id_pregunta || null,
        pregunta: p.pregunta || null ,
        estado_proyecto: p.estado,
        num_postulaciones: p.num,
        periodo_nombre: p.periodo_nombre,
        momento: p.momento
      }));
      setProjectsDb(adaptados);
    });
  }

  if (sessionType === "ss" && vistaPendientes) {
  fetch("http://localhost:8000/proyectos/revisar")
    .then((res) => res.json())
    .then((proyectos) => {
      const adaptados = proyectos.map((p) => ({
        id: p.proyecto_id,
        osf_id: p.osf_id,
        // periodo_id: p.periodo_id,
        nombre_coordinador: p.nombre_coordinador,
        numero_coordinador: p.numero_coordinador,
        title: p.nombre_proyecto,
        problema_social: p.problema_social,
        tipo_vulnerabilidad: p.tipo_vulnerabilidad,
        rango_edad: p.rango_edad?.replace(/\[|\)/g, "").split(",")[1] || "100",
        zona: p.zona,
        numero_beneficiarios: p.numero_beneficiarios,
        lista_actividades_alumno: p.lista_actividades_alumno,
        producto_a_entregar: p.producto_a_entregar,
        medida_impacto_social: p.medida_impacto_social,
        modalidad: p.modalidad,
        modalidad_desc: p.modalidad_desc,
        competencias: p.competencias,
        direccion: p.direccion,
        enlace_maps: p.enlace_maps,
        valor_promueve: p.valor_promueve?.trim() || "Sin valor",
        surgio_unidad_formacion: p.surgio_unidad_formacion,
        necesita_entrevista: p.necesita_entrevista,
        notificaciones: p.notificaciones,
        horas: p.horas,
        images: ["/logo.jpg"], // puedes cambiar esto si usaSs una columna de imagen real
        carreras: p.carreras, // cambia esto si tienes relación real con carreras
        cupo: p.cantidad,
        logo: p.logo,
        pregunta_id: p.id_pregunta || null,
        pregunta: p.pregunta || null ,
        estado_proyecto: p.estado,
        num_postulaciones: p.num,
        periodo_nombre: p.periodo_nombre,
        momento: p.momento
      }));
      setProjectsDb(adaptados);
    });
  }

  if (sessionType === "ss" && !vistaPendientes) {
  fetch("http://localhost:8000/proyectos")
    .then((res) => res.json())
    .then((proyectos) => {
      const adaptados = proyectos.map((p) => ({
        id: p.proyecto_id,
        osf_id: p.osf_id,
        // periodo_id: p.periodo_id,
        nombre_coordinador: p.nombre_coordinador,
        numero_coordinador: p.numero_coordinador,
        title: p.nombre_proyecto,
        problema_social: p.problema_social,
        tipo_vulnerabilidad: p.tipo_vulnerabilidad,
        rango_edad: p.rango_edad?.replace(/\[|\)/g, "").split(",")[1] || "100",
        zona: p.zona,
        numero_beneficiarios: p.numero_beneficiarios,
        lista_actividades_alumno: p.lista_actividades_alumno,
        producto_a_entregar: p.producto_a_entregar,
        medida_impacto_social: p.medida_impacto_social,
        modalidad: p.modalidad,
        modalidad_desc: p.modalidad_desc,
        competencias: p.competencias,
        direccion: p.direccion,
        enlace_maps: p.enlace_maps,
        valor_promueve: p.valor_promueve?.trim() || "Sin valor",
        surgio_unidad_formacion: p.surgio_unidad_formacion,
        necesita_entrevista: p.necesita_entrevista,
        notificaciones: p.notificaciones,
        horas: p.horas,
        images: ["/logo.jpg"], // puedes cambiar esto si usaSs una columna de imagen real
        carreras: p.carreras, // cambia esto si tienes relación real con carreras
        cupo: p.cantidad,
        logo: p.logo,
        pregunta_id: p.id_pregunta || null,
        pregunta: p.pregunta || null ,
        estado_proyecto: p.estado,
        num_postulaciones: p.num,
        periodo_nombre: p.periodo_nombre,
        momento: p.momento
      }));
      setProjectsDb(adaptados);
    });
  }


    fetch("http://localhost:8000/carreras")
    .then((res) => res.json())
    .then((data) => {
      const nombres = data.map((c) => c.nombre); // solo nombres
      setTodasCarreras(nombres);
    })
    .catch((err) => console.error("Error al cargar carreras:", err));

    if (sessionType === "alumno" && userId) {
      fetch("http://localhost:8000/postulaciones/alumno/"+userId.special_id)
      .then((res) => res.json()) 
      .then((data) => {
        setPostulaciones( Object.fromEntries(data.map(e => ([e.id_proyecto, e]))))
      })
    }

    
}, [userId, sessionType, vistaPendientes, location.pathname]);


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

  // match por área
  const matchCarreraArea = carreraFilter === "" || (
    mapaDeAreas[carreraFilter] &&
    project.carreras.some(carrera => mapaDeAreas[carreraFilter].includes(carrera))
  );

  return matchTitle && matchHorasMin && matchHorasMax && matchEdad && matchModalidad && matchValores && matchCarreraArea;
});




  return (
    <Box className="projects-page">

{ sessionType == "alumno" && (<Hero searchText={searchText} setSearchText={setSearchText} /> )}
{console.log(projectsDb)}
{console.log(filteredProjects)}

      
      <Box className="projects-header">
        <Typography variant="h4">{!vistaPendientes ? "Proyectos Solidarios" : "Proyectos pendientes" } - {sessionType}</Typography>
        <Button variant="outlined" startIcon={<FilterList />} onClick={() => setDrawerOpen(true)}>Filtros Avanzados</Button>
      </Box>

      

  <Box
  className="notch-elevated"
  sx={{
    display: "flex",
    flexDirection: "column", // para separar por filas
    alignItems: "center",
    gap: 1.5, // espacio entre filas
    px: 2,
    py: 2,
    borderRadius: 3,
    mt: 3,
    mb: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
    // backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.25)",
    boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
  }}
>
  {/* Fila de carreras */}
  <Box
    sx={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 1.5,
    }}
  >
    {[
      "Ambiente Construido",
      "Derecho, Economía y Relaciones Internacionales",
      "Estudios Creativos",
      "Ingeniería y Ciencias",
      "Negocios",
      "Salud",
    ].map((carrera) => (
     <Button
  key={carrera}
  className={`glass-buttonProjects ${carreraFilter === carrera ? "active" : ""}`}
  onClick={() => handleCarreraClick(carrera)}
  sx={{
    fontSize: "0.75rem",
    fontWeight: 600,
    px: 2,
    py: 0.6,
    borderRadius: 2.5,
    minWidth: "auto",
    whiteSpace: "nowrap",
    backgroundColor: carreraFilter === carrera ? "#60a5fa" : "#ffffff",
    color: carreraFilter === carrera ? "#ffffff" : "#1d4ed8", // texto azul normal
    boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
    transition: "all 0.2s ease",
    border: "1px solid #e2e8f0",
    "&:hover": {
      backgroundColor: "#60a5fa",
      color: "#ffffff",
      transform: "scale(1.03)",
    },
  }}
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
              <Card className={project.estado_proyecto === "lleno" || project.estado_proyecto === "pendiente" ? "lleno":"" }
              //Desde ACA EMPIEZA TODA EL elemento CARD, no es posible realizar algo similar desde un CSS
          //onClick={() => navigate(`/projects/${project.id}`)} //Quitamos navigate para usar el modal
          onClick={() => setProyectoSeleccionado(project)}

          // onMouseEnter={() => setHoveredId(project.id)}
          // onMouseLeave={() => setHoveredId(null)}
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
                      // src={
                      //   hoveredId === project.id
                        
                      //     ? project.images[imageIndexes[project.id] || 0]
                      //     : `/src/assets/${project.logo}`
                      // }
                      src={
                        `/src/assets/${project.logo}`
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
  <Box
  sx={{
    position: "absolute",
    top: 12,
    right: 12,
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    px: 1.2,
    py: "3px",
    borderRadius: "999px",
    fontSize: "0.65rem",
    fontWeight: 600,
    color: "#1e293b",
    backgroundColor:
      project.modalidad.toLowerCase() === "presencial"
        ? "#dbeafe" // azul claro
        : project.modalidad.toLowerCase() === "en linea"
        ? "#ccfbf1" // cian claro
        : "#ede9fe", // mixto
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    zIndex: 3,
  }}
>
  {project.modalidad.toLowerCase() === "presencial" && <FaPerson size={12} />}
  {project.modalidad.toLowerCase() === "en linea" && <FaChalkboardTeacher size={12} />}
  {project.modalidad.toLowerCase() === "mixto" && (
    <>
      <FaPerson size={11} />
      <FaChalkboardTeacher size={11} />
    </>
  )}
  <span style={{ textTransform: "capitalize" }}>{project.modalidad}</span>
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

</Typography> <br />
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
  {`${project.periodo_nombre} - Periodo ${project.momento}`.split("").map((char, i) => (
    <span key={i}>{char === " " ? "\u00A0" : char}</span>
  ))}
</Typography> <br />



    {/* Color tags carreras y efecto hover */}
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>

      {/*
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

*/}




{project.carreras.map((carrera, idx) => (
  <Box
    key={idx}
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
    }}
  >
    <FaUserGraduate size={10} />
    {carrera}
  </Box>
))}




</Box>





{/* Campos adicionales del proyecto NUEVOS despues de estar trabajando en la mismas tarjetas, darles estilos y harcelos mas bonitos*/}
<div className="project-attributes-grid">
  {[
    {
      label: "Tipo de Vulnerabilidad",
      value: project.tipo_vulnerabilidad,
      icon: <FiUser size={11} />,
    },
    {
      label: "Zona",
      value: project.zona,
      icon: <FiMapPin size={11} />,
    },
    {
      label: "Beneficiarios",
      value: project.numero_beneficiarios,
      icon: <FiUsers size={11} />,
    },
    {
      label: "Producto a Entregar",
      value: project.producto_a_entregar,
      icon: <FiBox size={11} />,
    },
    {
      label: "Impacto Social",
      value: project.medida_impacto_social,
      icon: <FiTarget size={11} />,
    },
    {
      label: "Competencias",
      value: project.competencias,
      icon: <FiActivity size={11} />,
    },
  ].map((item, i) => (
    <div className="attribute-card" key={i}>
      <div className="attribute-header">
        {item.icon}
        <span className="attribute-label">{item.label}</span>
      </div>
      <div className="attribute-value">{item.value || "Sin info"}</div>
    </div>
  ))}
</div>




{/* Vista de google maps  */}










  {/* Informacion de horas requeridas, edad, valores*/}
<Box
  sx={{
    display: "grid",
    gap: 1,
    mb: 2,
    p: 1,
    borderRadius: 3,
    background: "linear-gradient(135deg, rgba(224, 242, 255, 0.5), rgba(255,255,255,0.3))",
    border: "1px solid rgba(203, 213, 225, 0.5)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)",
  }}
>
  {[
    {
      icon: <FaClock size={14} style={{ color: "#1e293b" }} />,
      text: `${project.horas} horas requeridas`,
    },
    {
      icon: <FaUserFriends size={14} style={{ color: "#1e293b" }} />,
      text: `${project.rango_edad} años`,
    },
    {
      icon: <FaStar size={14} style={{ color: "#1e293b" }} />,
      text: project.valor_promueve,
    },
  ].map((item, i) => (
    <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {item.icon}
      <Typography variant="caption" sx={{ fontWeight: 500, color: "#1e293b" }}>
        {item.text}
      </Typography>
    </Box>
  ))}
</Box>

  <div className="footer">
    <span>Cupo: {project.num_postulaciones}/{project.cupo}</span>
    {postulaciones[project.id] && (
      <div className="state-container">
      {/* {console.log(postulaciones[project.id])} */}
      <span>{postulaciones[project.id].estado}</span>
    </div>
    )}
  </div>



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
  <>
  {/* {console.log(postulaciones[proyectoSeleccionado.id] ? true : false)} */}
  <ProjectModal
    proyecto={proyectoSeleccionado}
    onClose={() => setProyectoSeleccionado(null)}
    proyectosDisponibles={projectsDb} // Este sí es el array completo de proyectos
    pos={ postulaciones[proyectoSeleccionado.id] ? true : false }
    />
  </>
)}
    </Box>
  );
};
     //Desde ACA TERMINA TODA EL elemento CARD, no es posible realizar algo similar desde un CSS


export default Projects;