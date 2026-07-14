"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { IdentityInitializer } from "@/components/ui/IdentityInitializer";
import { RoomWorkspace } from "@/components/room/RoomWorkspace";
import { useAppStore } from "@/lib/store";

function getRoomIdFromPathname(pathname: string): string | null {
  const match = pathname.match(/\/room\/([^/]+)\/?$/);
  const segment = match?.[1];
  return segment && segment !== "index" ? segment : null;
}

export default function RoomPage() {
  const searchParams = useSearchParams();
  const setIsReadOnly = useAppStore((state) => state.setIsReadOnly);

  const roomId = useMemo(() => {
    const fromQuery = searchParams.get("id");
    if (fromQuery) return fromQuery;

    if (typeof window !== "undefined") {
      return getRoomIdFromPathname(window.location.pathname);
    }

    return null;
  }, [searchParams]);

  const view = searchParams.get("view");

  useEffect(() => {
    setIsReadOnly(view === "1" || view === "true");
    return () => setIsReadOnly(false);
  }, [view, setIsReadOnly]);

  if (!roomId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-center">
        <p className="text-sm text-zinc-500">Invalid or missing room ID.</p>
      </div>
    );
  }

  return (
    <>
      <IdentityInitializer />
      <RoomWorkspace roomId={roomId} />
    </>
  );
}
