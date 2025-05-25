import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projects } from "../data/projects";
import "./ProjectDetail.css";


import {
  FiClipboard,
  FiMapPin,
  FiClock,
  FiBookOpen,
  FiUsers,
  FiTarget,
  FiList,
  FiCalendar,
  FiKey
} from "react-icons/fi";




const dummyComments = [
  { name: "María", text: "Una experiencia inolvidable " },
  { name: "Carlos", text: "El equipo muy profesional y comprometido." },
  { name: "Luz", text: "Recomiendo ampliamente este voluntariado." },
];

const ProjectDetail = () => {
  //Estados
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find((p) => p.id.toString() === id);

  const [imgIndex, setImgIndex] = useState(0);
  const [balls, setBalls] = useState([]);
  const [showAllPhotos, setShowAllPhotos] = useState(false); 
const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);



  const containerRef = useRef(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    if (!project) return;
    const initialBalls = project.images.slice(0, 3).map((_, i) => ({
      x: 50 + i * 80,
      y: 50 + i * 60,
      dx: 2 + i,
      dy: 2 - i,
      image: project.images[i],
    }));
    setBalls(initialBalls);
  }, [project]);

  useEffect(() => {
    const move = () => {
      setBalls(prev =>
        prev.map(ball => {
          const container = containerRef.current?.getBoundingClientRect();
          const size = 80; //80
          let newX = ball.x + ball.dx;
          let newY = ball.y + ball.dy;

          if (container) {
            if (newX < 0 || newX + size > container.width) {
              ball.dx *= -1;
              newX = ball.x + ball.dx;
            }
            if (newY < 0 || newY + size > container.height) {
              ball.dy *= -1;
              newY = ball.y + ball.dy;
            }
          }

          return { ...ball, x: newX, y: newY };
        })
      );
    };

    const interval = setInterval(move, 20);
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setImgIndex((imgIndex + 1) % project.images.length);
  };

  const handlePrev = () => {
    setImgIndex((imgIndex - 1 + project.images.length) % project.images.length);
  };

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

  const relatedProjects = projects.filter((p) => p.id.toString() !== id);

  if (!project) return <div>Proyecto no encontrado</div>;

  return (
    <div className="project-detail-container">
      {/* HERO */}
      
<section className="hero-section">
  <h1 className="project-title">{project.title}</h1>
  <p className="project-subtitle">Descubre este proyecto</p>

  <div className="badge-container">
    <span className="badge modalidad">{project.modalidad}</span>
    {project.carreras.map((c, i) => (
      <span className="badge" key={i}>{c}</span>
    ))}
  </div>
</section>

{/* CARRUSEL GRANDE + BOLAS */}
<section className="photo-gallery">
  <div className="gallery-layout">
    <div className="gallery-main">
      <img src={project.images[0]} alt="Principal" />
    </div>

    <div className="gallery-side">
  {project.images.slice(1, 5).map((img, i) => (
    <div
      className="side-image hoverable"
      key={i}
      onClick={() => {
        setSelectedPhotoIndex(i + 1); // +1 porque la 0 ya está a la izquierda
        setShowAllPhotos(true);
      }}
    >
      <img src={img} alt={`Vista ${i + 2}`} />
    </div>
  ))}
  {project.images.length > 5 && (
    <div className="side-image see-more">
      <button
        className="see-more-btn"
        onClick={() => {
          setSelectedPhotoIndex(0);
          setShowAllPhotos(true);
        }}
      >
        Ver {project.images.length} fotos
      </button>
    </div>
  )}
</div>



  </div>
</section>




{/* NUEVO CONTENIDO: VA FUERA DEL HERO */}
<section className="quote-section">
  <blockquote>
    <p>“Descrpcion/frase rapida de proyecto.”</p>
  </blockquote>
</section>

<section className="project-kpi-section">
  <div className="kpi-card">
    <FiClock className="kpi-icon" />
    <div>
      <h4>100 hrs</h4>
      <p>Requeridas</p>
    </div>
  </div>
  <div className="kpi-card">
    <FiUsers className="kpi-icon" />
    <div>
      <h4>{project.carreras.length}</h4>
      <p>Carreras compatibles</p>
    </div>
  </div>
  <div className="kpi-card">
    <FiCalendar className="kpi-icon" />
    <div>
      <h4>Feb - Jun</h4>
      <p>Periodo</p>
    </div>
  </div>
</section>

<div className="wave-divider">
  <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
    <path fill="#f0f4f8" d="M0,0 C480,100 960,0 1440,100 L1440,0 L0,0 Z"></path>
  </svg>
</div>





<div className="kpi-container-notch">
  <div className="notch-deco" />
  <div className="kpi-chip">
    <FiCalendar className="kpi-icon" />
    <span>Febrero - Junio</span>
  </div>
  <div className="kpi-chip">
    <FiClock className="kpi-icon" />
    <span>100 hrs mínimas</span>
  </div>
  <div className="kpi-chip">
    <FiKey className="kpi-icon" />
    <span>Clave: WA1058</span>
  </div>
</div>




      {/* INFO */}
      <section className="info-structured-section">
  <h2 className="info-title">Información del Proyecto</h2>

  {/* Sección: Detalles Generales */}
  <h3 className="info-group-title">
  <FiClipboard style={{ marginRight: "8px" }} /> Detalles Generales
</h3>

  <div className="info-grid-modern">
    <div className="info-card" style={{ "--i": 0 }}>
      <FiClipboard className="info-icon" />
      <div>
        <h4>Tipo de inscripción</h4>
        <p>Por IRIS</p>
      </div>
    </div>
    <div className="info-card" style={{ "--i": 1 }}>
      <FiMapPin className="info-icon" />
      <div>
        <h4>Modalidad</h4>
        <p>{project.modalidad}</p>
      </div>
    </div>
    <div className="info-card" style={{ "--i": 2 }}>
      <FiUsers className="info-icon" />
      <div>
        <h4>Carreras</h4>
        <p>{project.carreras.join(", ")}</p>
      </div>
    </div>
    <div className="info-card full" style={{ "--i": 3 }}>
      <FiTarget className="info-icon" />
      <div>
        <h4>Objetivo</h4>
        <p>Crear contenido constructivo que reduzca la fatiga informativa.</p>
      </div>
    </div>
  </div>

  {/* Sección: Horas y Clave */}
  <h3 className="info-group-title">
  <FiClock style={{ marginRight: "8px" }} /> Horas y claves
</h3>

  <div className="info-grid-modern">
    <div className="info-card" style={{ "--i": 4 }}>
      <FiClock className="info-icon" />
      <div>
        <h4>Horas requeridas</h4>
        <p>100 hrs</p>
      </div>
    </div>
    <div className="info-card" style={{ "--i": 5 }}>
      <FiClock className="info-icon" />
      <div>
        <h4>Horas máximas</h4>
        <p>Hasta 180</p>
      </div>
    </div>
    <div className="info-card" style={{ "--i": 6 }}>
      <FiKey className="info-icon" />
      <div>
        <h4>Clave</h4>
        <p>WA1058 - Grupo: 642 - CRN: 61985</p>
      </div>
    </div>
  </div>

  {/* Sección: Actividades */}
  <h3 className="info-group-title">
  <FiList style={{ marginRight: "8px" }} /> Actividades
</h3>

  <div className="info-grid-modern">
    <div className="info-card full" style={{ "--i": 7 }}>
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

  {/* Sección: Logística */}
  <h3 className="info-group-title">
  <FiMapPin style={{ marginRight: "8px" }} /> Logística
</h3>

  <div className="info-grid-modern">
    <div className="info-card" style={{ "--i": 8 }}>
      <FiMapPin className="info-icon" />
      <div>
        <h4>Ubicación</h4>
        <p>{project.modalidad === "Presencial" ? "Campus" : "En línea"}</p>
      </div>
    </div>
    <div className="info-card" style={{ "--i": 9 }}>
      <FiCalendar className="info-icon" />
      <div>
        <h4>Horario</h4>
        <p>Lunes a viernes entre 8am y 4pm</p>
      </div>
    </div>
  </div>
</section>



    {/* INFO */}
    <section className="info-structured-section">
  <h2 className="info-title">Información del Proyecto</h2>
  <div className="info-grid-modern">
    {/* infor-cards */}
  </div>
</section>



      {/* COMENTARIOS */}
      <section className="comments-section">
        <h2>Comentarios recientes</h2>
        {dummyComments.map((c, i) => (
          <div className="comment-item" key={i}>
            <img src={`https://i.pravatar.cc/36?img=${i + 6}`} alt={c.name} />
            <div>
              <strong>{c.name}</strong>
              <p>{c.text}</p>
            </div>
          </div>
        ))}
      </section>

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
                onClick={() => navigate(`/projects/${p.id}`)}
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
  );
};

export default ProjectDetail;
