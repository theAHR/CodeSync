export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function roomPath(roomId: string, view = false): string {
  const params = new URLSearchParams({ id: roomId });
  if (view) params.set("view", "1");
  return `${basePath}/room/?${params.toString()}`;
}

export function roomUrl(roomId: string, view = false): string {
  if (typeof window === "undefined") {
    return roomPath(roomId, view);
  }

  const url = new URL(window.location.href);
  url.pathname = `${basePath}/room/`;
  url.search = view ? `id=${roomId}&view=1` : `id=${roomId}`;
  return url.toString();
}
