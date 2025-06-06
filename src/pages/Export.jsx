import React, { useState } from "react";
import { FiExternalLink, FiCopy } from "react-icons/fi";
import "./Export.css";

const Export = () => {
  const [activeTab, setActiveTab] = useState("nacional");
  const [exportInfo, setExportInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sheetLinks = {
    nacional: "https://docs.google.com/spreadsheets/d/1lMG8Gk2_RUWxE94hqO-d57jLc6iLqf7tWgJ5YrqhhMQ/edit#gid=0",
    programacion: "https://docs.google.com/spreadsheets/d/1lMG8Gk2_RUWxE94hqO-d57jLc6iLqf7tWgJ5YrqhhMQ/edit#gid=1895685579" // Replace with actual GID for Programación
  };

  const handleExport = async (endpoint) => {
    setLoading(true);
    setError(null);
    setExportInfo(null);
    try {
      const response = await fetch(`http://localhost:8000/sheets/${endpoint}`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Export failed");
      setExportInfo(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sheetLinks[activeTab]);
  };

  return (
    <div className="export-container">
      <h1 className="export-title">📤 Exportar Proyectos</h1>
      <p className="export-subtitle">Selecciona el tipo de exportación</p>

      <div className="export-tabs">
        <button
          className={`export-tab ${activeTab === "nacional" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("nacional");
            setExportInfo(null);
            setError(null);
          }}
        >
          Archivo Nacional
        </button>
        <button
          className={`export-tab ${activeTab === "programacion" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("programacion");
            setExportInfo(null);
            setError(null);
          }}
        >
          Programación
        </button>
      </div>

      <div className="export-actions">
        <button
          className="export-btn primary"
          onClick={() =>
            handleExport(activeTab === "nacional" ? "export" : "export-programacion")
          }
          disabled={loading}
        >
          {loading ? "Exportando..." : "Exportar a Google Sheets"}
        </button>

        <button className="export-btn secondary" onClick={handleCopyLink}>
          <FiCopy /> Copiar enlace
        </button>

        <a
          className="export-btn secondary"
          href={sheetLinks[activeTab]}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FiExternalLink /> Abrir hoja
        </a>
      </div>

      {error && <p className="export-error">❌ {error}</p>}

      {exportInfo && (
        <div className="export-summary">
          <p>✅ {exportInfo.message}</p>
          <p><strong>Proyectos exportados:</strong> {exportInfo.totalProjects}</p>
          {exportInfo.periods && (
            <p><strong>Resumen de periodos:</strong> {exportInfo.periods.join(", ")}</p>
          )}

          <h3>Vista previa (2 proyectos)</h3>
          <table className="export-preview">
            <thead>
              <tr>
                {activeTab === "nacional" ? (
                  <>
                    <th>Proyecto</th>
                    <th>OSF</th>
                    <th>Modalidad</th>
                    <th>Cupo</th>
                    <th>Periodo</th>
                    <th>Zona</th>
                  </>
                ) : (
                  <>
                    <th>Proyecto</th>
                    <th>OSF</th>
                    <th>Modalidad</th>
                    <th>Horas</th>
                    <th>Numeración</th>
                    <th>PMT</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {exportInfo.preview.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.proyecto || row.nombre_proyecto}</td>
                  <td>{row.osf || row.osf_nombre}</td>
                  <td>{row.modalidad}</td>
                  <td>{row.horas || row.cantidad}</td>
                  <td>{row.numeracion || row.periodo}</td>
                  <td>{row.pmt || row.zona}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Export;
