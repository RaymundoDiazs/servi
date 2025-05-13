import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../Contexts/SessionContext";
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setSessionType } = useContext(SessionContext);
  const navigate = useNavigate();

  function handleUsernameChange(e) { setUsername(e.target.value); }
  function handlePasswordChange(e) { setPassword(e.target.value); }

  function handleSubmit() {
    const formInfo = new FormData();
    formInfo.append("username", username);
    formInfo.append("password", password);


    fetch("http://localhost:8000/login", {

      method: "POST",
      credentials: "include",
      body: formInfo,
    })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      setSessionType(data.tipo);
      navigate('/');
    })
    .catch((error) => { console.log(error); });
  }

  return (
    <div className="login-page">
      {/*pt izquierda */}
      <div className="login-left">
        <img src="/logoservicio.png" alt="Logo Servicio" className="service-logo" />
        <p className="service-text">¿Listo para registrar un proyecto?</p>
      </div>


      {/*pt derecha*/}

      <div className="login-right">
        <div className="login-form">
          <h1>Inicio de sesión</h1>

          {/* Campo Usuario */}
          <div className="input-group">
            <label>Usuario:</label>
            <div className="input-with-sprite">
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                className="input-text"
                onFocus={(e) => e.target.parentNode.querySelector('.sprite-decorativo').classList.add('sprite-jump')}
                onBlur={(e) => e.target.parentNode.querySelector('.sprite-decorativo').classList.remove('sprite-jump')}
              />
              <img src="/teusr1.png" alt="Sprite decorativo" className="sprite-decorativo" />
            </div>
          </div>

          {/*contraseña */}
          <div className="input-group">
            <label>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className="input-text"
            />
          </div>

          {/*Entrar */}
          <input type="submit" value="Entrar" onClick={handleSubmit} className="submit" />

          <input type="submit" value="Regístrate" onClick={() => navigate("/signin")} className="submit" />

        </div>
      </div>
    </div>
  );

}

