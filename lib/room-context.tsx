"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { RoomConnection } from "./yjs-provider";
import {
  acquireRoomConnectionAsync,
  releaseRoomConnection,
} from "./room-connection-manager";
import { loadRoomState, setupRoomPersistence } from "./persistence";
import { useAppStore } from "./store";
import type { OnlineUser } from "./store";
import type { ChatMessage, VersionSnapshot } from "./types";

const RoomContext = createContext<RoomConnection | null>(null);

function syncOnlineUsers(
  awareness: RoomConnection["awareness"],
  setOnlineUsers: (users: OnlineUser[]) => void,
) {
  const users: OnlineUser[] = [];

  awareness.getStates().forEach((state, clientId) => {
    const user = state.user as { name?: string; color?: string } | undefined;
    const voice = state.voice as { active?: boolean } | undefined;
    if (user?.name && user?.color) {
      users.push({
        clientId,
        name: user.name,
        color: user.color,
        voiceActive: voice?.active ?? false,
      });
    }
  });

  users.sort((a, b) => a.name.localeCompare(b.name));
  setOnlineUsers(users);
}

function syncFileNames(
  files: RoomConnection["files"],
  setFileNames: (names: string[]) => void,
  activeFile: string,
  setActiveFile: (name: string) => void,
) {
  const names = Array.from(files.keys()).sort((a, b) => {
    if (a === "index.html") return -1;
    if (b === "index.html") return 1;
    return a.localeCompare(b);
  });

  setFileNames(names);

  if (names.length > 0 && !names.includes(activeFile)) {
    setActiveFile(names[0]);
  }
}

function syncChatMessages(
  chat: RoomConnection["chat"],
  setChatMessages: (messages: ChatMessage[]) => void,
) {
  setChatMessages(chat.toArray());
}

function syncVersions(
  versions: RoomConnection["versions"],
  setVersions: (versions: VersionSnapshot[]) => void,
) {
  setVersions([...versions.toArray()].reverse());
}

export function RoomProvider({
  roomId,
  children,
}: {
  roomId: string;
  children: ReactNode;
}) {
  const [connection, setConnection] = useState<RoomConnection | null>(null);
  const [ready, setReady] = useState(false);
  const currentUser = useAppStore((state) => state.currentUser);
  const voiceActive = useAppStore((state) => state.voiceActive);
  const setOnlineUsers = useAppStore((state) => state.setOnlineUsers);
  const setLocalClientId = useAppStore((state) => state.setLocalClientId);
  const setFileNames = useAppStore((state) => state.setFileNames);
  const setActiveFile = useAppStore((state) => state.setActiveFile);
  const setChatMessages = useAppStore((state) => state.setChatMessages);
  const setVersions = useAppStore((state) => state.setVersions);
  const setSyncStatus = useAppStore((state) => state.setSyncStatus);

  useEffect(() => {
    let disposed = false;
    let cleanupPersistence: (() => void) | undefined;
    let activeConn: RoomConnection | null = null;
    let statusHandler: ((event: { status: string }) => void) | undefined;

    const init = async () => {
      try {
        setSyncStatus("connecting");
        const conn = await acquireRoomConnectionAsync(roomId);
        if (disposed) {
          releaseRoomConnection(roomId);
          return;
        }

        activeConn = conn;
        setConnection(conn);
        setSyncStatus(conn.getStatus());

        statusHandler = (event: { status: string }) => {
          if (event.status === "connected") setSyncStatus("connected");
          else if (event.status === "disconnected") setSyncStatus("disconnected");
          else setSyncStatus("connecting");
        };
        conn.provider.on("status", statusHandler);

        await loadRoomState(roomId, conn.ydoc);
        if (disposed) return;

        setLocalClientId(conn.awareness.clientID);
        syncFileNames(
          conn.files,
          setFileNames,
          useAppStore.getState().activeFile,
          setActiveFile,
        );
        syncChatMessages(conn.chat, setChatMessages);
        syncVersions(conn.versions, setVersions);

        cleanupPersistence = setupRoomPersistence(roomId, conn.ydoc);
        setReady(true);
      } catch (error) {
        console.error("Failed to connect to room:", error);
        setSyncStatus("disconnected");
      }
    };

    init();

    return () => {
      disposed = true;
      setReady(false);
      if (statusHandler && activeConn) {
        activeConn.provider.off("status", statusHandler);
      }
      setConnection(null);
      cleanupPersistence?.();
      releaseRoomConnection(roomId);
    };
  }, [
    roomId,
    setLocalClientId,
    setFileNames,
    setActiveFile,
    setChatMessages,
    setVersions,
    setSyncStatus,
  ]);

  useEffect(() => {
    if (!connection || !ready) return;

    const handleFilesChange = () => {
      syncFileNames(
        connection.files,
        setFileNames,
        useAppStore.getState().activeFile,
        setActiveFile,
      );
    };

    const handleChatChange = () => {
      syncChatMessages(connection.chat, setChatMessages);
    };

    const handleVersionsChange = () => {
      syncVersions(connection.versions, setVersions);
    };

    connection.files.observe(handleFilesChange);
    connection.chat.observe(handleChatChange);
    connection.versions.observe(handleVersionsChange);

    return () => {
      connection.files.unobserve(handleFilesChange);
      connection.chat.unobserve(handleChatChange);
      connection.versions.unobserve(handleVersionsChange);
    };
  }, [connection, ready, setFileNames, setActiveFile, setChatMessages, setVersions]);

  useEffect(() => {
    if (!ready || !currentUser || !connection) return;

    const { awareness } = connection;

    awareness.setLocalStateField("user", {
      name: currentUser.name,
      color: currentUser.color,
    });

    const handleAwarenessChange = () => {
      syncOnlineUsers(awareness, setOnlineUsers);
    };

    handleAwarenessChange();
    awareness.on("change", handleAwarenessChange);

    return () => {
      awareness.off("change", handleAwarenessChange);
    };
  }, [connection, currentUser, ready, setOnlineUsers]);

  useEffect(() => {
    if (!ready || !connection) return;
    connection.awareness.setLocalStateField("voice", { active: voiceActive });
  }, [connection, ready, voiceActive]);

  if (!ready || !connection) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-violet-400" />
          <p className="text-sm">Connecting to room…</p>
        </div>
      </div>
    );
  }

  return (
    <RoomContext.Provider value={connection}>{children}</RoomContext.Provider>
  );
}

export function useRoom(): RoomConnection {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
}
