
import React from "react";

const Topbar = () => {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      padding: "0.5rem 1rem",
      backgroundColor: "#F4F5F7",
      borderBottom: "1px solid #DFE1E6"
    }}>
      <img src="/logo.png" alt="Logo" style={{ height: 32, marginRight: 12 }} />
      <h2 style={{ fontFamily: "Inter, sans-serif", margin: 0 }}>Mi Plataforma</h2>
    </div>
  );
};

export default Topbar;
