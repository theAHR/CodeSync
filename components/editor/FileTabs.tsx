"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { getLanguageForFile } from "@/lib/constants";
import { useRoom } from "@/lib/room-context";

export function FileTabs() {
  const fileNames = useAppStore((state) => state.fileNames);
  const activeFile = useAppStore((state) => state.activeFile);
  const isReadOnly = useAppStore((state) => state.isReadOnly);
  const setActiveFile = useAppStore((state) => state.setActiveFile);
  const { getFileText } = useRoom();
  const [newFileName, setNewFileName] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const handleAddFile = () => {
    const trimmed = newFileName.trim();
    if (!trimmed || fileNames.includes(trimmed)) return;

    const text = getFileText(trimmed);
    if (text.length === 0) {
      const ext = trimmed.split(".").pop() ?? "";
      const starter =
        ext === "css"
          ? "/* New stylesheet */\n"
          : ext === "js"
            ? "// New script\n"
            : ext === "html"
              ? "<!DOCTYPE html>\n<html>\n<body>\n\n</body>\n</html>\n"
              : "";
      if (starter) text.insert(0, starter);
    }

    setActiveFile(trimmed);
    setNewFileName("");
    setShowAdd(false);
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-zinc-800 bg-zinc-900/80 px-2 py-1.5">
      {fileNames.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => setActiveFile(name)}
          className={`shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            activeFile === name
              ? "bg-violet-600 text-white"
              : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          }`}
        >
          {name}
          <span className="ml-1.5 hidden text-[10px] opacity-60 sm:inline">
            {getLanguageForFile(name)}
          </span>
        </button>
      ))}

      {!isReadOnly && (
        <>
          {showAdd ? (
            <form
              className="flex shrink-0 items-center gap-1"
              onSubmit={(e) => {
                e.preventDefault();
                handleAddFile();
              }}
            >
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="filename.js"
                className="w-28 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-100 outline-none focus:border-violet-500"
                autoFocus
              />
              <button
                type="submit"
                className="rounded bg-violet-600 px-2 py-1 text-xs text-white"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-1 text-xs text-zinc-500"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="shrink-0 rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
            >
              + File
            </button>
          )}
        </>
      )}
    </div>
  );
}
