import React, { useState, useContext } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import PixelCharacter from "../components/PixelCharacter";
import PixelCharacterAI from "../components/PixelCharacterAI";
import PetMode from "../components/PetMode";
import Hero from "../components/Hero";
import RightBar from "../components/RightBar"; 
import { useLocation } from "react-router-dom";
import { SessionContext } from "../Contexts/SessionContext";


export default function MainLayout({ children }) {
  const [showSidebar, setShowSidebar] = useState(true);
  const [showCharacter, setShowCharacter] = useState(false);
  const [showAICharacter, setShowAICharacter] = useState(false);
  const [showPetMode, setShowPetMode] = useState(false);
  const [rightMenuOpen, setRightMenuOpen] = useState(false);

  const location = useLocation();
  const { sessionType } = useContext(SessionContext)

  const toggleSidebar = () => setShowSidebar(!showSidebar);
  const toggleCharacter = () => setShowCharacter((prev) => !prev);
  const toggleAI = () => setShowAICharacter((prev) => !prev);

  return (
    <div className="app" style={{ display: "flex" }}>
      {showSidebar && <Sidebar />}
      <div className="content" style={{ flex: 1, position: "relative" }}>
        
        {/* teus modos */}
        {showCharacter && <PixelCharacter />}



        {showAICharacter && <PixelCharacterAI />}
        {showPetMode && <PetMode />}

        {/* Header con botones para abrir el RightBar */}
        <Header
          onMenuClick={toggleSidebar}
          toggleCharacter={toggleCharacter}
          toggleAI={toggleAI}
          onRightMenuClick={() => setRightMenuOpen(true)} 
        />

        {/* RightBar/Menu teus */}
        <RightBar
          isOpen={rightMenuOpen}
          onClose={() => setRightMenuOpen(false)}
          setShowCharacter={setShowCharacter}
          setShowAICharacter={setShowAICharacter}
          setShowPetMode={setShowPetMode}
        />
            
        {location.pathname === "/" && sessionType ==="alumno" && <Hero />}
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>

        {/* Hero solo en "/" 
        
                {location.pathname === "/" && <Hero />}

        */}

        {/* Contenido de la página */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
