import React, { useRef, useEffect, useState } from "react";
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
  FiStar
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { FiBox, FiActivity, FiUser } from "react-icons/fi";

import Box from '@mui/material/Box';


const cleanIframeHtml = (html) => {
  return html
    .replace(/width="[^"]*"/, 'width="100%"')
    .replace(/height="[^"]*"/, 'height="100%"')
    .replace(/style="[^"]*"/, 'style="border:0; width:100%; height:100%;"');
};



const ProjectModal = ({ proyecto, onClose, proyectosDisponibles }) => {
    const carouselRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedModalidad, setEditedModalidad] = useState(proyecto.modalidad);
  const [horas, setHoras] = useState(proyecto.horas);
  const [showPreview, setShowPreview] = useState(false);
    const navigate = useNavigate();

      const [showAllPhotos, setShowAllPhotos] = useState(false); 
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

    //const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null); //Lo llamamos desde Project, no desde aca


    //Al dar click postular abra formulario
    const [mostrarFormularioPostulacion, setMostrarFormularioPostulacion] = useState(false);




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
    setEditedModalidad(proyecto.modalidad);
    setHoras(proyecto.horas);
  }, [proyecto]);

  const handleSave = async () => {
    const modalidadesValidas = ["presencial", "en linea", "mixto"];
    if (!modalidadesValidas.includes(editedModalidad.toLowerCase())) {
      alert("Modalidad no valida. Usa: presencial, en linea o mixto.");
      return;
    }


    try {
      const response = await fetch(`http://localhost:8000/proyectos/${proyecto_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modalidad: editedModalidad, horas }),
      });

      if (response.ok) {
        setIsEditing(false);
      } else {
        alert("Error al actualizar el proyecto");
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
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
    setHoras(proyecto.horas);
    setIsEditing(false);
  };

  if (!proyecto) return null;

  return (
    <>
      <div className="project-modal-overlay" onClick={onClose}>
      <div className={`project-modal fade-in`} onClick={(e) => e.stopPropagation()}> 
      <button className="close-button" onClick={onClose}><FiX /></button>
      <h1 className="modal-title">{proyecto.title}</h1>

      


          <div className="carousel-section">
            <img src={proyecto.images[selectedImage]} alt="Principal" className="main-image" />
            <div className="thumbnail-row" ref={carouselRef}>
              {proyecto.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Mini ${i}`}
                  className={`thumb ${selectedImage === i ? "active" : ""}`}
                  onClick={() => {
                    setSelectedImage(i);
                    setShowPreview(true);
                  }}
                />
              ))}
            </div>
          </div>

   

          <div className="chips">
            <span><FiClock /> {horas} hrs</span>
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



<div className="apply-box-top">
  <button
    className="apply-button"
    onClick={() => setMostrarFormularioPostulacion(!mostrarFormularioPostulacion)}
  >
    {mostrarFormularioPostulacion ? "Cancelar" : "Postularme"}
  </button>

  {mostrarFormularioPostulacion && (
    <div className="postulacion-form-container">
      <label htmlFor="respuestaPostulacion">¿Por qué te interesa este proyecto?</label>
      <textarea
        id="respuestaPostulacion"
        className="respuesta-textarea"
        placeholder="Escribe tu motivo..."
      />
      <button className="enviar-button">Enviar postulación</button>
    </div>
  )}
</div>



{/* === Periodos de Ejecución === */}
<section className="info-structured-section">
  <div className="info-container">

    <h3 className="info-group-title"><FiCalendar /> Periodos de Ejecución</h3>

    <div className="info-grid-modern">
      <div className="info-card full">
        <img
          src="/periodos.jpeg"
          alt="Periodos de ejecución Febrero - Junio 2025"
          style={{
            width: "100%",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            marginTop: "0.8rem",
            maxHeight: "500px",
            objectFit: "contain"
          }}
        />
      </div>
    </div>

  </div>
</section>



{/* === Vista del maps === */}
<section className="info-structured-section">
  <div className="info-container">

    <h3 className="info-group-title"><FiCalendar /> Mapa</h3>

    <div className="info-grid-modern">
      {proyecto.enlace_maps && (
  <Box
    sx={{
      borderRadius: 4,
      overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
      mt: 2,
      height: 400,
      width: "100%", // Asegura que el contenedor sea 100%
    }}
  >
    <div
      dangerouslySetInnerHTML={{ __html: cleanIframeHtml(proyecto.enlace_maps) }}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  </Box>
)}

    </div>

  </div>
</section>











          <section className="info-structured-section">
            <div className="info-container">
              <div className="info-header-fixed">
                {isEditing && (
                  <button className="cancel-button" onClick={handleCancel}>
                    <FiX /> Cancelar
                  </button>
                )}
                <h2 className="info-title">Información del Proyecto</h2>
                <button className="edit-button" onClick={isEditing ? handleSave : () => setIsEditing(true)}>
                  <FiEdit3 /> {isEditing ? "Guardar" : "Editar"}
                </button>
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

                <div className="info-card full">
                  <FiList className="info-icon" />
                  <div>
                    <h4>Actividades</h4>
                    <ul>
                      <li>Tomar curso de redacción</li>
                      <li>Buscar noticias positivas</li>
                      <li>Crear contenido visual</li>
                      <li>Entrevistar y reportar</li>
                    </ul>
                  </div>
                </div>
              </div>

            <h3 className="info-group-title"><FiCalendar /> Detalles Generales</h3>
<div className="info-grid-modern">
  <div className="info-card">
    <FiCalendar className="info-icon" />
    <div>
      <h4>Tipo de inscripción</h4>
      <p>Por IRIS</p>
    </div>
  </div>
  <div className="info-card">
    <FiUsers className="info-icon" />
    <div>
      <h4>Carreras</h4>
      <p>{proyecto.carreras.join(", ")}</p>
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
      <p>{proyecto.tipo_vulnerabilidad}</p>
    </div>
  </div>

  <div className="info-card">
    <FiMapPin className="info-icon" />
    <div>
      <h4>Zona</h4>
      <p>{proyecto.zona}</p>
    </div>
  </div>

  <div className="info-card">
    <FiUsers className="info-icon" />
    <div>
      <h4>Número de Beneficiarios</h4>
      <p>{proyecto.numero_beneficiarios}</p>
    </div>
  </div>
  <div className="info-card full">
    <FiList className="info-icon" />
    <div>
      <h4>Producto a Entregar</h4>
      <p>{proyecto.producto_a_entregar}</p>
    </div>
  </div>
  <div className="info-card full">
    <FiStar className="info-icon" />
    <div>
      <h4>Medida de Impacto Social</h4>
      <p>{proyecto.medida_impacto_social}</p>
    </div>
  </div>
  <div className="info-card full">
    <FiList className="info-icon" />
    <div>
      <h4>Competencias</h4>
      <p>{proyecto.competencias}</p>
    </div>
  </div>
  <div className="info-card full">
    <FiMapPin className="info-icon" />
    <div>
      <h4>Dirección</h4>
      <p>{proyecto.direccion}</p>
    </div>
  </div>
</div>

<div className="info-grid-modern" style={{ marginTop: "1.5rem" }}>
  <div className="info-card full">
    <FiTarget className="info-icon" />
    <div>
      <h4>Objetivo</h4>
      <p>{proyecto.objetivo}</p>
    </div>
  </div>
</div>

<h3 className="info-group-title"><FiClock /> Horas & Clave</h3>
<div className="info-grid-modern">
  <div className="info-card">
    <FiClock className="info-icon" />
    <div>
      <h4>Horas requeridas</h4>
      {isEditing ? (
        <input type="number" value={horas} onChange={(e) => setHoras(e.target.value)} className="edit-input" />
      ) : (
        <p>{horas} hrs</p>
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
  <div className="info-card">
    <FiKey className="info-icon" />
    <div>
      <h4>Clave</h4>
      <p>{`WA1058 - Grupo: ${proyecto.grupo} - CRN: ${proyecto.crn}`}</p>
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