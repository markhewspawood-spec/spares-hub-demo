import React, { useMemo, useState } from "react";

type EraId = "pre1950" | "50_70" | "70_80" | "80_2000";

const ERAS: { id: EraId; label: string; meta: string }[] = [
  { id: "pre1950", label: "Pre-1950", meta: "veteran & pre-war" },
  { id: "50_70", label: "1950–1970", meta: "golden era" },
  { id: "70_80", label: "1970–1980", meta: "analogue icons" },
  { id: "80_2000", label: "1980–2000", meta: "modern classics" },
];

const MAKE_MODEL_BY_ERA: Record<EraId, Record<string, string[]>> = {
  pre1950: { Jaguar: ["SS 100"], MG: ["TC"], Bentley: ["3½ Litre"] },
  "50_70": { Jaguar: ["E-Type Series 1", "E-Type Series 2"], Porsche: ["356"], Mercedes: ["300 SL"] },
  "70_80": { Porsche: ["911 SC"], Ford: ["Escort Mk2"], BMW: ["E9 3.0 CS"] },
  "80_2000": { Ford: ["Escort RS Turbo"], BMW: ["E30"], Jaguar: ["XJS"] },
};

const CATEGORIES = [
  "Engine & Fuel",
  "Cooling",
  "Transmission",
  "Suspension",
  "Brakes",
  "Electrical",
  "Body Panels",
  "Interior & Trim",
] as const;

type Listing = {
  id: string;
  era: EraId;
  make: string;
  model: string;
  category: typeof CATEGORIES[number];
  title: string;
  price: number;
  location: string;
  condition: "Original" | "Used" | "Overhauled";
};

const SEED: Listing[] = [
  {
    id: "1",
    era: "50_70",
    make: "Jaguar",
    model: "E-Type Series 1",
    category: "Brakes",
    title: "Dunlop front calipers (pair)",
    price: 595,
    location: "West Sussex",
    condition: "Used",
  },
  {
    id: "2",
    era: "80_2000",
    make: "Ford",
    model: "Escort RS Turbo",
    category: "Engine & Fuel",
    title: "RS Turbo S2 inlet manifold",
    price: 380,
    location: "Essex",
    condition: "Original",
  },
  {
    id: "3",
    era: "50_70",
    make: "Porsche",
    model: "356",
    category: "Electrical",
    title: "Bosch starter motor (overhauled)",
    price: 725,
    location: "London",
    condition: "Overhauled",
  },
];

type Step = "era" | "make" | "model" | "category" | "results";

export default function App() {
  const [step, setStep] = useState<Step>("era");
  const [era, setEra] = useState<EraId | null>(null);
  const [make, setMake] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [category, setCategory] = useState<typeof CATEGORIES[number] | null>(null);

  const reset = () => {
    setStep("era");
    setEra(null);
    setMake(null);
    setModel(null);
    setCategory(null);
  };

  const makes = useMemo(() => (era ? Object.keys(MAKE_MODEL_BY_ERA[era] || {}).sort() : []), [era]);
  const models = useMemo(() => (era && make ? (MAKE_MODEL_BY_ERA[era]?.[make] || []).slice().sort() : []), [era, make]);

  const filtered = useMemo(() => {
    return SEED.filter((x) => (era ? x.era === era : true))
      .filter((x) => (make ? x.make === make : true))
      .filter((x) => (model ? x.model === model : true))
      .filter((x) => (category ? x.category === category : true));
  }, [era, make, model, category]);

  const title: Record<Step, string> = {
    era: "Choose an era",
    make: "Choose a make",
    model: "Choose a model",
    category: "Choose a category",
    results: "Parts for sale",
  };

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.headerRow}>
          <div>
            <div style={styles.brand}>Parts Web</div>
            <div style={styles.sub}>Original • Used • Overhauled classic parts</div>
          </div>
          <button onClick={reset} style={styles.resetBtn}>
            Reset
          </button>
        </div>

        <div style={styles.breadcrumbs}>
          {era && <span style={styles.crumb}>Era: <b>{ERAS.find(e => e.id === era)?.label}</b></span>}
          {make && <span style={styles.crumb}>Make: <b>{make}</b></span>}
          {model && <span style={styles.crumb}>Model: <b>{model}</b></span>}
          {category && <span style={styles.crumb}>Category: <b>{category}</b></span>}
        </div>

        <div style={styles.h1}>{title[step]}</div>

        {step === "era" && (
          <Grid>
            {ERAS.map((e) => (
              <Tile key={e.id} onClick={() => { setEra(e.id); setStep("make"); }}>
                <div style={styles.tileLabel}>{e.label}</div>
                <div style={styles.tileMeta}>{e.meta}</div>
              </Tile>
            ))}
          </Grid>
        )}

        {step === "make" && (
          <>
            <div style={styles.actions}>
              <button style={styles.secondary} onClick={() => { setStep("era"); setEra(null); }}>
                Back
              </button>
            </div>
            <Grid>
              {makes.map((m) => (
                <Tile key={m} onClick={() => { setMake(m); setStep("model"); }}>
                  <div style={styles.tileLabel}>{m}</div>
                  <div style={styles.tileMeta}>Tap to choose</div>
                </Tile>
              ))}
            </Grid>
          </>
        )}

        {step === "model" && (
          <>
            <div style={styles.actions}>
              <button style={styles.secondary} onClick={() => { setStep("make"); setMake(null); }}>
                Back
              </button>
            </div>
            <Grid>
              {models.map((m) => (
                <Tile key={m} onClick={() => { setModel(m); setStep("category"); }}>
                  <div style={styles.tileLabel}>{m}</div>
                  <div style={styles.tileMeta}>Tap to choose</div>
                </Tile>
              ))}
            </Grid>
          </>
        )}

        {step === "category" && (
          <>
            <div style={styles.actions}>
              <button style={styles.secondary} onClick={() => { setStep("model"); setModel(null); }}>
                Back
              </button>
            </div>
            <Grid>
              {CATEGORIES.map((c) => (
                <Tile key={c} onClick={() => { setCategory(c); setStep("results"); }}>
                  <div style={styles.tileLabel}>{c}</div>
                  <div style={styles.tileMeta}>Tap to view parts</div>
                </Tile>
              ))}
            </Grid>
          </>
        )}

        {step === "results" && (
          <>
            <div style={styles.actions}>
              <button style={styles.secondary} onClick={() => { setStep("category"); setCategory(null); }}>
                Back
              </button>
              <div style={styles.resultsPill}>{filtered.length} results</div>
            </div>

            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              {filtered.length === 0 ? (
                <div style={styles.note}>No demo parts match this selection yet.</div>
              ) : (
                filtered.map((x) => (
                  <div key={x.id} style={styles.card}>
                    <div>
                      <div style={styles.cardTitle}>{x.title}</div>
                      <div style={styles.cardSub}>{x.make} • {x.model} • {x.category}</div>
                      <div style={styles.badges}>
                        <span style={styles.badge}>{x.condition}</span>
                        <span style={styles.badge}>{x.location}</span>
                      </div>
                    </div>
                    <div style={styles.price}>£{x.price}</div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div style={styles.grid}>{children}</div>;
}

function Tile({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={styles.tile}>
      {children}
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0b0d10",
    color: "#eef2f7",
    padding: 16,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
  },
  shell: {
    maxWidth: 980,
    margin: "0 auto",
    border: "1px solid rgba(255,255,255,.10)",
    borderRadius: 22,
    padding: 16,
    background: "rgba(255,255,255,.03)",
  },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 },
  brand: { fontWeight: 850, letterSpacing: 0.2 },
  sub: { opacity: 0.7, fontSize: 12, marginTop: 2 },
  resetBtn: {
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(255,255,255,.06)",
    color: "#eef2f7",
  },
  breadcrumbs: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12, opacity: 0.9, fontSize: 12 },
  crumb: { padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,.10)", background: "rgba(255,255,255,.03)" },
  h1: { marginTop: 14, fontSize: 18, fontWeight: 800 },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginTop: 12 },
  tile: {
    textAlign: "left",
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,.10)",
    background: "rgba(255,255,255,.03)",
    color: "#eef2f7",
    minHeight: 86,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  tileLabel: { fontWeight: 750 },
  tileMeta: { opacity: 0.65, fontSize: 12 },
  actions: { display: "flex", gap: 10, alignItems: "center", marginTop: 12 },
  secondary: {
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,.10)",
    background: "rgba(255,255,255,.04)",
    color: "#eef2f7",
  },
  resultsPill: {
    marginLeft: "auto",
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.10)",
    background: "rgba(255,255,255,.06)",
    fontWeight: 700,
    fontSize: 12,
  },
  card: {
    border: "1px solid rgba(255,255,255,.10)",
    borderRadius: 18,
    padding: 12,
    background: "rgba(255,255,255,.03)",
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  cardTitle: { fontWeight: 750 },
  cardSub: { opacity: 0.7, fontSize: 12, marginTop: 4 },
  badges: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 },
  badge: { fontSize: 12, padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,.10)", background: "rgba(255,255,255,.03)", opacity: 0.9 },
  price: { fontWeight: 900, fontSize: 16 },
  note: { opacity: 0.7, fontSize: 13 },
};
