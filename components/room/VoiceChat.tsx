"use client";

import { useEffect, useRef } from "react";
import { useVoiceChat } from "@/lib/voice-chat";

export function VoiceChat() {
  const {
    voiceActive,
    joining,
    joinVoice,
    leaveVoice,
    remoteStreams,
    error,
    micMuted,
    toggleMicMute,
    micSupported,
    voicePeerCount,
  } = useVoiceChat();
  const audioContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = audioContainerRef.current;
    if (!container) return;

    container.innerHTML = "";
    remoteStreams.forEach((stream) => {
      const audio = document.createElement("audio");
      audio.srcObject = stream;
      audio.autoplay = true;
      void audio.play().catch(() => {
        // autoplay may require prior user gesture
      });
      container.appendChild(audio);
    });
  }, [remoteStreams]);

  return (
    <div className="border-b border-zinc-800 p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Voice
      </h3>

      {!micSupported && (
        <p className="mt-2 text-xs text-amber-400">
          Microphone only works on HTTPS or localhost. Use{" "}
          <span className="font-mono">http://localhost:3000</span> instead of a
          network IP.
        </p>
      )}

      {error && (
        <p className="mt-2 text-xs leading-relaxed text-red-400">{error}</p>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        {!voiceActive ? (
          <button
            type="button"
            onClick={() => void joinVoice()}
            disabled={joining || !micSupported}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {joining ? "Requesting mic…" : "Join voice"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={leaveVoice}
              className="rounded-lg bg-red-600/80 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-500"
            >
              Leave
            </button>
            <button
              type="button"
              onClick={toggleMicMute}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              {micMuted ? "Unmute mic" : "Mute mic"}
            </button>
          </>
        )}
      </div>

      {voiceActive && (
        <p className="mt-2 text-xs text-emerald-400">
          In voice · {voicePeerCount} other{voicePeerCount !== 1 ? "s" : ""}{" "}
          connected
          {micMuted ? " · mic muted" : ""}
        </p>
      )}

      <div ref={audioContainerRef} className="hidden" aria-hidden />
    </div>
  );
}
