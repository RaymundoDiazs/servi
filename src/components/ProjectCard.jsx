export function ProjectCard({ project }) {
  const [carreras, setCarreras] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:8000/proyecto_carrera/` + project.proyecto_id)
      .then((res) => res.json())
      .then((data) => setCarreras(data))
      .catch((err) => console.error("Error cargando carreras:", err));
  }, [project.proyecto_id]);

  return (
    <div className="project-card fade-in"> {/* CAMBIADO de "card" a "project-card" */}
      <div className="card-content">
        <div className="image-container">
          <img
            src="/logo.jpg"
            alt={project.nombre_proyecto}
            className="project-image"
          />
        </div>

        <div className="card-body">
          <div className="modalidad-info">
            <div className="avatar">
              {project.modalidad === "Presencial" ? <FaPerson /> : <FaChalkboardTeacher />}
            </div>
            <p className="modalidad-text">{project.modalidad}</p>
          </div>

          <h3 className="project-title">{project.nombre_proyecto}</h3>

          <div className="carreras-list">
            {carreras.map((carrera, idx) => (
              <div className="carrera-pill" key={idx}>
                <FaUserGraduate size={11} />
                {carrera.nombre}
              </div>
            ))}
          </div>

          <div className="card-footer">
            <div className="footer-info">
              <strong>Horas:</strong> {project.cantidad || "N/A"}
            </div>
            <div className="footer-info">
              <strong>Edad:</strong> {project.rango_edad || "N/A"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

