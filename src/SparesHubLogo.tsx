import React from "react";

export default function SparesHubLogo({ size = 32 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gear */}
        <path
          d="M50 34l6-3 5 4 6-2 4 6 6 1v8l-6 1-4 6-6-2-5 4-6-3-6 3-5-4-6 2-4-6-6-1v-8l6-1 4-6 6 2 5-4 6 3z"
          fill="#3CFFB4"
        />
        <circle cx="50" cy="50" r="10" fill="#0B1020" />
      </svg>

      <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
        <span style={{ color: "#3CFFB4", fontWeight: 800, letterSpacing: 0.5 }}>
          Spares
        </span>
        <span style={{ color: "#FFFFFF", fontWeight: 800 }}>Hub</span>
      </div>
    </div>
  );
}
