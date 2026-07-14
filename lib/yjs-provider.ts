import * as Y from "yjs";
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate } from "y-protocols/awareness";
import { joinRoom, type Room } from "@trystero-p2p/mqtt";
import { DEFAULT_FILES } from "./constants";
import type { ChatMessage, VersionSnapshot } from "./types";

export type SyncStatus = "connecting" | "connected" | "disconnected";

type StatusListener = (event: { status: SyncStatus }) => void;

export interface SyncProvider {
  awareness: Awareness;
  destroy: () => void;
  on: (event: "status", listener: StatusListener) => void;
  off: (event: "status", listener: StatusListener) => void;
  getStatus: () => SyncStatus;
}

export interface RoomConnection {
  ydoc: Y.Doc;
  provider: SyncProvider;
  files: Y.Map<Y.Text>;
  chat: Y.Array<ChatMessage>;
  versions: Y.Array<VersionSnapshot>;
  voiceSignals: Y.Array<unknown>;
  awareness: Awareness;
  getFileText: (filename: string) => Y.Text;
  getStatus: () => SyncStatus;
}

const APP_ID = "codesync-github-pages";

function roomTopic(roomId: string): string {
  return `codesync-v2-${roomId}`;
}

function toUint8(data: ArrayBuffer | Uint8Array): Uint8Array {
  return data instanceof Uint8Array ? data : new Uint8Array(data);
}

function seedDefaultFiles(files: Y.Map<Y.Text>): void {
  for (const [name, content] of Object.entries(DEFAULT_FILES)) {
    const text = new Y.Text();
    text.insert(0, content);
    files.set(name, text);
  }
}

function migrateLegacyMonacoText(ydoc: Y.Doc, files: Y.Map<Y.Text>): void {
  const legacy = ydoc.getText("monaco");
  if (legacy.length === 0) return;

  const existing = files.get("index.html");
  if (existing && existing.length > 0) return;

  const text = new Y.Text();
  text.insert(0, legacy.toString());
  files.set("index.html", text);
}

export function getFileText(files: Y.Map<Y.Text>, filename: string): Y.Text {
  let text = files.get(filename);
  if (!text) {
    text = new Y.Text();
    files.set(filename, text);
  }
  return text;
}

export function getAllFileContents(files: Y.Map<Y.Text>): Record<string, string> {
  const result: Record<string, string> = {};
  files.forEach((text, name) => {
    result[name] = text.toString();
  });
  return result;
}

function createTrysteroProvider(roomId: string, ydoc: Y.Doc): SyncProvider {
  const awareness = new Awareness(ydoc);
  const listeners = new Set<StatusListener>();
  let status: SyncStatus = "connecting";
  let room: Room | null = null;
  let destroyed = false;

  const emitStatus = (next: SyncStatus) => {
    status = next;
    for (const listener of listeners) {
      listener({ status: next });
    }
  };

  const originRemote = "trystero-remote";

  try {
    room = joinRoom(
      {
        appId: APP_ID,
        password: roomId,
      },
      roomTopic(roomId),
    );
  } catch (error) {
    console.error("Failed to join Trystero room:", error);
    emitStatus("disconnected");
    return {
      awareness,
      destroy: () => {
        destroyed = true;
        awareness.destroy();
      },
      on: (_event, listener) => {
        listeners.add(listener);
      },
      off: (_event, listener) => {
        listeners.delete(listener);
      },
      getStatus: () => status,
    };
  }

  const docAction = room.makeAction<Uint8Array>("ydoc");
  const awarenessAction = room.makeAction<Uint8Array>("awareness");

  const sendFullState = (peerId?: string) => {
    if (destroyed) return;
    const update = Y.encodeStateAsUpdate(ydoc);
    const awarenessUpdate = encodeAwarenessUpdate(
      awareness,
      Array.from(awareness.getStates().keys()),
    );

    if (peerId) {
      docAction.send(update, { target: peerId });
      awarenessAction.send(awarenessUpdate, { target: peerId });
    } else {
      docAction.send(update);
      awarenessAction.send(awarenessUpdate);
    }
  };

  const handleDocUpdate = (update: Uint8Array, origin: unknown) => {
    if (destroyed || origin === originRemote) return;
    docAction.send(update);
  };

  ydoc.on("update", handleDocUpdate);

  docAction.onMessage = (data) => {
    if (destroyed) return;
    Y.applyUpdate(ydoc, toUint8(data as Uint8Array), originRemote);
  };

  awareness.on("update", ({ added, updated, removed }: { added: number[]; updated: number[]; removed: number[] }) => {
    if (destroyed) return;
    const changedClients = added.concat(updated, removed);
    if (changedClients.length === 0) return;
    const update = encodeAwarenessUpdate(awareness, changedClients);
    awarenessAction.send(update);
  });

  awarenessAction.onMessage = (data) => {
    if (destroyed) return;
    applyAwarenessUpdate(awareness, toUint8(data as Uint8Array), originRemote);
  };

  room.onPeerJoin = (peerId) => {
    sendFullState(peerId);
    emitStatus("connected");
  };

  room.onPeerLeave = () => {
    // Stay connected as long as the room/signaling is alive.
    emitStatus("connected");
  };

  // Signaling joined successfully — ready for peers.
  emitStatus("connected");

  // Announce current state shortly after join in case peers overlapped.
  window.setTimeout(() => {
    if (!destroyed) sendFullState();
  }, 400);

  return {
    awareness,
    destroy: () => {
      destroyed = true;
      ydoc.off("update", handleDocUpdate);
      try {
        room?.leave();
      } catch {
        // ignore
      }
      room = null;
      awareness.destroy();
      emitStatus("disconnected");
      listeners.clear();
    },
    on: (_event, listener) => {
      listeners.add(listener);
    },
    off: (_event, listener) => {
      listeners.delete(listener);
    },
    getStatus: () => status,
  };
}

export function createRoomConnection(roomId: string): RoomConnection {
  const ydoc = new Y.Doc();
  const provider = createTrysteroProvider(roomId, ydoc);

  const files = ydoc.getMap<Y.Text>("files");
  const chat = ydoc.getArray<ChatMessage>("chat");
  const versions = ydoc.getArray<VersionSnapshot>("versions");
  const voiceSignals = ydoc.getArray<unknown>("voiceSignals");

  const seedIfEmpty = () => {
    if (files.size === 0) {
      migrateLegacyMonacoText(ydoc, files);
    }
    if (files.size === 0) {
      seedDefaultFiles(files);
    }
  };

  // Give peers a moment to send existing state before seeding defaults.
  window.setTimeout(seedIfEmpty, 1200);

  return {
    ydoc,
    provider,
    files,
    chat,
    versions,
    voiceSignals,
    awareness: provider.awareness,
    getFileText: (filename) => getFileText(files, filename),
    getStatus: () => provider.getStatus(),
  };
}

export function restoreVersionSnapshot(
  files: Y.Map<Y.Text>,
  snapshot: Record<string, string>,
): void {
  for (const [name, content] of Object.entries(snapshot)) {
    const text = getFileText(files, name);
    text.delete(0, text.length);
    text.insert(0, content);
  }
}

export { DEFAULT_ACTIVE_FILE } from "./constants";
