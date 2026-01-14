import React, { useMemo } from "react";
import { Listing } from "../types";
import { CATEGORIES, ERAS } from "../data/catalog";

export default function ListingPage({
  item,
  onBack,
}: {
  item: Listing;
  onBack: () => void;
}) {
  const cat = useMemo(() => CATEGORIES.find((c) => c.id === item.category)?.label ?? "Category", [item.category]);
  const era = useMemo(() => ERAS.find((e) => e.id === item.era)?.label ?? "Era", [item.era]);

  const date = new Date(item.createdAt);
  const posted = date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="card">
      <div className="section">
        <div className="row">
          <div>
            <h1 className="h1">{item.title}</h1>
            <p className="p">
              {era} • {item.make} • {item.model}
            </p>
          </div>
          <button className="secondary" onClick={onBack}>
            Back
          </button>
        </div>

        <div className="hr" />

        <div className="row" style={{ alignItems: "flex-start" }}>
          <div className="thumb" style={{ width: 108, height: 108, borderRadius: 22 }}>
            {item.thumb ?? item.make.slice(0, 2).toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="badges">
              <span className="badge">{cat}</span>
              <span className="badge">{item.condition}</span>
              <span className="badge">{item.postageAvailable ? "Postage available" : "Collection only"}</span>
              <span className="badge">Posted {posted}</span>
            </div>

            <div className="hr" />

            <div className="row">
              <div>
                <div className="p">Price</div>
                <div style={{ fontWeight: 900, fontSize: 22 }}>£{item.priceGBP.toLocaleString()}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="p">Location</div>
                <div style={{ fontWeight: 700 }}>{item.location}</div>
              </div>
            </div>

            {item.description && (
              <>
                <div className="hr" />
                <div className="p" style={{ color: "var(--text)", fontWeight: 650, marginBottom: 6 }}>
                  Description
                </div>
                <div className="note" style={{ fontSize: 13, color: "var(--muted)" }}>
                  {item.description}
                </div>
              </>
            )}

            <div className="hr" />
            <div className="actions">
              <button className="primary" onClick={() => alert("Demo: wire up messaging / checkout later.")}>
                Message seller
              </button>
              <button className="secondary" onClick={() => alert("Demo: make-offer flow later.")}>
                Make offer
              </button>
            </div>

            <div className="note">
              This is a demo detail page. Next step would be seller profiles, messaging, and payments.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
