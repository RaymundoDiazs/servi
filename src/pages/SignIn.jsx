import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

const SignIn = () => {
    const [formData, setFormData] = useState({nombre:'', matricula: '', carrera:'', password: '', numero: '' });
    const [userType, setUserType] = useState("");
    const [carrerasArr, setCarrerasArr] = useState([]);
    const [successMessage, setSuccessMessage] = useState(""); // Estado para el mensaje de éxito
    const navigate = useNavigate(); // Hook para redirigir

    useEffect(() => {
        fetch("http://localhost:5000/carreras")
        .then((res) => res.json())
        .then((data) => setCarrerasArr(data));
    }, []); // Agrega un array vacío para evitar múltiples llamadas

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formInfo = new FormData();
        formInfo.append("nombre", formData.nombre);
        formInfo.append("matricula", formData.matricula);
        formInfo.append("carrera", formData.carrera);
        formInfo.append("password", formData.password);
        formInfo.append("numero", formData.numero);

        fetch("http://localhost:5000/users/alumnoNuevo", {
            method: "POST",
            body: formInfo,
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
        <div className="signin-container">
            <h2>Sign In</h2>
            <p>Regístrate como:</p>
            <button onClick={() => setUserType("alumno")}>Alumno</button>
            <button onClick={() => setUserType("osf")}>Organización Socioformadora</button>
            <button onClick={() => setUserType("")}>Clear</button>
        </div>
        {userType === "alumno" && (
            <div className='registerForm'>
            <form onSubmit={handleSubmit}>
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
                    <select name="carrera" id="carrera" value={formData.carrera} onChange={handleChange}>
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
                <span>osf form</span>
            </div>
        )}
        </>
    );
};

export default SignIn;