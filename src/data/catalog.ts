import { CategoryId, EraId } from "../types";

export const ERAS: { id: EraId; label: string; meta: string }[] = [
  { id: "pre1950", label: "Pre-1950", meta: "veteran & pre-war" },
  { id: "50_70", label: "1950–1970", meta: "golden era" },
  { id: "70_80", label: "1970–1980", meta: "analogue icons" },
  { id: "80_2000", label: "1980–2000", meta: "modern classics" },
];

export const CATEGORIES: { id: CategoryId; label: string; meta: string }[] = [
  { id: "engine", label: "Engine & Fuel", meta: "carb, injection, ancillaries" },
  { id: "cooling", label: "Cooling", meta: "rads, hoses, fans" },
  { id: "transmission", label: "Transmission", meta: "gearbox, diff, clutch" },
  { id: "suspension", label: "Suspension", meta: "springs, shocks, steering" },
  { id: "brakes", label: "Brakes", meta: "calipers, discs, hydraulics" },
  { id: "electrical", label: "Electrical", meta: "looms, ignition, lights" },
  { id: "body", label: "Body Panels", meta: "doors, wings, bonnets" },
  { id: "interior", label: "Interior & Trim", meta: "seats, switches, trim" },
  { id: "glass", label: "Glass & Seals", meta: "rubbers, screens, seals" },
  { id: "wheels", label: "Wheels", meta: "wheels, hubs, spinners" },
  { id: "hardware", label: "Hardware", meta: "fixings, brackets, clips" },
  { id: "misc", label: "Misc", meta: "tools, literature, other" },
];

// Demo makes/models per era (you can expand anytime)
export const MAKE_MODEL_BY_ERA: Record<EraId, Record<string, string[]>> = {
  pre1950: {
    Bentley: ["4¼ Litre", "3½ Litre"],
    MG: ["TA", "TB", "TC"],
    Jaguar: ["SS 100", "SS 90"],
  },
  "50_70": {
    Jaguar: ["XK120", "XK140", "XK150", "E-Type Series 1", "E-Type Series 2"],
    Porsche: ["356", "911 (early)"],
    Mercedes: ["300 SL", "230 SL (Pagoda)"],
    Ford: ["Escort Mk1", "Escort Mk2 (early)"],
  },
  "70_80": {
    Porsche: ["911 SC", "928"],
    Ferrari: ["308"],
    BMW: ["E9 3.0 CS", "E21 3-Series"],
    Ford: ["Escort Mk2", "Capri"],
  },
  "80_2000": {
    Porsche: ["964", "993", "996"],
    Ferrari: ["348", "355"],
    BMW: ["E30", "E36", "E46"],
    Ford: ["Sierra Cosworth", "Escort RS Turbo"],
    Jaguar: ["XJ40", "XJS"],
  },
};
