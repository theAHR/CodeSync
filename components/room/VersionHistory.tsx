"use client";

import { useState } from "react";
import { createId } from "@/lib/create-id";
import { useRoom } from "@/lib/room-context";
import { useAppStore } from "@/lib/store";
import { getAllFileContents, restoreVersionSnapshot } from "@/lib/yjs-provider";

export function VersionHistory() {
  const { files, versions } = useRoom();
  const versionList = useAppStore((state) => state.versions);
  const currentUser = useAppStore((state) => state.currentUser);
  const isReadOnly = useAppStore((state) => state.isReadOnly);
  const [expanded, setExpanded] = useState(false);
  const [label, setLabel] = useState("");

  const saveSnapshot = () => {
    if (!currentUser) return;

    const snapshot = getAllFileContents(files);
    versions.push([
      {
        id: createId(),
        label: label.trim() || `Snapshot ${versionList.length + 1}`,
        author: currentUser.name,
        timestamp: Date.now(),
        files: snapshot,
      },
    ]);
    setLabel("");
  };

  const restoreSnapshot = (filesSnapshot: Record<string, string>) => {
    if (isReadOnly) return;
    if (!confirm("Restore this version? Current code will be replaced.")) return;
    restoreVersionSnapshot(files, filesSnapshot);
  };

  return (
    <div className="border-b border-zinc-800 p-3">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-500"
      >
        Versions
        <span className="text-zinc-600">{expanded ? "▾" : "▸"}</span>
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {!isReadOnly && (
            <div className="flex gap-1">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Snapshot label"
                className="min-w-0 flex-1 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-100 outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={saveSnapshot}
                className="shrink-0 rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
              >
                Save
              </button>
            </div>
          )}

          <div className="max-h-32 space-y-1 overflow-y-auto">
            {versionList.length === 0 && (
              <p className="text-xs text-zinc-600">No saved versions</p>
            )}
            {versionList.map((version) => (
              <div
                key={version.id}
                className="flex items-center justify-between rounded bg-zinc-900/80 px-2 py-1.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-zinc-300">
                    {version.label}
                  </p>
                  <p className="text-[10px] text-zinc-600">
                    {version.author} ·{" "}
                    {new Date(version.timestamp).toLocaleString()}
                  </p>
                </div>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => restoreSnapshot(version.files)}
                    className="shrink-0 text-[10px] text-violet-400 hover:text-violet-300"
                  >
                    Restore
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
