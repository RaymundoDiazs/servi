import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
//import Sidebar from "./components/Sidebar";
import MainLayout from "./layouts/MainLayout";
import Projects from "./pages/Projects";
import Dashboard from "./pages/Dashboard";
import Hero from "./components/Hero";
import Header from "./components/Header";
import PixelCharacter from "./components/PixelCharacter";
import PixelCharacterAI from "./components/PixelCharacterAI.jsx";
import PetMode from "./components/PetMode";
import RespuestasAlumnos from "./tools/RespuestasAlumnos";
import { BallProvider } from "./Contexts/BallContext";
import ProjectDetail from "./pages/ProjectDetail";
//import RightBar from "./components/RightBar";
import FormOSF from "./pages/FormOSF";
import Login from "./pages/Login";
import Logout from "./components/Logout";
import ProtectedRoute from "./components/ProtectedRoute";
import { SessionProvider } from "./Contexts/SessionContext";
import "./App.css";

function AppWrapper({ sessionType }) {
  const [showSidebar, setShowSidebar] = useState(true);
  const [showCharacter, setShowCharacter] = useState(false);
  const [showAICharacter, setShowAICharacter] = useState(false);
  const [showPetMode, setShowPetMode] = useState(false);
  const [rightMenuOpen, setRightMenuOpen] = useState(false);

  const toggleSidebar = () => setShowSidebar(!showSidebar);
  const toggleCharacter = () => setShowCharacter((prev) => !prev);
  const toggleAI = () => setShowAICharacter((prev) => !prev);

  const location = useLocation();

  return (
    <div style={{ display: "flex" }}>
      {showSidebar && <Sidebar />}
      <div style={{ flex: 1, position: "relative" }}>
        
        {/* Personaje activo */}
        {showCharacter && <PixelCharacter />}
        {showAICharacter && <PixelCharacterAI />}
        {showPetMode && <PetMode />}

        {/* Header */}
        <Header
          onMenuClick={toggleSidebar}
          toggleCharacter={toggleCharacter}
          toggleAI={toggleAI}
          onRightMenuClick={() => setRightMenuOpen(true)}
        />

        {/* RightBar */}
        <RightBar
          isOpen={rightMenuOpen}
          onClose={() => setRightMenuOpen(false)}
          setShowCharacter={setShowCharacter}
          setShowAICharacter={setShowAICharacter}
          setShowPetMode={setShowPetMode}
        />

        {/* Mostrar Hero solo en la principal */}
        {location.pathname === "/" && <Hero />}

        {/* Páginas */}
        <div style={{ position: "relative", height: "100px", zIndex: -1 }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Routes>
            {/* Protegidas */}
            <Route path="/" element={<ProtectedRoute><Projects sessionType={sessionType} /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/respuesta_alumnos" element={<ProtectedRoute><RespuestasAlumnos /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
            <Route path="/formosf" element={<ProtectedRoute><FormOSF /></ProtectedRoute>} />

            {/* Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [sessionType, setSessionType] = useState('');

  useEffect(() => {
    fetch("http://localhost:8000/session/detail", {
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

  return (
    <SessionProvider>
      <BallProvider>
        <Router>
          <Routes>
            {/* Rutas protegidas con layout */}
            <Route path="/" element={ 
              <ProtectedRoute>
                <MainLayout> <Projects sessionType={sessionType} /> </MainLayout> 
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={ <MainLayout> <Dashboard /> </MainLayout> } />
            <Route path="/respuesta_alumnos" element={ <MainLayout> <RespuestasAlumnos /> </MainLayout> } />
            <Route path="/projects/:id" element={ <MainLayout> <ProjectDetail /> </MainLayout> } />
            <Route path="/formosf" element={ <MainLayout> <FormOSF /> </MainLayout> } />
            
            {/* Rutas públicas sin layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </Router>
      </BallProvider>
    </SessionProvider>
  );
}
