import React, { useState } from "react";
import { FiExternalLink, FiCopy } from "react-icons/fi";
import "./Export.css";

const Export = () => {
  const [exportInfo, setExportInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/sheets/export", {
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

  return (
    <div className="export-container">
      <h1 className="export-title">📤 Exportar Proyectos</h1>
      <p className="export-subtitle">Genera el archivo y súbelo a Google Sheets</p>

      <button className="export-btn primary" onClick={handleExport} disabled={loading}>
        {loading ? "Exportando..." : "Exportar a Google Sheets"}
      </button>

      {error && <p className="export-error">❌ {error}</p>}

      {exportInfo && (
        <div className="export-summary">
          <p>✅ {exportInfo.message}</p>
          <p><strong>Proyectos exportados:</strong> {exportInfo.totalProjects}</p>
          <p><strong>Resumen de periodos:</strong> {exportInfo.periods.join(", ")}</p>

          <h3>Vista previa (2 proyectos)</h3>
          <table className="export-preview">
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>OSF</th>
                <th>Modalidad</th>
                <th>Cupo</th>
                <th>Periodo</th>
                <th>Zona</th>
              </tr>
            </thead>
            <tbody>
              {exportInfo.preview.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.nombre_proyecto}</td>
                  <td>{row.osf_nombre}</td>
                  <td>{row.modalidad}</td>
                  <td>{row.cantidad}</td>
                  <td>{row.periodo}</td>
                  <td>{row.zona}</td>
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
