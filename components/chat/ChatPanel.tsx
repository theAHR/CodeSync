"use client";

import { useEffect, useRef, useState } from "react";
import { createId } from "@/lib/create-id";
import { useRoom } from "@/lib/room-context";
import { useAppStore } from "@/lib/store";
import { getInitial } from "@/lib/user-identity";

export function ChatPanel() {
  const { chat } = useRoom();
  const messages = useAppStore((state) => state.chatMessages);
  const currentUser = useAppStore((state) => state.currentUser);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !currentUser) return;

    chat.push([
      {
        id: createId(),
        author: currentUser.name,
        color: currentUser.color,
        text: trimmed,
        timestamp: Date.now(),
      },
    ]);

    setText("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Chat
        </h2>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {messages.length === 0 && (
          <p className="py-4 text-center text-xs text-zinc-600">
            No messages yet. Say hello!
          </p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className="rounded-lg bg-zinc-900/80 px-3 py-2"
            style={{ animation: "fadeIn 0.2s ease-out" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-zinc-950"
                style={{ backgroundColor: msg.color }}
              >
                {getInitial(msg.author)}
              </span>
              <span className="text-xs font-medium" style={{ color: msg.color }}>
                {msg.author}
              </span>
              <span className="text-[10px] text-zinc-600">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-300">{msg.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="border-t border-zinc-800 p-3"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            maxLength={500}
            className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none ring-violet-500 placeholder:text-zinc-600 focus:ring-1"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="shrink-0 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
