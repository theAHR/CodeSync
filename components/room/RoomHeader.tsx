"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { basePath, roomUrl } from "@/lib/paths";
import { useAppStore } from "@/lib/store";

interface RoomHeaderProps {
  roomId: string;
}

export function RoomHeader({ roomId }: RoomHeaderProps) {
  const [copiedEdit, setCopiedEdit] = useState(false);
  const [copiedView, setCopiedView] = useState(false);
  const [copiedLan, setCopiedLan] = useState(false);
  const [lanUrl, setLanUrl] = useState<string | null>(null);
  const isReadOnly = useAppStore((state) => state.isReadOnly);

  const editUrl = roomUrl(roomId);
  const viewUrl = roomUrl(roomId, true);

  useEffect(() => {
    fetch(`${basePath}/api/network`)
      .then((res) => res.json())
      .then((data: { ips?: string[]; port?: string }) => {
        const ip = data.ips?.[0];
        if (ip) {
          setLanUrl(
            `http://${ip}:${data.port ?? "3000"}${basePath}/room/${roomId}/`,
          );
        }
      })
      .catch(() => setLanUrl(null));
  }, [roomId]);

  const copyToClipboard = useCallback(
    async (url: string, type: "edit" | "view" | "lan") => {
      const setCopied =
        type === "edit"
          ? setCopiedEdit
          : type === "view"
            ? setCopiedView
            : setCopiedLan;

      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } catch {
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    },
    [],
  );

  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Image
          src="/icon.png"
          alt="CodeSync"
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-zinc-100">
            CodeSync Room
            {isReadOnly && (
              <span className="ml-2 rounded bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                View only
              </span>
            )}
          </h1>
          <p className="truncate font-mono text-xs text-zinc-500">{roomId}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {lanUrl && !isReadOnly && (
          <button
            type="button"
            onClick={() => void copyToClipboard(lanUrl, "lan")}
            className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-500/20"
            title={lanUrl}
          >
            {copiedLan ? "Copied!" : "Copy LAN link"}
          </button>
        )}
        {!isReadOnly && (
          <button
            type="button"
            onClick={() => void copyToClipboard(editUrl, "edit")}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
          >
            {copiedEdit ? "Copied!" : "Copy edit link"}
          </button>
        )}
        <button
          type="button"
          onClick={() => void copyToClipboard(viewUrl, "view")}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
        >
          {copiedView ? "Copied!" : "Copy view link"}
        </button>
      </div>
    </header>
  );
}
