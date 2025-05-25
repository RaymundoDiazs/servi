import React, { createContext, useState, useEffect } from "react";

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessionType, setSessionType] = useState("");

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
    <SessionContext.Provider value={{ sessionType, setSessionType }}>
      {children}
    </SessionContext.Provider>
  );
};