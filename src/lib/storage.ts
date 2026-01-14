import { Listing } from "../types";
import { SEED_LISTINGS } from "../data/seed";

const KEY = "partsweb:listings:v1";

export function loadListings(): Listing[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [...SEED_LISTINGS];
    const parsed = JSON.parse(raw) as Listing[];
    if (!Array.isArray(parsed)) return [...SEED_LISTINGS];
    return parsed;
  } catch {
    return [...SEED_LISTINGS];
  }
}

export function saveListings(listings: Listing[]) {
  localStorage.setItem(KEY, JSON.stringify(listings));
}

export function addListing(newListing: Listing) {
  const current = loadListings();
  const next = [newListing, ...current];
  saveListings(next);
  return next;
}

export function clearListings() {
  localStorage.removeItem(KEY);
}
