import { Suspense } from "react";
import RoomPage from "./RoomPageClient";

export default function RoomPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <p className="text-sm text-zinc-500">Loading room...</p>
        </div>
      }
    >
      <RoomPage />
    </Suspense>
  );
}
