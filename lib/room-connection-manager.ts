import { createRoomConnection, type RoomConnection } from "./yjs-provider";

interface PoolEntry {
  connection: RoomConnection;
  refs: number;
}

const connectionPool = new Map<string, PoolEntry>();
const destroyTimers = new Map<string, ReturnType<typeof setTimeout>>();

const DESTROY_DELAY_MS = 300;

function isRoomExistsError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("already exists");
}

export function acquireRoomConnection(roomId: string): RoomConnection {
  const pendingTimer = destroyTimers.get(roomId);
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    destroyTimers.delete(roomId);
  }

  const existing = connectionPool.get(roomId);
  if (existing) {
    existing.refs++;
    return existing.connection;
  }

  try {
    const connection = createRoomConnection(roomId);
    connectionPool.set(roomId, { connection, refs: 1 });
    return connection;
  } catch (error) {
    if (!isRoomExistsError(error)) throw error;

    // y-webrtc removes the room asynchronously after destroy()
    const stale = connectionPool.get(roomId);
    if (stale) {
      stale.refs++;
      return stale.connection;
    }

    throw error;
  }
}

export async function acquireRoomConnectionAsync(
  roomId: string,
): Promise<RoomConnection> {
  const maxRetries = 12;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return acquireRoomConnection(roomId);
    } catch (error) {
      if (!isRoomExistsError(error) || attempt === maxRetries - 1) {
        throw error;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, 50 * (attempt + 1)),
      );
    }
  }

  throw new Error(`Failed to connect to room "${roomId}"`);
}

export function releaseRoomConnection(roomId: string): void {
  const entry = connectionPool.get(roomId);
  if (!entry) return;

  entry.refs--;
  if (entry.refs > 0) return;

  const pendingTimer = destroyTimers.get(roomId);
  if (pendingTimer) clearTimeout(pendingTimer);

  destroyTimers.set(
    roomId,
    setTimeout(() => {
      const current = connectionPool.get(roomId);
      if (current && current.refs <= 0) {
        connectionPool.delete(roomId);
        current.connection.provider.destroy();
        current.connection.ydoc.destroy();
      }
      destroyTimers.delete(roomId);
    }, DESTROY_DELAY_MS),
  );
}
