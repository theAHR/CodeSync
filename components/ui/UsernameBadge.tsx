"use client";

import { useState } from "react";
import { saveIdentity } from "@/lib/user-identity";
import { useAppStore } from "@/lib/store";

export function UsernameBadge() {
  const currentUser = useAppStore((state) => state.currentUser);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  if (!currentUser) return null;

  const startEdit = () => {
    setName(currentUser.name);
    setEditing(true);
  };

  const saveEdit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const updated = { ...currentUser, name: trimmed };
    saveIdentity(updated);
    setCurrentUser(updated);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveEdit();
            if (e.key === "Escape") setEditing(false);
          }}
          maxLength={32}
          className="w-32 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-100 outline-none ring-violet-500 focus:ring-1"
          autoFocus
        />
        <button
          type="button"
          onClick={saveEdit}
          className="text-xs text-violet-400 hover:text-violet-300"
        >
          Save
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-700 hover:text-zinc-100"
      title="Click to edit name"
    >
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: currentUser.color }}
      />
      {currentUser.name}
    </button>
  );
}
