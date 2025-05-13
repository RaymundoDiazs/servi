import React, { useState, useEffect } from "react";

import { useNavigate } from 'react-router-dom'; // Importa useNavigate

const FormsAlumno = () => {
    const [formData, setFormData] = useState({nombre:'', matricula: '', carrera:'', password: '', numero: '' });
    const [carrerasArr, setCarrerasArr] = useState([]);
    
    useEffect(() => {
        fetch("http://localhost:8000/carreras")
        .then((res) => res.json())
        .then((data) => setCarrerasArr(data));
    }, []); // Agrega un array vacío para evitar múltiples llamadas

    const [successMessage, setSuccessMessage] = useState(""); // Estado para el mensaje de éxito
    const navigate = useNavigate(); // Hook para redirigir


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

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
                        value={formData.password}
                        onChange={handleChange}
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