import React, { useEffect, useMemo, useState } from "react";

/**
 * Spares Hub (Demo) — Single-file App.tsx
 *
 * Core UX:
 * ✅ Era → Make → Model → Category → Results (classic funnel restored)
 * ✅ On Make/Model/Category pages, the search bar can search LISTINGS within the current selection context.
 *    Example: 1950–1970 → Jaguar → type "speedo" → shows all speedo listings under Jaguar in that era,
 *    even if they fit multiple models.
 * ✅ Search matches title + description + category + make + model.
 *
 * Extras:
 * ✅ Sort (Newest / Price low-high / Price high-low)
 * ✅ Clearable filter chips (tap to clear)
 * ✅ Condition badge styling
 * ✅ Clean premium UI
 */

// ---- Accent colours (premium) ----
const ACCENT = "#3CFFB4"; // mint neon
const ACCENT2 = "#5AA8FF"; // electric blue
const ACCENT3 = "#FF5AA5"; // rose neon

// ---- Types ----
type EraId = "pre1950" | "50_70" | "70_80" | "80_2000";
type Category =
  | "Engine & Fuel"
  | "Cooling"
  | "Transmission"
  | "Suspension & Steering"
  | "Brakes"
  | "Electrical & Ignition"
  | "Body Panels"
  | "Interior & Trim"
  | "Glass & Seals"
  | "Wheels"
  | "Hardware & Fixings"
  | "Literature / Tools"
  | "Misc";

type Condition = "Original" | "Used" | "Overhauled" | "NOS" | "Reproduction" | "Unknown";
type SortMode = "newest" | "price_asc" | "price_desc";

type Listing = {
  id: string;
  createdAt: number;

  era: EraId;
  make: string;
  model: string;
  category: Category;

  title: string;
  description?: string;
  condition: Condition;

  priceGBP: number;
  location: string;
  postageAvailable: boolean;

  photos: string[]; // base64 data URLs (demo)
};

type Route =
  | { name: "browse" }
  | { name: "sell" }
  | { name: "listing"; id: string };

type Step = "era" | "make" | "model" | "category" | "results";

// ---- Data ----
const ERAS: { id: EraId; label: string; meta: string; years: string }[] = [
  { id: "pre1950", label: "Pre-1950", meta: "veteran & pre-war", years: "— 1949" },
  { id: "50_70", label: "1950–1970", meta: "golden era", years: "1950 — 1970" },
  { id: "70_80", label: "1970–1980", meta: "analogue icons", years: "1970 — 1980" },
  { id: "80_2000", label: "1980–2000", meta: "modern classics", years: "1980 — 2000" },
];

const CATEGORIES: { label: Category; meta: string }[] = [
  { label: "Engine & Fuel", meta: "carb, injection, ancillaries" },
  { label: "Cooling", meta: "rads, hoses, fans" },
  { label: "Transmission", meta: "gearbox, diff, clutch" },
  { label: "Suspension & Steering", meta: "springs, shocks, racks" },
  { label: "Brakes", meta: "calipers, discs, hydraulics" },
  { label: "Electrical & Ignition", meta: "looms, ignition, lights" },
  { label: "Body Panels", meta: "doors, wings, bonnets" },
  { label: "Interior & Trim", meta: "seats, trim, switches" },
  { label: "Glass & Seals", meta: "rubbers, screens, seals" },
  { label: "Wheels", meta: "wheels, hubs, spinners" },
  { label: "Hardware & Fixings", meta: "brackets, clips, fasteners" },
  { label: "Literature / Tools", meta: "manuals, tools, specials" },
  { label: "Misc", meta: "other parts" },
];

const MAKE_MODEL_BY_ERA: Record<EraId, Record<string, string[]>> = {
  pre1950: {
    Bentley: ["3.5 Litre", "4.25 Litre"],
    Bugatti: ["Type 35", "Type 57"],
    Jaguar: ["SS 100", "SS 90"],
    MG: ["TA", "TB", "TC"],
    "Alfa Romeo": ["6C", "8C (pre-war)"],
    "Rolls-Royce": ["Phantom", "Wraith (pre-war)"],
  },
  "50_70": {
    Jaguar: ["XK120", "XK140", "XK150", "E-Type Series 1", "E-Type Series 2"],
    Porsche: ["356", "911 (early)"],
    Mercedes: ["300 SL", "230 SL (Pagoda)"],
    Ferrari: ["250 (series)", "275 (series)"],
    "Aston Martin": ["DB2/4", "DB4", "DB5", "DB6"],
    Ford: ["Escort Mk1", "Cortina Mk1/2", "Mustang (early)"],
    Chevrolet: ["Corvette C1", "Corvette C2"],
    Mini: ["Mini (classic)"],
    "Alfa Romeo": ["Giulia (105)", "Spider (Duetto)"],
    BMW: ["2002", "E9 3.0 CS (early)"],
  },
  "70_80": {
    Porsche: ["911 SC", "930 Turbo", "928"],
    Ferrari: ["308", "512 BB"],
    BMW: ["E9 3.0 CS", "E21 3-Series"],
    Ford: ["Escort Mk2", "Capri", "RS2000"],
    Jaguar: ["XJ Series 2/3", "XJS (early)"],
    Mercedes: ["W116 S-Class", "R107 SL"],
    Lamborghini: ["Countach (early)"],
    "Alfa Romeo": ["Alfetta", "GTV (116)"],
  },
  "80_2000": {
    Ford: ["Escort RS Turbo", "Sierra Cosworth", "Focus (early)"],
    BMW: ["E30", "E36", "E46", "E34 5-Series"],
    Porsche: ["964", "993", "996", "944", "928 (late)"],
    Ferrari: ["348", "355", "360 (early)"],
    Mercedes: ["W124", "R129 SL", "190E (W201)"],
    Jaguar: ["XJ40", "X300", "XJS", "XK8 (early)"],
    Audi: ["Quattro (Ur)", "B5 S4 (late 90s)"],
    Volkswagen: ["Golf GTI Mk2/3", "Corrado"],
    Subaru: ["Impreza (classic)"],
  },
};

// ---- Storage ----
const STORAGE_KEY = "spares_hub:listings:v2";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function seedListings(): Listing[] {
  return [
    {
      id: "seed1",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
      era: "50_70",
      make: "Jaguar",
      model: "E-Type Series 1",
      category: "Electrical & Ignition",
      title: "Smiths speedometer (mph) — excellent face, needs cable",
      description: "Original Smiths unit. Great for E-Type / XK applications. Please check fitment.",
      condition: "Original",
      priceGBP: 640,
      location: "London",
      postageAvailable: true,
      photos: [],
    },
    {
      id: "seed2",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
      era: "50_70",
      make: "Jaguar",
      model: "XK140",
      category: "Electrical & Ignition",
      title: "Smiths speedo head (mph) — tested",
      description: "Bench-tested. Good needle action. Suitable for XK / early Jaguar applications.",
      condition: "Used",
      priceGBP: 495,
      location: "West Sussex",
      postageAvailable: true,
      photos: [],
    },
    {
      id: "seed3",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
      era: "80_2000",
      make: "BMW",
      model: "E30",
      category: "Suspension & Steering",
      title: "E30 steering rack (good used)",
      description: "No play. Boots intact. Collection preferred.",
      condition: "Used",
      priceGBP: 220,
      location: "Manchester",
      postageAvailable: false,
      photos: [],
    },
    {
      id: "seed4",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
      era: "80_2000",
      make: "Ford",
      model: "Escort RS Turbo",
      category: "Engine & Fuel",
      title: "Original RS Turbo Series 2 inlet manifold",
      description: "Original used item. No cracks. Threads good.",
      condition: "Original",
      priceGBP: 380,
      location: "Essex",
      postageAvailable: true,
      photos: [],
    },
  ];
}

function loadListings(): Listing[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedListings();
    const parsed = JSON.parse(raw) as Listing[];
    if (!Array.isArray(parsed)) return seedListings();
    return parsed;
  } catch {
    return seedListings();
  }
}

function saveListings(listings: Listing[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
}

// ---- App ----
export default function App() {
  const [route, setRoute] = useState<Route>({ name: "browse" });
  const [listings, setListings] = useState<Listing[]>([]);

  const [step, setStep] = useState<Step>("era");
  const [era, setEra] = useState<EraId | null>(null);
  const [make, setMake] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | null>(null);

  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortMode>("newest");

  useEffect(() => {
    setListings(loadListings());
  }, []);

  const refresh = () => setListings(loadListings());

  const resetBrowse = () => {
    setStep("era");
    setEra(null);
    setMake(null);
    setModel(null);
    setCategory(null);
    setQ("");
    setSort("newest");
  };

  // Lists for tiles
  const makes = useMemo(() => {
    if (!era) return [];
    return Object.keys(MAKE_MODEL_BY_ERA[era] || {}).sort();
  }, [era]);

  const models = useMemo(() => {
    if (!era || !make) return [];
    return (MAKE_MODEL_BY_ERA[era]?.[make] || []).slice().sort();
  }, [era, make]);

  // Search within the current step’s tile list (make/model/category)
  const tileQuery = q.trim().toLowerCase();

  const filteredMakes = useMemo(() => {
    if (!tileQuery) return makes;
    return makes.filter((m) => m.toLowerCase().includes(tileQuery));
  }, [makes, tileQuery]);

  const filteredModels = useMemo(() => {
    if (!tileQuery) return models;
    return models.filter((m) => m.toLowerCase().includes(tileQuery));
  }, [models, tileQuery]);

  const filteredCats = useMemo(() => {
    if (!tileQuery) return CATEGORIES;
    return CATEGORIES.filter((c) => c.label.toLowerCase().includes(tileQuery));
  }, [tileQuery]);

  // Listing search ALWAYS respects current selection context:
  // era + make + model + category, then searches text across fields.
  const listingMatches = useMemo(() => {
    const s = q.trim().toLowerCase();

    const base = listings
      .filter((l) => (era ? l.era === era : true))
      .filter((l) => (make ? l.make === make : true))
      .filter((l) => (model ? l.model === model : true))
      .filter((l) => (category ? l.category === category : true))
      .filter((l) => {
        if (!s) return true;
        return (
          l.title.toLowerCase().includes(s) ||
          (l.description || "").toLowerCase().includes(s) ||
          l.make.toLowerCase().includes(s) ||
          l.model.toLowerCase().includes(s) ||
          l.category.toLowerCase().includes(s)
        );
      });

    const out = base.slice();
    if (sort === "newest") out.sort((a, b) => b.createdAt - a.createdAt);
    if (sort === "price_asc") out.sort((a, b) => a.priceGBP - b.priceGBP);
    if (sort === "price_desc") out.sort((a, b) => b.priceGBP - a.priceGBP);
    return out;
  }, [listings, era, make, model, category, q, sort]);

  // On Make/Model/Category pages, show “instant matches” only when the user typed something
  // OR when they’re already in Results.
  const showInstantMatches = step === "results" || q.trim().length > 0;

  const stats = useMemo(() => {
    if (listingMatches.length === 0) return { min: 0, max: 0 };
    let min = listingMatches[0].priceGBP;
    let max = listingMatches[0].priceGBP;
    for (const l of listingMatches) {
      if (l.priceGBP < min) min = l.priceGBP;
      if (l.priceGBP > max) max = l.priceGBP;
    }
    return { min, max };
  }, [listingMatches]);

  const activeListing =
    route.name === "listing" ? listings.find((l) => l.id === route.id) : null;

  return (
    <div style={S.page}>
      <TopBar
        active={route.name === "sell" ? "sell" : "browse"}
        onBrowse={() => setRoute({ name: "browse" })}
        onSell={() => setRoute({ name: "sell" })}
      />

      <div style={S.container}>
        {route.name === "browse" && (
          <div style={S.card}>
            <div style={S.section}>
              <Header
                step={step}
                showReset={step !== "era"}
                onReset={resetBrowse}
              />

              <Breadcrumbs
                era={era}
                make={make}
                model={model}
                category={category}
                onClearEra={() => resetBrowse()}
                onClearMake={() => {
                  setMake(null);
                  setModel(null);
                  setCategory(null);
                }}
                onClearModel={() => {
                  setModel(null);
                  setCategory(null);
                }}
                onClearCategory={() => setCategory(null)}
              />

              {(step !== "era") && (
                <div style={S.searchRow}>
                  <SearchBar
                    value={q}
                    onChange={setQ}
                    onClear={() => setQ("")}
                    placeholder={
                      step === "make"
                        ? "Search makes OR type a part (e.g. speedo)…"
                        : step === "model"
                        ? "Search models OR type a part (e.g. speedo)…"
                        : step === "category"
                        ? "Search categories OR type a part (e.g. steering)…"
                        : "Search results (e.g. speedo, steering, Weber)…"
                    }
                  />
                  <SortSelect value={sort} onChange={setSort} />
                </div>
              )}

              {/* ERA */}
              {step === "era" && (
                <Grid>
                  {ERAS.map((e) => (
                    <Tile
                      key={e.id}
                      label={e.label}
                      meta={`${e.meta} • ${e.years}`}
                      onClick={() => {
                        setEra(e.id);
                        setStep("make");
                        setQ("");
                      }}
                    />
                  ))}
                </Grid>
              )}

              {/* MAKE */}
              {step === "make" && (
                <>
                  <Actions>
                    <BtnSecondary
                      onClick={() => {
                        setStep("era");
                        setEra(null);
                        setMake(null);
                        setModel(null);
                        setCategory(null);
                        setQ("");
                      }}
                    >
                      Back
                    </BtnSecondary>
                    <BtnPrimary
                      onClick={() => {
                        // if the user typed an exact make, let them apply quickly
                        const exact = makes.find((m) => m.toLowerCase() === q.trim().toLowerCase());
                        if (exact) {
                          setMake(exact);
                          setStep("model");
                          setQ("");
                        }
                      }}
                    >
                      Continue
                    </BtnPrimary>
                  </Actions>

                  <Divider />

                  <Grid>
                    {filteredMakes.map((m) => (
                      <Tile
                        key={m}
                        label={m}
                        meta="Tap to choose"
                        onClick={() => {
                          setMake(m);
                          setStep("model");
                          // DO NOT clear q here: if they typed "speedo" before selecting Jaguar,
                          // we want that search to carry into the Jaguar context on the next screen.
                          // But we also want the model tiles visible. So we keep q, and show matches below.
                        }}
                      />
                    ))}
                    <Tile
                      key="other-make"
                      label="Other / Unknown"
                      meta="If your make isn’t listed"
                      onClick={() => {
                        setMake("Other / Unknown");
                        setStep("model");
                      }}
                    />
                  </Grid>

                  {showInstantMatches && (
                    <InstantMatches
                      title={`Matches in ${labelEra(era!)}${make ? ` • ${make}` : ""}`}
                      items={listingMatches}
                      min={stats.min}
                      max={stats.max}
                      onOpen={(id) => setRoute({ name: "listing", id })}
                      onGoResults={() => setStep("results")}
                      showGoResults={true}
                    />
                  )}
                </>
              )}

              {/* MODEL */}
              {step === "model" && (
                <>
                  <Actions>
                    <BtnSecondary
                      onClick={() => {
                        setStep("make");
                        setMake(null);
                        setModel(null);
                        setCategory(null);
                        // keep q (they might be searching for a part)
                      }}
                    >
                      Back
                    </BtnSecondary>
                    <BtnPrimary
                      onClick={() => {
                        // Skip selecting a model; go to category (but keep make)
                        setModel(null);
                        setStep("category");
                        // keep q if they’re searching listings
                      }}
                    >
                      Skip model
                    </BtnPrimary>
                  </Actions>

                  <Divider />

                  <Grid>
                    {filteredModels.map((m) => (
                      <Tile
                        key={m}
                        label={m}
                        meta="Tap to choose"
                        onClick={() => {
                          setModel(m);
                          setStep("category");
                          // keep q to continue searching within a narrower context if they want
                        }}
                      />
                    ))}
                    <Tile
                      key="other-model"
                      label="Other / Unknown"
                      meta="If your model isn’t listed"
                      onClick={() => {
                        setModel("Other / Unknown");
                        setStep("category");
                      }}
                    />
                  </Grid>

                  {showInstantMatches && (
                    <InstantMatches
                      title={`Matches in ${labelEra(era!)} • ${make ?? "Any make"}${model ? ` • ${model}` : ""}`}
                      items={listingMatches}
                      min={stats.min}
                      max={stats.max}
                      onOpen={(id) => setRoute({ name: "listing", id })}
                      onGoResults={() => setStep("results")}
                      showGoResults={true}
                    />
                  )}
                </>
              )}

              {/* CATEGORY */}
              {step === "category" && (
                <>
                  <Actions>
                    <BtnSecondary
                      onClick={() => {
                        setStep("model");
                        setCategory(null);
                        // keep q if searching
                      }}
                    >
                      Back
                    </BtnSecondary>
                    <BtnPrimary
                      onClick={() => {
                        setStep("results");
                      }}
                    >
                      View results
                    </BtnPrimary>
                  </Actions>

                  <Divider />

                  <Grid>
                    {filteredCats.map((c) => (
                      <Tile
                        key={c.label}
                        label={c.label}
                        meta={c.meta}
                        onClick={() => {
                          setCategory(c.label);
                          setStep("results");
                        }}
                      />
                    ))}
                  </Grid>

                  {showInstantMatches && (
                    <InstantMatches
                      title={`Matches in ${labelEra(era!)} • ${make ?? "Any make"}${category ? ` • ${category}` : ""}`}
                      items={listingMatches}
                      min={stats.min}
                      max={stats.max}
                      onOpen={(id) => setRoute({ name: "listing", id })}
                      onGoResults={() => setStep("results")}
                      showGoResults={true}
                    />
                  )}
                </>
              )}

              {/* RESULTS */}
              {step === "results" && (
                <>
                  <Actions>
                    <BtnSecondary
                      onClick={() => {
                        setStep("category");
                        // keep q
                      }}
                    >
                      Back
                    </BtnSecondary>
                    <Pill>
                      {listingMatches.length} results
                      {listingMatches.length ? <> • £{stats.min.toLocaleString()}–£{stats.max.toLocaleString()}</> : null}
                    </Pill>
                  </Actions>

                  <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                    {listingMatches.length === 0 ? (
                      <Note>
                        No matches. Try a different keyword (e.g. “speedo”, “rack”, “starter”), or clear filters.
                      </Note>
                    ) : (
                      listingMatches.map((l) => (
                        <ListingCard
                          key={l.id}
                          listing={l}
                          onOpen={() => setRoute({ name: "listing", id: l.id })}
                        />
                      ))
                    )}
                  </div>

                  <Divider />
                  <Note>
                    Example workflow: 1950–1970 → Jaguar → type “speedo” to see all Jaguar speedo listings in that era (across models).
                  </Note>
                </>
              )}
            </div>
          </div>
        )}

        {route.name === "sell" && (
          <SellPage
            onPosted={(id) => {
              refresh();
              setRoute({ name: "listing", id });
            }}
          />
        )}

        {route.name === "listing" && (
          <ListingPage
            listing={activeListing ?? loadListings().find((l) => l.id === route.id) ?? null}
            onBack={() => setRoute({ name: "browse" })}
            onGoSell={() => setRoute({ name: "sell" })}
          />
        )}

        <div style={S.footerRow}>
          <BtnGhost
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              saveListings(seedListings());
              setListings(seedListings());
              resetBrowse();
              setRoute({ name: "browse" });
            }}
          >
            Reset demo listings
          </BtnGhost>

          <SmallMuted>
            This demo saves to your browser (localStorage). Next we’ll deploy to Netlify.
          </SmallMuted>
        </div>
      </div>
    </div>
  );
}

// ---- Instant Matches (the “cool” bit that solves your Speedo example) ----
function InstantMatches({
  title,
  items,
  min,
  max,
  onOpen,
  onGoResults,
  showGoResults,
}: {
  title: string;
  items: Listing[];
  min: number;
  max: number;
  onOpen: (id: string) => void;
  onGoResults: () => void;
  showGoResults: boolean;
}) {
  // show the top 6 matches on non-results pages to keep it clean
  const preview = items.slice(0, 6);

  return (
    <div style={S.instantWrap}>
      <div style={S.instantTop}>
        <div>
          <div style={{ fontWeight: 950 }}>Instant matches</div>
          <div style={{ opacity: 0.78, fontSize: 12 }}>
            {title} • {items.length} results{items.length ? <> • £{min.toLocaleString()}–£{max.toLocaleString()}</> : null}
          </div>
        </div>
        {showGoResults && (
          <BtnSecondary onClick={onGoResults}>Open results</BtnSecondary>
        )}
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
        {items.length === 0 ? (
          <Note>No matches yet for that keyword in this context. Try a broader term.</Note>
        ) : (
          preview.map((l) => (
            <ListingCard key={l.id} listing={l} onOpen={() => onOpen(l.id)} />
          ))
        )}
      </div>

      {items.length > preview.length && (
        <div style={{ marginTop: 10 }}>
          <SmallMuted>Showing {preview.length} of {items.length}. Tap “Open results” to see all.</SmallMuted>
        </div>
      )}
    </div>
  );
}

// ---- Sell + Listing pages ----
function SellPage({ onPosted }: { onPosted: (id: string) => void }) {
  const [era, setEra] = useState<EraId>("50_70");
  const [make, setMake] = useState<string>("Jaguar");
  const [model, setModel] = useState<string>("E-Type Series 1");
  const [category, setCategory] = useState<Category>("Electrical & Ignition");
  const [title, setTitle] = useState("");
  const [condition, setCondition] = useState<Condition>("Used");
  const [priceGBP, setPriceGBP] = useState<number>(250);
  const [location, setLocation] = useState("UK");
  const [postageAvailable, setPostageAvailable] = useState(true);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const makes = useMemo(() => Object.keys(MAKE_MODEL_BY_ERA[era] || {}).sort(), [era]);
  const models = useMemo(() => (MAKE_MODEL_BY_ERA[era]?.[make] || []).slice().sort(), [era, make]);

  useEffect(() => {
    const eraMakes = Object.keys(MAKE_MODEL_BY_ERA[era] || {});
    if (eraMakes.length && !eraMakes.includes(make) && make !== "Other / Unknown") setMake(eraMakes[0]);
  }, [era]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const arr = MAKE_MODEL_BY_ERA[era]?.[make] || [];
    if (arr.length && !arr.includes(model) && model !== "Other / Unknown") setModel(arr[0]);
  }, [era, make]); // eslint-disable-line react-hooks/exhaustive-deps

  const canPost = title.trim().length >= 4 && priceGBP > 0 && location.trim().length >= 2 && make && model;

  const onPickPhotos = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const max = 6;
    const take = Array.from(files).slice(0, max);

    const readAsDataURL = (f: File) =>
      new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(f);
      });

    const urls = await Promise.all(take.map(readAsDataURL));
    setPhotos((prev) => [...prev, ...urls].slice(0, max));
  };

  const post = () => {
    if (!canPost) return;

    const listing: Listing = {
      id: uid(),
      createdAt: Date.now(),
      era,
      make,
      model,
      category,
      title: title.trim(),
      description: description.trim() || undefined,
      condition,
      priceGBP: Number(priceGBP),
      location: location.trim(),
      postageAvailable,
      photos,
    };

    const current = loadListings();
    const next = [listing, ...current];
    saveListings(next);

    setTitle("");
    setDescription("");
    setPriceGBP(250);
    setCondition("Used");
    setPostageAvailable(true);
    setPhotos([]);

    onPosted(listing.id);
  };

  return (
    <div style={S.card}>
      <div style={S.section}>
        <div style={S.row}>
          <div>
            <div style={S.h1}>Sell a part</div>
            <div style={S.p}>Fast posting — stored locally for this demo.</div>
          </div>
        </div>

        <div style={S.form}>
          <Field label="Photos (up to 6)">
            <input type="file" accept="image/*" multiple onChange={(e) => onPickPhotos(e.target.files)} style={S.input} />
            {photos.length > 0 && (
              <div style={S.photoGrid}>
                {photos.map((p, idx) => (
                  <div key={idx} style={S.photoWrap}>
                    <img src={p} style={S.photo} alt={`Photo ${idx + 1}`} />
                    <button
                      onClick={() => setPhotos((arr) => arr.filter((_, i) => i !== idx))}
                      style={S.photoRemove}
                      aria-label="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <SmallMuted>Tip: smaller photos keep the demo fast.</SmallMuted>
          </Field>

          <Field label="Era">
            <select value={era} onChange={(e) => setEra(e.target.value as EraId)} style={S.input}>
              {ERAS.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Make">
            <select value={make} onChange={(e) => setMake(e.target.value)} style={S.input}>
              {makes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
              <option value="Other / Unknown">Other / Unknown</option>
            </select>
          </Field>

          <Field label="Model">
            <select value={model} onChange={(e) => setModel(e.target.value)} style={S.input}>
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
              <option value="Other / Unknown">Other / Unknown</option>
            </select>
          </Field>

          <Field label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)} style={S.input}>
              {CATEGORIES.map((c) => (
                <option key={c.label} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Part title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Smiths speedo (mph)" style={S.input} />
          </Field>

          <Field label="Condition">
            <select value={condition} onChange={(e) => setCondition(e.target.value as Condition)} style={S.input}>
              {(["Original", "Used", "Overhauled", "NOS", "Reproduction", "Unknown"] as Condition[]).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Price (GBP)">
            <input type="number" min={1} value={priceGBP} onChange={(e) => setPriceGBP(Number(e.target.value))} style={S.input} />
          </Field>

          <Field label="Location">
            <input value={location} onChange={(e) => setLocation(e.target.value)} style={S.input} />
          </Field>

          <Field label="Postage">
            <select value={postageAvailable ? "yes" : "no"} onChange={(e) => setPostageAvailable(e.target.value === "yes")} style={S.input}>
              <option value="yes">Postage available</option>
              <option value="no">Collection only</option>
            </select>
          </Field>

          <Field label="Description (optional)">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Fitment notes, measurements, what’s included…" style={{ ...S.input, minHeight: 110, resize: "vertical" }} />
          </Field>

          <div style={S.actions}>
            <BtnSecondary onClick={() => { setTitle(""); setDescription(""); }}>Clear text</BtnSecondary>
            <BtnPrimary onClick={post} disabled={!canPost} aria-disabled={!canPost}>Post listing</BtnPrimary>
          </div>

          <Note>This is a demo. Next step is accounts, messaging, payments, and moderation.</Note>
        </div>
      </div>
    </div>
  );
}

function ListingPage({
  listing,
  onBack,
  onGoSell,
}: {
  listing: Listing | null;
  onBack: () => void;
  onGoSell: () => void;
}) {
  if (!listing) {
    return (
      <div style={S.card}>
        <div style={S.section}>
          <div style={S.row}>
            <div>
              <div style={S.h1}>Listing not found</div>
              <div style={S.p}>It may have been removed.</div>
            </div>
            <BtnSecondary onClick={onBack}>Back</BtnSecondary>
          </div>
        </div>
      </div>
    );
  }

  const posted = new Date(listing.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div style={S.card}>
      <div style={S.section}>
        <div style={S.row}>
          <div>
            <div style={S.h1}>{listing.title}</div>
            <div style={S.p}>
              {labelEra(listing.era)} • {listing.make} • {listing.model}
            </div>
          </div>
          <BtnSecondary onClick={onBack}>Back</BtnSecondary>
        </div>

        <Divider />

        {listing.photos.length > 0 && (
          <div style={S.photoGrid}>
            {listing.photos.map((p, idx) => (
              <div key={idx} style={S.photoWrap}>
                <img src={p} style={S.photo} alt={`Listing photo ${idx + 1}`} />
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          <Badge>{listing.category}</Badge>
          <ConditionBadge condition={listing.condition} />
          <Badge>{listing.postageAvailable ? "Postage available" : "Collection only"}</Badge>
          <Badge>Posted {posted}</Badge>
        </div>

        <Divider />

        <div style={S.row}>
          <div>
            <div style={S.p}>Price</div>
            <div style={{ fontWeight: 950, fontSize: 24, color: ACCENT, textShadow: `0 0 16px ${ACCENT}55` }}>
              £{listing.priceGBP.toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={S.p}>Location</div>
            <div style={{ fontWeight: 850 }}>{listing.location}</div>
          </div>
        </div>

        {listing.description && (
          <>
            <Divider />
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Description</div>
            <Note style={{ fontSize: 13 }}>{listing.description}</Note>
          </>
        )}

        <Divider />

        <div style={S.actions}>
          <BtnPrimary onClick={() => alert("Demo: wire up messaging later.")}>Message seller</BtnPrimary>
          <BtnSecondary onClick={() => alert("Demo: make-offer flow later.")}>Make offer</BtnSecondary>
          <BtnGhost onClick={onGoSell}>Sell another part</BtnGhost>
        </div>
      </div>
    </div>
  );
}

// ---- UI ----
function TopBar({
  active,
  onBrowse,
  onSell,
}: {
  active: "browse" | "sell";
  onBrowse: () => void;
  onSell: () => void;
}) {
  return (
    <div style={S.topbar}>
      <div style={S.topbarInner}>
        <div style={S.brandBlock}>
          <LogoLockup />
          <div style={S.brandSub}>Classic spares • Original • Used • Overhauled</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <BtnPill active={active === "browse"} onClick={onBrowse}>
            Browse
          </BtnPill>
          <BtnPill active={active === "sell"} onClick={onSell}>
            Sell a Part
          </BtnPill>
        </div>
      </div>
      <div style={S.topbarGlow} />
    </div>
  );
}

// Simple “locked-style” lockup (flat, clean, minimal)
function LogoLockup() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={S.logoBadge}>
        <svg width="18" height="18" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M50 32l7-4 6 5 7-2 5 7 7 1v10l-7 1-5 7-7-2-6 5-7-4-7 4-6-5-7 2-5-7-7-1V45l7-1 5-7 7 2 6-5 7 4z"
            fill={ACCENT}
          />
          <circle cx="50" cy="50" r="12" fill="#0B1020" />
        </svg>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <span style={{ color: ACCENT, fontWeight: 950, letterSpacing: 0.3 }}>Spares</span>
        <span style={{ color: "#FFFFFF", fontWeight: 950, letterSpacing: 0.3 }}>Hub</span>
      </div>
    </div>
  );
}

function Header({ step, showReset, onReset }: { step: Step; showReset: boolean; onReset: () => void }) {
  const map: Record<Step, { h: string; p: string }> = {
    era: { h: "Choose an era", p: "Tap once. Then narrow by make/model… or just search." },
    make: { h: "Choose a make", p: "You can also type a part name to see instant matches." },
    model: { h: "Choose a model", p: "Or type a part name to search across this make." },
    category: { h: "Choose a category", p: "Search works here too (e.g. “steering”, “speedo”)." },
    results: { h: "Results", p: "All matching listings in this selection context." },
  };

  return (
    <div style={S.row}>
      <div>
        <div style={S.h1}>{map[step].h}</div>
        <div style={S.p}>{map[step].p}</div>
      </div>
      {showReset && <BtnSecondary onClick={onReset}>Reset</BtnSecondary>}
    </div>
  );
}

function Breadcrumbs({
  era,
  make,
  model,
  category,
  onClearEra,
  onClearMake,
  onClearModel,
  onClearCategory,
}: {
  era: EraId | null;
  make: string | null;
  model: string | null;
  category: Category | null;
  onClearEra: () => void;
  onClearMake: () => void;
  onClearModel: () => void;
  onClearCategory: () => void;
}) {
  const items: { k: string; v: string; onClear: () => void }[] = [];
  if (era) items.push({ k: "Era", v: labelEra(era), onClear: onClearEra });
  if (make) items.push({ k: "Make", v: make, onClear: onClearMake });
  if (model) items.push({ k: "Model", v: model, onClear: onClearModel });
  if (category) items.push({ k: "Category", v: category, onClear: onClearCategory });

  if (!items.length) return null;

  return (
    <div style={S.breadcrumbs}>
      {items.map((b) => (
        <button key={b.k} style={S.crumbBtn} onClick={b.onClear} title={`Clear ${b.k}`}>
          <span style={{ opacity: 0.82 }}>{b.k}:</span> <b style={{ color: "#eef2f7" }}>{b.v}</b>
          <span style={S.crumbX}>×</span>
        </button>
      ))}
    </div>
  );
}

function SearchBar({
  value,
  onChange,
  onClear,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  placeholder: string;
}) {
  return (
    <div style={S.search}>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={S.searchInput} />
      <BtnSecondary onClick={onClear}>Clear</BtnSecondary>
    </div>
  );
}

function SortSelect({ value, onChange }: { value: SortMode; onChange: (v: SortMode) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as SortMode)} style={S.sortSelect}>
      <option value="newest">Newest</option>
      <option value="price_asc">Price: low → high</option>
      <option value="price_desc">Price: high → low</option>
    </select>
  );
}

function ListingCard({ listing, onOpen }: { listing: Listing; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      style={{
        ...S.listingCard,
        ...(hovered
          ? {
              transform: "translateY(-2px)",
              boxShadow: `0 0 0 1px ${ACCENT}40, 0 18px 60px rgba(0,0,0,.45)`,
              borderColor: `${ACCENT2}55`,
            }
          : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={S.thumb}>
          {listing.photos[0] ? (
            <img
              src={listing.photos[0]}
              alt="thumb"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <span style={{ fontWeight: 950, opacity: 0.9 }}>
              {listing.make.slice(0, 1).toUpperCase()}
              {listing.model.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <div style={{ fontWeight: 950 }}>{listing.title}</div>
          <div style={{ opacity: 0.74, fontSize: 12, marginTop: 4 }}>
            {labelEra(listing.era)} • {listing.make} • {listing.model}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            <Badge>{listing.category}</Badge>
            <ConditionBadge condition={listing.condition} />
            <Badge>{listing.postageAvailable ? "Postage" : "Collection"}</Badge>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 950, color: ACCENT, textShadow: `0 0 14px ${ACCENT}55` }}>
            £{listing.priceGBP.toLocaleString()}
          </div>
          <div style={{ opacity: 0.74, fontSize: 12, marginTop: 6 }}>{listing.location}</div>
        </div>
      </div>
    </button>
  );
}

function ConditionBadge({ condition }: { condition: Condition }) {
  const cfg: Record<Condition, { bg: string; br: string }> = {
    Original: { bg: `${ACCENT2}18`, br: `${ACCENT2}55` },
    Used: { bg: "rgba(255,255,255,.06)", br: "rgba(255,255,255,.12)" },
    Overhauled: { bg: `${ACCENT}18`, br: `${ACCENT}55` },
    NOS: { bg: `${ACCENT3}14`, br: `${ACCENT3}44` },
    Reproduction: { bg: "rgba(90,168,255,.12)", br: "rgba(90,168,255,.35)" },
    Unknown: { bg: "rgba(255,255,255,.05)", br: "rgba(255,255,255,.10)" },
  };

  return (
    <span style={{ ...S.badge, background: cfg[condition].bg, borderColor: cfg[condition].br }}>
      {condition}
    </span>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div style={S.grid}>{children}</div>;
}

function Tile({ label, meta, onClick }: { label: string; meta: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      style={{
        ...S.tile,
        ...(hovered
          ? {
              borderColor: `${ACCENT}88`,
              boxShadow: `0 0 0 1px ${ACCENT}66, 0 0 28px ${ACCENT}22`,
              transform: "translateY(-2px)",
            }
          : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div style={S.tileLabel}>{label}</div>
      <div style={S.tileMeta}>{meta}</div>
    </button>
  );
}

function Actions({ children }: { children: React.ReactNode }) {
  return <div style={S.actions}>{children}</div>;
}

function Divider() {
  return <div style={S.hr} />;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 12, opacity: 0.78 }}>{label}</div>
      {children}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span style={S.badge}>{children}</span>;
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span style={S.pill}>{children}</span>;
}

function Note({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ opacity: 0.8, fontSize: 13, lineHeight: 1.45, ...style }}>{children}</div>;
}

function SmallMuted({ children }: { children: React.ReactNode }) {
  return <div style={{ opacity: 0.7, fontSize: 12 }}>{children}</div>;
}

function BtnPill({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...S.btnPill,
        background: active ? `linear-gradient(135deg, ${ACCENT}22, ${ACCENT2}18)` : "rgba(255,255,255,.05)",
        borderColor: active ? `${ACCENT}66` : "rgba(255,255,255,.10)",
        boxShadow: active ? `0 0 18px ${ACCENT2}22` : "none",
      }}
    >
      {children}
    </button>
  );
}

function BtnPrimary(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} style={{ ...S.btnPrimary, ...(props.style || {}) }} />;
}
function BtnSecondary(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} style={{ ...S.btnSecondary, ...(props.style || {}) }} />;
}
function BtnGhost(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} style={{ ...S.btnGhost, ...(props.style || {}) }} />;
}

// ---- Helpers ----
function labelEra(id: EraId) {
  return ERAS.find((e) => e.id === id)?.label ?? id;
}

// ---- Styles ----
const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 800px at 15% 0%, rgba(90,168,255,.22) 0%, rgba(11,13,16,1) 55%)",
    color: "#eef2f7",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
  },

  topbar: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    backdropFilter: "blur(12px)",
    background: "linear-gradient(to bottom, rgba(11,13,16,.93), rgba(11,13,16,.70))",
    borderBottom: "1px solid rgba(255,255,255,.08)",
  },
  topbarGlow: { height: 2, background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2}, ${ACCENT3})`, opacity: 0.7 },
  topbarInner: {
    maxWidth: 1080,
    margin: "0 auto",
    padding: "14px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  brandBlock: { display: "flex", flexDirection: "column", gap: 4 },
  brandSub: { fontSize: 12, opacity: 0.75 },

  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 10,
    background: "#0B1020",
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(255,255,255,.10)",
  },

  container: { maxWidth: 1080, margin: "0 auto", padding: "18px 14px 30px" },

  card: {
    border: "1px solid rgba(255,255,255,.09)",
    borderRadius: 24,
    background: "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02))",
    boxShadow: "0 20px 60px rgba(0,0,0,.55)",
  },
  section: { padding: 16 },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  h1: { fontSize: 20, fontWeight: 950, marginBottom: 4 },
  p: { opacity: 0.78, fontSize: 13 },

  breadcrumbs: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 },
  crumbBtn: {
    display: "inline-flex",
    gap: 8,
    alignItems: "center",
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.10)",
    background: "rgba(255,255,255,.04)",
    fontSize: 12,
    color: "#eef2f7",
    cursor: "pointer",
  },
  crumbX: {
    marginLeft: 4,
    width: 18,
    height: 18,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "rgba(0,0,0,.35)",
    border: "1px solid rgba(255,255,255,.10)",
    fontWeight: 900,
    opacity: 0.9,
  },

  searchRow: { display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" },
  search: { display: "flex", gap: 10, flex: 1, minWidth: 260 },
  searchInput: {
    width: "100%",
    border: "1px solid rgba(255,255,255,.10)",
    background: "linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.20))",
    color: "#eef2f7",
    borderRadius: 14,
    padding: "12px 14px",
    outline: "none",
    boxShadow: `inset 0 0 0 1px rgba(90,168,255,.10)`,
  },

  sortSelect: {
    border: "1px solid rgba(255,255,255,.10)",
    background: "rgba(255,255,255,.05)",
    color: "#eef2f7",
    borderRadius: 14,
    padding: "12px 12px",
    outline: "none",
    minWidth: 190,
  },

  grid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginTop: 12 },

  tile: {
    textAlign: "left",
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,.10)",
    background: "linear-gradient(135deg, rgba(90,168,255,.12), rgba(255,255,255,.03))",
    color: "#eef2f7",
    minHeight: 86,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    cursor: "pointer",
    transition: "all .15s ease",
  },
  tileLabel: { fontWeight: 950, letterSpacing: 0.1 },
  tileMeta: { opacity: 0.75, fontSize: 12 },

  actions: { display: "flex", gap: 10, alignItems: "center", marginTop: 12, flexWrap: "wrap" },
  hr: { height: 1, background: "rgba(255,255,255,.09)", margin: "12px 0" },

  badge: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.10)",
    opacity: 0.95,
  },
  pill: {
    marginLeft: "auto",
    fontSize: 12,
    padding: "10px 12px",
    borderRadius: 999,
    border: `1px solid ${ACCENT2}55`,
    background: `linear-gradient(135deg, ${ACCENT2}1A, ${ACCENT}12)`,
    fontWeight: 900,
  },

  listingCard: {
    width: "100%",
    border: "1px solid rgba(255,255,255,.10)",
    background: "linear-gradient(135deg, rgba(255,255,255,.04), rgba(255,255,255,.02))",
    borderRadius: 18,
    padding: 12,
    cursor: "pointer",
    color: "#eef2f7",
    transition: "transform .12s ease, box-shadow .12s ease, border-color .12s ease",
  },

  thumb: {
    width: 86,
    height: 86,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,.10)",
    background: "linear-gradient(135deg, rgba(60,255,180,.18), rgba(90,168,255,.10))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    boxShadow: `0 0 20px rgba(60,255,180,.12)`,
  },

  form: { display: "grid", gap: 10, marginTop: 12 },
  input: {
    width: "100%",
    border: "1px solid rgba(255,255,255,.10)",
    background: "linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.20))",
    color: "#eef2f7",
    borderRadius: 14,
    padding: "12px 14px",
    outline: "none",
  },

  btnPill: {
    border: "1px solid rgba(255,255,255,.10)",
    color: "#eef2f7",
    padding: "10px 12px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 850,
  },

  btnPrimary: {
    flex: 1,
    background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
    color: "#03120C",
    padding: "12px 14px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 950,
    border: "none",
    boxShadow: `0 14px 40px ${ACCENT}33`,
  },
  btnSecondary: {
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(255,255,255,.05)",
    color: "#eef2f7",
    padding: "12px 14px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 850,
  },
  btnGhost: {
    border: `1px solid ${ACCENT3}44`,
    background: `linear-gradient(135deg, ${ACCENT3}14, rgba(255,255,255,.02))`,
    color: "#eef2f7",
    padding: "12px 14px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 850,
  },

  photoGrid: { marginTop: 10, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 },
  photoWrap: { position: "relative", borderRadius: 16, border: "1px solid rgba(255,255,255,.10)", overflow: "hidden", background: "rgba(255,255,255,.03)", aspectRatio: "1 / 1" },
  photo: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  photoRemove: { position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: 999, border: "1px solid rgba(255,255,255,.16)", background: "rgba(0,0,0,.55)", color: "#eef2f7", cursor: "pointer", fontSize: 18, lineHeight: "26px" },

  instantWrap: {
    marginTop: 14,
    padding: 12,
    borderRadius: 18,
    border: `1px solid ${ACCENT2}33`,
    background: "linear-gradient(135deg, rgba(90,168,255,.10), rgba(255,255,255,.02))",
  },
  instantTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },

  footerRow: { marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
};
