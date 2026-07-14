"use client";

import { use, useEffect } from "react";
import { IdentityInitializer } from "@/components/ui/IdentityInitializer";
import { RoomWorkspace } from "@/components/room/RoomWorkspace";
import { useAppStore } from "@/lib/store";

interface RoomPageClientProps {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ view?: string }>;
}

export function RoomPageClient({ params, searchParams }: RoomPageClientProps) {
  const { roomId } = use(params);
  const { view } = use(searchParams);
  const setIsReadOnly = useAppStore((state) => state.setIsReadOnly);

  useEffect(() => {
    setIsReadOnly(view === "1" || view === "true");
    return () => setIsReadOnly(false);
  }, [view, setIsReadOnly]);

  return (
    <>
      <IdentityInitializer />
      <RoomWorkspace roomId={roomId} />
    </>
  );
}
