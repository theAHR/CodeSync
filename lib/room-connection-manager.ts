import { createRoomConnection, type RoomConnection } from "./yjs-provider";

interface PoolEntry {
  connection: RoomConnection;
  refs: number;
}

const connectionPool = new Map<string, PoolEntry>();
const destroyTimers = new Map<string, ReturnType<typeof setTimeout>>();

const DESTROY_DELAY_MS = 300;

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

  const connection = createRoomConnection(roomId);
  connectionPool.set(roomId, { connection, refs: 1 });
  return connection;
}

export async function acquireRoomConnectionAsync(
  roomId: string,
): Promise<RoomConnection> {
  return acquireRoomConnection(roomId);
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
