"use client";

import dynamic from "next/dynamic";
import { RoomProvider } from "@/lib/room-context";
import { RoomHeader } from "./RoomHeader";
import { OnlineUsersList } from "./OnlineUsersList";
import { UsernameBadge } from "@/components/ui/UsernameBadge";
import { VoiceChat } from "./VoiceChat";
import { VersionHistory } from "./VersionHistory";

const CollaborativeEditor = dynamic(
  () =>
    import("@/components/editor/CollaborativeEditor").then(
      (mod) => mod.CollaborativeEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Loading editor…
      </div>
    ),
  },
);

const LivePreviewPanel = dynamic(
  () =>
    import("@/components/preview/LivePreviewPanel").then(
      (mod) => mod.LivePreviewPanel,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Loading preview…
      </div>
    ),
  },
);

const ChatPanel = dynamic(
  () =>
    import("@/components/chat/ChatPanel").then((mod) => mod.ChatPanel),
  { ssr: false },
);

interface RoomWorkspaceProps {
  roomId: string;
}

export function RoomWorkspace({ roomId }: RoomWorkspaceProps) {
  return (
    <RoomProvider roomId={roomId}>
      <div className="flex h-screen flex-col bg-zinc-900">
        <RoomHeader roomId={roomId} />

        <div className="flex min-h-0 flex-1">
          <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
            <OnlineUsersList />
            <VoiceChat />
            <VersionHistory />
            <ChatPanel />
          </aside>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Workspace
              </span>
              <UsernameBadge />
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 xl:grid-cols-2">
              <div className="min-h-[280px] min-w-0">
                <CollaborativeEditor />
              </div>
              <div className="min-h-[280px] min-w-0">
                <LivePreviewPanel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoomProvider>
  );
}
