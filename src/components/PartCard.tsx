import React from "react";
import { Listing } from "../types";
import { CATEGORIES, ERAS } from "../data/catalog";

function catLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? "Category";
}
function eraLabel(id: string) {
  return ERAS.find((e) => e.id === id)?.label ?? "Era";
}

export default function PartCard({
  item,
  onOpen,
}: {
  item: Listing;
  onOpen: () => void;
}) {
  return (
    <div className="part" onClick={onOpen} role="button" tabIndex={0}>
      <div className="thumb">{item.thumb ?? item.make.slice(0, 2).toUpperCase()}</div>
      <div style={{ minWidth: 0 }}>
        <h3>{item.title}</h3>
        <p className="sub">
          {eraLabel(item.era)} • {item.make} • {item.model}
        </p>
        <div className="badges">
          <span className="badge">{catLabel(item.category)}</span>
          <span className="badge">{item.condition}</span>
          <span className="badge">{item.postageAvailable ? "Postage" : "Collection"}</span>
        </div>
      </div>
      <div className="price">
        <div className="gbp">£{item.priceGBP.toLocaleString()}</div>
        <div className="tiny">{item.location}</div>
      </div>
    </div>
  );
}
