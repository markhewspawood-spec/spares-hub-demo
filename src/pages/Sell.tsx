import React, { useMemo, useState } from "react";
import { CATEGORIES, ERAS, MAKE_MODEL_BY_ERA } from "../data/catalog";
import { addListing } from "../lib/storage";
import { CategoryId, Condition, EraId, Listing } from "../types";

const CONDITIONS: Condition[] = ["Original", "Used", "Overhauled", "NOS", "Reproduction", "Unknown"];

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function Sell({
  onCreated,
}: {
  onCreated: (createdId: string) => void;
}) {
  const [era, setEra] = useState<EraId>("50_70");
  const [make, setMake] = useState<string>("Jaguar");
  const [model, setModel] = useState<string>("E-Type Series 1");
  const [category, setCategory] = useState<CategoryId>("engine");

  const [title, setTitle] = useState("");
  const [condition, setCondition] = useState<Condition>("Used");
  const [priceGBP, setPriceGBP] = useState<number>(250);
  const [location, setLocation] = useState("UK");
  const [postageAvailable, setPostageAvailable] = useState(true);
  const [description, setDescription] = useState("");

  const makes = useMemo(() => Object.keys(MAKE_MODEL_BY_ERA[era]).sort(), [era]);
  const models = useMemo(() => (MAKE_MODEL_BY_ERA[era][make] ?? []).slice().sort(), [era, make]);

  // keep make/model valid when era changes
  React.useEffect(() => {
    const eraMakes = Object.keys(MAKE_MODEL_BY_ERA[era]);
    if (!eraMakes.includes(make)) {
      const first = eraMakes[0] ?? "Jaguar";
      setMake(first);
    }
  }, [era]);

  React.useEffect(() => {
    const arr = MAKE_MODEL_BY_ERA[era][make] ?? [];
    if (!arr.includes(model)) {
      setModel(arr[0] ?? "Unknown");
    }
  }, [era, make]);

  const canPost = title.trim().length >= 4 && priceGBP > 0 && location.trim().length >= 2;

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
      condition,
      priceGBP: Number(priceGBP),
      location: location.trim(),
      postageAvailable,
      description: description.trim() || undefined,
      thumb: (make.slice(0, 1) + model.slice(0, 1)).toUpperCase(),
    };

    addListing(listing);
    onCreated(listing.id);

    // reset minimal fields for next listing
    setTitle("");
    setDescription("");
    setPriceGBP(250);
    setCondition("Used");
    setPostageAvailable(true);
  };

  return (
    <div className="card">
      <div className="section">
        <h1 className="h1">Sell a part</h1>
        <p className="p">Keep it simple. Post in under a minute.</p>

        <div className="form">
          <div className="field">
            <label>Era</label>
            <select value={era} onChange={(e) => setEra(e.target.value as EraId)}>
              {ERAS.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Make</label>
            <select value={make} onChange={(e) => setMake(e.target.value)}>
              {makes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Model</label>
            <select value={model} onChange={(e) => setModel(e.target.value)}>
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
              <option value="Unknown">Unknown</option>
            </select>
          </div>

          <div className="field">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as CategoryId)}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Part title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lucas distributor, E-Type S1"
            />
          </div>

          <div className="field">
            <label>Condition</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value as Condition)}>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Price (GBP)</label>
            <input
              type="number"
              value={priceGBP}
              onChange={(e) => setPriceGBP(Number(e.target.value))}
              min={1}
            />
          </div>

          <div className="field">
            <label>Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Sussex" />
          </div>

          <div className="field">
            <label>Postage</label>
            <select
              value={postageAvailable ? "yes" : "no"}
              onChange={(e) => setPostageAvailable(e.target.value === "yes")}
            >
              <option value="yes">Postage available</option>
              <option value="no">Collection only</option>
            </select>
          </div>

          <div className="field">
            <label>Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any fitment notes, measurements, what’s included, etc."
            />
          </div>

          <div className="actions">
            <button className="secondary" onClick={() => { setTitle(""); setDescription(""); }}>
              Clear text
            </button>
            <button className="primary" onClick={post} disabled={!canPost} aria-disabled={!canPost}>
              Post listing
            </button>
          </div>

          <div className="note">
            Demo note: listings are stored in your browser (localStorage). Great for a working demo.
          </div>
        </div>
      </div>
    </div>
  );
}
