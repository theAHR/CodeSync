"use client";

import { use, useEffect } from "react";
import { IdentityInitializer } from "@/components/ui/IdentityInitializer";
import { RoomWorkspace } from "@/components/room/RoomWorkspace";
import { useAppStore } from "@/lib/store";

interface RoomPageProps {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ view?: string }>;
}

export default function RoomPage({ params, searchParams }: RoomPageProps) {
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
