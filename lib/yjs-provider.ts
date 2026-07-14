import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { DEFAULT_FILES } from "./constants";
import type { ChatMessage, VersionSnapshot } from "./types";

export type SyncStatus = "connecting" | "connected" | "disconnected";

export interface RoomConnection {
  ydoc: Y.Doc;
  provider: WebsocketProvider;
  files: Y.Map<Y.Text>;
  chat: Y.Array<ChatMessage>;
  versions: Y.Array<VersionSnapshot>;
  voiceSignals: Y.Array<unknown>;
  awareness: WebsocketProvider["awareness"];
  getFileText: (filename: string) => Y.Text;
  getStatus: () => SyncStatus;
}

const WS_SERVER =
  process.env.NEXT_PUBLIC_YJS_WS_URL ?? "wss://demos.yjs.dev/ws";

function roomTopic(roomId: string): string {
  return `codesync-v1-${roomId}`;
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

export function createRoomConnection(roomId: string): RoomConnection {
  const ydoc = new Y.Doc();
  const provider = new WebsocketProvider(WS_SERVER, roomTopic(roomId), ydoc);

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

  // Only seed after the first remote sync so peers don't each create
  // divergent default documents before they can merge.
  provider.on("sync", (isSynced: boolean) => {
    if (isSynced) seedIfEmpty();
  });

  // Fallback if the room is brand new / offline briefly.
  window.setTimeout(() => {
    if (files.size === 0) seedIfEmpty();
  }, 1500);

  return {
    ydoc,
    provider,
    files,
    chat,
    versions,
    voiceSignals,
    awareness: provider.awareness,
    getFileText: (filename) => getFileText(files, filename),
    getStatus: () => {
      if (provider.wsconnected) return "connected";
      if (provider.wsconnecting) return "connecting";
      return "disconnected";
    },
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
