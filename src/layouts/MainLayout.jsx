import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import PixelCharacter from "../components/PixelCharacter";
import Hero from "../components/Hero";
import { useLocation } from "react-router-dom";
import { useState } from "react";

export default function MainLayout({ children }) {
  const [showSidebar, setShowSidebar] = useState(true);
  const [showCharacter, setShowCharacter] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setShowSidebar(!showSidebar);
  const toggleCharacter = () => setShowCharacter((prev) => !prev);

  return (
    <div className="app">
      {showSidebar && <Sidebar />}
      <div className="content">
        {showCharacter && <PixelCharacter />}
        <Header onMenuClick={toggleSidebar} toggleCharacter={toggleCharacter} />
        {location.pathname === "/" && <Hero />}
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      </div>
    </div>
  );
}
