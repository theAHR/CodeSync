import { RoomPageClient } from "./RoomPageClient";

export function generateStaticParams() {
  return [];
}

export default function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  return <RoomPageClient params={params} searchParams={searchParams} />;
}
