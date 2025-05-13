import { useContext, useState } from "react";
import { SessionContext } from "../Contexts/SessionContext";
import React from 'react';

const NewProject = () => {
    const {sessionType} = useContext(SessionContext)

    const [ projectForm, setProjectForm ] = useState({
        nombre_coordinador: '',
        numero_coordinador: '',
        nombre: '',
        problema_social: '',
        tipo_vulnerabilidad: '',
        rango_edad: '', // acá hay posibilidad de hacer un rango chido
        zona: '', // rural o urbana
        num_beneficiarios: '',
        objetivo_general: '',
        ods: [],
        lista_actividades_alumnos: '',
        producto_a_entregar: '',
        entregable_desc: '',
        medida_impacto_social: '',
        periodo: '',
        modalidad: '',
        modalidad_desc: '',
        carreras: [],
        competencias: [],
        cantidad_alumnos: '',
        direccion: '',
        // enlace_maps: '', 
        valor_promueve: '',
        surguio_unidad_de_formacion: '',
        pregunta_descarte: '',
        notificaciones: '', // notifiación sobre cuando alguien se postule
        
    })

    const handleFormChange = (e) => {
        const {name, value} = e.target;
        setProjectForm({...projectForm, [name]: value });
        // console.log(formDataOsf)
        }

    if (sessionType !== "osf") {
        return (
            <div>
                Acceso denegado a esta página - {sessionType}
            </div>
        )
    }
    
    return (
        <div>
            <div>
                <h1>Registro de Proyectos Solidarios 2025</h1>
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
            <form>
                <div>
                    <label htmlFor="nombre_coordinador">Nombre de la persona que coordinará el Proyecto Solidario.
(Nombre, correo y puesto)</label>
                    <input type="text" name="nombre_coordinador" value={projectForm.nombre_coordinador} onChange={handleFormChange} />
                </div>
                <div>
                    <label htmlFor="telefono_coordinador">Número telefónico de la persona que coordinará el Servicio Social (para integrarle al grupo de WhatsApp)</label>
                    <input type="text" name="telefono_coordinador" value={projectForm.telefono_coordinador} onChange={handleFormChange} />
                </div>

                <div>
                    <label htmlFor="nombre">Nombre del Proyecto Solidario</label>
                    <p>El nombre debe ser corto, atractivo y descriptivo para el estudiante</p>
                    <input type="text" name="nombre" value={projectForm.nombre} onChange={handleFormChange} />

                </div>

                <div>
                    <label htmlFor="problema_social">Describa el problema social específico que atenderá el estudiantado</label>
                    <p>En caso de que tenga datos estadísticos que le dieron la pauta a este Proyecto Solidario te pedimos los agregues aquí. </p>
                    <textarea name="problema_social" value={projectForm.problema_social} onChange={handleFormChange} />
                </div>

                <div>
                    <label htmlFor="tipo_vulnerabilidad">Tipo de vulnerabilidad que atenderá este proyecto</label>
                <input type="text" name="tipo_vulnerabilidad" value={projectForm.tipo_vulnerabilidad} onChange={handleFormChange} />    
                </div>

                <button type="submit">Create Project</button>
            </form>
        </div>
    );
};

export default NewProject;