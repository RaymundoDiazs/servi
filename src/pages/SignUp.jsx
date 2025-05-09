import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import FormsAlumno from '../components/formsAlumno';
import FormsOSF from '../components/FormsOsf';

const SignUp = () => {    
    const [userType, setUserType] = useState("");
    const navigate = useNavigate(); // Hook para redirigir

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
            <FormsAlumno/>
        )}
        {userType === "osf" && (
            <FormsOSF/>
        )}
        </>
    );
};

export default SignUp;