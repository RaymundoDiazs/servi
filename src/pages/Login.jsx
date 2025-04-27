import React, { useContext } from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SessionContext } from "../Contexts/SessionContext";

export default function Login(){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setSessionType } = useContext(SessionContext);
    
    const navigate = useNavigate();

    function handleUsernameChange(e) {
        setUsername(e.target.value);
    }

    function handlePasswordChange(e){
        setPassword(e.target.value);
    }

    function test(){
        fetch("http://localhost:5000/session/detail",{
            method: "GET",
            credentials: "include"
        })
        .then((res) => res.json())
        .then((data) => {
            console.log(data.tipo)
        })
    }

    function handleSubmit(){
        const formInfo = new FormData();
        formInfo.append("username", username);
        formInfo.append("password", password);
        console.log("handle submit")
        fetch("http://localhost:5000/login",{
            method: "POST",
            credentials: "include",
            body: formInfo,
        })
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            console.log("succesful")
            setSessionType(data.tipo)
            navigate('/');
            // window.location.reload();
        })
        .catch((error) => {console.log(error);})
    }

    return(
        <div className="login">
            <h1>Login</h1>
            <label>Usuario:</label>
            <input type="text" value={username} onChange={handleUsernameChange} />
            <label>Contraseña:</label>
            <input type="password" value={password} onChange={handlePasswordChange} />
            <input type="submit" value="Entrar" onClick={handleSubmit} className="submit"/>
            <button onClick={test}> HOLA </button>
        </div>
    )
    
}