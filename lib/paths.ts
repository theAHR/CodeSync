export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function roomPath(roomId: string, view = false): string {
  const query = view ? "?view=1" : "";
  return `${basePath}/room/${roomId}/${query}`;
}

export function roomUrl(roomId: string, view = false): string {
  if (typeof window === "undefined") {
    return roomPath(roomId, view);
  }

  const url = new URL(window.location.href);
  url.pathname = `${basePath}/room/${roomId}/`;
  url.search = view ? "view=1" : "";
  return url.toString();
}
