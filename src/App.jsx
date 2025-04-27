import React, {useState, useEffect }from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { Routes, Route, Link } from 'react-router'
import { BallProvider } from "./Contexts/BallContext";
import { SessionProvider } from "./Contexts/SessionContext";
import MainLayout from "./layouts/MainLayout";
import Projects from "./pages/Projects";
import Dashboard from "./pages/Dashboard";
import RespuestasAlumnos from "./tools/RespuestasAlumnos";
import ProjectDetail from "./pages/ProjectDetail";
import FormOSF from "./pages/FormOSF";
import Login from "./pages/Login";
import Logout from "./components/Logout";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

export default function App() {
  const [sessionType, setSessionType] = useState('');

  useEffect(() => {
    fetch("http://localhost:5000/session/detail", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error al obtener los detalles de la sesión");
        }
        return res.json();
      })
      .then((data) => setSessionType(data.tipo))
      .catch((error) => {
        console.error("Error al verificar la sesión:", error);
        setSessionType(null);
      });
  }, []);

  console.log("TIPO DE LA SESIÓN:")
  console.log(sessionType)
  
  return (
    <SessionProvider>
    <BallProvider>
      <Router>
        <Routes>
          {/* Rutas que usan el layout principal */}
          <Route path="/" element={ 
            <ProtectedRoute>
              <MainLayout> <Projects sessionType={sessionType} /> </MainLayout> 
            </ProtectedRoute>
          } 
          />
          <Route path="/dashboard" element={ <MainLayout> <Dashboard /> </MainLayout> } />
          <Route path="/respuesta_alumnos" element={ <MainLayout> <RespuestasAlumnos /> </MainLayout> } />
          <Route path="/projects/:id" element={ <MainLayout> <ProjectDetail /> </MainLayout> } />
          <Route path="/FormOSF" element={ <MainLayout> <FormOSF /> </MainLayout> } />
          {/* Rutas sin layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </Router>
  </BallProvider>
  </SessionProvider>
  );
}
