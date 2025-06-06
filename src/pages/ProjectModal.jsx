import React, { useRef, useEffect, useState, useContext } from "react";
import "./ProjectModal.css";
import {
  FiClock,
  FiUsers,
  FiCalendar,
  FiKey,
  FiMapPin,
  FiList,
  FiX,
  FiTarget,
  FiEdit3,
  FiStar,
  FiCheckCircle,
  FiClipboard,
  FiInfo,
  FiHelpCircle,
  FiFlag

} from "react-icons/fi";

import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  ListItemText,
  Checkbox,
} from "@mui/material";
import { TextField } from '@mui/material';

import { useNavigate } from "react-router-dom";

import { FiBox, FiActivity, FiUser } from "react-icons/fi";

import { SessionContext } from "../Contexts/SessionContext";
import { UserIdContext } from "../Contexts/UserIdContext";

import FormsOSF from "../components/FormsOsf";

import Box from '@mui/material/Box';


const cleanIframeHtml = (html) => {
  return html
    .replace(/width="[^"]*"/, 'width="100%"')
    .replace(/height="[^"]*"/, 'height="100%"')
    .replace(/style="[^"]*"/, 'style="border:0; width:100%; height:100%;"');
};



const ProjectModal = ({ proyecto, onClose, proyectosDisponibles, pos = false }) => {
  const carouselRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedModalidad, setEditedModalidad] = useState(proyecto.modalidad);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();
  const { sessionType } = useContext(SessionContext)
  const { userId } = useContext(UserIdContext)
  const [postulacion, setPostulacion] = useState(pos)
  const [toggleEditOsf, setToggleEditOsf] = useState(false)
  const [osf, setOsf] = useState("")

      const [showAllPhotos, setShowAllPhotos] = useState(false); 
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);


  const [isSaving, setIsSaving] = useState(false);

    //Editables con dropdowns (2 opcioens)
    const [editedZona, setEditedZona] = useState(proyecto.zona);

    //Editar enlace maps
    const [editedEnlaceMaps, setEditedEnlaceMaps] = useState(proyecto.enlace_maps);


    


  // const [editedCarreras, setEditedCarreras] = useState(proyecto.carreras.join(", "));
  const [editedVulnerabilidad, setEditedVulnerabilidad] = useState(proyecto.tipo_vulnerabilidad);
  //const [editedZona, setEditedZona] = useState(proyecto.zona);
  const [editedBeneficiarios, setEditedBeneficiarios] = useState(proyecto.numero_beneficiarios);
  const [editedProducto, setEditedProducto] = useState(proyecto.producto_a_entregar);
  const [editedImpacto, setEditedImpacto] = useState(proyecto.medida_impacto_social);
  const [editedCompetencias, setEditedCompetencias] = useState(proyecto.competencias);
  const [editedDireccion, setEditedDireccion] = useState(proyecto.direccion);

  const [editedCupo, setEditedCupo] = useState(proyecto.cupo);
  console.log("hola edited", proyecto.cupo)



  //carreras edit
  const [editedCarreras, setEditedCarreras] = useState(proyecto.carreras);
  const [todasCarreras, setTodasCarreras] = useState([]);


  //Restantes que faltaban
  // ✅ 1. ESTADOS AÑADIDOS EN COMPONENTE
  const [editedProblemaSocial, setEditedProblemaSocial] = useState(proyecto.problema_social || "");
  const [editedValorPromueve, setEditedValorPromueve] = useState(proyecto.valor_promueve || "");
  const [editedRangoEdad, setEditedRangoEdad] = useState(proyecto.rango_edad || "");
  const [editedActividadesAlumno, setEditedActividadesAlumno] = useState(proyecto.lista_actividades_alumno || "");
  const [editedModalidadDesc, setEditedModalidadDesc] = useState(proyecto.modalidad_desc || "");
  const [editedObjetivoGeneral, setEditedObjetivoGeneral] = useState(proyecto.objetivo_general || "");
  const [editedEstado, setEditedEstado] = useState(proyecto.estado_proyecto || "Activo");


    //const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null); //Lo llamamos desde Project, no desde aca
useEffect(() => {
  fetch("http://localhost:8000/carreras")
    .then((res) => res.json())
    .then((data) => setTodasCarreras(data.map(c => c.nombre)));
}, []);


    //Al dar click postular abra formulario
    const [mostrarFormularioPostulacion, setMostrarFormularioPostulacion] = useState(false);

  const [postulacionForm, setPostulacionForm] = useState({
    confirmacion_lectura: '',
    respuesta_habilidades: '',
    respuesta_descarte: null
  })


  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -carouselRef.current.offsetWidth, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: carouselRef.current.offsetWidth, behavior: "smooth" });
    }
  };

   //Handle scrolls de ProjectDetail para proyectos relacionados 

   const handleScrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -carouselRef.current.offsetWidth, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: carouselRef.current.offsetWidth, behavior: "smooth" });
    }
  };

  const handleFormChange = (e) => {
      const { name, value } = e.target;
      setPostulacionForm({ ...postulacionForm, [name]: value });  
      console.log(postulacionForm)
  } 

  function handleSubmit(){
      const formInf = new FormData();
      // console.log(postulacionForm)
      // console.log(proyecto)
      Object.entries(postulacionForm).forEach(([key, value]) => {
            formInf.append(key, value);
        });
      formInf.append("id_proyecto", proyecto.id)
      if (proyecto.pregunta_id) {
        formInf.append("id_pregunta", proyecto.pregunta_id);
      } else {
        formInf.append("id_pregunta", null);
      }

      fetch('http://localhost:8000/postulaciones/newPostulacion', {
          method: 'POST',
          credentials: "include",
          body: formInf,
      })
      .then((res) => {
          if (res.ok) {
              alert("Te postulaste a este proyecto! redirigiendo...")
              window.location.reload();

          } else {
              res.json().then((error) => {
                  console.error("Error en el registro:", error);
              });
          }
      })
      .catch((error) => {
          console.error("Error en el registro:", error);
      });
  }
  
  const relatedProjects = Array.isArray(proyectosDisponibles)
  ? proyectosDisponibles.filter(p =>
      p.id !== proyecto.id &&
      p.modalidad?.toLowerCase() === proyecto.modalidad?.toLowerCase()
    )
  : [];

  console.log(" Proyecto actual:", proyecto);
console.log(" Modalidad actual:", proyecto.modalidad);
console.log(" Todos los proyectos:", proyectosDisponibles);

console.log(" Proyectos relacionados encontrados:", relatedProjects);



//Handle scroll de ProjectDetail

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  useEffect(() => {
    if (proyecto.osf_id) {
      fetch("http://localhost:8000/osf_institucional/" + proyecto.osf_id)
      .then(res => res.json())
      .then(data => {setOsf(data)
        console.log(data)
      })
      .catch(err => setOsf(""));
    }
  },[])
  
  useEffect(() => {
    setEditedModalidad(proyecto.modalidad);
  }, [proyecto]);

const handleSave = async () => {
  const modalidadesValidas = ["presencial", "en linea", "mixto"];
  if (!modalidadesValidas.includes(editedModalidad.toLowerCase())) {
    alert("Modalidad no válida. Usa: presencial, en línea o mixto.");
    return;
  }

  try {
    setIsSaving(true); // 👈 Mostrar spinner

    const proyectoId = proyecto.id;

    const res1 = await fetch(`http://localhost:8000/api/proyectos/${proyectoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modalidad: editedModalidad }),
    });
    console.log(res1)
    if (!res1.ok) throw new Error("Error al actualizar modalidad");

    const res2 = await fetch(`http://localhost:8000/api/proyectos/${proyectoId}/detalles`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        zona: editedZona,
        tipo_vulnerabilidad: editedVulnerabilidad,
        numero_beneficiarios: editedBeneficiarios,
        producto_a_entregar: editedProducto,
        medida_impacto_social: editedImpacto,
        competencias: editedCompetencias,
        direccion: editedDireccion,
        carreras: editedCarreras,
        enlace_maps: editedEnlaceMaps,
        problema_social: editedProblemaSocial,
        valor_promueve: editedValorPromueve,
        rango_edad: Number(editedRangoEdad),
        lista_actividades_alumno: editedActividadesAlumno,
        modalidad_desc: editedModalidadDesc,
        objetivo_general: editedObjetivoGeneral,
        estado: editedEstado,
        cantidad: editedCupo,
      }),
    });
    if (!res2.ok) throw new Error("Error al actualizar detalles");

    //Sincronizar manualmente en memoria
    Object.assign(proyecto, {
      zona: editedZona,
      tipo_vulnerabilidad: editedVulnerabilidad,
      numero_beneficiarios: editedBeneficiarios,
      producto_a_entregar: editedProducto,
      medida_impacto_social: editedImpacto,
      competencias: editedCompetencias,
      direccion: editedDireccion,
      carreras: editedCarreras,
      enlace_maps: editedEnlaceMaps,
      problema_social: editedProblemaSocial,
      valor_promueve: editedValorPromueve,
      rango_edad: Number(editedRangoEdad),
      lista_actividades_alumno: editedActividadesAlumno,
      modalidad_desc: editedModalidadDesc,
      objetivo_general: editedObjetivoGeneral,
      estado: editedEstado,
      modalidad: editedModalidad,
      cupo: editedCupo,
    });

    setIsEditing(false);
    alert("¡Proyecto actualizado!");
  } catch (error) {
    console.error("❌ Error en handleSave:", error);
    alert("Error al actualizar el proyecto");
  } finally {
    setIsSaving(false); 
  }
};


  /*
  //Actualiza proyecto de proyectos relacionados al abrirlo
  useEffect(() => {
    const handler = (e) => {
      setProyectoSeleccionado(e.detail); // actualiza con el nuevo proyecto
    };
    window.addEventListener("abrir-proyecto", handler);
    return () => window.removeEventListener("abrir-proyecto", handler);
  }, []);

  */
  

  const handleCancel = () => {
    setEditedModalidad(proyecto.modalidad);
    setIsEditing(false);
  };

  if (!proyecto) return null;

  return (
    <>
      <div className="project-modal-overlay" onClick={onClose}>
      <div className={`project-modal fade-in`} onClick={(e) => e.stopPropagation()}> 
      <button className="close-button" onClick={onClose}><FiX /></button>
      <h1 className="modal-title">{proyecto.title}</h1>

{isSaving && (
  <div className="saving-overlay">
    <div className="spinner"></div>
    <p>Guardando...</p>
  </div>
)}



          { sessionType == "ss" && (<button className="apply-button" onClick={() => setToggleEditOsf(!toggleEditOsf)}>Editar información de osf</button>)}
              
          {toggleEditOsf && (
            <FormsOSF osf={osf}/>
          )}

          <div className="chips">
            <span><FiClock /> {proyecto.horas} hrs</span>
            <span><FiUsers /> {proyecto.carreras.join(", ")}</span>
            <span><FiKey /> WA1058</span>
            <span><FiCalendar /> {proyecto.rango_edad || "Edad no definida"}</span>
            <span><FiStar /> {proyecto.valor_promueve || "Sin valor"}</span>
          </div>


    


{/* Tarjetas compactas estilo Zillow */}
<div
  style={{
    display: "flex",
    flexWrap: "wrap",
    gap: "0.6rem",
    marginTop: "1rem", // antes estaba 1.5rem
    marginBottom: "2rem", // opcional, separa de lo que esté debajo
    paddingLeft: "1.5rem",
    maxWidth: "720px",
  }}
>
  {[
    {
      label: "Tipo de Vulnerabilidad",
      value: proyecto.tipo_vulnerabilidad,
      icon: <FiUser size={12} />,
    },
    {
      label: "Zona",
      value: proyecto.zona,
      icon: <FiMapPin size={12} />,
    },
    {
      label: "Beneficiarios",
      value: proyecto.numero_beneficiarios,
      icon: <FiUsers size={12} />,
    },
    {
      label: "Producto a Entregar",
      value: proyecto.producto_a_entregar,
      icon: <FiBox size={12} />,
    },
    {
      label: "Impacto Social",
      value: proyecto.medida_impacto_social,
      icon: <FiTarget size={12} />,
    },
    {
      label: "Competencias",
      value: proyecto.competencias,
      icon: <FiActivity size={12} />,
    },
  ].map((item, i) => (
    <div
      key={i}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        background: "#f8fafc",
        borderRadius: "8px",
        padding: "0.4rem 0.6rem",
        fontSize: "0.7rem",
        color: "#1e293b",
        width: "190px",
        flex: "none",
        boxShadow: "inset 0 0 0 1px #e2e8f0",
      }}
    >
      <div style={{ color: "#6366f1", marginTop: "1px" }}>{item.icon}</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: "0.68rem" }}>{item.label}</div>
        <div style={{ fontSize: "0.65rem", color: "#475569" }}>
          {item.value || "Sin información"}
        </div>
      </div>
    </div>
  ))}
</div>



 {/* Descripción del problema social estilo libre */}
<div style={{ padding: "0 1.8rem", marginTop: "2rem", marginBottom: "2.5rem" }}>
  <strong style={{ fontSize: "1.15rem", display: "block", marginBottom: "0.5rem" }}>
    Descripción
  </strong>
  <p
    style={{
      fontSize: "1.1rem",
      lineHeight: "1.9",
      color: "#1e293b",
      fontWeight: 400,
      whiteSpace: "pre-line",
      margin: 0
    }}
  >
    {proyecto.problema_social || "Este proyecto aún no tiene una descripción del problema social."}
  </p>
</div>













{/* Aplicar/postularse */}


{/*
                            <section className="apply-section">
  <div className="apply-box">
    <button className="apply-button">Postularme</button>
  </div>
</section>

*/}


{sessionType === "alumno" && !postulacion && proyecto.estado_proyecto !== 'lleno' && (
<div className="apply-box-top">
  <button
    className="apply-button"
    onClick={() => setMostrarFormularioPostulacion(!mostrarFormularioPostulacion)}
  >
    {mostrarFormularioPostulacion ? "Cancelar" : "Postularme"}
  </button>

  {mostrarFormularioPostulacion && (
    <div className="postulacion-form-container">
    
      <label htmlFor="respuestaPostulacion">Para nosotros es importante que hayas leído sobre el objetivo y actividades de nuestro proyecto. <br /> <br />

Coméntanos con tus propias palabras: ¿Qué buscamos? ¿Qué es lo que crees que necesitaríamos de ti?</label>
      <textarea
        id="respuestaPostulacion"
        className="respuesta-textarea"
        placeholder="Escribe tu motivo..."
        name="confirmacion_lectura"
        value={postulacionForm.confirmacion_lectura}
        onChange={handleFormChange}
      />

      <label htmlFor="respuestaPostulacion2">Para participar en este proyecto es necesario contar con habilidades como: <br /> <br />
      {proyecto.competencias} <br /><br />
      Coméntanos la razón por la que deberíamos elegirte.</label>
      <textarea 
        id="respuestaPostulacion2" 
        className="respuesta-textarea" 
        placeholder="Escribe aquí..."
        value={postulacionForm.respuesta_habilidades}
        name="respuesta_habilidades"
        onChange={handleFormChange}
      />

      {proyecto.pregunta && (
        <>
        <label htmlFor="respuestaPostulacion3">{proyecto.pregunta}</label>
        <textarea  
          id="respuestaPostulacion3" 
          className="respuesta-textarea" 
          placeholder="Escribe aquí..."
          name="respuesta_descarte"
          onChange={handleFormChange}
        />
        </>
      )}

      
      <button className="enviar-button" onClick={handleSubmit}>Enviar postulación</button>
    </div>
  )}
  
</div>
)}

{postulacion && (
    <button
    className="apply-button-fail"
  >
    {"Ya te postulaste a este proyecto"}
  </button>
)}


{proyecto.estado_proyecto === "lleno" && (
    <button
    className="apply-button-fail"
  >
    {"Este proyecto está lleno"}
  </button>
)}


<div className="seccion-actividades">
  <div className="act-title">Actividades del Alumno</div>
  <ul className="act-list">
    {(editedActividadesAlumno || "")
      .split(/\n|;/) // Por salto de línea O punto y coma
      .map((act, i) => act.trim() && <li key={i}>{act.trim()}</li>)
    }
  </ul>
</div>

<div className="seccion-modalidad-glass">
  <div className="modalidad-header">

    <span>Descripción de la Modalidad</span>
  </div>
  <div className="modalidad-content">
    {(editedModalidadDesc || "")
      .split(/\n/)
      .map((linea, i) =>
        <div key={i} className="modalidad-line">
          {linea.trim()}
        </div>
      )
    }
  </div>
  <div className="modalidad-separador" />
</div>




{/* === Periodos de Ejecución === */}
<section style={{ textAlign: "center", margin: "3rem 0" }}>
  <h3 style={{
    fontSize: "1.6rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    color: "#1e293b",
    marginBottom: "1.5rem"
  }}>
    <FiCalendar /> Periodos de Ejecución
  </h3>

  <img
    src="/src/assets/periodos.png"
    alt="Periodos de ejecución Febrero - Junio 2025"
    style={{
      maxWidth: "100%",
      height: "auto",
      borderRadius: "16px"
    }}
  />
</section>




{/* === Vista del maps === */}
<section className="info-structured-section">
  <div className="info-container">
    <div className="info-header-fixed">
      {isEditing && (
        <button className="cancel-button" onClick={handleCancel}>
          <FiX /> Cancelar
        </button>
      )}
      <h3 className="info-group-title"><FiMapPin /> Mapa</h3>
      {sessionType == 'ss' && (
        <button className="edit-button" onClick={isEditing ? handleSave : () => setIsEditing(true)}>
        <FiEdit3 /> {isEditing ? "Guardar" : "Editar"}
      </button>
      )}
    </div>

    <div className="info-grid-modern">
      {isEditing ? (
        <textarea
          value={editedEnlaceMaps}
          onChange={(e) => setEditedEnlaceMaps(e.target.value)}
          placeholder="Pega aquí el iframe de Google Maps"
          style={{
            width: "100%",
            height: "200px",
            borderRadius: "12px",
            padding: "1rem",
            fontSize: "1rem",
            border: "1px solid #cbd5e1",
          }}
        />
      ) : (
        proyecto.enlace_maps && (
          <Box
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
              mt: 2,
              height: 400,
              width: "100%",
            }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: cleanIframeHtml(proyecto.enlace_maps) }}
              style={{ width: "100%", height: "100%" }}
            />
          </Box>
        )
      )}
    </div>
  </div>
</section>

{/* Informacion del proyecto contenedor */}
          <section className="info-structured-section">
            <div className="info-container">
              <div className="info-header-fixed">
                {isEditing && (
                  <button className="cancel-button" onClick={handleCancel}>
                    <FiX /> Cancelar
                  </button>
                )}
                <h2 className="info-title">Información del Proyecto</h2>
                {sessionType == "ss" && (
                  <button className="edit-button" onClick={isEditing ? handleSave : () => setIsEditing(true)}>
                  <FiEdit3 /> {isEditing ? "Guardar" : "Editar"}
                </button>
                )}
              </div>


      


              <h3 className="info-group-title"><FiMapPin /> Logística</h3>
              <div className="info-grid-modern">
                <div className="info-card">
                  <FiMapPin className="info-icon" />
                  <div>
                    <h4>Modalidad</h4>
                    {isEditing ? (
                      <select value={editedModalidad} onChange={(e) => setEditedModalidad(e.target.value)} className="edit-select">
                        <option value="en linea">En línea</option>
                        <option value="presencial">Presencial</option>
                        <option value="mixto">Mixto</option>
                      </select>
                    ) : (
                      <p>{proyecto.modalidad}</p>
                    )}
                  </div>
                </div>




                <div className="info-card">
    <FiCheckCircle className="info-icon" />
    <div>
      <h4>Cupo</h4>
      {isEditing ? (
        <input
          type="text"
          value={editedCupo}
          onChange={(e) => setEditedCupo(e.target.value)}
          className="edit-input"
        />
      ) : (
        <p>{editedCupo}</p>
      )}
    </div>
  </div>


  

             
              </div>



              

            <h3 className="info-group-title"><FiCalendar /> Detalles Generales</h3>
<div className="info-grid-modern">


 <div className="info-card">
  <FiUsers className="info-icon" />
  <div style={{ width: "100%" }}>
    <h4>Carreras</h4>
    {isEditing ? (
      <FormControl fullWidth>
        <InputLabel>Seleccione</InputLabel>
        <Select
          multiple
          value={editedCarreras}
          onChange={(e) => setEditedCarreras(e.target.value)}
          renderValue={(selected) => selected.join(", ")}
          className="edit-select"
          sx={{
            borderRadius: 2,
            backgroundColor: "white",
            mt: 1,
          }}
        >
          {todasCarreras.map((carrera) => (
            <MenuItem key={carrera} value={carrera}>
              <Checkbox checked={editedCarreras.includes(carrera)} />
              <ListItemText primary={carrera} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    ) : (
      <p>{editedCarreras.join(", ")}</p>
    )}
  </div>
</div>


</div>

<h3 className="info-group-title"><FiList /> Información Complementaria</h3>
<div className="info-grid-modern">


{/*
  <div className="info-card full">
    <FiTarget className="info-icon" />
    <div>
      <h4>Problema Social</h4>
      <p>{proyecto.problema_social}</p>
    </div>
  </div>

*/}


  
  <div className="info-card full">
    <FiUsers className="info-icon" />
    <div>
      <h4>Tipo de Vulnerabilidad</h4>
      {isEditing ? (
  <input type="text" value={editedVulnerabilidad} onChange={(e) => setEditedVulnerabilidad(e.target.value)} className="edit-input" />
) : (
  <p>{editedVulnerabilidad}</p>
)}

    </div>
  </div>

<div className="info-card">
  <FiMapPin className="info-icon" />
  <div>
    <h4>Zona</h4>
    {isEditing ? (
      <select
        value={editedZona}
        onChange={(e) => setEditedZona(e.target.value)}
        className="edit-select"
      >
        <option value="Urbana">Urbana</option>
        <option value="Rural">Rural</option>
      </select>
    ) : (
      <p>{editedZona}</p>
    )}
  </div>
</div>


  <div className="info-card">
    <FiUsers className="info-icon" />
    <div>
      <h4>Número de Beneficiarios</h4>
{isEditing ? (
  <input
    type="number"
    value={editedBeneficiarios}
    onChange={(e) => setEditedBeneficiarios(e.target.value)}
    className="edit-input"
  />
) : (
  <p>{editedBeneficiarios}</p>
)}

    </div>
  </div>
  <div className="info-card full">
    <FiList className="info-icon" />
    <div>
     <h4>Producto a Entregar</h4>
{isEditing ? (
  <input
    type="text"
    value={editedProducto}
    onChange={(e) => setEditedProducto(e.target.value)}
    className="edit-input"
  />
) : (
  <p>{editedProducto}</p>
)}

    </div>
  </div>
  <div className="info-card full">
    <FiStar className="info-icon" />
    <div>
     <h4>Medida de Impacto Social</h4>
{isEditing ? (
  <input
    type="text"
    value={editedImpacto}
    onChange={(e) => setEditedImpacto(e.target.value)}
    className="edit-input"
  />
) : (
  <p>{editedImpacto}</p>
)}

    </div>
  </div>


<div className="info-card full">
  <FiList className="info-icon" />
  <div style={{ width: "100%" }}>
    <h4>Competencias</h4>
    {isEditing ? (
      <TextField
        value={editedCompetencias}
        onChange={(e) => setEditedCompetencias(e.target.value)}
        multiline
        minRows={4}
        fullWidth
        variant="outlined"
        placeholder="Describe aquí las competencias"
        sx={{
          mt: 1,
          backgroundColor: "white",
          borderRadius: 2,
          width: "100%",
        }}
      />
    ) : (
      <p>{editedCompetencias}</p>
    )}
  </div>
</div>




  <div className="info-card full">
    <FiMapPin className="info-icon" />
    <div>
     <h4>Dirección</h4>
{isEditing ? (
  <input
    type="text"
    value={editedDireccion}
    onChange={(e) => setEditedDireccion(e.target.value)}
    className="edit-input"
  />
) : (
  <p>{editedDireccion}</p>
)}

    </div>
  </div>
</div>


<h3 className="info-group-title"><FiClock /> Horas & Clave</h3>
<div className="info-grid-modern">
 
 
  <div className="info-card">
    <FiClock className="info-icon" />
    <div>
      <h4>Horas requeridas</h4>
      {isEditing ? null : (
        <p>{proyecto.horas} hrs</p>
      )}
    </div>
  </div>


  <div className="info-card">
    <FiClock className="info-icon" />
    <div>
      <h4>Horas máximas</h4>
      <p>{proyecto.horas_maximas}</p>
    </div>
  </div>
 


  
</div>


{/* Los que me faltaban de agregas xdxd */}

<h3 className="info-group-title"><FiList /> Información Complementaria</h3>
<div className="info-grid-modern">

  <div className="info-card full">
    <FiTarget className="info-icon" />
    <div>
      <h4>Problema Social</h4>
      {isEditing ? (
        <input
          type="text"
          value={editedProblemaSocial}
          onChange={(e) => setEditedProblemaSocial(e.target.value)}
          className="edit-input"
        />
      ) : (
        <p>{editedProblemaSocial}</p>
      )}
    </div>
  </div>

  <div className="info-card">
    <FiCheckCircle className="info-icon" />
    <div>
      <h4>Valor que Promueve</h4>
      {isEditing ? (
        <input
          type="text"
          value={editedValorPromueve}
          onChange={(e) => setEditedValorPromueve(e.target.value)}
          className="edit-input"
        />
      ) : (
        <p>{editedValorPromueve}</p>
      )}
    </div>
  </div>


  <div className="info-card">
    <FiUsers className="info-icon" />
    <div>
      <h4>Rango de Edad</h4>
      {isEditing ? (
        <input
          type="text"
          placeholder="[18,25)"
          value={editedRangoEdad}
          onChange={(e) => setEditedRangoEdad(e.target.value)}
          className="edit-input"
        />
      ) : (
        <p>{editedRangoEdad}</p>
      )}
    </div>
  </div>

  <div className="info-card full">
    <FiClipboard className="info-icon" />
    <div>
      <h4>Actividades del Alumno</h4>
      {isEditing ? (
        <TextField
          multiline
          minRows={3}
          fullWidth
          placeholder="Lista de actividades"
          value={editedActividadesAlumno}
          onChange={(e) => setEditedActividadesAlumno(e.target.value)}
          variant="outlined"
          sx={{ mt: 1, backgroundColor: "white", borderRadius: 2 }}
        />
      ) : (
        <p>{editedActividadesAlumno}</p>
      )}
    </div>
  </div>

  <div className="info-card full">
    <FiInfo className="info-icon" />
    <div>
      <h4>Descripción de la Modalidad</h4>
      {isEditing ? (
        <TextField
          multiline
          minRows={2}
          fullWidth
          placeholder="Describe cómo se llevará a cabo la modalidad"
          value={editedModalidadDesc}
          onChange={(e) => setEditedModalidadDesc(e.target.value)}
          variant="outlined"
          sx={{ mt: 1, backgroundColor: "white", borderRadius: 2 }}
        />
      ) : (
        <p>{editedModalidadDesc}</p>
      )}
    </div>
  </div>



  <div className="info-card full">
    <FiTarget className="info-icon" />
    <div>
      <h4>Objetivo General</h4>
      {isEditing ? (
        <TextField
          multiline
          minRows={2}
          fullWidth
          placeholder="Objetivo general del proyecto"
          value={editedObjetivoGeneral}
          onChange={(e) => setEditedObjetivoGeneral(e.target.value)}
          variant="outlined"
          sx={{ mt: 1, backgroundColor: "white", borderRadius: 2 }}
        />
      ) : (
        <p>{editedObjetivoGeneral}</p>
      )}
    </div>
  </div>




  <div className="info-card">
    <FiFlag className="info-icon" />
    <div>
      <h4>Estado</h4>
      {isEditing ? (
        <select
          value={editedEstado}
          onChange={(e) => setEditedEstado(e.target.value)}
          className="edit-select"
        >
          <option value="visible">Visible</option>
          <option value="pendiente">Pendiente</option>
          <option value="lleno">Lleno</option>
        </select>
      ) : (
        <p>{editedEstado}</p>
      )}
    </div>
  </div>

</div>






</div> {/* Este cierra .info-container */}
</section>

          

          {/* Proyectos relacionados inicio*/}
             {/* PROYECTOS RELACIONADOS */}
      <section className="related-section">
        <h2>Proyectos Relacionados</h2>
        <div className="related-carousel-wrapper">
          <button className="related-arrow left" onClick={handleScrollLeft}>←</button>
          <div className="related-carousel" ref={carouselRef}>
            {relatedProjects.map((p) => (
              <div
                className="related-card"
                key={p.id}
                //onClick={() => navigate(`/proyectos/${p.id}`)} //dummy data before
                onClick={() => {
                    onClose(); // cerramos modal actual
                    setTimeout(() => {
                      // abrimos el nuevo proyecto como modal
                      window.dispatchEvent(new CustomEvent("abrir-proyecto", { detail: p }));
                    }, 200);
                  }}
                  
              >
                <img src={p.images[0]} alt={p.title} />
                <h4>{p.title}</h4>
                <p>Ver más</p>
              </div>
            ))}
          </div>
          <button className="related-arrow right" onClick={handleScrollRight}>→</button>
        </div>
      </section>

      

     
      {showAllPhotos && (
  <div className="lightbox-overlay" onClick={() => setShowAllPhotos(false)}>
    <div className="lightbox-gallery" onClick={(e) => e.stopPropagation()}>
      <button className="close-lightbox" onClick={() => setShowAllPhotos(false)}>✕</button>

      {/* Navegación */}
      <button
        className="nav-arrow left"
        onClick={() =>
          setSelectedPhotoIndex(
            (selectedPhotoIndex - 1 + project.images.length) % project.images.length
          )
        }
      >
        ←
      </button>

      <img
        src={project.images[selectedPhotoIndex]}
        alt={`Foto ${selectedPhotoIndex + 1}`}
        className="lightbox-main-img"
      />

      <button
        className="nav-arrow right"
        onClick={() =>
          setSelectedPhotoIndex((selectedPhotoIndex + 1) % project.images.length)
        }
      >
        →
      </button>
    </div>
  </div>
)}




        </div>
      </div>

      {showPreview && (
        <ImagePreviewModal
          images={proyecto.images}
          selected={selectedImage}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
};

const ImagePreviewModal = ({ images, selected, onClose }) => {
  const [current, setCurrent] = useState(selected);

  const prevImage = () => setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImage = () => setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className="image-preview-overlay" onClick={onClose}>
      <div className="image-preview-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button glass-button" onClick={onClose}><FiX /></button>
        <img src={images[current]} alt="Vista previa" className="preview-image" />
        <button className="nav-button left" onClick={prevImage}>‹</button>
        <button className="nav-button right" onClick={nextImage}>›</button>
      </div>
    </div>
  );
};

export default ProjectModal;