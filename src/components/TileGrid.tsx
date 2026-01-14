import React from "react";

export function TileGrid<T extends { label: string; meta?: string }>({
  items,
  onPick,
}: {
  items: (T & { key: string })[];
  onPick: (item: T & { key: string }) => void;
}) {
  return (
    <div className="grid">
      {items.map((it) => (
        <div key={it.key} className="tile" onClick={() => onPick(it)}>
          <div className="label">{it.label}</div>
          <div className="meta">{it.meta ?? " "}</div>
        </div>
      ))}
    </div>
  );
}
