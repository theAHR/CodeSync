import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { DEFAULT_ACTIVE_FILE, DEFAULT_FILES } from "./constants";
import type { ChatMessage, VersionSnapshot } from "./types";

export interface RoomConnection {
  ydoc: Y.Doc;
  provider: WebrtcProvider;
  files: Y.Map<Y.Text>;
  chat: Y.Array<ChatMessage>;
  versions: Y.Array<VersionSnapshot>;
  voiceSignals: Y.Array<unknown>;
  awareness: WebrtcProvider["awareness"];
  getFileText: (filename: string) => Y.Text;
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
  const provider = new WebrtcProvider(roomId, ydoc, {
    signaling: ["wss://signaling.yjs.dev"],
  });

  const files = ydoc.getMap<Y.Text>("files");
  const chat = ydoc.getArray<ChatMessage>("chat");
  const versions = ydoc.getArray<VersionSnapshot>("versions");
  const voiceSignals = ydoc.getArray<unknown>("voiceSignals");

  const seedContent = () => {
    if (files.size === 0) {
      migrateLegacyMonacoText(ydoc, files);
    }
    if (files.size === 0) {
      seedDefaultFiles(files);
    }
  };

  provider.on("synced", seedContent);
  seedContent();

  return {
    ydoc,
    provider,
    files,
    chat,
    versions,
    voiceSignals,
    awareness: provider.awareness,
    getFileText: (filename) => getFileText(files, filename),
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

export { DEFAULT_ACTIVE_FILE };
