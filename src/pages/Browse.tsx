import React, { useMemo, useState } from "react";
import { CATEGORIES, ERAS, MAKE_MODEL_BY_ERA } from "../data/catalog";
import { Listing, CategoryId, EraId } from "../types";
import { TileGrid } from "../components/TileGrid";
import SearchBar from "../components/SearchBar";
import PartCard from "../components/PartCard";

type Step = "era" | "make" | "model" | "category" | "results";

export default function Browse({
  listings,
  onOpenListing,
}: {
  listings: Listing[];
  onOpenListing: (id: string) => void;
}) {
  const [step, setStep] = useState<Step>("era");

  const [era, setEra] = useState<EraId | null>(null);
  const [make, setMake] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryId | null>(null);

  const [q, setQ] = useState("");

  const breadcrumb = useMemo(() => {
    const items: { k: string; v: string }[] = [];
    if (era) items.push({ k: "Era", v: ERAS.find((e) => e.id === era)?.label ?? era });
    if (make) items.push({ k: "Make", v: make });
    if (model) items.push({ k: "Model", v: model });
    if (category)
      items.push({
        k: "Category",
        v: CATEGORIES.find((c) => c.id === category)?.label ?? category,
      });
    return items;
  }, [era, make, model, category]);

  const resetFrom = (level: Step) => {
    // Jump back cleanly
    if (level === "era") {
      setEra(null); setMake(null); setModel(null); setCategory(null);
      setStep("era"); setQ("");
      return;
    }
    if (level === "make") {
      setMake(null); setModel(null); setCategory(null);
      setStep("make"); setQ("");
      return;
    }
    if (level === "model") {
      setModel(null); setCategory(null);
      setStep("model"); setQ("");
      return;
    }
    if (level === "category") {
      setCategory(null);
      setStep("category"); setQ("");
      return;
    }
  };

  const filtered = useMemo(() => {
    return listings
      .filter((l) => (era ? l.era === era : true))
      .filter((l) => (make ? l.make === make : true))
      .filter((l) => (model ? l.model === model : true))
      .filter((l) => (category ? l.category === category : true))
      .filter((l) => {
        if (!q.trim()) return true;
        const s = q.toLowerCase();
        return (
          l.title.toLowerCase().includes(s) ||
          (l.description ?? "").toLowerCase().includes(s) ||
          l.make.toLowerCase().includes(s) ||
          l.model.toLowerCase().includes(s)
        );
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [listings, era, make, model, category, q]);

  const header = useMemo(() => {
    const titles: Record<Step, { h: string; p: string }> = {
      era: { h: "Choose an era", p: "Tap once. Keep moving. No clutter." },
      make: { h: "Choose a make", p: "Big tiles + search if you want it." },
      model: { h: "Choose a model", p: "Only the models that match the era." },
      category: { h: "Choose a category", p: "Find parts without scrolling forever." },
      results: { h: "Parts for sale", p: "Refine with a quick search." },
    };
    return titles[step];
  }, [step]);

  const makes = useMemo(() => {
    if (!era) return [];
    const m = Object.keys(MAKE_MODEL_BY_ERA[era]).sort();
    return m;
  }, [era]);

  const models = useMemo(() => {
    if (!era || !make) return [];
    const arr = MAKE_MODEL_BY_ERA[era][make] ?? [];
    return [...arr].sort();
  }, [era, make]);

  const makeSearch = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return makes;
    return makes.filter((m) => m.toLowerCase().includes(s));
  }, [makes, q]);

  const modelSearch = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return models;
    return models.filter((m) => m.toLowerCase().includes(s));
  }, [models, q]);

  const catSearch = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return CATEGORIES;
    return CATEGORIES.filter((c) => c.label.toLowerCase().includes(s));
  }, [q]);

  return (
    <div className="card">
      <div className="section">
        <div className="row">
          <div>
            <h1 className="h1">{header.h}</h1>
            <p className="p">{header.p}</p>
          </div>
          {step !== "era" && (
            <button className="secondary" onClick={() => resetFrom("era")}>
              Reset
            </button>
          )}
        </div>

        {breadcrumb.length > 0 && (
          <div className="breadcrumbs">
            {breadcrumb.map((b) => (
              <div key={b.k} className="crumb">
                {b.k}: <strong>{b.v}</strong>
              </div>
            ))}
          </div>
        )}

        {(step === "make" || step === "model" || step === "category" || step === "results") && (
          <SearchBar
            value={q}
            onChange={setQ}
            onClear={() => setQ("")}
            placeholder={
              step === "results"
                ? "Search listings (e.g. caliper, carb, bonnet)…"
                : "Search…"
            }
          />
        )}

        {step === "era" && (
          <TileGrid
            items={ERAS.map((e) => ({ key: e.id, label: e.label, meta: e.meta }))}
            onPick={(it) => {
              setEra(it.key as EraId);
              setStep("make");
              setQ("");
            }}
          />
        )}

        {step === "make" && (
          <>
            <div className="actions">
              <button className="secondary" onClick={() => resetFrom("era")}>
                Back
              </button>
              <button
                className="primary"
                onClick={() => {
                  // Quick route: if already typed a make exactly
                  const exact = makes.find((m) => m.toLowerCase() === q.trim().toLowerCase());
                  if (exact) {
                    setMake(exact);
                    setStep("model");
                    setQ("");
                  }
                }}
              >
                Continue
              </button>
            </div>
            <div className="hr" />
            <TileGrid
              items={makeSearch.map((m) => ({ key: m, label: m, meta: "Tap to choose" }))}
              onPick={(it) => {
                setMake(it.key);
                setStep("model");
                setQ("");
              }}
            />
          </>
        )}

        {step === "model" && (
          <>
            <div className="actions">
              <button className="secondary" onClick={() => resetFrom("make")}>
                Back
              </button>
              <button className="primary" onClick={() => setStep("category")}>
                Skip & choose category
              </button>
            </div>
            <div className="hr" />
            <TileGrid
              items={modelSearch.map((m) => ({ key: m, label: m, meta: "Tap to choose" }))}
              onPick={(it) => {
                setModel(it.key);
                setStep("category");
                setQ("");
              }}
            />
          </>
        )}

        {step === "category" && (
          <>
            <div className="actions">
              <button className="secondary" onClick={() => resetFrom("model")}>
                Back
              </button>
              <button className="primary" onClick={() => setStep("results")}>
                View parts
              </button>
            </div>
            <div className="hr" />
            <TileGrid
              items={catSearch.map((c) => ({
                key: c.id,
                label: c.label,
                meta: c.meta,
              }))}
              onPick={(it) => {
                setCategory(it.key as CategoryId);
                setStep("results");
                setQ("");
              }}
            />
          </>
        )}

        {step === "results" && (
          <>
            <div className="actions">
              <button className="secondary" onClick={() => resetFrom("category")}>
                Back
              </button>
              <button className="primary" onClick={() => { /* no-op */ }}>
                {filtered.length} results
              </button>
            </div>

            <div className="list">
              {filtered.length === 0 ? (
                <div className="note">
                  No listings match this filter yet. Try clearing search, or add one in “Sell a Part”.
                </div>
              ) : (
                filtered.map((l) => (
                  <PartCard key={l.id} item={l} onOpen={() => onOpenListing(l.id)} />
                ))
              )}
            </div>

            <div className="hr" />
            <div className="note">
              Demo tip: add a few listings (Sell a Part) and you’ll see the funnel feel like Convoy —
              quick taps, no clutter.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
