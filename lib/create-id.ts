import { nanoid } from "nanoid/non-secure";

/** URL-safe IDs that work on HTTP LAN (no secure crypto context required). */
export function createRoomId(): string {
  return nanoid(10);
}

export function createId(): string {
  return nanoid();
}
