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

  console.log("🧪 Proyecto actual:", proyecto);
console.log("🧪 Modalidad actual:", proyecto.modalidad);
console.log("🧪 Todos los proyectos:", proyectosDisponibles);

console.log("🧪 Proyectos relacionados encontrados:", relatedProjects);



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
            </div>
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