import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiClipboard,
  FiCheckCircle,
  FiUsers,
  FiSettings,
  FiLayout,
  FiLogOut,
} from "react-icons/fi";
import "./Dashboard.css";

const cards = [
  {
    label: "Proyectos solidarios",
    icon: <FiClipboard />,
    new: true,
    subtext: "+12 nuevos",
    to: "/",
  },
  {
    label: "Formularios con respuesta",
    icon: <FiCheckCircle />,
    subtext: "3 pendientes",
  },
  {
    label: "Alumnos que necesitan atención",
    icon: <FiUsers />,
    subtext: "+5 casos",
  },
  {
    label: "Revisión de programación para envío a nacional",
    icon: <FiSettings />,
  },
  {
    label: "Revisión de plantilla Locker Studio",
    icon: <FiLayout />,
  },
  {
    label: "Cerrar sesión",
    icon: <FiLogOut />,
    to: "/logout"
  },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-subtitle">Accesos rápidos para seguimiento y control</p>
      <div className="dashboard-grid">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="dashboard-card"
            tabIndex={0}
            onClick={() => card.to && navigate(card.to)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && card.to) navigate(card.to);
            }}
            title={card.label}
          >
            {card.new && <div className="dashboard-badge">Nuevo</div>}
            <div className="dashboard-icon-wrapper">{card.icon}</div>
            <span className="dashboard-label">{card.label}</span>
            {card.subtext && <div className="dashboard-subtext">{card.subtext}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
