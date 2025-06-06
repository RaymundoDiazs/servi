import { useContext, useEffect, useState } from "react";
import { SessionContext } from "../Contexts/SessionContext";
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

import React from 'react';
import {
  Slider
} from "@mui/material";
import { ConstructionOutlined } from "@mui/icons-material";
import { FaMoneyCheck } from "react-icons/fa";

import './NewProject.css';


const NewProject = () => {
    const {sessionType} = useContext(SessionContext)
    const [odsList, setOdsList] = useState([]);
    const [odsSelect, setOdsSelect] = useState([])
    const [periodos, setPeriodos] = useState([])
    const [momentosSelect, setMomentosSelect] = useState([])
    const [carreras, setCarreras] = useState([])
    const [carrerasSelect, setCarrerasSelect] = useState([])
    const [preguntaSelect, setPreguntaSelect] = useState(null)
    const navigate = useNavigate()
    
    const [ projectForm, setProjectForm ] = useState({
        nombre_coordinador: '',
        numero_coordinador: '',
        nombre: '',
        problema_social: '',
        tipo_vulnerabilidad: '',
        rango_edad: [18, 60], // acá hay posibilidad de hacer un rango chido
        zona: '', // rural o urbana
        num_beneficiarios: '',
        objetivo_general: '',
        ods: [],
        lista_actividades_alumnos: '',
        producto_a_entregar: '',
        entregable_desc: '',
        medida_impacto_social: '',
        // periodo: '',
        modalidad: '',
        modalidad_desc: '',
        carreras: [],
        competencias: '',
        // cantidad_alumnos: '',
        direccion: '',
        enlace_maps: '', 
        valor_promueve: '',
        surgio_unidad_de_formacion: '',
        pregunta_descarte: null,
        notificaciones: '', // notifiación sobre cuando alguien se postule

        momentos: {},
        // periodos: {},
        
    })

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setProjectForm({ ...projectForm, [name]: value });
    }

    useEffect(() => {
        if (projectForm.modalidad === "en linea") {
            setProjectForm(prev => ({
                ...prev,
                direccion: "",
                enlace_maps: ""
            }))
        }
    }, [projectForm.modalidad])

    const handleOdsChange = (e) => {
        const { value, checked } = e.target;

        const updatedOdsSelect = checked
            ? [...odsSelect, Number(value)]
            : odsSelect.filter((v) => v !== Number(value));

        setOdsSelect(updatedOdsSelect);
        setProjectForm({ ...projectForm, ods: updatedOdsSelect });
    }

    const handleMomentosChange = (e) => {
        // console.log(e)
        const { value, checked } = e.target;
        const updatedMomentosSelect = checked
            ? { ...momentosSelect, [value.momento_id]: value }
            : Object.fromEntries(
                Object.entries(momentosSelect).filter(([k]) => k !== String(value.momento_id))
            );
        
        setMomentosSelect(updatedMomentosSelect);

        setProjectForm({ ...projectForm, momentos: updatedMomentosSelect});    
        
    }

    const handleCarrerasChange = (e) => {
        const { value, checked } = e.target;

        const updatedCarrerasSelect = checked
            ? [...carrerasSelect, Number(value)]
            : carrerasSelect.filter((v) => v !== Number(value));
    
            
        setCarrerasSelect(updatedCarrerasSelect);
        setProjectForm({ ...projectForm, carreras: updatedCarrerasSelect });    
    }
    
    function test() {
        console.log(projectForm)
        setProjectForm(
            {
    "nombre_coordinador": "yahel alejandro jimenez fernandez",
    "numero_coordinador": "123123123",
    "nombre": "Los chicos de scott",
    "problema_social": "Pagaré la universidad de todos ustedes",
    "tipo_vulnerabilidad": "educación pobre",
    "rango_edad": [
        18,
        26
    ],
    "zona": "Urbana",
    "num_beneficiarios": "30",
    "objetivo_general": "objetivo general del proyecto",
    "ods": [
        1,
        5,
        7,
        11,
        14
    ],
    "lista_actividades_alumnos": "Descripción de las actividades acá",
    "producto_a_entregar": "un google docs",
    "entregable_desc": "otro google docs",
    "medida_impacto_social": "cantidad de google docs",
    "modalidad": "presencial",
    "modalidad_desc": "HORARIO",
    "carreras": [
        1,
        4,
        10,
        16
    ],
    "competencias": "Para este proyecto se necesitan habilidades para manipular la vida marina",
    "direccion": "la casa de yahel",
    "enlace_maps": "https://maps.app.goo.gl/n4XiZzDiiaUdiR936",
    "valor_promueve": "Compromiso",
    "surgio_unidad_de_formacion": "sí, SSH",
    "pregunta_descarte": "qué tanto conoces a yahel?",
    "notificaciones": "true",
    "momentos": [
    ],

}
        )
    }

    function test2() {
        console.log(momentosSelect)
        console.log(projectForm)
    }
    
    useEffect(() => {
        fetch("http://localhost:8000/ods")
            .then(response => response.json())
            .then(data => {
                setOdsList(data);
            });
        fetch("http://localhost:8000/periodos")
            .then(response => response.json())
            .then(data => {
                const resultado = {};
                data.forEach(({ nombre, momento, img, tipo, ...rest }) => {
                if (!resultado[nombre]) {
                    resultado[nombre] = {
                    info: {
                        img: img || "default.png",
                        tipo,
                        nombre
                    },
                    };
                }

                resultado[nombre][`m${momento}`] = {
                    momento,
                    periodo_nombre: nombre,
                    "num": 0,
                    ...rest,
                };
                });
                setPeriodos(resultado);
                console.log(resultado); // Cambié periodos por resultado para verificar el objeto correcto
            });
        fetch("http://localhost:8000/carreras")
            .then(response => response.json())
            .then(data => {
                setCarreras(data)
            })
    }, []);

    function fechaHumana(fechaStr) {
        return new Date(fechaStr).toLocaleDateString('es-MX', {
            weekday: 'long', // lunes, martes...
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const formInf = new FormData();

        Object.entries(projectForm).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (typeof value === 'object') {
                    formInf.append(key, JSON.stringify(value));
                }else formInf.append(key, value);
            }
        });

        console.log(formInf)

        fetch('http://localhost:8000/projects/newProject', {
            method: 'POST',
            credentials: "include",
            body: formInf,
            
        })
        .then((res) => {
            if (res.ok) {
                alert("Proyecto registrado!, redirigiendo...")
                navigate("/");

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




    if (sessionType !== "osf") {
        return (
            <div>
                Acceso denegado a esta página - {sessionType}
            </div>
        )
    }

    return (
        <div className="new-project-page">
            <div className="intro-section">
                <h1>Registro de Proyectos Solidarios 2025</h1>
                {/* {console.log(periodos)} */}

                <p>
                    Formulario para la postulación de proyectos en los periodos INVIERNO 2025 Y FEBRERO-JUNIO 2025.
                </p>
                <p>
                    El proyecto se revisará y aceptará en medida que la postulación cumpla con los requisitos y características de los proyectos solidarios, mismas que puede visualizar aquí: 
                    <a href="https://cutt.ly/YvLLFGl" target="_blank" rel="noopener noreferrer">https://cutt.ly/YvLLFGl</a>
                </p>
                <p><strong>IMPORTANTE:</strong></p>
                <ul>
                    <li>Recuerde que el Proyecto Solidario, debe cumplir con la atención de una <strong>NECESIDAD SOCIAL</strong>.</li>
                    <li><strong>LA POSTULACIÓN PODRÁ SER DESCARTADA</strong> si entre las actividades se encuentran:</li>
                    <ul>
                        <li>Colectas de dinero o alguna otra actividad asistencialista que infrinja el reglamento de Formación Social o bien, que implique una actividad donde no se considere el contacto con beneficiarios del socio formador.</li>
                        <li>Recaudación de fondos</li>
                        <li>Atracción de donatarias/padrinos</li>
                        <li>Venta de productos</li>
                        <li>Donaciones</li>
                    </ul>
                </ul>
            </div>
            <form className="project-form" onSubmit={handleSubmit}>
                <div className="form-group nombre-coordinador">
                    <label htmlFor="nombre_coordinador">Nombre de la persona que coordinará el Proyecto Solidario.
(Nombre, correo y puesto)</label>
                    <input type="text" name="nombre_coordinador" value={projectForm.nombre_coordinador} onChange={handleFormChange} required />
                </div>
                <div className="form-group numero-coordinador">
                    <label htmlFor="numero_coordinador">Número telefónico de la persona que coordinará el Servicio Social (para integrarle al grupo de WhatsApp)</label>
                    <input type="text" name="numero_coordinador" value={projectForm.numero_coordinador} onChange={handleFormChange} required />
                </div>

                <div className="form-group nombre-proyecto">
                    <label htmlFor="nombre">Nombre del Proyecto Solidario</label>
                    <p>El nombre debe ser corto, atractivo y descriptivo para el estudiante</p>
                    <input type="text" name="nombre" value={projectForm.nombre} onChange={handleFormChange} required />

                </div>

                <div className="form-group problema-social">
                    <label htmlFor="problema_social">Describa el problema social específico que atenderá el estudiantado</label>
                    <p>En caso de que tenga datos estadísticos que le dieron la pauta a este Proyecto Solidario te pedimos los agregues aquí. </p>
                    <textarea name="problema_social" value={projectForm.problema_social} onChange={handleFormChange} required />
                </div>

                <div className="form-group tipo-vulnerabilidad">
                    <label htmlFor="tipo_vulnerabilidad">Tipo de vulnerabilidad que atenderá este proyecto</label>
                <input type="text" name="tipo_vulnerabilidad" value={projectForm.tipo_vulnerabilidad} onChange={handleFormChange} required />
                </div>

                <div className="form-group rango-edad">
                    <p>Rango de edad de la población atendida en este proyecto</p>
                    <Slider
                        getAriaLabel={(index) => `Age range ${index + 1}`}
                        valueLabelDisplay="auto"
                        value={projectForm.rango_edad}
                        onChange={handleFormChange}
                        name="rango_edad"
                        min={0}
                        max={100}
                        step={1}
                        sx={{ color: '#0052CC' }}
                        required
                    />
                    <p>De {projectForm.rango_edad[0]} a {projectForm.rango_edad[1]} años</p>
                </div>

                <div className="form-group zona">
                    <label htmlFor="zona">Zona a la que pertenece el proyecto</label> <br />
                    <div className="radio-group">
                        <label>
                            <input type="radio" name="zona" value="Rural" onChange={handleFormChange} required /> Rural
                        </label>
                        <label>
                            <input type="radio" name="zona" value="Urbana" onChange={handleFormChange} required /> Urbana
                        </label>
                    </div>
                </div>

                <div className="form-group num-beneficiarios">
                    <label htmlFor="num_beneficiarios">Número aproximado de beneficiarios que estarán en contacto con el estudiantado o que se verán beneficiados durante la realización de ESTE Proyecto solidario</label>
                    <input type="number" name="num_beneficiarios" value={projectForm.num_beneficiarios} onChange={handleFormChange} required />
                </div>
                
                <div className="form-group objetivo-general">
                    <label htmlFor="objetivo_general">Objetivo General del Proyecto Solidario</label>
                    <p>(El objetivo es el cambio deseado que se quiere lograr con el proyecto solidario)</p>
                    <input type="text" name="objetivo_general" value={projectForm.objetivo_general} onChange={handleFormChange} required />
                </div>

                <div className="form-group ods-section">
                    <label htmlFor="ods">Seleccione 2 Objetivos de Desarrollo Sostenible que se impactarán CON ESTE Proyecto Solidario</label>
                    <div className="checkbox-group">
                        {odsList.map((ods) => (
                            <div key={ods.ods_id} className="checkbox-item">
                                <label>
                                    <input type="checkbox" name="ods" value={ods.ods_id} onChange={handleOdsChange} required={odsSelect.length < 2} />
                                    {ods.nombre}
                                </label> <br />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-group actividades-alumnos">
                    <label htmlFor="lista_actividades_alumno">
                        ENLISTE  y describe de forma breve LAS PRINCIPALES ACTIVIDADES/ACCIONES a realizar por parte del estudiantado durante 
                        el Proyecto Solidario (máximo 200 caracteres), ejemplo: 
                    </label>
                    <p>1.- Actividad principal 1 <br />
                    2.- Actividad principal 2 <br />
                    3.- Actividad principal 3 <br />
                    Recuerde que estas, deben propiciar la convivencia entre la organización, los beneficiarios y el estudiante y deben ser en pro de la atención a una necesidad social.
                    </p>
                    <textarea name="lista_actividades_alumnos" value={projectForm.lista_actividades_alumnos} onChange={handleFormChange} required />
                </div>

                <div className="form-group producto-entregar">
                    <label htmlFor="producto_a_entregar">Producto o Servicio a entregar. <br />(Máximo 30 caracteres)</label>
                    <input type="text" name="producto_a_entregar" value={projectForm.producto_a_entregar} onChange={handleFormChange} required/>
                </div>

                <div className="form-group entregable-desc">
                    <label htmlFor="entregable_desc"> Mencione y describa el entregable que se espera que realice el estudiantado para la OSF Producto, Servicio o Resultado del Servicio. (Máximo 200 caracteres) </label> <br />
                    <textarea name="entregable_desc" value={projectForm.entregable_desc} onChange={handleFormChange} required></textarea>
                </div>

                <div className="form-group impacto-social">
                    <label htmlFor="medida_impacto_social">Descripción de manera general cómo medirán el impacto social
(Por ejemplo: número de personas
beneficiadas, cambio esperado en la comunidad, antes y después, etc.)
</label><br />
                    <input type="text" name="medida_impacto_social" value={projectForm.medida_impacto_social} onChange={handleFormChange} required />
                </div>

                <div className="periodos-section">
                    {/* Iteración para cada periodo(semestre) */}
                    {Object.get}
                    {Object.entries(periodos).map(([periodo, momentos]) => (
                        <div key={periodo}>
                            {/* {console.log(periodo, momentos)} */}
                            <p>
                                Si desea participar en el PERIODO {periodo} (Periodo {momentos.info.tipo}), 
                                elija la o las las fechas de ejecución del periodo o periodos que más convengan a sus objetivos.
                            </p>
                            <img src={`/src/assets/${momentos.info.img}`} alt="descripción de periodos" />
                            {/* Iteración para cada momento del semestre */}
                            {/* slice(1) para descartar el primer elemento que trae la info del periodo */}
                            {(Object.entries(momentos).slice(1)).map(([momentoClave, info]) => ( 
                                <div key={`${periodo}-${momentoClave}`}> {/* Usar una combinación de periodo y momentoClave como key único */}
                                    {/* {console.log(momentoClave, info)} */}

                                    <label htmlFor={`momento-${info.momento_id}`}>
                                        <input
                                            type="checkbox"
                                            id={`momento-${info.momento_id}`} // Asignar un id único
                                            name="momento"
                                            value={JSON.stringify({
                                                momento_id: info.momento_id,
                                                periodo_id: info.periodo_id,
                                                periodo_nombre: info.periodo_nombre,
                                                num: info.num
                                            })} // Serializar el objeto a JSON
                                            onChange={(e) => {
                                                const parsedValue = JSON.parse(e.target.value); // Deserializar el valor
                                                handleMomentosChange({
                                                    ...e,
                                                    target: { ...e.target, value: parsedValue }
                                                });
                                            }}
                                            
                                        />
                                        PERIODO {info.momento} - HASTA {info.horas} Hrs - Del {fechaHumana(info.fecha_inicio)} al {fechaHumana(info.fecha_final)}
                                    </label> <br />
                                    { projectForm.momentos[info.momento_id] && (
                                        <div>
                                            <label htmlFor="cupo">Ingresa el número de estudiantes que pueden participar en este periodo: </label> <br />
                                            {console.log(projectForm["momentos"])}
                                            <input type="number" value={projectForm["momentos"][info.momento_id].num} onChange={e => {
                                                console.log(e)
                                                const newMomentos = projectForm["momentos"]
                                                newMomentos[info.momento_id].num = e.target.value
                                                console.log(newMomentos)
                                                
                                                setProjectForm({
                                                    ...projectForm,
                                                    momentos: newMomentos
                                                })
                                            }} required />
                                        </div>
                                    ) }
                                </div>
                            ))}
                        </div>
                    ))}
                    
                </div>

                <div className="carreras-section">
                    <label htmlFor="carreras">Carreras:</label>
                    <div className="checkbox-group">
                        {carreras.map((carrera) => (
                            <div key={carrera.carrera_id} className="checkbox-item">
                                <label htmlFor={`carrera-${carrera.carrera_id}`}>
                                    <input type="checkbox" name="carrera" id={`carrera-${carrera.carrera_id}`} onChange={handleCarrerasChange} value={carrera.carrera_id} required={carrerasSelect.length < 1} />
                                    {carrera.nombre_completo} {`(${carrera.nombre})`}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-group competencias-section">
                    <label htmlFor="competencias">Habilidades o competencias que el alumno requiere para participar en el proyecto:</label> <br />
                    <textarea value={projectForm.competencias} onChange={handleFormChange} name="competencias" required/>
                </div>

            <div className="modalidad-section">
                <label htmlFor="modalidad">Modalidad en que se llevará a cabo el proyecto solidario: </label> <br />
                <div className="radio-group">
                    <label>
                    <input type="radio" value={'en linea'} name="modalidad" onChange={handleFormChange} required />
                    En línea (Se verificará la posibilidad de autorización)
                    </label> <br />
                    
                    <label>
                    <input type="radio" value={'mixto'} name="modalidad" onChange={handleFormChange} required />
                    Mixto (70% actividades presenciales, 30% actividades remotas)
                    </label> <br />

                    <label>
                    <input type="radio" value={'presencial'} name="modalidad" onChange={handleFormChange} required />
                    Presencial (100% presencial)
                    </label>
                </div>
            </div>

                <div className="form-group modalidad-desc-section">
                    <label htmlFor="modalidad_desc">Coloque aquí el día o días de la semana en que deberá llevar a cabo las actividades.</label>
                    <p>
                    <strong>EJEMPLO de horario de un Proyecto Solidario MIXTO</strong> <br />

                    <strong>Asistencia presencial:</strong> 2 veces por semana <br />
                    <strong>Asistencia remota:</strong> 1 vez por semana <br />
                    <strong>Días presenciales:</strong> Lunes y martes (puede cambiar en acuerdo con la OSF) <br />
                    <strong>Días remotos:</strong> Viernes (inamovible) <br />
                    <strong>Horas por día:</strong> 3 horas (Ya sea presencial o remoto) <br />
                    <strong>Rango de horarios ya sea presencia o remoto:</strong> <br />
                    <strong>Matutino:</strong> entre 9:00 am y 2:00 pm <br />
                    <strong>Vespertino:</strong> entre 2:00 pm y 5:00 pm
                    </p>
                    <textarea name="modalidad_desc" id="modalidad_desc" value={projectForm.modalidad_desc} onChange={handleFormChange} required ></textarea>
                </div>

                {(projectForm.modalidad !== 'en linea' && projectForm.modalidad !== '' )  && (
                    <>
                        <div className="form-group direccion-section">
                            <label htmlFor="direccion"> <strong> DIRECCIÓN ESCRITA en donde trabajará el estudiantado </strong> (sólo para actividades PRESENCIALES o MIXTAS):</label> <br />
                            <input type="text" name="direccion" id="direccion" value={projectForm.direccion} onChange={handleFormChange} required />
                        </div>         
                        <div className="form-group enlace-maps-section">
                            <label htmlFor="enlace_maps">ENLACE DE MAPS en donde trabajará el estudiantado:</label> <br />
                            <input type="enlace_maps" name="enlace_maps" id="enlace_maps" value={projectForm.enlace_maps} onChange={handleFormChange} required />
                        </div>
                    </>
                )}
                
                <div className="valor-promueve-section">
                    <label htmlFor="valor_promueve">Valor o actitud que promueve en el estudiantado con las acciones a llevar a cabo:</label> <br />
                    <div className="radio-group">
                        <label>
                            <input type="radio" value={'Empatia'} name="valor_promueve" onChange={handleFormChange} required />
                            Empatia | Es sensible ante la vulnerabilidad, el dolor y el sufrimiento del otro y actúa con el fin de eliminarlo, aliviarlo o evitarlo, a través de acciones justas alejadas de la pasión egoísta y/o de sentimientos de superioridad.
                        </label> <br />
                        <label>
                            <input type="radio" value={'Compromiso'} name="valor_promueve" onChange={handleFormChange} required />
                            Compromiso | Actúa con responsabilidad, con el fin de asegurar el bienestar de la colectividad, a través de acciones que garantizan el acceso a los derechos humanos, el empoderamiento de los ciudadanos y de las comunidades, así como el cuidado, mantenimiento y uso sostenible de los recursos y bienes comunes.
                        </label> <br />
                        <label>
                            <input type="radio" value={'Tolerancia'} name="valor_promueve" onChange={handleFormChange} required />
                            Tolerancia | Actúa con respeto ante la diversidad de género, sexual, étnica, cultural, de capacidades, generacional, religiosa y socioeconómica mostrando una cordial aceptación de las diferencias y la capacidad para gestionar de manera razonable los conflictos.
                        </label> <br />
                        <label>
                            <input type="radio" value={'Participación ciudadana'} name="valor_promueve" onChange={handleFormChange} required />
                            Participación ciudadana | Promueve la solución cooperativa de problemas y la coordinación de acciones colectivas con el fin de mejorar la calidad de vida de la sociedad, fomentar la cultura de la legalidad, los derechos humanos y/o el fortalecimiento de la democracia.
                        </label>
                    </div>
                </div>

                <div className="surgio-unidad-formacion-section">
                    <label htmlFor="surgio_unidad_de_formacion"><strong>¿El Proyecto Solidario surgión de una propuesta de unidad de formación?</strong></label><br />
                    <div className="radio-group">
                        <label>
                            <input type="radio" value={'sí, SI'} name="surgio_unidad_de_formacion" onChange={handleFormChange} required/>
                            Si, de una Semana de Inducción
                        </label> <br />

                        <label>
                            <input type="radio" value={'sí, SSH'} name="surgio_unidad_de_formacion" onChange={handleFormChange} required/>
                            Si, de una Semana con Sentido Humano
                        </label> <br />

                        <label>
                            <input type="radio" value={'no'} name="surgio_unidad_de_formacion" onChange={handleFormChange} required/>
                            Ninguna de las anteriores
                        </label>
                    </div>
                </div>

                <div className="pregunta-section">
                    <label htmlFor="pregunta_select"><strong>¿Les gustaría realizar un PROCESO DE SELECCIÓN/ENTREVISTA para definir la participación de lxs alumnxs en este proyecto?</strong></label><br />

                    <div className="radio-group">
                        <label>
                            <input type="radio" name="pregunta_select" value={true} onChange={e =>{
                                setPreguntaSelect(true)
                            }} required />
                            Sí, busco un perfil muy específico y requiero revisar perfiles
                        </label> <br />

                        <label>
                            <input type="radio" name="pregunta_select" value={false} onChange={() => {
                                setPreguntaSelect(false);
                                setProjectForm(prev => ({
                                    ...prev,
                                    pregunta_descarte: null
                                }));
                            }} required />
                            No, el proyecto puede recibir diferentes perfiles. No es necesario verificar perfiles
                        </label>
                    </div>
                </div>

                {preguntaSelect && (
                    <>
                        <div className="pregunta-descarte-section">
                            <label htmlFor="pregunta_descarte"><strong>Escriba por favor la "pregunta de descarte".</strong></label>
                            <p>
                                Esta pregunta tiene la intención de facilitar la elección del alumno, para una posible entrevista. <br />
                                <strong>Sugerimos preguntas que requieran una respuesta abierta</strong> para identificar el interés de participar en el proyecto.
                            </p>
                            <input type="text" name="pregunta_descarte" id="pregunta_descarte" value={projectForm.pregunta_descarte} onChange={handleFormChange} required />
                        </div>
                        <div className="notificaciones-section">
                            <label htmlFor="notificaciones">Coméntanos si <strong>deseas recibir notificaciones en tu correo cuando alguien se postule.</strong></label><br />
                            <div className="radio-group">
                                <label>
                                    <input type="radio" name="notificaciones" value={true} onChange={handleFormChange} required />
                                    SI requiero recibir notificaciones cuando un alumnx se postule.
                                </label><br />
                                <label>
                                    <input type="radio" name="notificaciones" value={false} onChange={handleFormChange} required />
                                    NO requiero recibir notificaciones.
                                </label> <br />
                            </div>
                        </div>
                    </>
                )}

                <div className="terminos-section terminos1">
                    <label htmlFor="terminos1"><strong>Es de mi conocimiento que los horarios para los alumnos de S.S. pueden ser variables debido a su horario académico cambiante cada 5 semanas.</strong></label><br />
                    <div className="radio-group">
                        <label>
                            <input type="radio" required />
                            Notifico de enteradx que  en PERIODOS SEMESTRALES el horario académico CAMBIA CADA 5 SEMANAS
                        </label>
                    </div>
                </div>

                <div className="terminos-section terminos2">
                    <label htmlFor="terminos2">Para enriquecer la formación del estudiante, como Socio Formador, me comprometo a:</label><br />
                    <p>
                        1. <strong>AL INICIO</strong> - Realiza una introducción del proyecto. <br />
                        2. <strong>AL INICIO</strong> - Anunciar el proceso de evaluación. <br />
                        3. <strong>DURANTE el periodo de ejecución</strong> - Hacer una retroalimentación del desempeño de cada alumno <br />
                        4. <strong>AL FINAL del proyecto</strong> - Notificar las horas acreditadas a los alumnos <br />
                    </p>
                    <div className="radio-group">
                        <label>
                            <input type="radio" required />
                            Me comprometo
                        </label>
                    </div>
                </div>


            <button type="submit" className="submit-btn">Create Project</button>
            </form>
            <button onClick={test}>test</button>
            <button onClick={test2}>test2</button>
        </div>
    );
};

export default NewProject;