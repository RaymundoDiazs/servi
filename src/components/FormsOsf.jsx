import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

const FormsOSF = () => {
    const [files, setFiles] = useState([]);
    const [odsList, setOdsList] = useState([])
    const [formDataOsf, setFormDataOsf] = useState({
        correo: '',
        contrasena: '',
        subtipo: '',
        nombre: '',
        mision: '',
        vision: '',
        objetivo: '',
        ods: '',
        poblacion: '',
        num_beneficiarios: 0,
        nombre_responsable: '',
        puesto_responsable: '',
        correo_responsable: '',
        telefono: '',
        direccion: '',
        horario: '',
        pagina_web_redes: '',
        correo_registro: '',
        /////////////////////////
        nombre_encargado: '',
        puesto_encargado: '',
        telefono_encargado: '',
        correo_encargado: '',
    });

    const [successMessage, setSuccessMessage] = useState(""); // Estado para el mensaje de éxito
    const navigate = useNavigate(); // Hook para redirigir

    const poblacionList = [
        "Comunidades urbano marginadas",
        "Comunidades rurales",
        "Primera infancia (0 a 6 años)",
        "Niños y niñas de nivel primaria",
        "Niños, niñas y adolescentes",
        "Mujeres en situación vulnerable",
        "Adultos mayores", 
        "Personas con discapacidad",
        "Personas con enfermedades crónicas/terminales",
        "Personas con problemas de adicciones",
        "Personas migrantes o situación de movilidad"
    ]

    
    const [poblacionSelect, setPoblacionSelet] = useState([])
    
    const handleChangePoblacion = (e) => {
        console.log("TO DO!!!!!!!")
    }


    useEffect(() => {
        fetch('http://localhost:8000/ods')
        .then((res) => res.json())
        .then((data ) =>{ 
            console.log(data);
            setOdsList(data)})
    },[])
    
    const handleChangeOsf = (e) => {
        const {name, value} = e.target;
        setFormDataOsf({...formDataOsf, [name]: value });
        console.log(formDataOsf)
    }

    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;

        setFiles(prev => ({
          ...prev,
          [name]: selectedFiles
        }));

        console.log(files)
      };

    const handleSubmitOsf = (e) => {
        e.preventDefault();
        console.log(formDataOsf);
        const formInfOsf = new FormData();

        // Append form data
        Object.entries(formDataOsf).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formInfOsf.append(key, value);
            }
        });

        console.log(formInfOsf)
        
        // Append files
        for (const field in files) {
            const fileList = files[field];
            for (let i = 0; i < fileList.length; i++) {
                formInfOsf.append(field, fileList[i]);
            }
        }


        fetch("http://localhost:8000/users/osfNuevo", {
            method: "POST",
            body: formInfOsf,
        })
        .then((res) => {
            if (res.ok) {
                setSuccessMessage("Registro exitoso. Redirigiendo...");
                setTimeout(() => {
                    navigate("/login");
                }, 3000);
            } else {
                res.json().then((error) => {
                    console.error("Error en el registro:", error);
                    setSuccessMessage("Error en el registro. Por favor, inténtalo de nuevo.");
                });
            }
        })
        .catch((error) => {
            console.error("Error en el registro:", error);
            setSuccessMessage("Error en el registro. Por favor, inténtalo de nuevo.");
        });
    };

    
    return (
        <div>
            <h1>Alta de Organizaciones Socio Formadoras</h1>
            <h2>Datos de la organización y su responsable</h2>
            <div className="registerFormOsf">
                <form onSubmit={handleSubmitOsf}>
                    <div>
                        <label htmlFor="subtipo">Selecciona el tipo de OSF a registrar:</label>
                        <select value={formDataOsf.subtipo} onChange={handleChangeOsf} name="subtipo" >
                            <option value="" disabled>-- selecciona --</option>
                            <option value="organización">Organización</option>
                            <option value="gobierno">Gobierno</option>
                            <option value="empresa">Empresa</option>
                            <option value="estudiante">Estudiante "Líder social"</option>
                        </select>
                    </div>
                    { formDataOsf.subtipo != "estudiante" && formDataOsf.subtipo != "" && (
                        <div>
                    <div>
                        <label htmlFor="correo">Ingresa un correo que usarás como usuario en este sitema:</label>
                        <input type="email" name='correo' value={formDataOsf.correo} onChange={handleChangeOsf} />
                    </div>
                    <div>
                        <label htmlFor="contrasena"> Ingresa una contraseña</label>
                        <input type="password" name='contrasena' value={formDataOsf.contrasena} onChange={handleChangeOsf}/>
                    </div>
                    <div>
                            <label htmlFor="nombre">1. Nombre oficial de la organización:</label>
                        <input type="text" value={formDataOsf.nombre} onChange={handleChangeOsf} name='nombre' />
                    </div>
                    <div>
                            <label htmlFor="mision">1.1 Misión:</label>
                        <textarea value={formDataOsf.mision} onChange={handleChangeOsf} name="mision" ></textarea>
                    </div>
                    <div>
                            <label htmlFor="vision">1.2 Visión:</label>
                        <textarea value={formDataOsf.vision} onChange={handleChangeOsf} name="vision" ></textarea>
                    </div>
                    <div>
                            <label htmlFor="objetivo">1.3 Objetivos:</label>
                        <textarea value={formDataOsf.objetivo} onChange={handleChangeOsf} name="objetivo" ></textarea>
                    </div>
                    <div>
                            <label htmlFor="ods">1.4 Objetivo de Desarrollo Sostenible (ODS) en el que se enfoca la organización </label> <br />
                        {odsList.map((ods, index) => (
                            <label key={index}>
                            <input type="radio" name="ods" value={ods.ods_id} onChange={handleChangeOsf} />
                            {ods.nombre}
                            <br />
                            </label>
                        ))}                    
                    </div>
                    <div>
                            <label htmlFor="poblacion">Población que atiende:</label>
                        <input type="text" value={formDataOsf.poblacion} onChange={handleChangeOsf} name="poblacion" />
                            { poblacionList.map((item, index) => (
                                <>
                                <label key={index}>
                                    <input type='checkbox' key={index} name="poblacion" value={formDataOsf.poblacion} onChange={handleChangePoblacion} ></input>
                                    {item}
                                </label> <br />
                                </>
                            ))}
                    </div>
                    <div>
                        <label htmlFor="num_beneficiarios">Número de Beneficiarios:</label>
                        <input type="number" value={formDataOsf.num_beneficiarios} onChange={handleChangeOsf} name="num_beneficiarios" />
                    </div>
                    <div>
                        <label htmlFor="nombre_responsable">Nombre del Responsable:</label>
                        <input type="text" value={formDataOsf.nombre_responsable} onChange={handleChangeOsf} name="nombre_responsable" />
                    </div>
                    <div>
                        <label htmlFor="puesto_responsable">Puesto del Responsable:</label>
                        <input type="text" value={formDataOsf.puesto_responsable} onChange={handleChangeOsf} name="puesto_responsable" />
                    </div>
                    <div>
                        <label htmlFor="correo_responsable">Correo del Responsable:</label>
                        <input type="email" value={formDataOsf.correo_responsable} onChange={handleChangeOsf} name="correo_responsable" />
                    </div>
                    <div>
                        <label htmlFor="telefono">Teléfono:</label>
                        <input type="text" value={formDataOsf.telefono} onChange={handleChangeOsf} name="telefono" />
                    </div>
                    <div>
                        <label htmlFor="direccion">Dirección:</label>
                        <textarea value={formDataOsf.direccion} onChange={handleChangeOsf} name="direccion" ></textarea>
                    </div>
                    <div>
                        <label htmlFor="horario">Horario:</label>
                        <input type="text" value={formDataOsf.horario} onChange={handleChangeOsf} name="horario" />
                    </div>
                    <div>
                        <label htmlFor="pagina_web_redes">Página Web o Redes Sociales:</label>
                        <input type="text" value={formDataOsf.pagina_web_redes} onChange={handleChangeOsf} name="pagina_web_redes" />
                    </div>
                    <div>
                        <label htmlFor="correo_registro">Correo de Registro:</label>
                        <input type="email" value={formDataOsf.correo_registro} onChange={handleChangeOsf} name="correo_registro" />
                    </div>
                    <div className="fotos">
                        <h1>FOTOS DE INSTALACIONES</h1>
                        <h3>Añade 3 fotografías de las instalaciones de la organización</h3>

                        <label htmlFor="foto1">Foto 1:</label>
                        <input type="file" id="foto1" multiple accept='image/*' onChange={handleFileChange} name="fotos_instalaciones" />
                    </div>
                    <div>
                        <label htmlFor="logo_institucion">Logo de la Institución:</label>
                        <input type="file" onChange={handleFileChange} name="logo_institucion" />
                    </div>
                    <div>
                        <label htmlFor="comprobante_domicilio">Comprobante de Domicilio:</label>
                        <input type="file" onChange={handleFileChange} name="comprobante_domicilio" />
                    </div>
                    <div>
                        <label htmlFor="RFC">RFC:</label>
                        <input type="file" onChange={handleFileChange} name="RFC" />
                    </div>
                    <div>
                        <label htmlFor="acta_constitutiva">Acta Constitutiva:</label>
                        <input type="file" onChange={handleFileChange} name="acta_constitutiva" />
                    </div>
                    <div>
                        <label htmlFor="nombre_encargado">Nombre del Encargado:</label>
                        <input type="text" value={formDataOsf.nombre_encargado} onChange={handleChangeOsf} name="nombre_encargado" />
                    </div>
                    <div>
                        <label htmlFor="puesto_encargado">Puesto del Encargado:</label>
                        <input type="text" value={formDataOsf.puesto_encargado} onChange={handleChangeOsf} name="puesto_encargado" />
                    </div>
                    <div>
                        <label htmlFor="telefono_encargado">Teléfono del Encargado:</label>
                        <input type="text" value={formDataOsf.telefono_encargado} onChange={handleChangeOsf} name="telefono_encargado" />
                    </div>
                    <div>
                        <label htmlFor="correo_encargado">Correo del Encargado:</label>
                        <input type="email" value={formDataOsf.correo_encargado} onChange={handleChangeOsf} name="correo_encargado" />
                    </div>
                    <div>
                        <label htmlFor="ine_encargado">INE del Encargado:</label>
                        <input type="file" onChange={handleFileChange} name="ine_encargado" />
                    </div>
                    </div>
                    ) }           
                    <button type="submit">Registrar OSF</button>
                </form>
                {successMessage}
            </div>
        </div>
        
    );
};

export default FormsOSF;