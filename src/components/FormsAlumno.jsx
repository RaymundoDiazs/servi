import React, { useState, useEffect, useContext } from "react";

import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import { SessionContext } from "../Contexts/SessionContext";

const FormsAlumno = () => {
    const [formData, setFormData] = useState({nombre:'', matricula: '', carrera:'', password: '', numero: '' });
    const [carrerasArr, setCarrerasArr] = useState([]);
    const [nombre, setNombre] = useState('');
    const [matricula, setMatricula] = useState('');
    const [carrera, setCarrera] = useState('');
    const [password, setPassword] = useState('');
    const [numero, setNumero] = useState('');
    const [email, setEmail] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const { setSessionType } = useContext(SessionContext);
    const [mensajeMatricula, setMensajeMatricula] = useState(null); 
    const [mensajeNumero, setMensajeNumero] = useState(null);
    const [mensajeError, setMensajeError] = useState(null); 
    
    useEffect(() => {
        fetch("http://localhost:8000/carreras")
        .then((res) => res.json())
        .then((data) => setCarrerasArr(data));
    }, []); // Agrega un array vacío para evitar múltiples llamadas

    const [successMessage, setSuccessMessage] = useState(""); // Estado para el mensaje de éxito
    const navigate = useNavigate(); // Hook para redirigir

    // Validación de longitud mínima y máxima para el nombre
    const handleNombreChange = (e) => {
        const value = e.target.value;
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/;
        if (value.length < 3 || value.length > 50) {
            setMensajeError("El nombre debe tener entre 3 y 50 caracteres.");
            setFormData({ ...formData, nombre: null });
        } else if (!regex.test(value)) {
            setMensajeError("El nombre solo puede contener letras y espacios.");
            setFormData({ ...formData, nombre: null });
        } else {
            setMensajeError(null);
            setFormData({ ...formData, nombre: value });
        }
        setNombre(value);
    };

    // Validación de duplicados en matrícula
    const handleMatriculaChange = async (e) => {
        const value = e.target.value.toLowerCase();
        setMatricula(value);

        const regex = /^[Aa]\d{8}$/;
        if (!regex.test(value)) {
            setMensajeMatricula("Matrícula inválida. Debe seguir el formato AXXXXXXXX.");
            setFormData({ ...formData, matricula: null });
        } else {
            const response = await fetch(`http://localhost:8000/users/checkMatricula/`+value);
            const exists = await response.json();
            console.log(exists)
            if (exists) {
                setMensajeMatricula("La matrícula ya está registrada.");
                setFormData({ ...formData, matricula: null });
            } else {
                setMensajeMatricula(null);
                setFormData({ ...formData, matricula: value });
            }
        }
    };

    const handleCarreraChange = (e) => {
        setCarrera(e.target.value);
        setFormData({ ...formData, carrera: e.target.value });
    };

    const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña
    const [passwordValidations, setPasswordValidations] = useState({
        length: false,
        uppercase: false,
        number: false,
        special: false
    });

    // Validación de contraseña segura
    const handlePasswordChange = (e) => {
        const value = e.target.value;
        const validations = {
            length: value.length >= 8,
            uppercase: /[A-Z]/.test(value),
            number: /\d/.test(value),
            special: /[@$!%*?&]/.test(value)
        };
        setPasswordValidations(validations);
        const allValid = Object.values(validations).every(Boolean);
        if (!allValid) {
            setMensajeError(null); // No mostrar mensaje general, solo validaciones
            setFormData({ ...formData, password: null });
        } else {
            setMensajeError(null);
            setFormData({ ...formData, password: value });
        }
        setPassword(value);
    };

    const toggleShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    // Validación de número de teléfono internacional
    const handleNumeroChange = (e) => {
        const value = e.target.value;
        const regex = /^\+?\d{10,15}$/;
        if (!regex.test(value)) {
            setMensajeNumero("Número de teléfono inválido. Debe tener entre 10 y 15 dígitos y puede incluir un prefijo internacional.");
            setFormData({ ...formData, numero: null });
        } else {
            setMensajeNumero(null);
            setFormData({ ...formData, numero: value });
        }
        setNumero(value);
    };



    // Validación de términos y condiciones
    const handleTermsChange = (e) => {
        setTermsAccepted(e.target.checked);
        if (!e.target.checked) {
            setMensajeError("Debes aceptar los términos y condiciones.");
        } else {
            setMensajeError(null);
        }
    };

    const handleSubmitAlumno = (e) => {
        e.preventDefault();
        const formInfo = new FormData();

        const allNotNull = Object.values(formData).every((value) => value !== null && value !== '');
        
        if (!allNotNull || !termsAccepted) {
            setMensajeError("Por favor completa todos los campos requeridos y acepta los términos y condiciones.");
            return;
        } else {
            setMensajeError(null);
        }
        
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formInfo.append(key, value);
            }
        });
        console.log(formInfo);
        console.log(formData)
        fetch("http://localhost:8000/users/alumnoNuevo", {
            method: "POST",
            body: formInfo,
        })
        .then((res) => {
            if (res.ok) {
                setSuccessMessage("Registro exitoso. Redirigiendo...");
                setTimeout(() => {
                    
                    const formInfoSubmit = new FormData();
                    formInfoSubmit.append("username", formData["matricula"]+"@tec.mx");
                    formInfoSubmit.append("password", formData["password"]);
                
                
                    fetch("http://localhost:8000/login", {
                
                      method: "POST",
                      credentials: "include",
                      body: formInfoSubmit,
                    })
                    .then((res) => res.json())
                    .then((data) => {
                      console.log(data);
                      setSessionType(data.tipo);
                      navigate('/');
                    })
                    .catch((error) => { console.log(error); });
                    
                }, 3000); // Redirige después de 3 segundos
            } else {
                console.log("Error en el registro");
            }
        })
        .catch((error) => console.log(error));
    };


    
    return (
        <div className='registerFormAlumno'>
            <form onSubmit={handleSubmitAlumno}>
                <div>
                    <label htmlFor="text">Ingresa tu nombre completo:</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={nombre}
                        onChange={handleNombreChange}
                        required
                    />
                </div>                
                <div>
                    <label htmlFor="text">Matricula:</label>
                    <input
                        type="text"
                        id="matricula"
                        name="matricula"
                        value={matricula}
                        onChange={handleMatriculaChange}
                        required
                    />
                    {mensajeMatricula && <div className="error-message">{mensajeMatricula}</div>} {/* Mensaje de error */}
                </div>
                <div>
                    <label>Selecciona tu carrera:</label>
                    <select name="carrera" id="carrera" value={carrera} onChange={handleCarreraChange} required>
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
                        value={numero}
                        onChange={handleNumeroChange}
                        required
                    />
                </div>
                {mensajeNumero && <div className="error-message">{mensajeNumero}</div>} {/* Mensaje de error */}
                <div>
                    <label htmlFor="password">Ingresa una contraseña para tu nueva cuenta:</label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                        />
                        <button type="button" onClick={toggleShowPassword} style={{marginLeft: '8px'}}>
                            {showPassword ? "Ocultar" : "Ver"}
                        </button>
                    </div>
                    <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.95em', margin: '8px 0 0 0' }}>
                        <li style={{ color: passwordValidations.length ? 'green' : 'red' }}>
                            {passwordValidations.length ? '✔' : '✖'} Al menos 8 caracteres
                        </li>
                        <li style={{ color: passwordValidations.uppercase ? 'green' : 'red' }}>
                            {passwordValidations.uppercase ? '✔' : '✖'} Una letra mayúscula
                        </li>
                        <li style={{ color: passwordValidations.number ? 'green' : 'red' }}>
                            {passwordValidations.number ? '✔' : '✖'} Un número
                        </li>
                        <li style={{ color: passwordValidations.special ? 'green' : 'red' }}>
                            {passwordValidations.special ? '✔' : '✖'} Un carácter especial (@$!%*?&)
                        </li>
                    </ul>
                    {password && !Object.values(passwordValidations).every(Boolean) && (
                        <div className="error-message">La contraseña no cumple con todos los requisitos.</div>
                    )}
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            id="terms"
                            name="terms"
                            checked={termsAccepted}
                            onChange={handleTermsChange}
                            required
                        />
                        Acepto los términos y condiciones
                    </label>
                </div>
                <button type="submit">Sign Up</button>
            </form>
            {successMessage && <div className="success-message">{successMessage}</div>} {/* Mensaje de éxito */}
            {mensajeError && <div className="error-message">{mensajeError}</div>} {/* Mensaje de error */}

        </div>
    );
};

export default FormsAlumno;