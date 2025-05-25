import React from "react";

const SectionDivider = () => {
  return (
    <div style={{ backgroundColor: "#0052CC", overflow: "hidden", lineHeight: 0 }}>
      <svg
        viewBox="0 0 1440 150"
        preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: "80px" }}
      >
        <path
          d="M0,96L48,101.3C96,107,192,117,288,106.7C384,96,480,64,576,58.7C672,53,768,75,864,96C960,117,1056,139,1152,138.7C1248,139,1344,117,1392,106.7L1440,96V0H1392C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0H0Z"
          fill="#ffffff"
        />
      </svg>
    </div>
  );
};

export default SectionDivider;
