import React, { useState, useEffect, useRef, useContext } from "react";
import "./RespuestasAlumnos.css";
import { FiArrowLeft, FiEdit3, FiCheck, FiX, FiChevronDown, FiChevronUp, FiInfo } from "react-icons/fi";
import { BallContext } from "../Contexts/BallContext";
import { SessionContext } from "../Contexts/SessionContext";
import { UserIdContext } from "../Contexts/UserIdContext";

const dummyData = [
  { carrera: "IMT", matricula: "A01736813", telefono: "2311535986", dispuesto: false },
  { carrera: "ITC", matricula: "A01736813", telefono: "2311535986", dispuesto: true },
  { carrera: "ITC", matricula: "A01736813", telefono: "2311535986", dispuesto: true },
  { carrera: "IMT", matricula: "A01736813", telefono: "2311535986", dispuesto: false },
  { carrera: "ITC", matricula: "A01736813", telefono: "2311535986", dispuesto: true },
  { carrera: "IMT", matricula: "A01736813", telefono: "2311535986", dispuesto: false },
];

const RespuestasAlumnos = ( {test = ''} ) => {
  const [filtroCarrera, setFiltroCarrera] = useState("Todas");
  const [postulaciones, setPostulaciones] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [carrerasArr, setCarrerasArr] = useState([]);
  const [estados, setEstados] = useState([])
  const [savedPostulaciones, setSavedPostulaciones] = useState({})
  const [currEdit, setCurrEdit] = useState(null)
  const [changes, setChanges] = useState({})
  const [changesAlumno, setChangesAlumno] = useState({})
  const [toChange, setToChange] = useState({})
  const [resDescarte, setResDescarte] = useState(null)
  const [filters, setFilters] = useState({ "alumno": "", "proyecto": "Todos", "periodo": "Todos" })
  const { userId, setUserId } = useContext(UserIdContext)
  const { sessionType, setSessionType } = useContext(SessionContext)
  const [showPopUp, setShowPopUp] = useState(false)
  

  const {
    ballPos,
    setBallPos,
    ballStartY,
    setBallStartY,
    depositPoint,
    setDepositPoint,
    setEntregando,
    setBallLanded,
  } = useContext(BallContext);

  const ballRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    // Fetch postulaciones
    fetch(( sessionType === 'osf' ? 'http://localhost:8000/postulaciones/'+userId.special_id : 'http://localhost:8000/postulaciones'))
      .then(res => res.json())
      .then((data) => {
        const result = data.reduce((acc, p) => {
          acc[p.id_postulacion] = {
            ...p,
            proyecto: `${p.proyecto} - ${p.periodo} Periodo ${p.momento}`
          };
          return acc;
        }, {});
        setPostulaciones(result);
        setSavedPostulaciones(result);
        console.log(result);
      });

    // Fetch carreras
    fetch("http://localhost:8000/carreras")
      .then((res) => res.json())
      .then((data) => setCarrerasArr(data));

  }, [sessionType, userId]);

  // Centraliza la lógica de estados según sessionType
  useEffect(() => {
    if (sessionType === "alumno") {
      setFilters({ "alumno": `${userId.special_id}`, "proyecto": "Todos", "periodo":"Todos" })
      setEstados(['ACEPTADX', 'DECLINADX', "CONFIRMADX"])
    } else if (sessionType === "osf") {
      setEstados(['POSTULADX', 'ACEPTADX', "RECHAZADX"])
    } else if (sessionType === "ss") {
      setEstados(['POSTULADX', 'ACEPTADX', 'RECHAZADX', 'DECLINADX', 'CONFIRMADX'])
    } else {
      setEstados([])
    }
  }, [sessionType, userId])

  const carreras = ["Todas", ...Array.from(new Set(Object.values(postulaciones).map((a) => a.carrera)))];
  const proyectos = ["Todos", ...Array.from(new Set(Object.values(postulaciones).map((a) => a.proyecto)))]
  const periodos = [
    "Todos",
    ...Array.from(new Set(Object.values(postulaciones).map((a) => a.periodo)))
  ]

  const dataFiltrada = Object.values(postulaciones).filter((alumno) => {
    // console.log(alumno)
    const coincideCarrera = filtroCarrera === "Todas" || alumno.carrera === filtroCarrera;
    const coincideAlumno = ((alumno["nombre"]).toLowerCase().includes(filters["alumno"].toLowerCase())) || (alumno["id_alumno"].includes(filters.alumno))
    const coincideProyecto = filters.proyecto === "Todos" || alumno.proyecto === filters.proyecto  || alumno.id_proyecto === filters.proyecto
    const coincidePeriodo = filters.periodo === "Todos" || alumno.periodo === filters.periodo;
    // console.log(alumno["nombre"], filters)
    // return coincideCarrera && coincideDispuesto;
    return coincideCarrera && coincideAlumno && coincideProyecto && coincidePeriodo;
  });

  




  // logica pelota
  useEffect(() => {
    if (!ballRef.current) return;

    setBallLanded(false); //si no cae aun

    let y = ballStartY;
    let velocity = 0;
    const gravity = 1;
    const bounce = 0.7;

    const tableTop = document.querySelector(".respuestas-tabla table").getBoundingClientRect().top;
    const containerTop = containerRef.current.getBoundingClientRect().top;
    const maxY = tableTop - containerTop - 24;

    const animate = () => {
      velocity += gravity;
      y += velocity;

      if (y >= maxY) {
        y = maxY;
        velocity *= -bounce;
        if (Math.abs(velocity) < 1.5) {
          velocity = 0;
          setBallLanded(true); //si cayo
        }
      }

      if (ballRef.current) {
        ballRef.current.style.top = `${y}px`;
      }

      if (velocity !== 0 || y < maxY) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();
  }, [ballStartY]);

  const handleSave = async () => {
    console.log("holi")
    setSavedPostulaciones(postulaciones)
    setIsEditing(false)
    setCurrEdit(null)
    console.log(changes)
    console.log(changesAlumno)
    console.log(resDescarte)

    const formInfo = new FormData()
    formInfo.append("postulacion", JSON.stringify(changes))
    formInfo.append("alumno", JSON.stringify(changesAlumno))
    formInfo.append("respuesta_descarte", resDescarte)
    formInfo.append("toChange", JSON.stringify(toChange))
    await fetch('http://localhost:8000/postulaciones/update', {
      method: "PATCH",
      body: formInfo
    })

    // Refetch postulaciones after save
    await fetch(( sessionType === 'osf' ? 'http://localhost:8000/postulaciones/'+userId.special_id : 'http://localhost:8000/postulaciones'))
      .then(res => res.json())
      .then((data) => {
        const result = data.reduce((acc, p) => {
          acc[p.id_postulacion] = {
            ...p,
            proyecto: `${p.proyecto} - ${p.periodo} Periodo ${p.momento}`
          };
          return acc;
        }, {});
        setPostulaciones(result);
        setSavedPostulaciones(result);
        console.log(result);
      });
  }

  const handleCancel = () => {
    setPostulaciones(savedPostulaciones)
    setIsEditing(false)
    setCurrEdit(null)
  }

  const alumnoFields = new Set(["nombre", "alumno_id", "carrera", "telefono"]);
  const handleChange = (e) => {
    const { value, name, id } = e.target;
    console.log(value, name, id);
    const newPos = { ...postulaciones[id], [name]: value };
    setPostulaciones({ ...postulaciones, [id]: newPos });

    if (name === 'respuesta_descarte') {
      setResDescarte(value)
    } else if (alumnoFields.has(name)) {
        setChangesAlumno(prev => ({
            ...prev,
            [name]: value
        }));
    } else {
        setChanges(prev => ({
            ...prev,
            [name]: value
        }));
    }
  }
  

  const handleClick = (e) => {
    const x = e.clientX;
    const y = e.clientY - containerRef.current.getBoundingClientRect().top;
    setBallPos({ x });
    setBallStartY(y);
  };

  function checkPermission(user, name, value = '') {
    if (user === 'ss') return true
    
    if (user === 'alumno') {
      if (name === 'estado' && value == 'ACEPTADX') return true
      return false
    }

    if (user === 'osf') {
      if (name === 'estado' && value === 'POSTULADX' ) return true
      if (name === 'comentarios') return true
    }
    
    return false
  }

  // Función para obtener la clase según el estado
  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'ACEPTADX':
        return 'estado-aceptadx';
      case 'RECHAZADX':
        return 'estado-rechazadx';
      case 'DECLINADX':
        return 'estado-declinadx';
      case 'CONFIRMADX':
        return 'estado-confirmadx';
      case 'POSTULADX':
      default:
        return 'estado-postuladx';
    }
  }

  const ExpandableCell = ({ children, className = '', style = {}, ...props }) => {
    const [expanded, setExpanded] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const spanRef = useRef(null);

    useEffect(() => {
      const checkOverflow = () => {
        if (spanRef.current) {
          setShowButton(spanRef.current.scrollWidth > spanRef.current.clientWidth);
        }
      };
      checkOverflow();
      window.addEventListener('resize', checkOverflow);
      return () => window.removeEventListener('resize', checkOverflow);
    }, [children]);

    return (
      <td className={className} style={{ position: 'relative', ...style }} {...props}>
        <span
          ref={spanRef}
          style={{
            display: 'block',
            whiteSpace: expanded ? 'normal' : 'nowrap',
            overflow: 'hidden',
            textOverflow: expanded ? 'unset' : 'ellipsis',
            wordBreak: expanded ? 'break-word' : 'normal',
            maxWidth: expanded ? 'none' : '100%',
          }}
        >
          {children}
        </span>
        {showButton && (
          <button
            style={{
              position: 'absolute',
              right: 4,
              bottom: 4,
              background: 'rgba(255,255,255,0.7)',
              border: 'none',
              cursor: 'pointer',
              padding: 2,
              borderRadius: 4,
              zIndex: 10,
            }}
            onClick={e => {
              e.stopPropagation();
              setExpanded(v => !v);
            }}
            aria-label={expanded ? 'Colapsar' : 'Expandir'}
          >
            {expanded ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        )}
      </td>
    );
  };

  return (
    <>
        {showPopUp && (
        <div className="overlay">
          <div class="popup">
            <div class="popup-header">
              <span class="popup-icon"><FiInfo></FiInfo></span>
              <span class="popup-title">Advertencia</span>
            </div>
            <div class="popup-message">
              Los cambios que realices serán <strong>irreversibles</strong>.
              {sessionType === "alumno" ? (
                <>
                  <br />
                  Al confirmar un proyecto, <strong>todos los demás proyectos con los que tengas empalmes serán rechazados automáticamente</strong>.
                </>
              ) : (
                <>
                  <br />
                  Por favor, revisa cuidadosamente antes de guardar.
                </>
              )}
              </div>
            <div class="popup-buttons">
              <button class="btn-outline" onClick={() => setShowPopUp(false)} >Regresar</button>
              <button class="btn-primary" onClick={() => {
              setShowPopUp(false)
              handleSave()
              }} >Guardar</button>
            </div>
          </div>
        </div>
      )}
    <div className="respuestas-container" ref={containerRef}>
      <div className="respuestas-header">
        <FiArrowLeft />
        <h1>Postulaciones - {sessionType} {test}</h1>
      </div>

      <div className="edit-buttons-container">
      {isEditing && (
          <>
          <button className="edit-button" onClick={

            sessionType === "ss" ? () => handleSave() : () => setShowPopUp(true)
            
          }>
            <FiEdit3 /> {isEditing ? "Guardar" : "Editar"}
          </button>
          <button className="cancel-button" onClick={handleCancel}>
            <FiX /> Cancelar
          </button>
          </>
      )}
        </div>

      <div className="respuestas-filtros">
        { sessionType !== "alumno" && (
        <>
        <label>
          Carrera:
          <select value={filtroCarrera} onChange={(e) => setFiltroCarrera(e.target.value)}>
            {carreras.map((carrera) => (
              <option key={carrera} value={carrera}>{carrera}</option>
            ))}
          </select>
        </label>

          <label>
          Alumno:
          <input type="text" value={filters["alumno"]} onChange={
            (e) => {
              setFilters({...filters, ["alumno"]: e.target.value})
            }
          }/>
        </label>
        </>
        ) }

        <label>
          Proyecto:
          <select value={filters.proyecto} onChange={
            (e) => {
              setFilters({...filters, ["proyecto"]: e.target.value})
            }
          }>
            {proyectos.map((proyecto, index) => (
              <option key={index} value={proyecto}>{proyecto}</option>
            ))}
          </select>
        </label>
        <label>
          Periodo:
          <select value={filters.periodo} onChange={
            (e) => {
              setFilters({...filters, ["periodo"]: e.target.value})
            }
          }>
            {periodos.map((periodo, index) => (
              <option key={index} value={periodo}>{periodo}</option>
            ))}
          </select>
        </label>

        <div className="deposito" />
        <div className="respuestas-contador">
          Mostrando <strong>{dataFiltrada.length}</strong> resultados
        </div>
      </div>

      <div className="respuestas-tabla">
        <table>
          <thead>
            <tr>
              <th>Marca temporal</th>
              <th>Nombre completo</th>
              <th>Matrícula</th>
              <th>Estado</th>
              <th>Comentarios</th>
              <th>Proyecto</th>
              <th>Carrera</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>¿Qué queremos?</th>
              <th>¿Por qué deberíamos elegirte?</th>
              <th>Pregunta descarte</th>
            </tr>
          </thead>
          <tbody>
            {dataFiltrada.map((postulacion, idx) => (
              <tr
                key={idx}
                id={postulacion.id_postulacion}
                onDoubleClick={(e) => {
                  if (!isEditing && ((sessionType === "alumno" && postulacion.estado === "ACEPTADX") || (sessionType === "osf" && postulacion.estado === "POSTULADX")) || (sessionType == "ss")  )  {
                    console.log(estados)
                    setCurrEdit(postulacion.id_postulacion);
                    setToChange({
                      "id_postulacion": postulacion.id_postulacion,
                      "alumno_id": postulacion.id_alumno
                    })
                    setIsEditing(true);
                  }
                }}
              >
                {/* {console.log(postulacion)} */}
                {currEdit !== postulacion.id_postulacion && (
                  <>
                    <td>{postulacion.lastupdate}</td>
                    <ExpandableCell>{postulacion.nombre}</ExpandableCell>
                    <ExpandableCell>{postulacion.alumno_id}</ExpandableCell>
                    <td className={getEstadoClass(postulacion.estado)}>{postulacion.estado}</td>
                    <ExpandableCell>{postulacion.comentarios}</ExpandableCell>
                    <td style={{
                      textOverflow: "unset",
                      maxWidth: "500px"
                    }}>{postulacion.proyecto}</td>
                    <ExpandableCell>{postulacion.carrera}</ExpandableCell>
                    <ExpandableCell>{`${postulacion.alumno_id}@tec.mx`}</ExpandableCell>
                    <ExpandableCell>{postulacion.telefono}</ExpandableCell>
                    <ExpandableCell>{postulacion.confirmacion_lectura}</ExpandableCell>
                    <ExpandableCell>{postulacion.respuesta_habilidades}</ExpandableCell>
                    <ExpandableCell>{postulacion.respuesta_descarte || ''}</ExpandableCell>
                  </>
                )}
                {currEdit === postulacion.id_postulacion && (
                  <>
                    <td>{postulacion.lastupdate}</td>
                    <td>
                      {checkPermission(sessionType, "nombre") ? (
                        <input
                          type="text"
                          name="nombre"
                          id={postulacion.id_postulacion}
                          value={postulaciones[postulacion.id_postulacion].nombre}
                          onChange={handleChange}
                        />
                      ) : (
                        postulacion.nombre
                      )}
                    </td>
                    <td>
                      {checkPermission(sessionType, "alumno_id") ? (
                        <input
                          type="text"
                          name="alumno_id"
                          id={postulacion.id_postulacion}
                          value={postulaciones[postulacion.id_postulacion].alumno_id}
                          onChange={handleChange}
                        />
                      ) : (
                        postulacion.alumno_id
                      )}
                    </td>
                    <td className={getEstadoClass(postulacion.estado)}>
                      {checkPermission(sessionType, "estado", savedPostulaciones[postulacion.id_postulacion].estado) ? (
                        <select
                          name="estado"
                          id={postulacion.id_postulacion}
                          value={postulaciones[postulacion.id_postulacion].estado}
                          onChange={handleChange}
                        >
                          {estados.map((estado, index) => (
                            <option key={index} value={estado}>
                              {estado}
                            </option>
                          ))}
                        </select>
                      ) : (
                        postulacion.estado
                      )}
                    </td>
                    <td>
                      {checkPermission(sessionType, "comentarios") ? (
                        <textarea
                          name="comentarios"
                          id={postulacion.id_postulacion}
                          value={postulaciones[postulacion.id_postulacion].comentarios || ''}
                          onChange={handleChange}
                        />
                      ) : (
                        postulacion.comentarios
                      )}
                    </td>
                    <td>{postulacion.proyecto}</td>
                    <td>
                      {checkPermission(sessionType, "carrera_id") ? (
                        <select
                          name="carrera_id"
                          id={postulacion.id_postulacion}
                          value={postulaciones[postulacion.id_postulacion].carrera_id}
                          onChange={e => {
                            const { value, name, id } = e.target;
                            const selectedOption = carrerasArr.find(c => String(c.carrera_id) === value);
                            const newPos = {
                              ...postulaciones[id],
                              carrera_id: value,
                              carrera: selectedOption ? selectedOption.nombre : '',
                            };
                            setPostulaciones({ ...postulaciones, [id]: newPos });
                            setChangesAlumno(prev => ({
                              ...prev,
                              [name]: value
                            }));
                          }}
                        >
                          {carrerasArr.map((carrera) => (
                            <option value={carrera.carrera_id} key={carrera.carrera_id}>
                              {carrera.nombre}
                            </option>
                          ))}
                        </select>
                      ) : (
                        postulacion.carrera
                      )}
                    </td>
                    <td>{`${postulacion.id_alumno}@tec.mx`}</td>
                    <td>
                      {checkPermission(sessionType, "telefono") ? (
                        <input
                          type="text"
                          name="telefono"
                          id={postulacion.id_postulacion}
                          value={postulaciones[postulacion.id_postulacion].telefono}
                          onChange={handleChange}
                        />
                      ) : (
                        postulacion.telefono
                      )}
                    </td>
                    <td>
                      {checkPermission(sessionType, "confirmacion_lectura") ? (
                        <input
                          type="text"
                          name="confirmacion_lectura"
                          id={postulacion.id_postulacion}
                          value={postulaciones[postulacion.id_postulacion].confirmacion_lectura}
                          onChange={handleChange}
                        />
                      ) : (
                        postulacion.confirmacion_lectura
                      )}
                    </td>
                    <td>
                      {checkPermission(sessionType, "respuesta_habilidades") ? (
                        <input
                          type="text"
                          name="respuesta_habilidades"
                          id={postulacion.id_postulacion}
                          value={postulaciones[postulacion.id_postulacion].respuesta_habilidades}
                          onChange={handleChange}
                        />
                      ) : (
                        postulacion.respuesta_habilidades
                      )}
                    </td>
                    <td>
                      {postulacion.id_pregunta && checkPermission(sessionType, "respuesta_descarte") ? (
                        <input
                          type="text"
                          name="respuesta_descarte"
                          id={postulacion.id_postulacion}
                          value={postulaciones[postulacion.id_postulacion].respuesta_descarte || ''}
                          onChange={handleChange}
                        />
                      ) : (
                        postulacion.respuesta_descarte || ''
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ballPos && (
        <img
          ref={ballRef}
          src="/ball.png"
          alt="ball"
          style={{
            left: ballPos.x,
            top: ballStartY,
            position: "absolute",
            width: 24,
            height: 24,
            transform: "translateX(-50%)",
            imageRendering: "pixelated",
            pointerEvents: "none",
            zIndex: 20,
          }}
        />
      )}
    </div>

    </>

  );
};

export default RespuestasAlumnos;
