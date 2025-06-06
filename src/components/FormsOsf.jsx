import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

const FormsOSF = ({ osf = {} }) => {
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
    const [poblacionSelect, setPoblacionSelect] = useState([])
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



    const handleChangePoblacion = (e) => {
        const { value, checked } = e.target

        setPoblacionSelect((prev) =>
            checked ? [...prev, value] : prev.filter((v) => v !== value)
        );



        setFormDataOsf({ ...formDataOsf, ["poblacion"]: poblacionSelect });
        // console.log(formDataOsf)

    }


    useEffect(() => {
        fetch('http://localhost:8000/ods')
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setOdsList(data)
            })
    }, [])

    const handleChangeOsf = (e) => {
        const { name, value } = e.target;
        setFormDataOsf({ ...formDataOsf, [name]: value });
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

    const handleUpdateOsf = async (e) => {
        e.preventDefault();
        setSuccessMessage("");
        console.log(formDataOsf)
        const formInf = new FormData();
        // Construye el objeto osf solo con los campos correspondientes a osf/institucional
        const institucional = {
            subtipo: formDataOsf.subtipo,
            mision: formDataOsf.mision,
            vision: formDataOsf.vision,
            objetivos: formDataOsf.objetivo,
            // ods: formDataOsf.ods,
            poblacion: formDataOsf.poblacion,
            num_beneficiarios: formDataOsf.num_beneficiarios,
            nombre_responsable: formDataOsf.nombre_responsable,
            puesto_responsable: formDataOsf.puesto_responsable,
            correo_responsable: formDataOsf.correo_responsable,
            telefono: formDataOsf.telefono,
            direccion: formDataOsf.direccion,
            horario: formDataOsf.horario,
            pagina_web_redes: formDataOsf.pagina_web_redes,
            correo_registro: formDataOsf.correo_registro
        };
        const userData = {
            correo: formDataOsf.correo,
            contrasena: formDataOsf.contrasena,
        };
        const encargadoData = {
            nombre: formDataOsf.nombre_encargado,
            puesto: formDataOsf.puesto_encargado,
            telefono: formDataOsf.telefono_encargado,
            correo: formDataOsf.correo_encargado,
        };

        const osfData = {
            nombre: formDataOsf.nombre,
            tipo: 'institucional',
        }

        formInf.append("osf", JSON.stringify(osfData));
        formInf.append("user", JSON.stringify(userData));
        formInf.append("encargado", JSON.stringify(encargadoData));
        formInf.append("institucional", JSON.stringify(institucional));
        try {
            // Suponiendo que tienes el osf_id en el prop osf.osf_id o similar
            const osfId = osf.osf?.osf_id || osf.osf_id || osf.institucional?.osf_id;
            if (!osfId) {
                setSuccessMessage("No se encontró el ID de la OSF para actualizar.");
                return;
            }
            const response = await fetch(`http://localhost:8000/osf_institucional/${osfId}`, {
                method: "PATCH",
                body: formInf
            });
            if (response.ok) {
                setSuccessMessage("Cambios guardados correctamente.");
            } else {
                setSuccessMessage("Error al guardar los cambios.");
            }
        } catch (error) {
            setSuccessMessage("Error al guardar los cambios.");
        }
    };

    useEffect(() => {
        if (osf && Object.keys(osf).length > 0) {
            setFormDataOsf(prev => ({
                ...prev,
                correo: osf.user?.correo || '',
                contrasena: osf.user?.contrasena || '',
                nombre: osf.osf?.nombre || '',
                subtipo: osf.institucional?.subtipo || '',
                mision: osf.institucional?.mision || '',
                vision: osf.institucional?.vision || '',
                objetivo: osf.institucional?.objetivos || '',
                ods: osf.institucional?.ods_id || '',
                poblacion: osf.institucional?.poblacion || '',
                num_beneficiarios: osf.institucional?.num_beneficiarios || 0,
                nombre_responsable: osf.institucional?.nombre_responsable || '',
                puesto_responsable: osf.institucional?.puesto_responsable || '',
                correo_responsable: osf.institucional?.correo_responsable || '',
                telefono: osf.institucional?.telefono || '',
                direccion: osf.institucional?.direccion || '',
                horario: osf.institucional?.horario || '',
                pagina_web_redes: osf.institucional?.pagina_web_redes || '',
                correo_registro: osf.institucional?.correo_registro || '',
                nombre_encargado: osf.encargado?.nombre_encargado || '',
                puesto_encargado: osf.encargado?.puesto_encargado || '',
                telefono_encargado: osf.encargado?.telefono_encargado || '',
                correo_encargado: osf.encargado?.correo_encargado || '',
            }));
            // Si "poblacion" es un array, también actualiza poblacionSelect
            if (Array.isArray(osf.institucional?.poblacion)) {
                setPoblacionSelect(osf.institucional.poblacion);
            }
        }
    }, [osf]);

    return (
        <div className="registerFormAlumno">
            <div style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: '1rem' }}>
                <form onSubmit={handleSubmitOsf}>
                    <h2>Datos de la organización y su responsable</h2>
                    <div>
                        <label htmlFor="subtipo">Selecciona el tipo de OSF a registrar:</label>
                        <select value={formDataOsf.subtipo} onChange={handleChangeOsf} name="subtipo" required>
                            <option value="" disabled>-- selecciona --</option>
                            <option value="organización">Organización</option>
                            <option value="gobierno">Gobierno</option>
                            <option value="empresa">Empresa</option>
                            <option value="estudiante">Estudiante "Líder social"</option>
                        </select>
                    </div>
                    {formDataOsf.subtipo != "estudiante" && formDataOsf.subtipo != "" && (
                        <div>
                            <div>
                                <label htmlFor="correo">Ingresa un correo que usarás como usuario en este sitema:</label>
                                <input type="email" name='correo' value={formDataOsf.correo} onChange={handleChangeOsf} required />
                            </div>
                            <div>
                                <label htmlFor="contrasena"> Ingresa una contraseña</label>
                                <input type="password" name='contrasena' value={formDataOsf.contrasena} onChange={handleChangeOsf} required />
                            </div>
                            <div>
                                <label htmlFor="nombre">1. Nombre oficial de la organización:</label>
                                <input type="text" value={formDataOsf.nombre} onChange={handleChangeOsf} name='nombre' required />
                            </div>
                            <div>
                                <label htmlFor="mision">1.1 Misión:</label>
                                <textarea value={formDataOsf.mision} onChange={handleChangeOsf} name="mision" required></textarea>
                            </div>
                            <div>
                                <label htmlFor="vision">1.2 Visión:</label>
                                <textarea value={formDataOsf.vision} onChange={handleChangeOsf} name="vision" required></textarea>
                            </div>
                            <div>
                                <label htmlFor="objetivo">1.3 Objetivos:</label>
                                <textarea value={formDataOsf.objetivo} onChange={handleChangeOsf} name="objetivo" required></textarea>
                            </div>
                            <div>
                                <label htmlFor="ods">1.4 Objetivo de Desarrollo Sostenible (ODS) en el que se enfoca la organización </label> <br />
                                {odsList.map((ods, index) => (
                                    <label key={index}>
                                        <input
                                            type="radio"
                                            name="ods"
                                            value={ods.ods_id}
                                            onChange={handleChangeOsf}
                                            checked={String(formDataOsf.ods) === String(ods.ods_id)}
                                            required
                                        />
                                        {ods.nombre}
                                        <br />
                                    </label>
                                ))}
                            </div>
                            <div>
                                <label htmlFor="poblacion">1.5 Población que atiende:</label> <br />
                                {poblacionList.map((item, index) => (
                                    <div key={index}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                name="poblacion"
                                                value={item}
                                                onChange={handleChangePoblacion}
                                                checked={poblacionSelect.includes(item)}
                                                required={poblacionSelect.length === 0 && index === 0}
                                            />
                                            {item}
                                        </label> <br />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label htmlFor="num_beneficiarios">1.6 Número aproximado de beneficiarios que atiende la Organización anualmente </label>
                                <input type="number" value={formDataOsf.num_beneficiarios} onChange={handleChangeOsf} name="num_beneficiarios" required />
                            </div>
                            <div>
                                <label htmlFor="nombre_responsable">2. Nombre completo del(a) responsable:</label>
                                <input type="text" value={formDataOsf.nombre_responsable} onChange={handleChangeOsf} name="nombre_responsable" required />
                            </div>
                            <div>
                                <label htmlFor="puesto_responsable">3. Puesto del(a) responsable:</label>
                                <input type="text" value={formDataOsf.puesto_responsable} onChange={handleChangeOsf} name="puesto_responsable" required />
                            </div>
                            <div>
                                <label htmlFor="correo_responsable">4. Correo electrónico del(a) responsable:</label>
                                <input type="email" value={formDataOsf.correo_responsable} onChange={handleChangeOsf} name="correo_responsable" required />
                            </div>
                            <div>
                                <label htmlFor="telefono">5. Número de teléfono de la Organización:</label>
                                <input type="text" value={formDataOsf.telefono} onChange={handleChangeOsf} name="telefono" required />
                            </div>
                            <div>
                                <label htmlFor="direccion">6. Dirección de oficina de la Organización</label>
                                <textarea value={formDataOsf.direccion} onChange={handleChangeOsf} name="direccion" required></textarea>
                            </div>
                            <div>
                                <label htmlFor="horario">6.1 Horario de oficina de la Organización</label>
                                <input type="text" value={formDataOsf.horario} onChange={handleChangeOsf} name="horario" required />
                            </div>
                            <div>
                                <label htmlFor="pagina_web_redes">7. Página web o redes sociales oficiales de la Organización</label>
                                <input type="text" value={formDataOsf.pagina_web_redes} onChange={handleChangeOsf} name="pagina_web_redes" required />
                            </div>
                            <div>
                                <label htmlFor="correo_registro">8. Correo electrónico de la persona que realiza el registro</label>
                                <input type="email" value={formDataOsf.correo_registro} onChange={handleChangeOsf} name="correo_registro" required />
                            </div>
                            <div className="título-documentacion">
                                <h1>Documentación de la organización</h1>
                                <h3>En este apartado se solicita adjuntar archivos digitalizados, en caso de no contar con alguno, continuar con los sucesivos. </h3>
                            </div>
                            <div>
                                <label htmlFor="foto1">1. Adjuntar 3 fotografías de sus instalaciones u oficinas:</label>
                                <input type="file" id="foto1" multiple accept='image/*' onChange={handleFileChange} name="fotos_instalaciones" required />
                            </div>
                            <div>
                                <label htmlFor="logo_institucion">2. Adjuntar Logo de la Organización</label>
                                <input type="file" onChange={handleFileChange} name="logo_institucion" required />
                            </div>
                            <div>
                                <label htmlFor="comprobante_domicilio">3. Adjuntar Comprobante de domicilio actualizado:</label>
                                <input type="file" onChange={handleFileChange} name="comprobante_domicilio" required />
                            </div>
                            <div>
                                <label htmlFor="RFC">4. Adjuntar RFC</label>
                                <input type="file" onChange={handleFileChange} name="RFC" required />
                            </div>
                            {formDataOsf.subtipo == "organización" && (
                                <div>
                                    <label htmlFor="acta_constitutiva">5. Adjuntar Acta Constitutiva:</label>
                                    <input type="file" onChange={handleFileChange} name="acta_constitutiva" required />
                                </div>
                            )}
                            <div className="título-encargado">
                                <h1>DATOS DEL ENCARGADO(A) QUE DARÁ SEGUIMIENTO:</h1>
                                <h3>Para el proceso de colaboración, es necesario designar a un miembro que fungirá como contacto principal y dará seguimiento al proceso. </h3>
                            </div>
                            <div>
                                <label htmlFor="nombre_encargado">1. Nombre completo:</label>
                                <input type="text" value={formDataOsf.nombre_encargado} onChange={handleChangeOsf} name="nombre_encargado" required />
                            </div>
                            <div>
                                <label htmlFor="puesto_encargado">2. Puesto que desmpeña:</label>
                                <input type="text" value={formDataOsf.puesto_encargado} onChange={handleChangeOsf} name="puesto_encargado" required />
                            </div>
                            <div>
                                <label htmlFor="telefono_encargado">3. Número de teléfono celular:</label>
                                <input type="text" value={formDataOsf.telefono_encargado} onChange={handleChangeOsf} name="telefono_encargado" required />
                            </div>
                            <div>
                                <label htmlFor="correo_encargado">4. Correo electrónico</label>
                                <input type="email" value={formDataOsf.correo_encargado} onChange={handleChangeOsf} name="correo_encargado" required />
                            </div>
                            <div>
                                <label htmlFor="ine_encargado">5. Adjuntar Credencial INE</label>
                                <input type="file" onChange={handleFileChange} name="ine_encargado" required />
                            </div>
                        </div>
                    )}
                    {console.log(Object.entries(osf).length)}
                    {Object.entries(osf).length === 0 && (<button type="submit">Registrar OSF</button>)}
                    {Object.entries(osf).length > 0 && (<button type="button" onClick={handleUpdateOsf} style={{ marginLeft: '1rem' }}>Guardar cambios</button>)}

                </form>
                {successMessage}
            </div>
        </div>

    );
};

export default FormsOSF;