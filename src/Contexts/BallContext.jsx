import React, { createContext, useState } from "react";


export const BallContext = createContext();

export const BallProvider = ({ children }) => {
  const [ballPos, setBallPos] = useState(null);
  const [ballStartY, setBallStartY] = useState(0);
  const [depositPoint, setDepositPoint] = useState(null);
  const [entregando, setEntregando] = useState(false);
  const [ballLanded, setBallLanded] = useState(false);

  return (
    <BallContext.Provider
      value={{
        ballPos,
        setBallPos,
        ballStartY,
        setBallStartY,
        depositPoint,
        setDepositPoint,
        entregando,
        setEntregando,
        ballLanded,
        setBallLanded, 
      }}
    >
      {children}
    </BallContext.Provider>
  );
};
