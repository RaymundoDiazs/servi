import React, { useState, useEffect } from "react";

import { useNavigate } from 'react-router-dom'; // Importa useNavigate

const FormsAlumno = () => {
    const [formData, setFormData] = useState({nombre:'', matricula: '', carrera:'', password: '', numero: '' });
    const [carrerasArr, setCarrerasArr] = useState([]);
    const [nombre, setNombre] = useState('');
    const [matricula, setMatricula] = useState('');
    const [carrera, setCarrera] = useState('');
    const [password, setPassword] = useState('');
    const [numero, setNumero] = useState('');
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

    const handleNombreChange = (e) => {
        setNombre(e.target.value);
        setFormData({ ...formData, nombre: e.target.value }); 
    };

    const handleMatriculaChange = (e) => {
        const value = e.target.value.toLowerCase(); // Obtén el valor ingresado
        setMatricula(value); // Actualiza el estado

        const regex = /^[Aa]01\d{6}$/; 
        if (!regex.test(value)) { 
            setMensajeMatricula("Matrícula inválida. Debe seguir el formato A01XXXXXX.");
            setFormData({ ...formData, matricula: null }); 
        } else {
            setMensajeMatricula(null);
            setFormData({ ...formData, matricula: value }); // Actualiza el formData
        }
    };

    const handleCarreraChange = (e) => {
        setCarrera(e.target.value);
        setFormData({ ...formData, carrera: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setFormData({ ...formData, password: e.target.value });
    };

    const handleNumeroChange = (e) => {
        setNumero(e.target.value);
        const regex = /^\d{10}$/; // Expresión regular para validar un número de teléfono de 10 dígitos
        if (!regex.test(e.target.value)) {
            setMensajeNumero("Número de teléfono inválido. Debe tener 10 dígitos.");
            setFormData({ ...formData, numero: null }); // Actualiza el formData
        } else {
            setMensajeNumero(null);
            setFormData({ ...formData, numero: e.target.value }); // Actualiza el formData
        }
    };




    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "matricula") {
            const regex = /^[Aa]01\d{6}$/; // Expresión regular para validar si el valor es una matrícula válida
            if (!regex.test(value)) {
                setMensajeMatricula("Matrícula inválida. Debe seguir el formato A01XXXXXX.");
                // return;
            } else {
                setMensajeMatricula(null);
            }
        }
        
        setFormData({ ...formData, [name]: value });
        console.log(formData)
    };

    const handleSubmitAlumno = (e) => {
        e.preventDefault();
        const formInfo = new FormData();

        const allNotNull = Object.values(formData).every((value) => value !== null && value !== '');
        
        if (!allNotNull) {
            setMensajeError("Por favor completa todos los campos requeridos.");
            return;
        } else {
            setMensajeError(null);
        }
        
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


    
    return (
        <div className='registerFormAlumno'>
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
                        value={password}
                        onChange={handlePasswordChange}
                        required
                    />
                </div>
                <button type="submit">Sign Up</button>
            </form>
            {successMessage && <div className="success-message">{successMessage}</div>} {/* Mensaje de éxito */}

        </div>
    );
};

export default FormsAlumno;