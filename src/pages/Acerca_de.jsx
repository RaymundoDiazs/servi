import React from "react";
import { FaInstagram, FaYoutube, FaFacebook, FaEnvelope } from "react-icons/fa";
import "./Acerca_de.css";

import ods1 from "../assets/ODS/ods1.png";
import ods2 from "../assets/ODS/ods2.png";
import ods3 from "../assets/ODS/ods3.png";
import ods4 from "../assets/ODS/ods4.png";
import ods5 from "../assets/ODS/ods5.png";
import ods6 from "../assets/ODS/ods6.png";
import ods7 from "../assets/ODS/ods7.png";
import ods8 from "../assets/ODS/ods8.png";
import ods9 from "../assets/ODS/ods9.png";
import ods10 from "../assets/ODS/ods10.png";
import ods11 from "../assets/ODS/ods11.png";
import ods12 from "../assets/ODS/ods12.png";
import ods13 from "../assets/ODS/ods13.png";
import ods14 from "../assets/ODS/ods14.png";
import ods15 from "../assets/ODS/ods15.png";
import ods16 from "../assets/ODS/ods16.png";

import ods17 from "../assets/ODS/ods17.png";




const odsImgs = [ods1, ods2, ods3, ods4, ods5, ods6, ods7, ods8, ods9, 
  ods10, ods11, ods12, ods13, ods14, ods15, ods16, ods17];

const odsInfo = [
  {
    color: "#e5243b",
    number: 1,
    title: "Fin de la pobreza",
    desc: "Erradicar la pobreza en todo el mundo.",
  },
  {
    color: "#dda63a",
    number: 2,
    title: "Hambre cero",
    desc: "Poner fin al hambre y mejorar la nutrición.",
  },
  {
    color: "#4c9f38",
    number: 3,
    title: "Salud y bienestar",
    desc: "Garantizar una vida sana para todos.",
  },
  {
    color: "#c5192d",
    number: 4,
    title: "Educación de calidad",
    desc: "Acceso a educación de calidad e inclusiva.",
  },
  {
    color: "#ff3a21",
    number: 5,
    title: "Igualdad de género",
    desc: "Lograr igualdad entre los géneros.",
  },
  {
    color: "#26bde2",
    number: 6,
    title: "Agua limpia y saneamiento",
    desc: "Agua y saneamiento para todos.",
  },
  {
    color: "#fcc30b",
    number: 7,
    title: "Energía asequible y no contaminante",
    desc: "Energía sostenible y moderna para todos.",
  },
  {
    color: "#a21942",
    number: 8,
    title: "Trabajo decente y crecimiento económico",
    desc: "Promover el trabajo decente y crecimiento.",
  },
  {
    color: "#fd6925",
    number: 9,
    title: "Industria, innovación e infraestructura",
    desc: "Fomentar innovación e infraestructura resiliente.",
  },
  {
    color: "#dd1367",
    number: 10,
    title: "Reducción de las desigualdades",
    desc: "Reducir desigualdades dentro y entre países.",
  },
  {
    color: "#fd9d24",
    number: 11,
    title: "Ciudades y comunidades sostenibles",
    desc: "Ciudades inclusivas, seguras y sostenibles.",
  },
  {
    color: "#bf8b2e",
    number: 12,
    title: "Producción y consumo responsables",
    desc: "Promover consumo y producción sostenibles.",
  },
  {
    color: "#3f7e44",
    number: 13,
    title: "Acción por el clima",
    desc: "Combatir el cambio climático.",
  },
  {
    color: "#0a97d9",
    number: 14,
    title: "Vida submarina",
    desc: "Proteger los océanos y sus recursos.",
  },
  {
    color: "#56c02b",
    number: 15,
    title: "Vida de ecosistemas terrestres",
    desc: "Gestionar y proteger ecosistemas terrestres.",
  },
  {
    color: "#00689d",
    number: 16,
    title: "Paz, justicia e instituciones sólidas",
    desc: "Promover sociedades justas e inclusivas.",
  },
  {
    color: "#19486a",
    number: 17,
    title: "Alianzas para lograr los objetivos",
    desc: "Fortalecer alianzas para el desarrollo.",
  },
];



const Acerca_de = () => {
  return (
    <div className="about-container">
      <div className="about-card glass">
        <h1 className="about-title">Acerca de Nosotros</h1>
        <p className="about-description">
          Plataforma de servicio social funcional para subir y postular proyectos
        </p>

        <div className="about-highlights">
          <div className="highlight">
            <h3>Misión</h3>
            <p>
              Fomentar el compromiso social mediante herramientas accesibles,
              visuales y funcionales.
            </p>
          </div>

          <div className="highlight">
            <h3>Visión</h3>
            <p>
              Ser una plataforma en gestión de proyectos de servicio social querida
              por los usuarios.
            </p>
          </div>

          <div className="highlight">
            <h3>Valores</h3>
            <ul>
              <li>Empatía</li>
              <li>Transparencia</li>
              <li>Innovación</li>
              <li>Compromiso</li>
            </ul>
          </div>
        </div>

  <div className="ods-section">
  <h3>Objetivos de Desarrollo Sostenible (ODS)</h3>
  <div className="ods-grid">
    {odsInfo.map((ods, i) => (
      <div className="ods-card-expand" style={{ "--ods-color": ods.color }} key={ods.number}>
        <div className="ods-card-inner">
          <img src={odsImgs[i]} alt={ods.title} className="ods-img-expand" />
          <div className="ods-card-content">
            <span className="ods-num-main">ODS {ods.number}</span>
            <span className="ods-title-main">{ods.title}</span>
          </div>
        </div>
        {/* Expanded info al hover */}
        <div className="ods-card-expanded">
          <div className="ods-exp-header">
            <span className="ods-exp-number">ODS {ods.number}</span>
            <span className="ods-exp-title">{ods.title}</span>
          </div>
          <div className="ods-exp-desc">{ods.desc}</div>
          {/* Puedes agregar aquí un botón o enlace si quieres */}
        </div>
      </div>
    ))}
  </div>
</div>





        <div className="social-icons">
          <a href="https://www.instagram.com/" className="instagram" target="_blank" rel="noopener noreferrer">
            <FaInstagram size={30} />
          </a>
          <a href="https://www.youtube.com/" className="youtube" target="_blank" rel="noopener noreferrer">
            <FaYoutube size={30} />
          </a>
          <a href="https://www.facebook.com/" className="facebook" target="_blank" rel="noopener noreferrer">
            <FaFacebook size={30} />
          </a>
          <div className="email-contact">
            <FaEnvelope size={24} />
            <span>mailtext.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Acerca_de;

