import React, { createContext, useState, useEffect } from "react";

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessionType, setSessionType] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [sessionName, setSessionName] = useState(""); //

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
      .then((data) => {
        console.log(data)
        setSessionType(data.tipo);
        setSessionId(data.user_id);
        //endpoint regresa el nombre mencionarlo
        if (data.nombre) setSessionName(data.nombre);
      })
      .catch((error) => {
        console.error("Error al verificar la sesión:", error);
        setSessionType(null);
        setSessionId(null);
        setSessionName("");
      });
  }, []);

  return (
    <SessionContext.Provider
      value={{
        sessionType, setSessionType,
        sessionId, setSessionId,
        sessionName, setSessionName
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
