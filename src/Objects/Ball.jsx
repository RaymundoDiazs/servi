import React, { useEffect, useRef, useState } from "react";

const Ball = ({ x, onCatch }) => {
  const [y, setY] = useState(0);
  const [vy, setVy] = useState(0); //velocidad vertical
  const ballRef = useRef();
  const gravity = 1;
  const bounceFactor = 0.6;
  const floor = 430;

  //estados
const [entregando, setEntregando] = useState(false);
const [depositPoint, setDepositPoint] = useState(null);


  useEffect(() => {
    let animation;
    const animate = () => {
      setY((prevY) => {
        const nextY = prevY + vy;
        if (nextY >= floor) {
          setVy(-vy * bounceFactor);
          if (Math.abs(vy) < 2) {
            onCatch(); //Se detuvo el rebote
            return floor;
          }
          return floor;
        }
        return nextY;
      });

      setVy((prevVy) => prevVy + gravity);
      animation = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animation);
  }, [vy, onCatch]);

  return (
    <div
      ref={ballRef}
      style={{
        position: "absolute",
        top: y,
        left: x,
        width: 20,
        height: 20,
        backgroundColor: "orange",
        borderRadius: "50%",
        zIndex: 5,
      }}
    />
  );
};

export default Ball;
