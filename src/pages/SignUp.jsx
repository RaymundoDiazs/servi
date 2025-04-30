import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

const SignUp = () => {
    const [formData, setFormData] = useState({nombre:'', matricula: '', carrera:'', password: '', numero: '' });
    const [img, setImg] = useState(null)
    const [files, setFiles] = useState([])
    const [formDataOsf, setFormDataOsf] = useState({
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
        logo_institucion: '',
        comprobante_domicilio: '',
        RFC: '',
        acta_constitutiva: '',
        /////////////////////////
        nombre_encargado: '',
        puesto_encargado: '',
        telefono_encargado: '',
        correo_encargado: '',
        ine_encargado: ''
    });
    
    const [userType, setUserType] = useState("osf");
    const [carrerasArr, setCarrerasArr] = useState([]);
    const [successMessage, setSuccessMessage] = useState(""); // Estado para el mensaje de éxito
    const navigate = useNavigate(); // Hook para redirigir

    useEffect(() => {
        fetch("http://localhost:8000/carreras")
        .then((res) => res.json())
        .then((data) => setCarrerasArr(data));
    }, []); // Agrega un array vacío para evitar múltiples llamadas

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleChangeOsf = (e) => {
        const {name, value} = e.target;
        setFormDataOsf({...formDataOsf, [name]: value });
        console.log(formDataOsf)
    }

    function handleFileChange(e) {
        setFiles(e.target.files);
    }

    const handleSubmitAlumno = (e) => {
        e.preventDefault();
        const formInfo = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formInfo.append(key, value);
            }
        });

        fetch("http://localhost:8000/users/alumnoNuevo", {
            method: "POST",
            body: formInfo,
        })
        .then((res) => {
            if (res.ok) {
                setSuccessMessage("Registro exitoso. Redirigiendo...");
                setTimeout(() => {
                    navigate("/login");
                }, 3000); // Redirige después de 3 segundos
            } else {
                console.log("Error en el registro");
            }
        })
        .catch((error) => console.log(error));
    };

    const handleSubmitOsf = (e) => {
        e.preventDefault();
        const formInfOsf = new FormData();
        Object.entries(formDataOsf).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formInfOsf.append(key, value);
            }
        });
        console.log(formInfOsf)
        for (let i = 0; i < files.length; i++) {
            formInfOsf.append('fotos', files[i]); // 'fotos' debe coincidir con upload.array('fotos')
        }


        fetch("http://localhost:8000/users/osfNuevo", {
            method: "POST",
            body: formInfOsf,
        })
        .then((res) => {
            if (res.ok) {
                setSuccessMessage("Registro exitoso. Redirigiendo...");
                setTimeout(() => {
                    navigate("/login"); // Cambia "/otra-pagina" por la ruta deseada
                }, 3000); // Redirige después de 3 segundos
            } else {
                console.log("Error en el registro");
            }
        })
        .catch((error) => console.log(error));
    };


    return (
        <>
        <div className="signup-container">
            <h2>Sign Up</h2>
            <p>Regístrate como:</p>
            <button onClick={() => setUserType("alumno")}>Alumno</button>
            <button onClick={() => setUserType("osf")}>Organización Socioformadora</button>
            <button onClick={() => setUserType("")}>Clear</button>
        </div>
        {userType === "alumno" && (
            <div className='registerForm'>
            <form onSubmit={handleSubmitAlumno}>
                <div>
                    <label htmlFor="text">Ingresa tu nombre completo:</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>                
                <div>
                    <label htmlFor="text">Matricula:</label>
                    <input
                        type="text"
                        id="matricula"
                        name="matricula"
                        value={formData.matricula}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Selecciona tu carrera:</label>
                    <select name="carrera" id="carrera" value={formData.carrera} onChange={handleChange} required>
                        <option value="" disabled>-- selecciona --</option>
                        {carrerasArr.map((carrera, index) => (
                            <option key={index} value={carrera.carrera_id}>{carrera.nombre}</option>
                        ))}
                    </select>
                </div>                
                <div>
                    <label>Número de teléfono:</label>
                    <input 
                        type='text'
                        id='numero'
                        name='numero'
                        value={formData.numero}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Ingresa una contraseña para tu nueva cuenta:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Sign In</button>
            </form>
            {successMessage && <div className="success-message">{successMessage}</div>} {/* Mensaje de éxito */}

            </div>
        )}
        {userType === "osf" && (
            <div className="registerForm">
                <form onSubmit={handleSubmitOsf}>
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
                    <div>
                        <label htmlFor="nombre">Nombre oficial de la organización:</label>
                        <input type="text" value={formDataOsf.nombre} onChange={handleChangeOsf} name='nombre' required/>
                    </div>
                    <div>
                        <label htmlFor="mision">Misión:</label>
                        <textarea value={formDataOsf.mision} onChange={handleChangeOsf} name="mision" required></textarea>
                    </div>
                    <div>
                        <label htmlFor="vision">Visión:</label>
                        <textarea value={formDataOsf.vision} onChange={handleChangeOsf} name="vision" required></textarea>
                    </div>
                    <div>
                        <label htmlFor="objetivo">Objetivo:</label>
                        <textarea value={formDataOsf.objetivo} onChange={handleChangeOsf} name="objetivo" required></textarea>
                    </div>
                    <div>
                        <label htmlFor="ods">ODS:</label>
                        <input type="text" value={formDataOsf.ods} onChange={handleChangeOsf} name="ods" required/>
                    </div>
                    <div>
                        <label htmlFor="poblacion">Población:</label>
                        <input type="text" value={formDataOsf.poblacion} onChange={handleChangeOsf} name="poblacion" required/>
                    </div>
                    <div>
                        <label htmlFor="num_beneficiarios">Número de Beneficiarios:</label>
                        <input type="number" value={formDataOsf.num_beneficiarios} onChange={handleChangeOsf} name="num_beneficiarios" required/>
                    </div>
                    <div>
                        <label htmlFor="nombre_responsable">Nombre del Responsable:</label>
                        <input type="text" value={formDataOsf.nombre_responsable} onChange={handleChangeOsf} name="nombre_responsable" required/>
                    </div>
                    <div>
                        <label htmlFor="puesto_responsable">Puesto del Responsable:</label>
                        <input type="text" value={formDataOsf.puesto_responsable} onChange={handleChangeOsf} name="puesto_responsable" required/>
                    </div>
                    <div>
                        <label htmlFor="correo_responsable">Correo del Responsable:</label>
                        <input type="email" value={formDataOsf.correo_responsable} onChange={handleChangeOsf} name="correo_responsable" required/>
                    </div>
                    <div>
                        <label htmlFor="telefono">Teléfono:</label>
                        <input type="text" value={formDataOsf.telefono} onChange={handleChangeOsf} name="telefono" required/>
                    </div>
                    <div>
                        <label htmlFor="direccion">Dirección:</label>
                        <textarea value={formDataOsf.direccion} onChange={handleChangeOsf} name="direccion" required></textarea>
                    </div>
                    <div>
                        <label htmlFor="horario">Horario:</label>
                        <input type="text" value={formDataOsf.horario} onChange={handleChangeOsf} name="horario" required/>
                    </div>
                    <div>
                        <label htmlFor="pagina_web_redes">Página Web o Redes Sociales:</label>
                        <input type="text" value={formDataOsf.pagina_web_redes} onChange={handleChangeOsf} name="pagina_web_redes" required/>
                    </div>
                    <div>
                        <label htmlFor="correo_registro">Correo de Registro:</label>
                        <input type="email" value={formDataOsf.correo_registro} onChange={handleChangeOsf} name="correo_registro" required/>
                    </div>
                    <div className="fotos">
                        <h1>FOTOS DE INSTALACIONES</h1>
                        <h3>Añade 3 fotografías de las instalaciones de la organización</h3>

                        <label htmlFor="foto1">Foto 1:</label>
                        <input type="file" id="foto1" multiple accept='image/*' onChange={handleFileChange} name="fotos_instalaciones[]" required/>
                    </div>

                    <div>
                        <label htmlFor="logo_institucion">Logo de la Institución:</label>
                        <input type="file" onChange={handleChangeOsf} name="logo_institucion" required/>
                    </div>
                    <div>
                        <label htmlFor="comprobante_domicilio">Comprobante de Domicilio:</label>
                        <input type="file" onChange={handleChangeOsf} name="comprobante_domicilio" required/>
                    </div>
                    <div>
                        <label htmlFor="RFC">RFC:</label>
                        <input type="text" value={formDataOsf.RFC} onChange={handleChangeOsf} name="RFC" required/>
                    </div>
                    <div>
                        <label htmlFor="acta_constitutiva">Acta Constitutiva:</label>
                        <input type="file" onChange={handleChangeOsf} name="acta_constitutiva" required/>
                    </div>
                    <div>
                        <label htmlFor="nombre_encargado">Nombre del Encargado:</label>
                        <input type="text" value={formDataOsf.nombre_encargado} onChange={handleChangeOsf} name="nombre_encargado" required/>
                    </div>
                    <div>
                        <label htmlFor="puesto_encargado">Puesto del Encargado:</label>
                        <input type="text" value={formDataOsf.puesto_encargado} onChange={handleChangeOsf} name="puesto_encargado" required/>
                    </div>
                    <div>
                        <label htmlFor="telefono_encargado">Teléfono del Encargado:</label>
                        <input type="text" value={formDataOsf.telefono_encargado} onChange={handleChangeOsf} name="telefono_encargado" required/>
                    </div>
                    <div>
                        <label htmlFor="correo_encargado">Correo del Encargado:</label>
                        <input type="email" value={formDataOsf.correo_encargado} onChange={handleChangeOsf} name="correo_encargado" required/>
                    </div>
                    <div>
                        <label htmlFor="ine_encargado">INE del Encargado:</label>
                        <input type="file" onChange={handleChangeOsf} name="ine_encargado" required/>
                    </div>
                    <button type="submit">Registrar OSF</button>
                </form>
            </div>
        )}
        </>
    );
};

export default SignUp;