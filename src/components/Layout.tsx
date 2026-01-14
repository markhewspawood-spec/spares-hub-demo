import React from "react";

export default function Layout({
  active,
  onNavigate,
  children,
}: {
  active: "browse" | "sell";
  onNavigate: (to: "browse" | "sell") => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="title">Parts Web</div>
            <div className="sub">Original • Used • Overhauled classic parts</div>
          </div>

          <div className="nav">
            <button
              onClick={() => onNavigate("browse")}
              data-active={active === "browse"}
              aria-label="Browse"
            >
              Browse
            </button>
            <button
              onClick={() => onNavigate("sell")}
              data-active={active === "sell"}
              aria-label="Sell"
            >
              Sell a Part
            </button>
          </div>
        </div>
      </div>

      <div className="container">{children}</div>
    </>
  );
}
