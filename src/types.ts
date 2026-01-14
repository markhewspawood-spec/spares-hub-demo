export type EraId = "pre1950" | "50_70" | "70_80" | "80_2000";
export type Condition =
  | "Original"
  | "Used"
  | "Overhauled"
  | "NOS"
  | "Reproduction"
  | "Unknown";

export type CategoryId =
  | "engine"
  | "cooling"
  | "transmission"
  | "suspension"
  | "brakes"
  | "electrical"
  | "body"
  | "interior"
  | "glass"
  | "wheels"
  | "hardware"
  | "misc";

export type Listing = {
  id: string;
  createdAt: number;

  era: EraId;
  make: string;
  model: string;
  category: CategoryId;

  title: string;
  description?: string;
  condition: Condition;

  priceGBP: number;
  location: string;
  postageAvailable: boolean;

  // demo thumbnail letters
  thumb?: string;
};
