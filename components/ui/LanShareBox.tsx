"use client";

import { useEffect, useState } from "react";
import { basePath } from "@/lib/paths";

interface NetworkInfo {
  ips: string[];
  port: string;
}

export function LanShareBox({ roomPath = "" }: { roomPath?: string }) {
  const [network, setNetwork] = useState<NetworkInfo | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    // LAN helper only works with a local Next.js API — skip on GitHub Pages.
    if (basePath) return;

    fetch(`${basePath}/api/network`)
      .then((res) => res.json())
      .then((data: NetworkInfo) => setNetwork(data))
      .catch(() => setNetwork(null));
  }, []);

  if (!network?.ips.length) return null;

  const primaryIp = network.ips[0];
  const lanUrl = `http://${primaryIp}:${network.port}${roomPath}`;

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 text-left">
      <h3 className="text-sm font-semibold text-cyan-300">
        Share with colleagues on your network
      </h3>
      <p className="mt-1 text-xs text-zinc-400">
        Run <span className="font-mono text-zinc-300">npm run dev:lan</span>,
        then send this link to anyone on the same Wi‑Fi/LAN:
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-cyan-200">
          {lanUrl}
        </code>
        <button
          type="button"
          onClick={() => void copy(lanUrl)}
          className="shrink-0 rounded-lg border border-cyan-500/40 px-3 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-500/10"
        >
          {copied === lanUrl ? "Copied!" : "Copy LAN link"}
        </button>
      </div>
      {network.ips.length > 1 && (
        <p className="mt-2 text-[10px] text-zinc-600">
          Other IPs on this machine: {network.ips.join(", ")}
        </p>
      )}
      <p className="mt-2 text-[10px] text-zinc-500">
        Code sync, chat, and cursors work over LAN. Voice needs HTTPS — use
        localhost on each machine, or a tunnel (ngrok) for voice.
      </p>
    </div>
  );
}
