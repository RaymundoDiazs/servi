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
  const [uiState, setUiState] = useState({
    showSidebar: true,
    showCharacter: false,
    showAICharacter: false,
    showPetMode: false,
    rightMenuOpen: false,
  });

  const toggleUIState = (key) => {
    setUiState((prevState) => ({ ...prevState, [key]: !prevState[key] }));
  };

  const location = useLocation();
  const { sessionType } = useContext(SessionContext)

  return (
    <div className="app" style={{ display: "flex" }}>
      {uiState.showSidebar && sessionType !== "alumno" && <Sidebar />}
      <div className="content" style={{ flex: 1, position: "relative" }}>
        
        {/* teus modos */}
        {uiState.showCharacter && <PixelCharacter />}



        {uiState.showAICharacter && <PixelCharacterAI />}
        {uiState.showPetMode && <PetMode />}

        {/* Header con botones para abrir el RightBar */}
        <Header
          onMenuClick={() => toggleUIState("showSidebar")}
          toggleCharacter={() => toggleUIState("showCharacter")}
          toggleAI={() => toggleUIState("showAICharacter")}
          onRightMenuClick={() => toggleUIState("rightMenuOpen")} 
        />

        {/* RightBar/Menu teus */}
        <RightBar
          isOpen={uiState.rightMenuOpen}
          onClose={() => toggleUIState("rightMenuOpen")}
          setShowCharacter={(value) => setUiState((prevState) => ({ ...prevState, showCharacter: value }))}
          setShowAICharacter={(value) => setUiState((prevState) => ({ ...prevState, showAICharacter: value }))}
          setShowPetMode={(value) => setUiState((prevState) => ({ ...prevState, showPetMode: value }))}
        />
            
        {location.pathname === "/" && sessionType ==="alumno" && <Hero />}
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>

      </div>
    </div>
  );
}
