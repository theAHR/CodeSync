import {
  ADJECTIVES,
  ANIMALS,
  IDENTITY_STORAGE_KEY,
  USER_COLORS,
} from "./constants";

export interface UserIdentity {
  name: string;
  color: string;
}

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function generateIdentity(): UserIdentity {
  return {
    name: `${randomItem(ADJECTIVES)} ${randomItem(ANIMALS)}`,
    color: randomItem(USER_COLORS),
  };
}

export function getStoredIdentity(): UserIdentity | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(IDENTITY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserIdentity;
    if (parsed.name && parsed.color) return parsed;
  } catch {
    // ignore corrupt storage
  }

  return null;
}

export function getOrCreateIdentity(): UserIdentity {
  return getStoredIdentity() ?? generateIdentity();
}

export function saveIdentity(identity: UserIdentity): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify(identity));
}

export function getInitial(initial: string): string {
  return initial.trim().charAt(0).toUpperCase() || "?";
}
