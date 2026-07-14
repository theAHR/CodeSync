import * as Y from "yjs";

const SAVE_DEBOUNCE_MS = 2000;

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function loadRoomState(
  roomId: string,
  ydoc: Y.Doc,
): Promise<boolean> {
  try {
    const response = await fetch(`/api/rooms/${roomId}`);
    if (!response.ok) return false;

    const data = (await response.json()) as { state?: string };
    if (!data.state) return false;

    Y.applyUpdate(ydoc, base64ToUint8(data.state), "persistence");
    return true;
  } catch {
    return false;
  }
}

export function setupRoomPersistence(
  roomId: string,
  ydoc: Y.Doc,
): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;

  const save = async () => {
    if (disposed) return;
    try {
      const state = uint8ToBase64(Y.encodeStateAsUpdate(ydoc));
      await fetch(`/api/rooms/${roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      });
    } catch {
      // persistence is best-effort
    }
  };

  const scheduleSave = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(save, SAVE_DEBOUNCE_MS);
  };

  const handleUpdate = (update: Uint8Array, origin: unknown) => {
    if (origin === "persistence") return;
    scheduleSave();
  };

  ydoc.on("update", handleUpdate);

  return () => {
    disposed = true;
    if (timer) clearTimeout(timer);
    ydoc.off("update", handleUpdate);
  };
}
